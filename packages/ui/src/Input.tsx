import type { ComponentPropsWithoutRef, ReactNode } from "react"

interface InputProps extends ComponentPropsWithoutRef<"input"> {
  label?: string
  error?: string
  hint?: string
  /** Icon or element placed on the left inside the input */
  prefix?: ReactNode
}

export function Input({ label, error, hint, prefix, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          style={{ color: "var(--sea-ink-soft)" }}
          className="text-xs font-semibold tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span
            style={{ color: "var(--sea-ink-soft)" }}
            className="absolute left-3 flex items-center pointer-events-none"
          >
            {prefix}
          </span>
        )}
        <input
          {...props}
          id={inputId}
          style={{
            background: "var(--surface)",
            borderColor: error ? "var(--destructive)" : "var(--line)",
            color: "var(--sea-ink)",
          }}
          className={[
            "w-full h-9 rounded-md border px-3 text-sm",
            "placeholder:text-[var(--sea-ink-soft)] placeholder:opacity-60",
            "focus:outline-none focus:ring-2 focus:ring-[var(--lagoon)] focus:ring-offset-0",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors duration-150",
            prefix ? "pl-9" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
      {error && (
        <p style={{ color: "var(--destructive)" }} className="text-xs">
          {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ color: "var(--sea-ink-soft)" }} className="text-xs">
          {hint}
        </p>
      )}
    </div>
  )
}
