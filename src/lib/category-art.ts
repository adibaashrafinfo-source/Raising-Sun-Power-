import type { ProductCardData } from "@/types/product"

const SLUG_ART: Record<string, ProductCardData["art"]> = {
  "solar-panels": "panel",
  inverters: "inverter",
  batteries: "battery",
  "mcb-mccb": "breaker",
  switchgear: "breaker",
  "cables-wires": "cable",
}

const SLUG_TINT: Record<string, string> = {
  "solar-panels": "linear-gradient(135deg,#EAF1FB,#C9DCF3)",
  inverters: "linear-gradient(135deg,#FEF0D6,#F7D69B)",
  batteries: "linear-gradient(135deg,#EAF6DD,#CDE9B7)",
  "mcb-mccb": "linear-gradient(135deg,#EAF1FB,#C9DCF3)",
  switchgear: "linear-gradient(135deg,#FEF0D6,#F7D69B)",
  "cables-wires": "linear-gradient(135deg,#EAF6DD,#CDE9B7)",
}

export function artForCategory(slug: string | undefined | null): ProductCardData["art"] {
  return (slug && SLUG_ART[slug]) || "panel"
}

export function tintForCategory(slug: string | undefined | null): string {
  return (slug && SLUG_TINT[slug]) || "linear-gradient(135deg,#EAF1FB,#C9DCF3)"
}
