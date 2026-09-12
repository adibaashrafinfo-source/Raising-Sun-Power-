import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2.5 py-1 text-[11px] font-bold leading-none w-fit whitespace-nowrap",
  {
    variants: {
      variant: {
        orange: "bg-orange-500/15 text-orange-500",
        blue: "bg-blue-500/15 text-blue",
        green: "bg-green-500/15 text-green-600",
        gold: "bg-gold-400/25 text-[#7a5b00]",
        neutral: "bg-surface-2 text-muted border border-border",
        outline: "border border-blue-500/40 text-blue bg-transparent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
