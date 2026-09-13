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
import { useAllCategoriesAdmin, useDeleteCategory, useUpsertCategory } from "@/hooks/use-admin"
import { slugify } from "@/lib/schemas/product"
import type { Category } from "@/types/database"

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useAllCategoriesAdmin()
  const deleteCategory = useDeleteCategory()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete "${category.name}"?`)) return
    try {
      await deleteCategory.mutateAsync(category.id)
      toast.success("Category deleted")
    } catch {
      toast.error("Couldn't delete — it may still have products.")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold text-text">Categories</h1>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="size-4" /> New Category
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
              <div>
                <div className="text-sm font-bold text-text">{category.name}</div>
                <div className="text-xs text-muted">/{category.slug}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(category)
                    setDialogOpen(true)
                  }}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(category)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryDialog key={editing?.id ?? "new"} open={dialogOpen} onOpenChange={setDialogOpen} category={editing} />
    </div>
  )
}

function CategoryDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
}) {
  const upsertCategory = useUpsertCategory()
  const [name, setName] = useState(category?.name ?? "")
  const [slug, setSlug] = useState(category?.slug ?? "")
  const [sortOrder, setSortOrder] = useState(category?.sort_order ?? 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await upsertCategory.mutateAsync({ id: category?.id, name, slug, sort_order: sortOrder })
      toast.success(category ? "Category updated" : "Category created")
      onOpenChange(false)
    } catch {
      toast.error("Couldn't save this category")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <Label className="mb-1.5 block">Name</Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!category) setSlug(slugify(e.target.value))
              }}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div>
            <Label className="mb-1.5 block">Sort order</Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
