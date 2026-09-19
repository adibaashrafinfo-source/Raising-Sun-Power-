import { useEffect, useRef, useState } from "react"
import { ImageIcon, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useUpdateSettings } from "@/hooks/use-admin"
import { useSettings } from "@/hooks/use-checkout"
import { useSiteContent, useUpdateSiteContent } from "@/hooks/use-site-content"
import { formatBytes } from "@/lib/compress-image"
import { uploadSiteAsset } from "@/lib/queries/site-content"
import { getErrorMessage } from "@/lib/utils"
import type { SiteContent } from "@/types/database"

type FormState = Omit<SiteContent, "id" | "updated_at">

const EMPTY: FormState = {
  header_logo_url: "",
  footer_logo_url: "",
  hero_image_url: "",
  hero_badge: "",
  hero_headline_prefix: "",
  hero_headline_highlight: "",
  hero_subheading: "",
  footer_description: "",
  footer_designed_by: "",
  about_badge: "",
  about_title: "",
  about_highlight: "",
  about_intro: "",
  about_story: "",
  showroom_1_name: "",
  showroom_1_address: "",
  showroom_2_name: "",
  showroom_2_address: "",
  business_hours: "",
}

/** Phone, WhatsApp and email live on the settings row, not site_content. */
type ContactState = { support_phone: string; whatsapp_number: string; contact_email: string }
const EMPTY_CONTACT: ContactState = { support_phone: "", whatsapp_number: "", contact_email: "" }

export default function AdminCmsPage() {
  const { data: content, isLoading } = useSiteContent()
  const { data: settings } = useSettings()
  const updateContent = useUpdateSiteContent()
  const updateSettings = useUpdateSettings()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [contact, setContact] = useState<ContactState>(EMPTY_CONTACT)

  useEffect(() => {
    if (!content) return
    setForm({
      header_logo_url: content.header_logo_url ?? "",
      footer_logo_url: content.footer_logo_url ?? "",
      hero_image_url: content.hero_image_url ?? "",
      hero_badge: content.hero_badge ?? "",
      hero_headline_prefix: content.hero_headline_prefix ?? "",
      hero_headline_highlight: content.hero_headline_highlight ?? "",
      hero_subheading: content.hero_subheading ?? "",
      footer_description: content.footer_description ?? "",
      footer_designed_by: content.footer_designed_by ?? "",
      about_badge: content.about_badge ?? "",
      about_title: content.about_title ?? "",
      about_highlight: content.about_highlight ?? "",
      about_intro: content.about_intro ?? "",
      about_story: content.about_story ?? "",
      showroom_1_name: content.showroom_1_name ?? "",
      showroom_1_address: content.showroom_1_address ?? "",
      showroom_2_name: content.showroom_2_name ?? "",
      showroom_2_address: content.showroom_2_address ?? "",
      business_hours: content.business_hours ?? "",
    })
  }, [content])

  useEffect(() => {
    if (!settings) return
    setContact({
      support_phone: settings.support_phone ?? "",
      whatsapp_number: settings.whatsapp_number ?? "",
      contact_email: settings.contact_email ?? "",
    })
  }, [settings])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Both rows are saved together so one Save button covers the page.
      await updateContent.mutateAsync(form)
      await updateSettings.mutateAsync(contact)
      toast.success("Site content saved")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save content"))
    }
  }

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-text">Site Content (CMS)</h1>
        <p className="mt-1 text-sm text-muted">
          Edit logos, hero, footer, About page, office addresses and contact numbers shown across the public
          site — no code deploy needed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex max-w-[820px] flex-col gap-5">
        {/* Branding / logos */}
        <Section title="Branding & Logos" subtitle="Shown in the header and footer. Square/wide PNG or JPG works best.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ImageField label="Header logo" value={form.header_logo_url} onChange={(v) => set("header_logo_url", v)} />
            <ImageField label="Footer logo" value={form.footer_logo_url} onChange={(v) => set("footer_logo_url", v)} />
          </div>
        </Section>

        {/* Hero */}
        <Section title="Homepage Hero" subtitle="The headline and subheading at the top of the homepage. The hero uses a brand gradient background — no image needed.">
          <TextField label="Badge text" value={form.hero_badge} onChange={(v) => set("hero_badge", v)} />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="Headline — first part" value={form.hero_headline_prefix} onChange={(v) => set("hero_headline_prefix", v)} />
            <TextField label="Headline — highlighted part" value={form.hero_headline_highlight} onChange={(v) => set("hero_headline_highlight", v)} />
          </div>
          <TextArea label="Subheading" value={form.hero_subheading} onChange={(v) => set("hero_subheading", v)} />
        </Section>

        {/* About page */}
        <Section title="About Page" subtitle="Content shown on the /about page.">
          <TextField label="Badge text" value={form.about_badge} onChange={(v) => set("about_badge", v)} />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="Title — first part" value={form.about_title} onChange={(v) => set("about_title", v)} />
            <TextField label="Title — highlighted part" value={form.about_highlight} onChange={(v) => set("about_highlight", v)} />
          </div>
          <TextArea label="Intro paragraph" value={form.about_intro} onChange={(v) => set("about_intro", v)} />
          <TextArea
            label="Our story (leave a blank line between paragraphs)"
            value={form.about_story}
            onChange={(v) => set("about_story", v)}
            rows={7}
          />
        </Section>

        {/* Footer */}
        <Section title="Footer" subtitle="Text shown in the site footer.">
          <TextArea label="Footer description" value={form.footer_description} onChange={(v) => set("footer_description", v)} />
          <TextField label='"Designed by" credit' value={form.footer_designed_by} onChange={(v) => set("footer_designed_by", v)} />
        </Section>

        {/* Offices + hours */}
        <Section title="Office Addresses" subtitle="Shown in the footer and on the About and Contact pages.">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField label="Office 1 — name" value={form.showroom_1_name} onChange={(v) => set("showroom_1_name", v)} />
            <TextField label="Office 1 — address" value={form.showroom_1_address} onChange={(v) => set("showroom_1_address", v)} />
            <TextField label="Office 2 — name" value={form.showroom_2_name} onChange={(v) => set("showroom_2_name", v)} />
            <TextField label="Office 2 — address" value={form.showroom_2_address} onChange={(v) => set("showroom_2_address", v)} />
          </div>
          <TextField label="Business hours" value={form.business_hours} onChange={(v) => set("business_hours", v)} />
        </Section>

        {/* Contact numbers — these live on the settings row but belong with the
            addresses for whoever is editing the site's contact details. */}
        <Section title="Contact Details" subtitle="The call number, WhatsApp number and email used across the site — header, footer, Contact page and every Call/WhatsApp button.">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <TextField
              label="Call number"
              value={contact.support_phone}
              onChange={(v) => setContact((c) => ({ ...c, support_phone: v }))}
            />
            <TextField
              label="WhatsApp number (with country code, e.g. 8801786896390)"
              value={contact.whatsapp_number}
              onChange={(v) => setContact((c) => ({ ...c, whatsapp_number: v }))}
            />
          </div>
          <TextField
            label="Email address"
            value={contact.contact_email}
            onChange={(v) => setContact((c) => ({ ...c, contact_email: v }))}
          />
        </Section>

        <Button type="submit" size="lg" className="self-start" disabled={updateContent.isPending}>
          {updateContent.isPending || updateSettings.isPending ? "Saving…" : "Save Content"}
        </Button>
      </form>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-1 font-heading text-base font-extrabold text-text">{title}</div>
      {subtitle && <p className="mb-4 text-xs text-muted">{subtitle}</p>}
      <div className="flex flex-col gap-3.5">{children}</div>
    </div>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string
  value: string | null
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-2.5 text-base text-text outline-none sm:text-sm"
      />
    </div>
  )
}

function ImageField({
  label,
  value,
  onChange,
  wide,
}: {
  label: string
  value: string | null
  onChange: (v: string) => void
  wide?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadSiteAsset(file)
      onChange(result.url)
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

  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <div className="flex items-center gap-3">
        <div
          className={`flex ${wide ? "h-24 w-40" : "size-20"} shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-2`}
        >
          {value ? (
            <img src={value} alt="" className="size-full object-contain" />
          ) : (
            <ImageIcon className="size-6 text-muted" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" />
            {uploading ? "Uploading…" : "Upload"}
          </Button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-500"
            >
              <X className="size-3.5" /> Remove
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
      </div>
    </div>
  )
}
