import {
  Blocks,
  Boxes,
  Cable,
  Gauge,
  PanelTop,
  Puzzle,
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
}

export function CategoryIcon({ slug }: { slug: string }) {
  const Icon = ICONS[slug] ?? Boxes
  return <Icon className="size-[26px]" style={{ color: COLORS[slug] }} />
}
