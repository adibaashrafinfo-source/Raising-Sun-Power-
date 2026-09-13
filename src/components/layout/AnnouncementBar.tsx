import { useState } from "react"
import { Leaf, X, Zap } from "lucide-react"

import { useSettings } from "@/hooks/use-checkout"

export function AnnouncementBar() {
  const [open, setOpen] = useState(true)
  const { data: settings } = useSettings()
  const phone = settings?.support_phone || "+8801705742208"
  if (!open) return null

  return (
    <div className="bg-[linear-gradient(100deg,#217CCA,#F49E09_60%,#67A70E)] text-[13px] font-semibold text-white dark:bg-[linear-gradient(100deg,#217CCA,#67A70E)]">
      <div className="relative mx-auto flex max-w-[1280px] items-center justify-center gap-2.5 px-4 py-2 text-center sm:justify-between sm:px-6">
        <span className="inline-flex flex-wrap items-center justify-center gap-2">
          <Zap className="size-[15px] fill-current" />
          Free delivery on orders over ৳5,000 · Call/WhatsApp <b>{phone}</b>
        </span>
        <span className="hidden items-center gap-1.5 italic text-white/90 sm:inline-flex">
          <Leaf className="size-[13px]" />
          Clean Energy, Brighter Tomorrow
        </span>
        <button
          onClick={() => setOpen(false)}
          aria-label="Dismiss"
          className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md bg-white/20 sm:static sm:translate-y-0"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
