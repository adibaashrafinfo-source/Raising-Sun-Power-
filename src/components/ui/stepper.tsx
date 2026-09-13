import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

type StepperProps = {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  className?: string
}

function Stepper({ value, min = 1, max = 99, onChange, className }: StepperProps) {
  const decrement = () => onChange(Math.max(min, value - 1))
  const increment = () => onChange(Math.min(max, value + 1))

  return (
    <div
      className={cn(
        "inline-flex h-11 items-center rounded-[var(--radius-md)] border border-border bg-surface-2",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={decrement}
        disabled={value <= min}
        className="flex h-full w-10 items-center justify-center text-muted transition-colors hover:text-blue disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center text-sm font-bold text-text">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={increment}
        disabled={value >= max}
        className="flex h-full w-10 items-center justify-center text-muted transition-colors hover:text-blue disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}

export { Stepper }
