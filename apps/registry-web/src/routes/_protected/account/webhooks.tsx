import { createFileRoute } from "@tanstack/react-router"
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { requireAuth } from "@/middleware/auth-guard"
import { Webhook, Trash2, Plus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/lib/auth"
import { env } from "@/env"

// ── Types ─────────────────────────────────────────────────────────────────────

type WebhookRecord = {
  id: number
  url: string
  events: string[]
  active: boolean
  created_at: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getSessionToken(headers: Headers): Promise<string | null> {
  const session = await auth.api.getSession({ headers })
  return session?.session?.token ?? null
}

// ── Server functions ──────────────────────────────────────────────────────────

const listWebhooksFn = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders()
  const token = await getSessionToken(headers)
  if (!token) throw new Error("Not authenticated")

  const resp = await fetch(`${env.VITE_REGISTRY_URL}/v1/webhooks`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!resp.ok) throw new Error(`Registry error: ${resp.status}`)
  return resp.json() as Promise<WebhookRecord[]>
})

const createWebhookFn = createServerFn({ method: "POST" })
  .inputValidator((data: { url: string; events: string[]; secret: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const token = await getSessionToken(headers)
    if (!token) throw new Error("Not authenticated")

    const resp = await fetch(`${env.VITE_REGISTRY_URL}/v1/webhooks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: data.url,
        events: data.events,
        secret: data.secret || undefined,
      }),
    })
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: resp.statusText }))
      throw new Error(err.error ?? "Failed to create webhook")
    }
    return resp.json() as Promise<WebhookRecord>
  })

const deleteWebhookFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const token = await getSessionToken(headers)
    if (!token) throw new Error("Not authenticated")

    const resp = await fetch(`${env.VITE_REGISTRY_URL}/v1/webhooks/${data.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!resp.ok) throw new Error(`Failed to delete webhook: ${resp.status}`)
  })

// ── Route ─────────────────────────────────────────────────────────────────────

const webhooksQueryOptions = queryOptions({
  queryKey: ["account", "webhooks"],
  queryFn: () => listWebhooksFn(),
  staleTime: 30_000,
})

export const Route = createFileRoute("/_protected/account/webhooks")({
  beforeLoad: async () => requireAuth(),
  loader: ({ context: { queryClient } }) => queryClient.prefetchQuery(webhooksQueryOptions),
  head: () => ({ meta: [{ title: "Webhooks — tsx registry" }] }),
  component: WebhooksPage,
})

// ── Component ─────────────────────────────────────────────────────────────────

const ALL_EVENTS = ["package:publish", "package:yank", "package:delete"] as const

function WebhooksPage() {
  const { data: hooks, isLoading } = useQuery(webhooksQueryOptions)
  const queryClient = useQueryClient()

  const [url, setUrl]         = useState("")
  const [secret, setSecret]   = useState("")
  const [events, setEvents]   = useState<string[]>(["package:publish"])
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  function toggleEvent(ev: string) {
    setEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev],
    )
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || events.length === 0) return
    setCreating(true)
    try {
      await createWebhookFn({ data: { url: url.trim(), events, secret: secret.trim() } })
      setUrl("")
      setSecret("")
      setEvents(["package:publish"])
      queryClient.invalidateQueries({ queryKey: ["account", "webhooks"] })
      toast.success("Webhook created")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create webhook")
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete() {
    if (deleteId === null) return
    setDeleting(true)
    try {
      await deleteWebhookFn({ data: { id: deleteId } })
      queryClient.invalidateQueries({ queryKey: ["account", "webhooks"] })
      toast.success("Webhook deleted")
      setDeleteId(null)
    } catch {
      toast.error("Failed to delete webhook")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page-wrap py-12 rise-in">
      <div className="mb-2 flex items-center gap-2">
        <Webhook className="size-5" style={{ color: "var(--lagoon)" }} />
        <h1 className="text-2xl font-bold" style={{ color: "var(--sea-ink)" }}>Webhooks</h1>
      </div>
      <p className="mb-8 text-sm" style={{ color: "var(--sea-ink-soft)" }}>
        Receive HTTP POST notifications when packages you own are published, yanked, or deleted.
        Include a secret to enable HMAC-SHA256 signature verification.
      </p>

      <div className="max-w-lg space-y-6">
        {/* Create form */}
        <div className="island-shell rounded-xl p-6">
          <h2 className="mb-4 font-semibold" style={{ color: "var(--sea-ink)" }}>Add webhook</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="wh-url">Payload URL</Label>
              <Input
                id="wh-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                required
              />
            </div>

            <div>
              <Label htmlFor="wh-secret">Secret (optional)</Label>
              <Input
                id="wh-secret"
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Used to sign the X-TSX-Signature-256 header"
                autoComplete="new-password"
              />
            </div>

            <div>
              <Label className="mb-2 block">Events</Label>
              <div className="space-y-1.5">
                {ALL_EVENTS.map((ev) => (
                  <label key={ev} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={events.includes(ev)}
                      onChange={() => toggleEvent(ev)}
                      className="accent-[var(--lagoon)]"
                    />
                    <code className="font-mono text-xs" style={{ color: "var(--sea-ink)" }}>{ev}</code>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={creating || !url.trim() || events.length === 0} size="sm">
              <Plus className="mr-1 size-4" />
              {creating ? "Adding…" : "Add webhook"}
            </Button>
          </form>
        </div>

        {/* Webhooks list */}
        <div className="island-shell rounded-xl p-6">
          <h2 className="mb-4 font-semibold" style={{ color: "var(--sea-ink)" }}>Active webhooks</h2>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg" style={{ background: "var(--line)" }} />
              ))}
            </div>
          ) : hooks && hooks.length > 0 ? (
            <div className="space-y-2">
              {hooks.map((wh) => (
                <div
                  key={wh.id}
                  className="flex items-start justify-between gap-3 rounded-lg px-3 py-3 text-sm"
                  style={{ border: "1px solid var(--line)" }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <ExternalLink className="size-3 shrink-0" style={{ color: "var(--sea-ink-soft)" }} />
                      <span className="truncate font-mono text-xs" style={{ color: "var(--sea-ink)" }}>
                        {wh.url}
                      </span>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "var(--sea-ink-soft)" }}>
                      {wh.events.join(", ")} · Added {new Date(wh.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteId(wh.id)}
                    className="mt-0.5 shrink-0 hover:opacity-70"
                    style={{ color: "#ef4444" }}
                    title="Delete webhook"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--sea-ink-soft)" }}>No webhooks yet.</p>
          )}
        </div>
      </div>

      {/* Delete confirm dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete webhook?</DialogTitle>
            <DialogDescription>
              The endpoint will stop receiving notifications immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? "Deleting…" : "Delete webhook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
