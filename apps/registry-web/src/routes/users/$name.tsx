import { createFileRoute, notFound, Link } from "@tanstack/react-router"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { User, Package, Download } from "lucide-react"
import { env } from "@/env"
import type { Package as Pkg } from "@tsx/api-types"
import { PackageSchema } from "@/lib/schemas"
import { z } from "zod"

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getUserPackages(author: string): Promise<Pkg[]> {
  const res = await fetch(
    `${env.VITE_REGISTRY_URL}/v1/users/${encodeURIComponent(author)}/packages`,
  )
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`Registry error: ${res.status}`)
  return z.array(PackageSchema).parse(await res.json())
}

function userPackagesQueryOptions(name: string) {
  return queryOptions({
    queryKey: ["user", "packages", name],
    queryFn: () => getUserPackages(name),
    staleTime: 60_000,
  })
}

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/users/$name")({
  loader: async ({ context: { queryClient }, params: { name } }) => {
    const pkgs = await queryClient.fetchQuery(userPackagesQueryOptions(name))
    if (pkgs.length === 0) throw notFound()
    return pkgs
  },
  head: ({ params: { name } }) => ({
    meta: [
      { title: `${name} — tsx registry` },
      { name: "description", content: `Packages published by ${name} on the tsx registry.` },
    ],
  }),
  component: UserProfilePage,
  notFoundComponent: () => (
    <div className="page-wrap py-16 text-center">
      <p className="text-lg" style={{ color: "var(--sea-ink-soft)" }}>Author not found.</p>
      <Link to="/browse" className="mt-4 inline-block text-sm" style={{ color: "var(--lagoon)" }}>
        Browse all packages
      </Link>
    </div>
  ),
})

// ── Component ─────────────────────────────────────────────────────────────────

function UserProfilePage() {
  const { name } = Route.useParams()
  const { data: packages = [] } = useQuery(userPackagesQueryOptions(name))

  const totalDownloads = packages.reduce((sum, p) => sum + p.download_count, 0)

  return (
    <div className="page-wrap py-12 rise-in">
      {/* Author header */}
      <div className="mb-10 flex items-center gap-4">
        <div
          className="flex size-16 items-center justify-center rounded-full"
          style={{ background: "var(--lagoon-muted)" }}
        >
          <User className="size-7" style={{ color: "var(--lagoon)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--sea-ink)" }}>{name}</h1>
          <div className="mt-1 flex items-center gap-4 text-sm" style={{ color: "var(--sea-ink-soft)" }}>
            <span className="flex items-center gap-1">
              <Package className="size-4" />
              {packages.length} {packages.length === 1 ? "package" : "packages"}
            </span>
            <span className="flex items-center gap-1">
              <Download className="size-4" />
              {totalDownloads.toLocaleString()} total downloads
            </span>
          </div>
        </div>
      </div>

      {/* Package grid */}
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

            <div
              className="mt-3 flex items-center gap-1 text-xs"
              style={{ color: "var(--sea-ink-soft)" }}
            >
              <Download className="size-3" />
              {pkg.download_count.toLocaleString()} downloads
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
