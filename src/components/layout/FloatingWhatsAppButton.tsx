import { useState } from "react"
import { MessageCircle } from "lucide-react"

import { useSettings } from "@/hooks/use-checkout"

export function FloatingWhatsAppButton() {
  const { data: settings } = useSettings()
  const [hovered, setHovered] = useState(false)
  const whatsappNumber = settings?.whatsapp_number || "8801786896390"

  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-[84px] right-4 z-50 flex items-center gap-2.5 no-underline lg:bottom-7 lg:right-7"
    >
      {hovered && (
        <span className="hidden animate-in fade-in slide-in-from-right-2 rounded-xl bg-[#111b0f] px-3.5 py-2 text-[13px] font-semibold text-white shadow-[var(--shadow)] duration-200 sm:block">
          Chat with us
        </span>
      )}
      <span className="relative flex size-[58px] items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-40 [animation-duration:2.2s]" />
        <span
          className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 [animation-delay:.6s] [animation-duration:2.2s]"
        />
        <span className="relative flex size-full items-center justify-center rounded-full bg-[linear-gradient(160deg,#2be374,#1fa851)] shadow-[0_10px_30px_rgba(37,211,102,.55)] transition-transform duration-200 ease-out hover:scale-110 active:scale-95">
          <MessageCircle className="size-7 text-white" />
        </span>
      </span>
    </a>
  )
}
