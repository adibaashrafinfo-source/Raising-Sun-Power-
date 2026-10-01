import { useRef, useState } from "react"
import { Eye, EyeOff, ImageIcon, Pencil, Plus, Trash2, Upload, X } from "lucide-react"
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
import { useDeleteHeroSlide, useHeroSlidesAdmin, useUpsertHeroSlide } from "@/hooks/use-hero-slides"
import { formatBytes } from "@/lib/compress-image"
import { uploadSiteAsset } from "@/lib/queries/site-content"
import { getErrorMessage } from "@/lib/utils"
import type { HeroSlideRow } from "@/types/database"

export default function AdminHeroSlidesPage() {
  const { data: slides = [], isLoading } = useHeroSlidesAdmin()
  const upsertSlide = useUpsertHeroSlide()
  const deleteSlide = useDeleteHeroSlide()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<HeroSlideRow | null>(null)

  const handleDelete = async (slide: HeroSlideRow) => {
    if (!confirm(`Delete this slide${slide.title ? ` ("${slide.title}")` : ""}?`)) return
    try {
      await deleteSlide.mutateAsync(slide.id)
      toast.success("Slide deleted")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete this slide"))
    }
  }

  const toggleActive = async (slide: HeroSlideRow) => {
    try {
      const { created_at: _c, updated_at: _u, ...rest } = slide
      await upsertSlide.mutateAsync({ ...rest, is_active: !slide.is_active })
      toast.success(slide.is_active ? "Slide hidden" : "Slide shown")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update this slide"))
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-text">Hero Slider</h1>
          <p className="mt-1 text-sm text-muted">
            The banners at the top of the homepage. Upload an image on its own, or add a headline and
            buttons over it. Lower order numbers come first; with no active slides the site falls back
            to its built-in banners.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus className="size-4" /> New Slide
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : slides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
          No slides yet — the homepage is showing its built-in banners. Add one to take over.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex h-[70px] w-[124px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-2">
                {slide.image_url ? (
                  <img src={slide.image_url} alt="" className="size-full object-cover" />
                ) : (
                  <ImageIcon className="size-5 text-muted" />
                )}
              </div>
              <div className="min-w-[200px] flex-1">
                <div className="text-sm font-bold text-text">
                  {slide.title || slide.badge || "Image-only banner"}{" "}
                  {slide.highlight && <span className="text-orange-500">{slide.highlight}</span>}
                </div>
                <div className="mt-0.5 line-clamp-1 text-xs text-muted">
                  {slide.body || slide.cta_href || "—"}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-muted">
                  <span>Order {slide.sort_order}</span>
                  <span
                    className={
                      slide.is_active
                        ? "rounded-full bg-green-500/12 px-2 py-0.5 text-green-600"
                        : "rounded-full bg-surface-3 px-2 py-0.5"
                    }
                  >
                    {slide.is_active ? "Live" : "Hidden"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  title={slide.is_active ? "Hide this slide" : "Show this slide"}
                  onClick={() => toggleActive(slide)}
                >
                  {slide.is_active ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  title="Edit"
                  onClick={() => {
                    setEditing(slide)
                    setDialogOpen(true)
                  }}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button variant="outline" size="sm" title="Delete" onClick={() => handleDelete(slide)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SlideDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        slide={editing}
        nextOrder={slides.length ? Math.max(...slides.map((s) => s.sort_order)) + 1 : 0}
      />
    </div>
  )
}

function SlideDialog({
  open,
  onOpenChange,
  slide,
  nextOrder,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  slide: HeroSlideRow | null
  nextOrder: number
}) {
  const upsertSlide = useUpsertHeroSlide()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    image_url: slide?.image_url ?? "",
    badge: slide?.badge ?? "",
    title: slide?.title ?? "",
    highlight: slide?.highlight ?? "",
    body: slide?.body ?? "",
    cta_label: slide?.cta_label ?? "",
    cta_href: slide?.cta_href ?? "",
    secondary_label: slide?.secondary_label ?? "",
    secondary_href: slide?.secondary_href ?? "",
    sort_order: slide?.sort_order ?? nextOrder,
    is_active: slide?.is_active ?? true,
  })

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadSiteAsset(file)
      set("image_url", result.url)
      toast.success(
        result.compressed
          ? `Image optimized — ${formatBytes(result.originalSize)} → ${formatBytes(result.size)}`
          : "Image uploaded",
      )
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't upload image"))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.image_url && !form.title && !form.badge && !form.body) {
      toast.error("Add an image or some copy — an empty slide has nothing to show.")
      return
    }
    try {
      // Blank text is stored as null so the slider can tell "nothing here" from
      // an empty string and skip the element entirely.
      const text = (v: string) => v.trim() || null
      await upsertSlide.mutateAsync({
        ...(slide ? { id: slide.id } : {}),
        image_url: text(form.image_url),
        badge: text(form.badge),
        title: text(form.title),
        highlight: text(form.highlight),
        body: text(form.body),
        cta_label: text(form.cta_label),
        cta_href: text(form.cta_href),
        secondary_label: text(form.secondary_label),
        secondary_href: text(form.secondary_href),
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      })
      toast.success(slide ? "Slide updated" : "Slide created")
      onOpenChange(false)
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save this slide"))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-[620px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{slide ? "Edit Slide" : "New Slide"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5 block">Banner image</Label>
            <div className="flex items-center gap-3">
              <div className="flex h-[88px] w-[156px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-2">
                {form.image_url ? (
                  <img src={form.image_url} alt="" className="size-full object-cover" />
                ) : (
                  <ImageIcon className="size-6 text-muted" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  {uploading ? "Uploading…" : "Upload image"}
                </Button>
                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => set("image_url", "")}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-500"
                  >
                    <X className="size-3.5" /> Remove
                  </button>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted">
              A wide banner works best — around 1920×700. Leave the copy below empty to show the image
              on its own.
            </p>
          </div>

          <Field label="Badge (small pill above the headline)" value={form.badge} onChange={(v) => set("badge", v)} />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Headline — first part" value={form.title} onChange={(v) => set("title", v)} />
            <Field label="Headline — highlighted part" value={form.highlight} onChange={(v) => set("highlight", v)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Subheading</Label>
            <textarea
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              rows={3}
              className="w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-2.5 text-base text-text outline-none sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Main button text" value={form.cta_label} onChange={(v) => set("cta_label", v)} />
            <Field
              label="Main button link (e.g. /products)"
              value={form.cta_href}
              onChange={(v) => set("cta_href", v)}
            />
            <Field
              label="Second button text"
              value={form.secondary_label}
              onChange={(v) => set("secondary_label", v)}
            />
            <Field
              label="Second button link"
              value={form.secondary_href}
              onChange={(v) => set("secondary_href", v)}
            />
          </div>

          <div className="flex flex-wrap items-end gap-5">
            <div className="w-[120px]">
              <Label className="mb-1.5 block">Order</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </div>
            <label className="flex items-center gap-2 pb-2.5 text-sm font-semibold text-text">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => set("is_active", e.target.checked)}
                className="size-4 accent-[var(--blue)]"
              />
              Show on the homepage
            </label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={upsertSlide.isPending || uploading}>
              {upsertSlide.isPending ? "Saving…" : "Save Slide"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
