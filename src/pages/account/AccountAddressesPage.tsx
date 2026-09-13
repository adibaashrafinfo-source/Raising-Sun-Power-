import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react"
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
import { bdDivisions, districtsFor, upazilasFor } from "@/data/bd-geo"
import { useAddresses } from "@/hooks/use-addresses"
import { useAuth } from "@/lib/auth-provider"
import { type AddressFormValues, addressSchema } from "@/lib/schemas/address"
import type { Address } from "@/types/database"

export default function AccountAddressesPage() {
  const { user } = useAuth()
  const { addresses, isLoading, isError, refetch, createAddress, updateAddress, deleteAddress } =
    useAddresses()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (address: Address) => {
    setEditing(address)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id)
      toast.success("Address removed")
    } catch {
      toast.error("Couldn't remove this address")
    }
  }

  const handleSubmit = async (values: AddressFormValues) => {
    if (!user) return
    const payload = {
      user_id: user.id,
      label: values.label || null,
      full_name: values.fullName,
      phone: values.phone,
      division: values.division,
      district: values.district,
      upazila: values.upazila || null,
      address_line: values.addressLine,
      landmark: values.landmark || null,
      is_default: values.isDefault,
    }
    try {
      if (editing) {
        await updateAddress({ id: editing.id, patch: payload })
        toast.success("Address updated")
      } else {
        await createAddress(payload)
        toast.success("Address added")
      }
      setDialogOpen(false)
    } catch {
      toast.error("Couldn't save this address")
    }
  }

  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-2xl" />
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-muted">Couldn't load your addresses.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center">
          <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-surface-2">
            <MapPin className="size-6 text-muted" />
          </span>
          <div className="font-heading text-lg font-bold text-text">No saved addresses</div>
          <p className="mt-1.5 text-sm text-muted">Add an address to speed up checkout next time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-bold text-text">{address.label || "Address"}</span>
                {address.is_default && <Badge variant="green">Default</Badge>}
              </div>
              <div className="text-sm text-text">{address.full_name}</div>
              <div className="text-sm text-muted">{address.phone}</div>
              <div className="mt-1.5 text-sm text-muted">
                {address.address_line}, {address.district}, {address.division}
              </div>
              <div className="mt-3.5 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(address)}>
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(address.id)}>
                  <Trash2 className="size-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editing}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

function AddressDialog({
  open,
  onOpenChange,
  address,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: Address | null
  onSubmit: (values: AddressFormValues) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          label: address.label ?? "",
          fullName: address.full_name,
          phone: address.phone,
          division: address.division,
          district: address.district,
          upazila: address.upazila ?? "",
          addressLine: address.address_line,
          landmark: address.landmark ?? "",
          isDefault: address.is_default,
        }
      : { isDefault: false },
  })

  const division = watch("division")
  const district = watch("district")
  const districts = useMemo(() => districtsFor(division), [division])
  const upazilas = useMemo(() => upazilasFor(division, district), [division, district])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{address ? "Edit Address" : "Add Address"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Label (optional)">
              <Input placeholder="Home, Office…" {...register("label")} />
            </Field>
            <Field label="Full name *" error={errors.fullName?.message}>
              <Input placeholder="Recipient name" {...register("fullName")} />
            </Field>
            <Field label="Phone *" error={errors.phone?.message}>
              <Input placeholder="01XXX-XXXXXX" {...register("phone")} />
            </Field>
            <Field label="Division *" error={errors.division?.message}>
              <select
                {...register("division")}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
              >
                <option value="">Select division</option>
                {bdDivisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="District *" error={errors.district?.message}>
              <select
                {...register("district")}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
              >
                <option value="">Select district</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Upazila (optional)">
              <select
                {...register("upazila")}
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none"
              >
                <option value="">Select upazila</option>
                {upazilas.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Full address *" className="sm:col-span-2" error={errors.addressLine?.message}>
              <Input placeholder="House / road / block" {...register("addressLine")} />
            </Field>
            <Field label="Landmark (optional)" className="sm:col-span-2">
              <Input placeholder="Near…" {...register("landmark")} />
            </Field>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-text">
            <input type="checkbox" {...register("isDefault")} className="size-4 accent-orange-500" />
            Set as default address
          </label>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Saving…"
              ) : (
                <>
                  <Check className="size-4" /> Save Address
                </>
              )}
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
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </div>
  )
}
