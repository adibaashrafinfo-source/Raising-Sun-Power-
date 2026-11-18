import { useEffect } from "react"

import { useSiteContent } from "@/hooks/use-site-content"

const FALLBACK = "/favicon.png"

function setIcon(href: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement("link")
    link.rel = "icon"
    document.head.appendChild(link)
  }
  link.type = href.startsWith("data:") ? "image/png" : ""
  link.href = href
}

/**
 * Keeps the browser-tab icon in step with the logo uploaded in the admin CMS.
 * A wide lockup is cropped to its left square (the emblem) so it stays legible
 * at 16–32px; if the image can't be read for cropping the default icon stays.
 */
export function useBrandFavicon() {
  const { data } = useSiteContent()
  const url = data?.header_logo_url

  useEffect(() => {
    if (!url) {
      setIcon(FALLBACK)
      return
    }
    let cancelled = false
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      if (cancelled) return
      try {
        const side = Math.min(img.naturalWidth, img.naturalHeight)
        const canvas = document.createElement("canvas")
        canvas.width = canvas.height = 128
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(img, 0, 0, side, side, 0, 0, 128, 128)
        setIcon(canvas.toDataURL("image/png"))
      } catch {
        setIcon(FALLBACK)
      }
    }
    img.onerror = () => !cancelled && setIcon(FALLBACK)
    img.src = url
    return () => {
      cancelled = true
    }
  }, [url])
}
