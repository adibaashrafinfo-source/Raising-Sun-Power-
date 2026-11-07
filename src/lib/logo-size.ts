/**
 * Logo heights are CMS-driven (site_content.header_logo_height and
 * footer_logo_height), so the bars can be tuned from the admin panel without a
 * deploy. The bounds keep each between "too small to read" and "taller than
 * the bar".
 */
export const DEFAULT_LOGO_HEIGHT = 56
export const LOGO_HEIGHT_MIN = 32
export const LOGO_HEIGHT_MAX = 160

export const clampLogoHeight = (height: number) =>
  Math.min(Math.max(height, LOGO_HEIGHT_MIN), LOGO_HEIGHT_MAX)

export const DEFAULT_FOOTER_LOGO_HEIGHT = 80
export const FOOTER_LOGO_HEIGHT_MIN = 32
export const FOOTER_LOGO_HEIGHT_MAX = 240

export const clampFooterLogoHeight = (height: number) =>
  Math.min(Math.max(height, FOOTER_LOGO_HEIGHT_MIN), FOOTER_LOGO_HEIGHT_MAX)

/** A "Registered & trusted" logo in the footer. Height is in pixels. */
export type FooterBadge = { url: string; alt: string; height: number; zoom?: number }

export const BADGE_HEIGHT_MIN = 32
export const BADGE_HEIGHT_MAX = 200
export const DEFAULT_BADGE_HEIGHT = 80

/** Shown until the admin saves their own list from the CMS. */
export const DEFAULT_FOOTER_BADGES: FooterBadge[] = [
  { url: "/badges/dncc.jpg", alt: "Dhaka North City Corporation", height: 80, zoom: 1.65 },
  { url: "/badges/sreda-stakeholder.png", alt: "SREDA Stakeholder", height: 76 },
  { url: "/badges/trustpilot.png", alt: "Review us on Trustpilot", height: 80 },
]
