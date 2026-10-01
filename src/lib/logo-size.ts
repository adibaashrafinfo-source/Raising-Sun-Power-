/**
 * The header logo's height is CMS-driven (site_content.header_logo_height), so
 * the bar can be tuned from the admin panel without a deploy. The bounds keep
 * it between "too small to read" and "taller than the bar".
 */
export const DEFAULT_LOGO_HEIGHT = 56
export const LOGO_HEIGHT_MIN = 32
export const LOGO_HEIGHT_MAX = 120

export const clampLogoHeight = (height: number) =>
  Math.min(Math.max(height, LOGO_HEIGHT_MIN), LOGO_HEIGHT_MAX)
