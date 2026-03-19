import type { ComponentPropsWithoutRef } from "react"

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info"

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    background: "var(--chip-bg)",
    borderColor: "var(--chip-line)",
    color: "var(--sea-ink-soft)",
  },
  success: {
    background: "color-mix(in oklab, var(--palm) 12%, transparent)",
    borderColor: "color-mix(in oklab, var(--palm) 28%, transparent)",
    color: "var(--palm)",
  },
  warning: {
    background: "rgba(204, 132, 0, 0.1)",
    borderColor: "rgba(204, 132, 0, 0.25)",
    color: "#a06200",
  },
  danger: {
    background: "color-mix(in oklab, var(--destructive) 10%, transparent)",
    borderColor: "color-mix(in oklab, var(--destructive) 25%, transparent)",
    color: "var(--destructive)",
  },
  info: {
    background: "color-mix(in oklab, var(--lagoon) 12%, transparent)",
    borderColor: "color-mix(in oklab, var(--lagoon) 28%, transparent)",
    color: "var(--lagoon-deep)",
  },
}

export function Badge({ variant = "default", className = "", style, children, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      style={{ ...variantStyles[variant], ...style }}
      className={[
        "inline-flex items-center font-semibold",
        "text-[0.7rem] px-2 py-0.5 rounded-full border",
        "backdrop-blur-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  )
}
