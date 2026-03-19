import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  /** Use "island" for the elevated hero-style shell, "feature" for hover-lift cards */
  variant?: "island" | "feature" | "plain"
}

interface CardHeaderProps extends ComponentPropsWithoutRef<"div"> {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export function Card({ variant = "feature", className = "", children, ...props }: CardProps) {
  const variantClass =
    variant === "island"
      ? "island-shell rounded-xl p-6"
      : variant === "feature"
        ? "feature-card rounded-xl p-6"
        : "rounded-xl border p-6"

  return (
    <div
      {...props}
      style={variant === "plain" ? { borderColor: "var(--line)" } : undefined}
      className={[variantClass, className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, description, action, className = "", ...props }: CardHeaderProps) {
  return (
    <div {...props} className={["flex items-start justify-between gap-4 mb-4", className].filter(Boolean).join(" ")}>
      <div>
        <h3 style={{ color: "var(--sea-ink)" }} className="font-semibold text-base leading-snug m-0">
          {title}
        </h3>
        {description && (
          <p style={{ color: "var(--sea-ink-soft)" }} className="text-sm mt-1 m-0">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardFooter({ className = "", children, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      style={{ borderTop: "1px solid var(--line)" }}
      className={["mt-4 pt-4 flex items-center gap-3", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  )
}
