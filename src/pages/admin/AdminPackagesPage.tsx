import { useEffect, useState } from "react"
import { GripVertical, Image as ImageIcon, Pencil, Plus, Trash2, Upload, X } from "lucide-react"
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
import {
  useAllPackagesAdmin,
  useDeletePackage,
  useDeletePackageCategory,
  usePackageCategories,
  usePackageItemsAdmin,
  useUpsertPackage,
  useUpsertPackageCategory,
} from "@/hooks/use-packages"
import { formatBytes } from "@/lib/compress-image"
import { uploadProductImage } from "@/lib/queries/admin"
import type { PackageItemInput } from "@/lib/queries/packages"
import { slugify } from "@/lib/schemas/product"
import { formatBDT, getErrorMessage } from "@/lib/utils"
import type { PackageCategory, SolarPackage } from "@/types/database"

export default function AdminPackagesPage() {
  const { data: packages = [], isLoading } = useAllPackagesAdmin()
  const deletePackage = useDeletePackage()
  const [editing, setEditing] = useState<SolarPackage | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  const handleDelete = async (pkg: SolarPackage) => {
    if (!window.confirm(`Delete "${pkg.name}"? Its items are deleted with it.`)) return
    try {
      await deletePackage.mutateAsync(pkg.id)
      toast.success("Package deleted")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete this package"))
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-extrabold text-text">Packages</h1>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" onClick={() => setCategoriesOpen(true)}>
            Package categories
          </Button>
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="size-4" /> New Package
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : packages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          No packages yet. Create one — it shows on /packages and on the homepage.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Package</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2">
                        {pkg.images[0] ? (
                          <img src={pkg.images[0]} alt="" className="size-full object-cover" />
                        ) : (
                          <ImageIcon className="size-4 text-muted" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-text">{pkg.name}</div>
                        <div className="text-xs text-muted">/{pkg.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{pkg.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-text">
                    {pkg.capacity_kw != null ? `${pkg.capacity_kw} kW` : "—"}
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums text-text">
                    {formatBDT(pkg.sale_price ?? pkg.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        pkg.status === "published"
                          ? "bg-green-500/12 text-green-600"
                          : "bg-surface-2 text-muted"
                      }`}
                    >
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Edit"
                        onClick={() => {
                          setEditing(pkg)
                          setDialogOpen(true)
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Delete"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(pkg)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialogOpen && (
        <PackageDialog key={editing?.id ?? "new"} pkg={editing} onClose={() => setDialogOpen(false)} />
      )}
      {categoriesOpen && <CategoriesDialog onClose={() => setCategoriesOpen(false)} />}
    </div>
  )
}

function PackageDialog({ pkg, onClose }: { pkg: SolarPackage | null; onClose: () => void }) {
  const { data: categories = [] } = usePackageCategories()
  const { data: savedItems } = usePackageItemsAdmin(pkg?.id)
  const upsertPackage = useUpsertPackage()

  const [form, setForm] = useState({
    name: pkg?.name ?? "",
    slug: pkg?.slug ?? "",
    categoryId: pkg?.category_id ?? "",
    capacityKw: pkg?.capacity_kw?.toString() ?? "",
    price: pkg?.price?.toString() ?? "",
    salePrice: pkg?.sale_price?.toString() ?? "",
    shortDescription: pkg?.short_description ?? "",
    description: pkg?.description ?? "",
    status: pkg?.status ?? "published",
    isFeatured: pkg?.is_featured ?? false,
  })
  const [images, setImages] = useState<string[]>(pkg?.images ?? [])
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    pkg ? Object.entries(pkg.specifications ?? {}).map(([key, value]) => ({ key, value })) : [],
  )
  const [items, setItems] = useState<PackageItemInput[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Items arrive after the dialog opens, so they are copied in when they land.
  useEffect(() => {
    if (!savedItems) return
    setItems(
      savedItems.map((item) => ({
        product_id: item.product_id,
        name: item.name,
        detail: item.detail,
        qty: item.qty,
        unit: item.unit,
        sort_order: item.sort_order,
      })),
    )
  }, [savedItems])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadProductImage(file)
      setImages((prev) => [...prev, result.url])
      toast.success(
        result.compressed
          ? `Image optimized — ${formatBytes(result.originalSize)} → ${formatBytes(result.size)}`
          : "Image uploaded",
      )
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't upload image"))
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error("Give the package a name")
      return
    }
    setSaving(true)
    try {
      await upsertPackage.mutateAsync({
        pkg: {
          id: pkg?.id,
          name: form.name.trim(),
          slug: (form.slug.trim() || slugify(form.name)).toLowerCase(),
          category_id: form.categoryId || null,
          capacity_kw: form.capacityKw ? Number(form.capacityKw) : null,
          price: Number(form.price) || 0,
          sale_price: form.salePrice ? Number(form.salePrice) : null,
          short_description: form.shortDescription.trim() || null,
          description: form.description.trim() || null,
          images,
          specifications: Object.fromEntries(
            specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value]),
          ),
          is_featured: form.isFeatured,
          status: form.status as SolarPackage["status"],
        },
        items: items
          .filter((item) => item.name.trim())
          .map((item, i) => ({ ...item, name: item.name.trim(), sort_order: i })),
      })
      toast.success(pkg ? "Package updated" : "Package created")
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save this package"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-[720px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pkg ? "Edit Package" : "New Package"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Name *">
              <Input
                value={form.name}
                onChange={(e) => {
                  set("name", e.target.value)
                  if (!pkg) set("slug", slugify(e.target.value))
                }}
              />
            </Field>
            <Field label="Slug">
              <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </Field>
            <Field label="Package category">
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="System size (kW)">
              <Input
                type="number"
                step="0.01"
                value={form.capacityKw}
                onChange={(e) => set("capacityKw", e.target.value)}
              />
            </Field>
            <Field label="Price (৳) *">
              <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </Field>
            <Field label="Sale price (৳)">
              <Input
                type="number"
                value={form.salePrice}
                onChange={(e) => set("salePrice", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Short description">
            <Input
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              placeholder="One line shown on the package card"
            />
          </Field>

          <Field label="Full description (markdown — headings, bullets, ✅ lists)">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={6}
              className="w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-2.5 text-base text-text outline-none sm:text-sm"
            />
          </Field>

          {/* What's inside */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Package contents</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setItems((prev) => [
                    ...prev,
                    { product_id: null, name: "", detail: null, qty: 1, unit: "pcs", sort_order: prev.length },
                  ])
                }
              >
                <Plus className="size-3.5" /> Add item
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {items.length === 0 && (
                <p className="text-xs text-muted">
                  List what the customer receives — panels, inverter, battery, structure, cables.
                </p>
              )}
              {items.map((item, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-2 p-2">
                  <GripVertical className="size-4 shrink-0 text-muted" />
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      setItems((prev) => prev.map((it, ii) => (ii === i ? { ...it, name: e.target.value } : it)))
                    }
                    placeholder="Item name"
                    className="min-w-[160px] flex-1"
                  />
                  <Input
                    value={item.detail ?? ""}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, ii) => (ii === i ? { ...it, detail: e.target.value || null } : it)),
                      )
                    }
                    placeholder="Detail (brand, model)"
                    className="min-w-[160px] flex-1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={item.qty}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((it, ii) => (ii === i ? { ...it, qty: Number(e.target.value) } : it)),
                      )
                    }
                    className="w-20"
                  />
                  <Input
                    value={item.unit}
                    onChange={(e) =>
                      setItems((prev) => prev.map((it, ii) => (ii === i ? { ...it, unit: e.target.value } : it)))
                    }
                    className="w-20"
                  />
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, ii) => ii !== i))}
                    className="flex size-8 items-center justify-center rounded-lg text-muted hover:text-red-500"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Specs */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Specifications (shown on the card and page)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])}
              >
                <Plus className="size-3.5" /> Add spec
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {specs.map((spec, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={spec.key}
                    onChange={(e) =>
                      setSpecs((prev) => prev.map((s, ii) => (ii === i ? { ...s, key: e.target.value } : s)))
                    }
                    placeholder="Daily output"
                  />
                  <Input
                    value={spec.value}
                    onChange={(e) =>
                      setSpecs((prev) => prev.map((s, ii) => (ii === i ? { ...s, value: e.target.value } : s)))
                    }
                    placeholder="18–20 units"
                  />
                  <button
                    type="button"
                    onClick={() => setSpecs((prev) => prev.filter((_, ii) => ii !== i))}
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:text-red-500"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <div>
            <Label className="mb-1 block">Image gallery</Label>
            <p className="mb-2.5 text-xs text-muted">
              First image is the cover. Uploads are optimized automatically.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {images.map((img, i) => (
                <div key={img} className="relative size-20 overflow-hidden rounded-xl border border-border">
                  <img src={img} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, ii) => ii !== i))}
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted hover:bg-surface-2">
                <Upload className="size-4" />
                <span className="text-[10px]">{uploading ? "…" : "Upload"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as typeof form.status)}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm font-semibold text-text">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => set("isFeatured", e.target.checked)}
                className="size-4"
              />
              Show on homepage
            </label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CategoriesDialog({ onClose }: { onClose: () => void }) {
  const { data: categories = [] } = usePackageCategories()
  const upsertCategory = useUpsertPackageCategory()
  const deleteCategory = useDeletePackageCategory()
  const [name, setName] = useState("")
  const [editing, setEditing] = useState<PackageCategory | null>(null)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await upsertCategory.mutateAsync({
        id: editing?.id,
        name: name.trim(),
        slug: slugify(name),
        sort_order: editing?.sort_order ?? categories.length + 1,
      })
      toast.success(editing ? "Category updated" : "Category added")
      setName("")
      setEditing(null)
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save this category"))
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Package categories</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={editing ? `Rename ${editing.name}` : "New category (e.g. Hybrid)"}
          />
          <Button type="submit">{editing ? "Save" : "Add"}</Button>
          {editing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(null)
                setName("")
              }}
            >
              Cancel
            </Button>
          )}
        </form>
        <div className="mt-3 flex flex-col gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5 py-2.5"
            >
              <div>
                <div className="text-sm font-semibold text-text">{cat.name}</div>
                <div className="text-xs text-muted">/{cat.slug}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(cat)
                    setName(cat.name)
                  }}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={async () => {
                    if (!window.confirm(`Delete "${cat.name}"?`)) return
                    try {
                      await deleteCategory.mutateAsync(cat.id)
                      toast.success("Category deleted")
                    } catch (err) {
                      toast.error(getErrorMessage(err, "Couldn't delete this category"))
                    }
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  )
}
