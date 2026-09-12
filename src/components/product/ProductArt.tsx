import type { ProductCardData } from "@/types/product"

function PanelArt() {
  return (
    <g>
      <rect x={14} y={12} width={92} height={64} rx={5} fill="#0B3F94" stroke="#052C6E" strokeWidth={2} />
      <line x1={45} y1={14} x2={45} y2={74} stroke="#4B9BE6" strokeWidth={1.6} />
      <line x1={75} y1={14} x2={75} y2={74} stroke="#4B9BE6" strokeWidth={1.6} />
      <line x1={16} y1={33} x2={104} y2={33} stroke="#4B9BE6" strokeWidth={1.6} />
      <line x1={16} y1={54} x2={104} y2={54} stroke="#4B9BE6" strokeWidth={1.6} />
      <rect x={55} y={76} width={10} height={14} fill="#217CCA" />
    </g>
  )
}

function InverterArt() {
  return (
    <g fill="none" stroke="#0B3F94" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x={24} y={14} width={72} height={66} rx={8} fill="#EAF1FB" />
      <circle cx={60} cy={36} r={11} stroke="#217CCA" />
      <path d="M55 36h10M60 31v10" stroke="#F49E09" />
      <rect x={38} y={56} width={44} height={6} rx={3} fill="#217CCA" stroke="none" />
      <rect x={38} y={66} width={28} height={6} rx={3} fill="#67A70E" stroke="none" />
    </g>
  )
}

function BatteryArt() {
  return (
    <g fill="none" stroke="#0B3F94" strokeWidth={2.4} strokeLinejoin="round">
      <rect x={30} y={20} width={60} height={60} rx={8} fill="#EAF1FB" />
      <rect x={42} y={12} width={14} height={9} rx={2} fill="#217CCA" stroke="none" />
      <rect x={64} y={12} width={14} height={9} rx={2} fill="#217CCA" stroke="none" />
      <path d="M62 34l-10 16h12l-10 16" stroke="#F49E09" strokeWidth={3} strokeLinecap="round" fill="none" />
    </g>
  )
}

function BreakerArt() {
  return (
    <g fill="none" stroke="#0B3F94" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x={38} y={14} width={44} height={68} rx={6} fill="#EAF1FB" />
      <rect x={52} y={26} width={16} height={22} rx={3} fill="#F49E09" stroke="none" />
      <path d="M60 54v18M48 82h24" />
    </g>
  )
}

function CableArt() {
  return (
    <g fill="none" strokeWidth={5} strokeLinecap="round">
      <path d="M20 30c20 0 20 30 40 30s20-30 40-30" stroke="#F49E09" />
      <path d="M20 46c20 0 20 30 40 30s20-30 40-30" stroke="#217CCA" />
      <path d="M20 62c20 0 20 14 40 14" stroke="#67A70E" />
    </g>
  )
}

const ART: Record<ProductCardData["art"], () => React.JSX.Element> = {
  panel: PanelArt,
  inverter: InverterArt,
  battery: BatteryArt,
  breaker: BreakerArt,
  cable: CableArt,
}

export function ProductArt({ art, className }: { art: ProductCardData["art"]; className?: string }) {
  const Art = ART[art]
  return (
    <svg width={118} height={94} viewBox="0 0 120 96" fill="none" className={className} style={{ opacity: 0.92 }}>
      <Art />
    </svg>
  )
}
