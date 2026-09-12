import { Check, MessageCircle } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import type { Lead } from "@/types/database"

export default function QuotationReceivedPage() {
  const location = useLocation()
  const lead = (location.state as { lead?: Lead } | null)?.lead

  if (!lead) {
    return (
      <main className="mx-auto max-w-[640px] px-4 py-16 text-center sm:px-6">
        <div className="rounded-[22px] border border-border bg-surface p-14 shadow-[var(--shadow-sm)]">
          <div className="font-heading text-xl font-extrabold text-text">No recent request</div>
          <p className="my-2 text-[15px] text-muted">Submit a quotation request to see your confirmation here.</p>
          <Button className="mt-4" asChild>
            <Link to="/get-quotation">Get a quotation</Link>
          </Button>
        </div>
      </main>
    )
  }

  const waMessage = `Hi RSP, following up on my quotation request ${lead.ref_id}.`

  return (
    <main className="mx-auto max-w-[640px] px-4 pb-16 pt-8 sm:px-6">
      <div className="text-center">
        <span className="inline-flex size-[88px] items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-500 shadow-[0_14px_34px_rgba(103,167,14,.4)]">
          <Check className="size-11 text-white" strokeWidth={2.5} />
        </span>
        <h1 className="mt-5 font-heading text-[clamp(24px,4vw,32px)] font-extrabold tracking-tight text-text">
          Quotation Request Received! 🎉
        </h1>
        <p className="mt-1.5 text-[15px] text-muted">আপনার অনুরোধ গ্রহণ করা হয়েছে</p>
        <div className="mt-[18px] inline-flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-5 py-3 shadow-[var(--shadow-sm)]">
          <span className="text-[13px] text-muted">Reference ID</span>
          <span className="font-heading text-lg font-extrabold tracking-wide text-orange-500">
            #{lead.ref_id}
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-[22px]">
        <div className="mb-4 font-heading text-base font-extrabold text-text">Your request</div>
        <div className="flex flex-col gap-2.5">
          <Row label="Name" value={lead.name} />
          <Row label="Mobile" value={lead.phone} />
          <Row label="Location" value={`${lead.district}, ${lead.division}`} />
          <Row label="Load" value={lead.load_watt ? `${lead.load_watt}W` : "—"} />
          <Row label="Backup" value={lead.backup_hours ? `${lead.backup_hours}h` : "—"} />
          {lead.budget_range && <Row label="Budget" value={lead.budget_range} />}
        </div>
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-[13.5px] font-semibold text-green-600">
          <Check className="size-4" />
          Our solar expert will call you within 24 hours.
        </div>
      </div>

      <div className="mt-[22px] flex flex-wrap gap-3">
        <Button asChild size="lg" className="min-w-[170px] flex-1">
          <a href={`https://wa.me/8801705742208?text=${encodeURIComponent(waMessage)}`}>
            <MessageCircle className="size-[18px]" />
            Chat on WhatsApp Now
          </a>
        </Button>
        <Button asChild variant="secondary" size="lg" className="min-w-[170px] flex-1">
          <Link to="/products">Browse Products While You Wait</Link>
        </Button>
      </div>
      <div className="mt-[22px] rounded-2xl bg-surface-2 p-4 text-center text-[13.5px] text-muted">
        Questions?{" "}
        <a href="https://wa.me/8801705742208" className="font-bold text-blue no-underline">
          Call/WhatsApp +880 1705-742208
        </a>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold text-text">{value}</span>
    </div>
  )
}
