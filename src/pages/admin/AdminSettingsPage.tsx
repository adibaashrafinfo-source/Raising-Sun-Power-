import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useUpdateSettings } from "@/hooks/use-admin"
import { useSettings } from "@/hooks/use-checkout"
import { getErrorMessage } from "@/lib/utils"

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  const [form, setForm] = useState({
    delivery_charge_inside_dhaka: 60,
    delivery_charge_outside_dhaka: 120,
    cod_enabled: true,
    bkash_enabled: true,
    nagad_enabled: true,
    support_phone: "",
    whatsapp_number: "",
    contact_email: "",
    facebook_url: "",
    instagram_url: "",
    youtube_url: "",
    linkedin_url: "",
    tiktok_url: "",
  })

  useEffect(() => {
    if (!settings) return
    setForm({
      ...settings,
      whatsapp_number: settings.whatsapp_number ?? "",
      contact_email: settings.contact_email ?? "",
      facebook_url: settings.facebook_url ?? "",
      instagram_url: settings.instagram_url ?? "",
      youtube_url: settings.youtube_url ?? "",
      linkedin_url: settings.linkedin_url ?? "",
      tiktok_url: settings.tiktok_url ?? "",
    })
  }, [settings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSettings.mutateAsync(form)
      toast.success("Settings saved")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save settings"))
    }
  }

  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl font-extrabold text-text">Settings</h1>

      <form onSubmit={handleSubmit} className="flex max-w-[560px] flex-col gap-5">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 font-heading text-base font-extrabold text-text">Delivery charges</div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Inside Dhaka (৳)</Label>
              <Input
                type="number"
                value={form.delivery_charge_inside_dhaka}
                onChange={(e) => setForm((f) => ({ ...f, delivery_charge_inside_dhaka: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Outside Dhaka (৳)</Label>
              <Input
                type="number"
                value={form.delivery_charge_outside_dhaka}
                onChange={(e) => setForm((f) => ({ ...f, delivery_charge_outside_dhaka: Number(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 font-heading text-base font-extrabold text-text">Payment methods</div>
          <div className="flex flex-col gap-3">
            <ToggleRow
              label="Cash on Delivery"
              checked={form.cod_enabled}
              onChange={(v) => setForm((f) => ({ ...f, cod_enabled: v }))}
            />
            <ToggleRow
              label="bKash"
              checked={form.bkash_enabled}
              onChange={(v) => setForm((f) => ({ ...f, bkash_enabled: v }))}
            />
            <ToggleRow
              label="Nagad"
              checked={form.nagad_enabled}
              onChange={(v) => setForm((f) => ({ ...f, nagad_enabled: v }))}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 font-heading text-base font-extrabold text-text">Store contact</div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Support phone</Label>
              <Input
                value={form.support_phone}
                onChange={(e) => setForm((f) => ({ ...f, support_phone: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">WhatsApp number (digits only, e.g. 8801XXXXXXXXX)</Label>
              <Input
                value={form.whatsapp_number}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp_number: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Contact email</Label>
              <Input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-1 font-heading text-base font-extrabold text-text">Social media links</div>
          <p className="mb-4 text-xs text-muted">
            Shown as icons in the site footer. Leave a field blank to hide that icon.
          </p>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block">Facebook URL</Label>
              <Input
                placeholder="https://facebook.com/yourpage"
                value={form.facebook_url}
                onChange={(e) => setForm((f) => ({ ...f, facebook_url: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Instagram URL</Label>
              <Input
                placeholder="https://instagram.com/yourpage"
                value={form.instagram_url}
                onChange={(e) => setForm((f) => ({ ...f, instagram_url: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">YouTube URL</Label>
              <Input
                placeholder="https://youtube.com/@yourchannel"
                value={form.youtube_url}
                onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">LinkedIn URL</Label>
              <Input
                placeholder="https://linkedin.com/company/yourpage"
                value={form.linkedin_url}
                onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">TikTok URL</Label>
              <Input
                placeholder="https://tiktok.com/@yourpage"
                value={form.tiktok_url}
                onChange={(e) => setForm((f) => ({ ...f, tiktok_url: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="self-start" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Saving…" : "Save Settings"}
        </Button>
      </form>
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm font-semibold text-text">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 accent-orange-500"
      />
    </label>
  )
}
