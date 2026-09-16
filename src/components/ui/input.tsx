import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm transition-shadow placeholder:text-muted",
        "focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--blue)_30%,transparent)] focus-visible:border-blue",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-red-500",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
