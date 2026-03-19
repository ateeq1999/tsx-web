/**
 * @tsx/api-types
 *
 * Re-exports component schemas from the auto-generated `generated.ts` as
 * named TypeScript types.  The source of truth is the OpenAPI spec served
 * by the registry at `/api-docs/openapi.json`.
 *
 * To regenerate `generated.ts`:
 *   REGISTRY_URL=https://tsx-tsnv.onrender.com bun run --filter @tsx/api-types gen
 */

export type { paths, components } from "./generated"

import type { components } from "./generated"

// ── Named type aliases (keep existing import paths working) ───────────────────

export type Package        = components["schemas"]["Package"]
export type PackageVersion = components["schemas"]["PackageVersion"]
export type SearchResult   = components["schemas"]["SearchResult"]
export type RegistryStats  = components["schemas"]["RegistryStats"]
export type DailyDownloads = components["schemas"]["DailyDownloads"]
export type PublishResult  = components["schemas"]["PublishResult"]
export type AuditEntry     = components["schemas"]["AuditEntry"]
export type RateLimitEntry = components["schemas"]["RateLimitEntry"]
export type Webhook        = components["schemas"]["Webhook"]
export type ApiError       = components["schemas"]["ApiError"]
