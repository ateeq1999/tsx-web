import { describe, it, expect, vi, beforeEach } from "vitest"

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockGetSession = vi.fn()

vi.mock("@/server/auth/queries", () => ({
  getSession: () => mockGetSession(),
}))

vi.mock("@tanstack/react-router", () => ({
  redirect: vi.fn((opts: { to: string }) => {
    const err = new Error(`Redirect to ${opts.to}`)
    ;(err as any).to = opts.to
    ;(err as any).__isRedirect = true
    throw err
  }),
}))

const { requireRole } = await import("./role-guard")

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeSession(role = "user") {
  return {
    user: { id: "user-1", email: "test@example.com", role },
    session: { id: "sess-1", token: "tok" },
  }
}

function catchRedirect(fn: () => unknown): Promise<{ to: string }> {
  return fn().catch((e: any) => {
    if (e.__isRedirect) return e
    throw e
  }) as Promise<{ to: string }>
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("requireRole", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns session when user has the required role", async () => {
    mockGetSession.mockResolvedValue(makeSession("admin"))

    const result = await requireRole("admin")

    expect(result).toMatchObject({ user: { role: "admin" } })
  })

  it("redirects to / when user has a different role", async () => {
    mockGetSession.mockResolvedValue(makeSession("user"))

    const err = await catchRedirect(() => requireRole("admin"))

    expect(err.to).toBe("/")
  })

  it("redirects to /auth/login when session is null", async () => {
    mockGetSession.mockResolvedValue(null)

    const err = await catchRedirect(() => requireRole("admin"))

    expect(err.to).toBe("/auth/login")
  })

  it("redirects to /auth/login when session has no user", async () => {
    mockGetSession.mockResolvedValue({ session: {}, user: null })

    const err = await catchRedirect(() => requireRole("user"))

    expect(err.to).toBe("/auth/login")
  })

  it("allows a user-role user to access user-protected routes", async () => {
    mockGetSession.mockResolvedValue(makeSession("user"))

    const result = await requireRole("user")

    expect(result).toMatchObject({ user: { role: "user" } })
  })
})
