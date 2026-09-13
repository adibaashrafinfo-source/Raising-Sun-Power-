import { useState } from "react"
import { Plus } from "lucide-react"
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
import { useCreateExpense, useExpenseCategories, useExpenses } from "@/hooks/use-admin"
import { formatBDT } from "@/lib/utils"
import type { FinancePaymentMethod } from "@/types/database"

export default function AdminExpensesPage() {
  const { data: categories = [] } = useExpenseCategories()
  const [categoryFilter, setCategoryFilter] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const { data: expenses = [], isLoading } = useExpenses({
    categoryId: categoryFilter || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  })
  const [dialogOpen, setDialogOpen] = useState(false)

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-extrabold text-text">Expenses</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Add Expense
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3 text-sm text-text outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Input type="date" className="w-40" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <Input type="date" className="w-40" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : expenses.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No expenses found.</p>
        ) : (
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Method</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-semibold text-text">{e.category?.name}</td>
                  <td className="px-4 py-3 text-muted">{e.description ?? "—"}</td>
                  <td className="px-4 py-3 uppercase text-muted">{e.payment_method}</td>
                  <td className="px-4 py-3 text-muted">{e.expense_date}</td>
                  <td className="px-4 py-3 font-bold tabular-nums text-red-500">{formatBDT(e.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border font-bold">
                <td className="px-4 py-3 text-text" colSpan={4}>
                  Total
                </td>
                <td className="px-4 py-3 tabular-nums text-red-500">{formatBDT(total)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <AddExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen} categories={categories} />
    </div>
  )
}

function AddExpenseDialog({
  open,
  onOpenChange,
  categories,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: { id: string; name: string }[]
}) {
  const createExpense = useCreateExpense()
  const [categoryId, setCategoryId] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [method, setMethod] = useState<FinancePaymentMethod>("cash")
  const [description, setDescription] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) {
      toast.error("Select a category")
      return
    }
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    try {
      await createExpense.mutateAsync({
        category_id: categoryId,
        amount: amt,
        expense_date: date,
        description: description || null,
        payment_method: method,
      })
      toast.success("Expense recorded")
      onOpenChange(false)
      setCategoryId("")
      setAmount("")
      setDescription("")
    } catch {
      toast.error("Couldn't record this expense")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <div>
            <Label className="mb-1.5 block">Category *</Label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-1.5 block">Amount (৳) *</Label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Date *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Payment method *</Label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as FinancePaymentMethod)}
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
            >
              <option value="cash">Cash</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="bank">Bank Transfer</option>
              <option value="card">Card</option>
            </select>
          </div>
          <div>
            <Label className="mb-1.5 block">Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createExpense.isPending}>
              {createExpense.isPending ? "Saving…" : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
