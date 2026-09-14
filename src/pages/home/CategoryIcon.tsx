import {
  Blocks,
  Boxes,
  Cable,
  Fan,
  Gauge,
  Lightbulb,
  PanelTop,
  Plug,
  Puzzle,
  Smartphone,
  ToggleLeft,
  Wrench,
  Zap,
} from "lucide-react"

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  "solar-panels": PanelTop,
  inverters: Zap,
  batteries: Boxes,
  "mcb-mccb": Blocks,
  switchgear: Gauge,
  "cables-wires": Cable,
  "complete-solutions": Puzzle,
  accessories: Wrench,
  "dc-fan": Fan,
  "dc-light": Lightbulb,
  "ac-fan": Fan,
  "switch-socket": ToggleLeft,
  gadgets: Smartphone,
  ips: Plug,
  "portable-power-station": Boxes,
}

const COLORS: Record<string, string> = {
  "solar-panels": "#217CCA",
  inverters: "#F49E09",
  batteries: "#67A70E",
  "mcb-mccb": "#217CCA",
  switchgear: "#F49E09",
  "cables-wires": "#67A70E",
  "complete-solutions": "#F49E09",
  accessories: "#217CCA",
  "dc-fan": "#F49E09",
  "dc-light": "#67A70E",
  "ac-fan": "#217CCA",
  "switch-socket": "#052C6E",
  gadgets: "#F49E09",
  ips: "#67A70E",
  "portable-power-station": "#217CCA",
}

export function CategoryIcon({ slug }: { slug: string }) {
  const Icon = ICONS[slug] ?? Boxes
  return <Icon className="size-[26px]" style={{ color: COLORS[slug] }} />
}
