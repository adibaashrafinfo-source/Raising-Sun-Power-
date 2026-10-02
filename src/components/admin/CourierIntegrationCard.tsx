import { useState } from "react"
import { CheckCircle2, KeyRound, Loader2, Truck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useCourierSettings,
  useSaveCourierCredentials,
  useTestCourierConnection,
} from "@/hooks/use-courier"
import { formatBDT, getErrorMessage } from "@/lib/utils"

/** The couriers this panel can configure. More can be added as they are built. */
const PROVIDERS = [{ value: "steadfast", label: "Steadfast Courier" }]

/**
 * Courier credentials. The saved key and secret are never sent to the browser —
 * the database does not grant those columns to this role — so the boxes stay
 * empty once saved and a blank box means "keep what is stored".
 */
export function CourierIntegrationCard() {
  const { data: couriers = [], isLoading } = useCourierSettings()
  const saveCredentials = useSaveCourierCredentials()
  const testConnection = useTestCourierConnection()

  const [provider, setProvider] = useState(PROVIDERS[0].value)
  const [apiKey, setApiKey] = useState("")
  const [secretKey, setSecretKey] = useState("")

  const current = couriers.find((row) => row.provider === provider)
  const isActive = current?.is_active ?? true
  const hasCredentials = current?.has_credentials ?? false

  const handleTest = async () => {
    // Untyped boxes test the stored keys; typed ones are tested before saving.
    if (!apiKey.trim() && !secretKey.trim() && !hasCredentials) {
      toast.error("Enter the API key and secret key first.")
      return
    }
    try {
      const result = await testConnection.mutateAsync({ apiKey, secretKey })
      toast.success(`Connected — Steadfast balance ${formatBDT(result.balance)}`)
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't reach Steadfast with these keys"))
    }
  }

  const handleSave = async (nextActive = isActive) => {
    try {
      await saveCredentials.mutateAsync({
        provider,
        apiKey,
        secretKey,
        isActive: nextActive,
      })
      setApiKey("")
      setSecretKey("")
      toast.success("Courier settings saved")
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't save the courier settings"))
    }
  }

  if (isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-1 flex items-center gap-2 font-heading text-base font-extrabold text-text">
        <Truck className="size-[18px] text-orange-500" /> Courier Integration
      </div>
      <p className="mb-4 text-xs text-muted">
        Book orders with a courier straight from the Orders page. The keys are stored server-side and
        every call to the courier is made from a Supabase edge function — they never reach the browser.
      </p>

      <div className="flex flex-col gap-3.5">
        <div>
          <Label className="mb-1.5 block">Courier</Label>
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value)
              setApiKey("")
              setSecretKey("")
            }}
            className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm"
          >
            {PROVIDERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block">API Key</Label>
            <Input
              type="password"
              autoComplete="off"
              placeholder={hasCredentials ? "•••••••• (saved)" : "Paste your Api-Key"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Secret Key</Label>
            <Input
              type="password"
              autoComplete="off"
              placeholder={hasCredentials ? "•••••••• (saved)" : "Paste your Secret-Key"}
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          </div>
        </div>

        {hasCredentials && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
            <CheckCircle2 className="size-3.5" />
            Keys are saved. Leave the boxes empty to keep them, or type new ones to replace them.
          </p>
        )}

        <label className="flex items-center gap-2 text-sm font-semibold text-text">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => handleSave(e.target.checked)}
            className="size-4 accent-[var(--blue)]"
          />
          Integration is switched on
        </label>

        <div className="flex flex-wrap gap-2.5">
          <Button type="button" variant="outline" onClick={handleTest} disabled={testConnection.isPending}>
            {testConnection.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <KeyRound className="size-4" />
            )}
            {testConnection.isPending ? "Testing…" : "Test Connection"}
          </Button>
          <Button type="button" onClick={() => handleSave()} disabled={saveCredentials.isPending}>
            {saveCredentials.isPending ? "Saving…" : "Save Courier Keys"}
          </Button>
        </div>
      </div>
    </div>
  )
}
