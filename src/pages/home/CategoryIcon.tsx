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
  "solar-panels": "#0352AF",
  inverters: "#FA9104",
  batteries: "#3F8F0C",
  "mcb-mccb": "#0352AF",
  switchgear: "#FA9104",
  "cables-wires": "#3F8F0C",
  "complete-solutions": "#FA9104",
  accessories: "#0352AF",
  "dc-fan": "#FA9104",
  "dc-light": "#3F8F0C",
  "ac-fan": "#0352AF",
  "switch-socket": "#011653",
  gadgets: "#FA9104",
  ips: "#3F8F0C",
  "portable-power-station": "#0352AF",
}

export function CategoryIcon({ slug, className = "size-[26px]" }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? Boxes
  return <Icon className={className} style={{ color: COLORS[slug] ?? "#FA9104" }} />
}
