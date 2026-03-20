import { createFileRoute, Link } from "@tanstack/react-router"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { Star, Download, Package } from "lucide-react"
import { requireAuth } from "@/middleware/auth-guard"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/lib/auth"
import { env } from "@/env"
import type { Package as Pkg } from "@tsx/api-types"
import { PackageSchema } from "@/lib/schemas"
import { z } from "zod"

// ── Server function ────────────────────────────────────────────────────────────

const listStarredFn = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  const token = session?.session?.token
  if (!token) throw new Error("Not authenticated")

  const res = await fetch(`${env.VITE_REGISTRY_URL}/v1/account/starred`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Registry error: ${res.status}`)
  return z.array(PackageSchema).parse(await res.json()) as Pkg[]
})

// ── Query options ──────────────────────────────────────────────────────────────

const starredQueryOptions = () =>
  queryOptions({
    queryKey: ["account", "starred"],
    queryFn: () => listStarredFn(),
    staleTime: 30_000,
  })

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_protected/account/starred")({
  beforeLoad: async () => requireAuth(),
  loader: ({ context: { queryClient } }) =>
    queryClient.fetchQuery(starredQueryOptions()),
  head: () => ({ meta: [{ title: "Starred packages — tsx registry" }] }),
  component: StarredPage,
})

// ── Component ─────────────────────────────────────────────────────────────────

function StarredPage() {
  const { data: packages = [] } = useQuery(starredQueryOptions())

  return (
    <div className="page-wrap py-12 rise-in">
      <div className="mb-8 flex items-center gap-3">
        <Star className="size-6" style={{ color: "var(--lagoon)" }} />
        <h1 className="text-2xl font-bold" style={{ color: "var(--sea-ink)" }}>
          Starred packages
        </h1>
        <span
          className="rounded-full px-2.5 py-0.5 text-sm font-medium"
          style={{ background: "var(--lagoon-muted)", color: "var(--lagoon)" }}
        >
          {packages.length}
        </span>
      </div>

      {packages.length === 0 ? (
        <div
          className="island-shell rounded-xl p-12 text-center text-sm"
          style={{ color: "var(--sea-ink-soft)" }}
        >
          <Star className="mx-auto mb-3 size-8 opacity-30" />
          <p>You haven't starred any packages yet.</p>
          <Link
            to="/browse"
            className="mt-3 inline-block text-sm"
            style={{ color: "var(--lagoon)" }}
          >
            Browse packages
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Link
              key={pkg.name}
              to="/packages/$name"
              params={{ name: pkg.name }}
              className="island-shell group rounded-xl p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h2
                  className="font-mono text-sm font-semibold group-hover:underline"
                  style={{ color: "var(--lagoon-deep)" }}
                >
                  {pkg.name}
                </h2>
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 text-xs font-mono"
                  style={{ background: "var(--lagoon-muted)", color: "var(--lagoon)" }}
                >
                  v{pkg.version}
                </span>
              </div>

              <p
                className="mt-2 line-clamp-2 text-sm"
                style={{ color: "var(--sea-ink-soft)" }}
              >
                {pkg.description || "No description."}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {pkg.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded px-1.5 py-0.5 text-xs"
                    style={{ background: "var(--line)", color: "var(--sea-ink-soft)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs" style={{ color: "var(--sea-ink-soft)" }}>
                <span className="flex items-center gap-1">
                  <Download className="size-3" />
                  {pkg.download_count.toLocaleString()}
                </span>
                {(pkg.star_count ?? 0) > 0 && (
                  <span className="flex items-center gap-1" style={{ color: "var(--lagoon)" }}>
                    <Star className="size-3" fill="currentColor" />
                    {pkg.star_count}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
