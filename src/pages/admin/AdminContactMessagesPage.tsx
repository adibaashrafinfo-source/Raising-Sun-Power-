import { useState } from "react"
import { Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useContactMessages, useDeleteContactMessage, useMarkContactMessageRead } from "@/hooks/use-admin"
import { getErrorMessage } from "@/lib/utils"
import type { ContactMessage } from "@/types/database"

export default function AdminContactMessagesPage() {
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const { data: messages = [], isLoading } = useContactMessages()
  const markRead = useMarkContactMessageRead()

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg)
    if (msg.status === "new") markRead.mutate(msg.id)
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl font-extrabold text-text">Contact Messages</h1>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : messages.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No messages yet.</p>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-2"
                >
                  <td className="px-4 py-3 font-semibold text-text">{msg.name}</td>
                  <td className="max-w-[280px] truncate px-4 py-3 text-muted">{msg.subject}</td>
                  <td className="px-4 py-3 text-muted">{new Date(msg.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={msg.status === "new" ? "blue" : "neutral"}>{msg.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <MessageDetailDialog message={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function MessageDetailDialog({ message, onClose }: { message: ContactMessage | null; onClose: () => void }) {
  const deleteMessage = useDeleteContactMessage()

  const handleDelete = async () => {
    if (!message) return
    try {
      await deleteMessage.mutateAsync(message.id)
      toast.success("Message deleted")
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete message"))
    }
  }

  return (
    <Dialog open={!!message} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showClose={false}>
        {message && (
          <>
            <div className="flex items-center justify-between">
              <DialogTitle>{message.subject}</DialogTitle>
              <button onClick={onClose} className="text-muted hover:text-text">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <Row label="Name" value={message.name} />
              <Row label="Email" value={message.email} />
              {message.phone && <Row label="Phone" value={message.phone} />}
              <Row label="Date" value={new Date(message.created_at).toLocaleString()} />
              <div>
                <div className="mb-1.5 text-xs font-semibold text-muted">Message</div>
                <p className="whitespace-pre-wrap rounded-[var(--radius-sm)] border border-border bg-surface-2 p-3.5 leading-relaxed text-text">
                  {message.message}
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 border-t border-border pt-3.5">
                <Button asChild size="sm">
                  <a href={`mailto:${message.email}`}>Reply by Email</a>
                </Button>
                <Button size="sm" variant="outline" className="text-red-500" onClick={handleDelete}>
                  <Trash2 className="size-4" /> Delete
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
