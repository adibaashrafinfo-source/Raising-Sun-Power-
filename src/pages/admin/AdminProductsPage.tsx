import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Bold,
  Eye,
  Heading,
  ImageIcon,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
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
  useAllBrandsAdmin,
  useAllCategoriesAdmin,
  useAllProductsAdmin,
  useDeleteProduct,
  useProductStockTotals,
  useUpsertProduct,
} from "@/hooks/use-admin"
import { uploadProductImage } from "@/lib/queries/admin"
import { type ProductFormValues, productSchema, slugify } from "@/lib/schemas/product"
import { formatBytes } from "@/lib/compress-image"
import { formatBDT, getErrorMessage } from "@/lib/utils"
import type { Product } from "@/types/database"

const HOMEPAGE_PLACEMENTS = [
  { field: "isBestSeller", label: "Best Seller", hint: "Best sellers this month" },
  { field: "isNewArrival", label: "New Arrival", hint: "New arrivals" },
  { field: "isFeatured", label: "Featured Product", hint: "Our Featured Products" },
] as const

export default function AdminProductsPage() {
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const { data: products = [], isLoading } = useAllProductsAdmin()
  const { data: stockTotals = {} } = useProductStockTotals()
  const deleteProduct = useDeleteProduct()

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (product: Product) => {
    setEditing(product)
    setDialogOpen(true)
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return
    try {
      await deleteProduct.mutateAsync(product.id)
      toast.success("Product deleted")
    } catch {
      toast.error("Couldn't delete this product")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-extrabold text-text">Products</h1>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 pl-9"
            />
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New Product
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No products found.</p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Brand</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Total Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-2">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="size-full object-cover" />
                        ) : (
                          <ImageIcon className="size-4 text-muted" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-text">{product.name}</div>
                        <div className="text-xs text-muted">{product.category?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{product.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted">{product.brand?.name ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-text">{formatBDT(product.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        (stockTotals[product.id] ?? product.stock_qty) <= product.reorder_level
                          ? "font-semibold tabular-nums text-red-500"
                          : "tabular-nums text-text"
                      }
                    >
                      {stockTotals[product.id] ?? product.stock_qty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={product.status === "published" ? "green" : product.status === "draft" ? "gold" : "neutral"}
                    >
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        title="View on site"
                      >
                        <a href={`/product/${product.slug}`} target="_blank" rel="noreferrer">
                          <Eye className="size-3.5" />
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" title="Edit" onClick={() => openEdit(product)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Delete"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(product)}
                      >
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

      <ProductDialog key={editing?.id ?? "new"} open={dialogOpen} onOpenChange={setDialogOpen} product={editing} />
    </div>
  )
}

function ProductDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}) {
  const { data: categories = [] } = useAllCategoriesAdmin()
  const { data: brands = [] } = useAllBrandsAdmin()
  const upsertProduct = useUpsertProduct()

  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    product ? Object.entries(product.specifications).map(([key, value]) => ({ key, value })) : [],
  )
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          categoryId: product.category_id ?? "",
          brandId: product.brand_id ?? "",
          sku: product.sku ?? "",
          unit: product.unit,
          price: String(product.price),
          salePrice: product.sale_price != null ? String(product.sale_price) : "",
          costPrice: String(product.cost_price),
          stockQty: String(product.stock_qty),
          reorderLevel: String(product.reorder_level),
          warrantyMonths: String(product.warranty_months),
          hasSerialTracking: product.has_serial_tracking,
          isActive: product.is_active,
          isBestSeller: product.is_best_seller,
          isNewArrival: product.is_new_arrival,
          isFeatured: product.is_featured,
          shortDescription: product.short_description ?? "",
          description: product.description ?? "",
          badges: product.badges.join(", "),
          status: product.status,
        }
      : {
          status: "draft",
          unit: "pcs",
          stockQty: "0",
          costPrice: "0",
          reorderLevel: "5",
          warrantyMonths: "0",
          hasSerialTracking: false,
          isActive: true,
          isBestSeller: false,
          isNewArrival: false,
          isFeatured: false,
        },
  })

  const name = watch("name")
  useEffect(() => {
    if (!product && name) setValue("slug", slugify(name))
  }, [name, product, setValue])

  // Lightweight markdown formatting toolbar for the long description. Buttons
  // insert markdown the public product page renders as premium sections; if the
  // admin never uses them, the page still auto-formats plain text.
  const descRef = useRef<HTMLTextAreaElement | null>(null)
  const descReg = register("description")

  const commitDesc = (nextValue: string, selStart: number, selEnd: number) => {
    setValue("description", nextValue, { shouldDirty: true })
    requestAnimationFrame(() => {
      const ta = descRef.current
      if (ta) {
        ta.focus()
        ta.setSelectionRange(selStart, selEnd)
      }
    })
  }

  const wrapInline = (marker: string) => {
    const ta = descRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e, value } = ta
    const selected = value.slice(s, e) || "text"
    const inserted = `${marker}${selected}${marker}`
    commitDesc(value.slice(0, s) + inserted + value.slice(e), s + marker.length, s + marker.length + selected.length)
  }

  const prefixLines = (makePrefix: (index: number) => string) => {
    const ta = descRef.current
    if (!ta) return
    const { selectionStart: s, selectionEnd: e, value } = ta
    const lineStart = value.lastIndexOf("\n", s - 1) + 1
    let lineEnd = value.indexOf("\n", e)
    if (lineEnd === -1) lineEnd = value.length
    const block = value.slice(lineStart, lineEnd)
    const stripMarker = /^(\s*)(?:#{1,6}\s+|[-*•]\s+|\d+[.)]\s+|[✅✔☑✓]️?\s*)?/
    const rebuilt = block
      .split("\n")
      .map((line, i) => line.replace(stripMarker, `$1${makePrefix(i)}`))
      .join("\n")
    commitDesc(value.slice(0, lineStart) + rebuilt + value.slice(lineEnd), lineStart, lineStart + rebuilt.length)
  }

  const FORMAT_BUTTONS = [
    { icon: Heading, title: "Heading", run: () => prefixLines(() => "## ") },
    { icon: Bold, title: "Bold", run: () => wrapInline("**") },
    { icon: Italic, title: "Italic", run: () => wrapInline("*") },
    { icon: ListChecks, title: "Checklist", run: () => prefixLines(() => "✅ ") },
    { icon: List, title: "Bullet list", run: () => prefixLines(() => "- ") },
    { icon: ListOrdered, title: "Numbered list", run: () => prefixLines((i) => `${i + 1}. `) },
  ]

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

  const onSubmit = async (values: ProductFormValues) => {
    const specifications = Object.fromEntries(
      specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value]),
    )
    try {
      await upsertProduct.mutateAsync({
        id: product?.id,
        name: values.name,
        slug: values.slug,
        category_id: values.categoryId || null,
        brand_id: values.brandId || null,
        sku: values.sku || null,
        unit: values.unit,
        price: Number(values.price),
        sale_price: values.salePrice ? Number(values.salePrice) : null,
        cost_price: Number(values.costPrice),
        stock_qty: Number(values.stockQty),
        reorder_level: Number(values.reorderLevel),
        warranty_months: Number(values.warrantyMonths),
        has_serial_tracking: values.hasSerialTracking,
        is_active: values.isActive,
        is_best_seller: values.isBestSeller,
        is_new_arrival: values.isNewArrival,
        is_featured: values.isFeatured,
        short_description: values.shortDescription?.trim() || null,
        description: values.description?.trim() || null,
        specifications,
        badges: values.badges ? values.badges.split(",").map((b) => b.trim()).filter(Boolean) : [],
        images,
        status: values.status,
      })
      toast.success(product ? "Product updated" : "Product created")
      onOpenChange(false)
    } catch {
      toast.error("Couldn't save this product")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[640px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Name *" error={errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field label="Slug *" error={errors.slug?.message}>
              <Input {...register("slug")} />
            </Field>
            <Field label="Category">
              <select {...register("categoryId")} className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none">
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Brand">
              <select {...register("brandId")} className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none">
                <option value="">None</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="SKU">
              <Input {...register("sku")} />
            </Field>
            <Field label="Status">
              <select {...register("status")} className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field label="Price (৳) *" error={errors.price?.message}>
              <Input type="number" step="0.01" {...register("price")} />
            </Field>
            <Field label="Sale price (৳)" error={errors.salePrice?.message as string}>
              <Input type="number" step="0.01" {...register("salePrice")} />
            </Field>
            <Field label="Cost price (৳) *" error={errors.costPrice?.message}>
              <Input type="number" step="0.01" {...register("costPrice")} />
            </Field>
            <Field label="Unit *" error={errors.unit?.message}>
              <Input placeholder="pcs, box, meter…" {...register("unit")} />
            </Field>
            <Field label="Stock quantity *" error={errors.stockQty?.message}>
              <Input type="number" {...register("stockQty")} />
            </Field>
            <Field label="Reorder level *" error={errors.reorderLevel?.message}>
              <Input type="number" {...register("reorderLevel")} />
            </Field>
            <Field label="Warranty (months) *" error={errors.warrantyMonths?.message}>
              <Input type="number" {...register("warrantyMonths")} />
            </Field>
            <Field label="Badges (comma separated)">
              <Input placeholder="New, Best Seller" {...register("badges")} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-text">
              <input type="checkbox" className="size-4" {...register("hasSerialTracking")} />
              Track serial numbers
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-text">
              <input type="checkbox" className="size-4" {...register("isActive")} />
              Active in inventory
            </label>
          </div>

          {/* Homepage placement — drives the matching sections on the home page */}
          <div className="rounded-[var(--radius-sm)] border border-border bg-surface-2 p-4">
            <Label className="mb-1 block">Show on homepage</Label>
            <p className="mb-3 text-xs text-muted">
              Tick a section and this product appears there on the home page.
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {HOMEPAGE_PLACEMENTS.map((pl) => (
                <label
                  key={pl.field}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface p-3 text-sm font-semibold text-text"
                >
                  <input type="checkbox" className="size-4" {...register(pl.field)} />
                  <span>
                    {pl.label}
                    <span className="block text-[11px] font-medium text-muted">{pl.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Field label="Short description" error={errors.shortDescription?.message}>
            <textarea
              {...register("shortDescription")}
              rows={2}
              placeholder="One or two lines shown right under the product name."
              className="w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none"
            />
          </Field>

          <div>
            <Label className="mb-1.5 block">Full description</Label>
            <div className="overflow-hidden rounded-[var(--radius-sm)] border border-border bg-surface-2">
              <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface px-2 py-1.5">
                {FORMAT_BUTTONS.map((b) => (
                  <button
                    key={b.title}
                    type="button"
                    title={b.title}
                    onClick={b.run}
                    className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-text"
                  >
                    <b.icon className="size-4" />
                  </button>
                ))}
              </div>
              <textarea
                {...descReg}
                ref={(el) => {
                  descReg.ref(el)
                  descRef.current = el
                }}
                rows={8}
                placeholder="Write the full description. Use the toolbar to add headings, checklists and bullets — or just paste your text and the site will auto-format it into sections."
                className="min-h-[160px] w-full resize-y bg-surface-2 px-3.5 py-3 text-sm leading-relaxed text-text outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-muted">
              Tip: start feature lines with ✅ (Checklist button). Even unformatted text is auto-arranged into
              premium sections on the product page.
            </p>
          </div>

          <div>
            <Label className="mb-2 block">Specifications</Label>
            <div className="flex flex-col gap-2">
              {specs.map((spec, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Key"
                    value={spec.key}
                    onChange={(e) =>
                      setSpecs((prev) => prev.map((s, si) => (si === i ? { ...s, key: e.target.value } : s)))
                    }
                  />
                  <Input
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) =>
                      setSpecs((prev) => prev.map((s, si) => (si === i ? { ...s, value: e.target.value } : s)))
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setSpecs((prev) => prev.filter((_, si) => si !== i))}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])}
              >
                <Plus className="size-3.5" /> Add spec
              </Button>
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Images</Label>
            <p className="mb-2.5 text-xs text-muted">
              Uploads are optimized automatically — resized to max 1600px and compressed to around
              300&nbsp;KB, so large photos still load fast.
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

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </div>
  )
}
