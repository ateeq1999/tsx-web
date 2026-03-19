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

// Import after mocks are registered
const { requireAuth } = await import("./auth-guard")

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeSession(overrides?: object) {
  return {
    user: { id: "user-1", email: "test@example.com", role: "user", ...overrides },
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

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns the session when the user is authenticated", async () => {
    const session = makeSession()
    mockGetSession.mockResolvedValue(session)

    const result = await requireAuth()

    expect(result).toStrictEqual(session)
  })

  it("redirects to /auth/login when session is null", async () => {
    mockGetSession.mockResolvedValue(null)

    const err = await catchRedirect(requireAuth)

    expect(err.to).toBe("/auth/login")
  })

  it("redirects to /auth/login when session has no user", async () => {
    mockGetSession.mockResolvedValue({ session: { id: "s" }, user: null })

    const err = await catchRedirect(requireAuth)

    expect(err.to).toBe("/auth/login")
  })

  it("redirects to /auth/login when getSession rejects", async () => {
    mockGetSession.mockRejectedValue(new Error("DB connection error"))

    await expect(requireAuth()).rejects.toThrow()
  })
})
