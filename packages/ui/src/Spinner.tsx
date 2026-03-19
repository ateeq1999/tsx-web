import type { ComponentPropsWithoutRef } from "react"

type SpinnerSize = "sm" | "md" | "lg"

interface SpinnerProps extends ComponentPropsWithoutRef<"span"> {
  size?: SpinnerSize
  label?: string
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: "size-4 border-2",
  md: "size-6 border-2",
  lg: "size-9 border-[3px]",
}

export function Spinner({ size = "md", label = "Loading…", className = "", ...props }: SpinnerProps) {
  return (
    <span
      {...props}
      role="status"
      aria-label={label}
      className={["inline-block", className].filter(Boolean).join(" ")}
    >
      <span
        style={{
          borderColor: "var(--line)",
          borderTopColor: "var(--lagoon)",
        }}
        className={[
          "block rounded-full animate-spin",
          sizeMap[size],
        ].join(" ")}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
