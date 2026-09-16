import { useState } from "react"
import { Eye, X } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAllLeads, useUpdateLead } from "@/hooks/use-admin"
import type { Lead, LeadStatus } from "@/types/database"

const STATUSES: LeadStatus[] = ["new", "contacted", "quoted", "converted", "lost"]

// Assessment/wholesale leads carry a free-text `location`; calculator and
// quotation leads carry a division/district pair instead.
function formatLocation(lead: Lead): string {
  if (lead.location) return lead.location
  const parts = [lead.district, lead.division].filter(Boolean)
  return parts.length ? parts.join(", ") : "—"
}
const STATUS_VARIANT: Record<LeadStatus, "blue" | "gold" | "green" | "neutral"> = {
  new: "blue",
  contacted: "gold",
  quoted: "gold",
  converted: "green",
  lost: "neutral",
}

export default function AdminLeadsPage() {
  const [status, setStatus] = useState<LeadStatus | "">("")
  const [selected, setSelected] = useState<Lead | null>(null)
  const { data: leads = [], isLoading } = useAllLeads({ status: status || undefined })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-extrabold text-text">Leads</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus | "")}
          className="h-11 rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : leads.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No leads found.</p>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Load</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-border last:border-0 hover:bg-surface-2"
                >
                  <td className="px-4 py-3 font-semibold text-text">{lead.name}</td>
                  <td className="px-4 py-3 text-muted">{lead.phone}</td>
                  <td className="px-4 py-3 text-muted">{formatLocation(lead)}</td>
                  <td className="px-4 py-3 text-text">
                    {lead.load_watt ? `${lead.load_watt}W` : "—"} / {lead.backup_hours ?? "—"}h
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{lead.source}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[lead.status]}>{lead.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" title="View" onClick={() => setSelected(lead)}>
                        <Eye className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <LeadDetailDialog lead={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function LeadDetailDialog({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const updateLead = useUpdateLead()
  const [notes, setNotes] = useState(lead?.admin_notes ?? "")

  const handleStatusChange = async (status: LeadStatus) => {
    if (!lead) return
    try {
      await updateLead.mutateAsync({ id: lead.id, patch: { status } })
      toast.success("Lead status updated")
    } catch {
      toast.error("Couldn't update lead status")
    }
  }

  const handleSaveNotes = async () => {
    if (!lead) return
    try {
      await updateLead.mutateAsync({ id: lead.id, patch: { admin_notes: notes } })
      toast.success("Notes saved")
    } catch {
      toast.error("Couldn't save notes")
    }
  }

  return (
    <Dialog open={!!lead} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showClose={false}>
        {lead && (
          <>
            <div className="flex items-center justify-between">
              <DialogTitle>{lead.name}</DialogTitle>
              <button onClick={onClose} className="text-muted hover:text-text">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <Row label="Phone" value={lead.phone} />
              {lead.email && <Row label="Email" value={lead.email} />}
              <Row label="Location" value={formatLocation(lead)} />
              {lead.customer_type && <Row label="Customer type" value={lead.customer_type} />}
              {lead.system_type && <Row label="System required" value={lead.system_type} />}
              {lead.monthly_bill && <Row label="Monthly bill" value={lead.monthly_bill} />}
              {lead.load_watt != null && <Row label="Load" value={`${lead.load_watt}W`} />}
              {lead.backup_hours != null && <Row label="Backup" value={`${lead.backup_hours}h`} />}
              {lead.budget_range && <Row label="Budget" value={lead.budget_range} />}
              {lead.roof_type && <Row label="Roof" value={lead.roof_type} />}
              {lead.timeline && <Row label="Timeline" value={lead.timeline} />}
              {lead.notes && <Row label="Customer notes" value={lead.notes} />}

              <div>
                <div className="mb-1.5 text-xs font-semibold text-muted">Status</div>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        lead.status === s ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-border text-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-xs font-semibold text-muted">Admin notes</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px] w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-2.5 text-base text-text outline-none sm:text-sm"
                />
                <Button size="sm" className="mt-2" onClick={handleSaveNotes}>
                  Save Notes
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold text-text">{value}</span>
    </div>
  )
}
