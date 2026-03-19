import * as Sentry from "@sentry/react"
import { env } from "@/env"

export function initSentry() {
  if (!env.VITE_SENTRY_DSN) return

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    // Only send errors in production; keep dev noise-free.
    enabled: import.meta.env.PROD,
    // Capture 10% of transactions for performance monitoring.
    tracesSampleRate: 0.1,
    integrations: [Sentry.browserTracingIntegration()],
  })
}

export { Sentry }
