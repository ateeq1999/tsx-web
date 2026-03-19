import type { ComponentPropsWithoutRef } from "react"

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--lagoon)] text-[var(--foam)] hover:bg-[var(--lagoon-deep)] border-transparent",
  secondary:
    "bg-[var(--surface)] text-[var(--sea-ink)] hover:bg-[var(--surface-strong)] border-[var(--line)]",
  ghost:
    "bg-transparent text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] border-transparent",
  destructive:
    "bg-[var(--destructive)] text-white hover:opacity-90 border-transparent",
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-base",
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-md border font-medium",
        "transition-colors duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lagoon)] focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  )
}
