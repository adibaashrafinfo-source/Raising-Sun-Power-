import { useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useCashBankAccounts, useDeleteCashBankAccount, useUpsertCashBankAccount } from "@/hooks/use-admin"
import { formatBDT } from "@/lib/utils"
import type { CashAccountType, CashBankAccount } from "@/types/database"

export default function AdminAccountsPage() {
  const { data: accounts = [], isLoading } = useCashBankAccounts()
  const deleteAccount = useDeleteCashBankAccount()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CashBankAccount | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (a: CashBankAccount) => {
    setEditing(a)
    setDialogOpen(true)
  }

  const handleDelete = async (a: CashBankAccount) => {
    if (!confirm(`Delete "${a.account_name}"?`)) return
    try {
      await deleteAccount.mutateAsync(a.id)
      toast.success("Account deleted")
    } catch {
      toast.error("Couldn't delete this account")
    }
  }

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.current_balance), 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-extrabold text-text">Cash & Bank Accounts</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          New Account
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="text-xs text-muted">Total balance across all accounts</div>
        <div className="font-heading text-2xl font-extrabold tabular-nums text-orange-500">
          {formatBDT(totalBalance)}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : accounts.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No accounts yet.</p>
        ) : (
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Account</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Balance</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-text">{a.account_name}</div>
                    {a.account_number && <div className="text-xs text-muted">{a.account_number}</div>}
                  </td>
                  <td className="px-4 py-3 uppercase text-muted">{a.account_type}</td>
                  <td className="px-4 py-3 font-bold tabular-nums text-text">{formatBDT(a.current_balance)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(a)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(a)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AccountDialog key={editing?.id ?? "new"} open={dialogOpen} onOpenChange={setDialogOpen} account={editing} />
    </div>
  )
}

function AccountDialog({
  open,
  onOpenChange,
  account,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: CashBankAccount | null
}) {
  const upsertAccount = useUpsertCashBankAccount()
  const [name, setName] = useState(account?.account_name ?? "")
  const [type, setType] = useState<CashAccountType>(account?.account_type ?? "cash")
  const [accountNumber, setAccountNumber] = useState(account?.account_number ?? "")
  const [balance, setBalance] = useState(String(account?.current_balance ?? 0))
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Enter an account name")
      return
    }
    setSubmitting(true)
    try {
      await upsertAccount.mutateAsync({
        id: account?.id,
        account_name: name.trim(),
        account_type: type,
        account_number: accountNumber || null,
        current_balance: Number(balance) || 0,
      })
      toast.success(account ? "Account updated" : "Account created")
      onOpenChange(false)
    } catch {
      toast.error("Couldn't save this account")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{account ? "Edit Account" : "New Account"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <div>
            <Label className="mb-1.5 block">Account name *</Label>
            <Input placeholder="e.g. Main Cash Box" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Type *</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CashAccountType)}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="bkash">bKash Merchant</option>
              <option value="nagad">Nagad Merchant</option>
            </select>
          </div>
          <div>
            <Label className="mb-1.5 block">Account number</Label>
            <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Current balance (৳) *</Label>
            <Input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
