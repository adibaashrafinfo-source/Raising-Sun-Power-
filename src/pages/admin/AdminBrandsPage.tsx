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
import { useAllBrandsAdmin, useDeleteBrand, useUpsertBrand } from "@/hooks/use-admin"
import { slugify } from "@/lib/schemas/product"
import type { Brand } from "@/types/database"

export default function AdminBrandsPage() {
  const { data: brands = [], isLoading } = useAllBrandsAdmin()
  const deleteBrand = useDeleteBrand()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Delete "${brand.name}"?`)) return
    try {
      await deleteBrand.mutateAsync(brand.id)
      toast.success("Brand deleted")
    } catch {
      toast.error("Couldn't delete — it may still have products.")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-extrabold text-text">Brands</h1>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="size-4" /> New Brand
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
              <div>
                <div className="text-sm font-bold text-text">{brand.name}</div>
                <div className="text-xs text-muted">/{brand.slug}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(brand)
                    setDialogOpen(true)
                  }}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(brand)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BrandDialog key={editing?.id ?? "new"} open={dialogOpen} onOpenChange={setDialogOpen} brand={editing} />
    </div>
  )
}

function BrandDialog({
  open,
  onOpenChange,
  brand,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand: Brand | null
}) {
  const upsertBrand = useUpsertBrand()
  const [name, setName] = useState(brand?.name ?? "")
  const [slug, setSlug] = useState(brand?.slug ?? "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await upsertBrand.mutateAsync({ id: brand?.id, name, slug })
      toast.success(brand ? "Brand updated" : "Brand created")
      onOpenChange(false)
    } catch {
      toast.error("Couldn't save this brand")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{brand ? "Edit Brand" : "New Brand"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <Label className="mb-1.5 block">Name</Label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!brand) setSlug(slugify(e.target.value))
              }}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
