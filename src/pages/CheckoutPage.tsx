import { useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronRight, MapPin, Store, Truck } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { bdDivisions, districtsFor, isInsideDhaka, upazilasFor } from "@/data/bd-geo"
import { useCreateOrder, useSettings } from "@/hooks/use-checkout"
import { useSeo } from "@/hooks/use-seo"
import { useAuth } from "@/lib/auth-provider"
import { generateOrderNumber } from "@/lib/queries/checkout"
import { type CheckoutFormValues, checkoutSchema } from "@/lib/schemas/checkout"
import { cn, formatBDT } from "@/lib/utils"
import { sendSms } from "@/lib/sms"
import { useCartStore } from "@/store/cart-store"
import type { OrderInsert, OrderItemInsert, PaymentMethod } from "@/types/database"

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; note: string; badgeBg: string }[] = [
  { value: "cod", label: "Cash on Delivery", note: "Pay when you receive your order", badgeBg: "#67A70E" },
  { value: "bkash", label: "bKash", note: "Send payment, then enter the transaction ID", badgeBg: "#E2136E" },
  { value: "nagad", label: "Nagad", note: "Send payment, then enter the transaction ID", badgeBg: "#EE6123" },
]

export default function CheckoutPage() {
  useSeo({ title: "Checkout", noIndex: true })
  const navigate = useNavigate()
  const { user } = useAuth()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const { data: settings } = useSettings()
  const createOrder = useCreateOrder()

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: "courier",
      paymentMethod: "cod",
    },
  })

  const division = watch("division")
  const district = watch("district")
  const deliveryMethod = watch("deliveryMethod")
  const paymentMethod = watch("paymentMethod")

  const districts = useMemo(() => districtsFor(division), [division])
  const upazilas = useMemo(() => upazilasFor(division, district), [division, district])

  const inside = isInsideDhaka(district)
  const insideCharge = settings?.delivery_charge_inside_dhaka ?? 60
  const outsideCharge = settings?.delivery_charge_outside_dhaka ?? 120
  // Delivery is always charged; only picking the order up at a shop is free of
  // a delivery fee, and that is shown as ৳0 rather than "Free".
  const deliveryCharge = deliveryMethod === "pickup" ? 0 : inside ? insideCharge : outsideCharge
  const total = Math.max(0, subtotal + deliveryCharge)

  const availablePayments = PAYMENT_OPTIONS.filter((opt) => {
    if (opt.value === "cod") return settings?.cod_enabled ?? true
    if (opt.value === "bkash") return settings?.bkash_enabled ?? true
    if (opt.value === "nagad") return settings?.nagad_enabled ?? true
    return true
  })

  const onSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("Your cart is empty.")
      return
    }
    const addressLine = [values.area, values.address].filter(Boolean).join(", ")
    const order: OrderInsert = {
      order_number: generateOrderNumber(),
      user_id: user?.id ?? null,
      guest_name: values.name,
      guest_phone: values.phone,
      status: "pending",
      payment_method: values.paymentMethod,
      payment_reference: values.paymentMethod === "cod" ? null : values.paymentReference ?? null,
      payment_sender_number: values.paymentMethod === "cod" ? null : values.paymentSenderNumber ?? null,
      division: values.division,
      district: values.district,
      upazila: values.upazila || null,
      address_line: addressLine,
      landmark: values.landmark || null,
      delivery_method: values.deliveryMethod,
      subtotal,
      delivery_charge: deliveryCharge,
      discount: 0,
      coupon_id: null,
      total,
      notes: values.notes || null,
    }
    const orderItems: OrderItemInsert[] = items.map((item) => ({
      product_id: item.id,
      product_name: item.name,
      unit_price: item.price,
      qty: item.qty,
      line_total: item.price * item.qty,
    }))

    try {
      const created = await createOrder.mutateAsync({ order, items: orderItems })
      sendSms(values.phone, `Thanks ${values.name}! Your RSP order ${created.order_number} is confirmed.`)
      toast.success(`Order ${created.order_number} placed!`)
      useCartStore.setState({ items: [] })
      navigate(`/order-confirmation/${created.id}`, {
        state: {
          order: created,
          items: orderItems.map((item, i) => ({ ...item, id: `${created.id}-${i}`, order_id: created.id })),
        },
      })
    } catch {
      toast.error("Couldn't place your order. Please check your connection and try again.")
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-[1180px] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-heading text-2xl font-extrabold text-text">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted">Add products before checking out.</p>
        <Button asChild className="mt-5">
          <Link to="/products">Browse products</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1180px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-4 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/cart" className="-my-1 py-1 text-muted no-underline hover:text-blue">
          Cart
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-text">Checkout</span>
      </div>
      <h1 className="mb-6 font-heading text-[clamp(24px,3.4vw,32px)] font-extrabold tracking-tight text-text">
        Checkout
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid items-start gap-6 lg:grid-cols-[1fr_360px]"
      >
        <div className="flex flex-col gap-5">
          <Section title="Contact information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name *" error={errors.name?.message}>
                <Input placeholder="Your name" {...register("name")} />
              </Field>
              <Field label="Phone (+880) *" error={errors.phone?.message}>
                <Input placeholder="01XXX-XXXXXX" {...register("phone")} />
              </Field>
              <Field label="Email (optional)" className="sm:col-span-2" error={errors.email?.message}>
                <Input placeholder="you@example.com" type="email" {...register("email")} />
              </Field>
            </div>
          </Section>

          <Section title="Delivery address">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Division *" error={errors.division?.message}>
                <select
                  {...register("division")}
                  className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm"
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
                  disabled={!division}
                  className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm disabled:opacity-50"
                >
                  <option value="">Select district</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Upazila / Thana (optional)">
                <select
                  {...register("upazila")}
                  disabled={!district}
                  className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 text-base text-text outline-none sm:text-sm disabled:opacity-50"
                >
                  <option value="">Select upazila</option>
                  {upazilas.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Area">
                <Input placeholder="Area / locality" {...register("area")} />
              </Field>
              <Field label="Full address *" className="sm:col-span-2" error={errors.address?.message}>
                <Input placeholder="House / road / block" {...register("address")} />
              </Field>
              <Field label="Landmark (optional)" className="sm:col-span-2">
                <Input placeholder="Near…" {...register("landmark")} />
              </Field>
            </div>
          </Section>

          <Section title="Delivery method">
            <Controller
              control={control}
              name="deliveryMethod"
              render={({ field }) => (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <OptionCard
                    active={field.value === "courier"}
                    onClick={() => field.onChange("courier")}
                    icon={<Truck className="size-5" />}
                    title="Steadfast Courier"
                    note={
                      district
                        ? `${inside ? "Inside" : "Outside"} Dhaka · ${formatBDT(inside ? insideCharge : outsideCharge)} · ${inside ? "1–2" : "2–4"} days`
                        : "Charge shown after district · 2–4 days"
                    }
                  />
                  <OptionCard
                    active={field.value === "pickup"}
                    onClick={() => field.onChange("pickup")}
                    icon={<Store className="size-5" />}
                    title="Pickup from shop"
                    note="No delivery charge · collect from one of our offices"
                  />
                </div>
              )}
            />
          </Section>

          <Section title="Payment method">
            <Controller
              control={control}
              name="paymentMethod"
              render={({ field }) => (
                <div className="flex flex-col gap-3">
                  {availablePayments.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      active={field.value === opt.value}
                      onClick={() => field.onChange(opt.value)}
                      title={opt.label}
                      note={opt.note}
                      badge={{ label: opt.label, bg: opt.badgeBg }}
                    />
                  ))}
                </div>
              )}
            />
            {paymentMethod !== "cod" && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Sender number *" error={errors.paymentSenderNumber?.message}>
                  <Input placeholder="01XXX-XXXXXX" {...register("paymentSenderNumber")} />
                </Field>
                <Field label="Transaction ID *" error={errors.paymentReference?.message}>
                  <Input placeholder="e.g. 8N7A6B5C4D" {...register("paymentReference")} />
                </Field>
              </div>
            )}
          </Section>

          <Section title="Order notes">
            <textarea
              placeholder="Delivery instructions, preferred time…"
              {...register("notes")}
              className="min-h-[80px] w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-3 text-base text-text outline-none sm:text-sm"
            />
          </Section>
        </div>

        <aside className="sticky top-24 rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-4 font-heading text-[17px] font-extrabold text-text">Order Summary</div>
          <div className="flex flex-col gap-2.5 border-b border-border pb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-[13px]">
                <span className="text-muted">
                  {item.name} <span className="text-text">× {item.qty}</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-text">
                  {formatBDT(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span className="font-semibold tabular-nums text-text">{formatBDT(subtotal)}</span>
          </div>
          <div className="mt-2.5 flex justify-between text-sm text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" /> Delivery
            </span>
            <span className="font-bold tabular-nums text-text">{formatBDT(deliveryCharge)}</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-[15px] font-bold text-text">Total</span>
            <span className="font-heading text-2xl font-extrabold tabular-nums text-orange-500">
              {formatBDT(total)}
            </span>
          </div>
          <Button size="lg" className="mt-[18px] w-full" type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending ? "Placing order…" : "Place Order"}
          </Button>
        </aside>
      </form>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-4 font-heading text-base font-extrabold text-text">{title}</div>
      {children}
    </div>
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
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </div>
  )
}

function OptionCard({
  active,
  onClick,
  icon,
  title,
  note,
  badge,
}: {
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
  title: string
  note: string
  badge?: { label: string; bg: string }
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
        active ? "border-orange-500 bg-orange-500/5" : "border-border bg-surface-2",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
          active ? "border-orange-500 bg-orange-500" : "border-border",
        )}
      >
        {active && <Check className="size-3 text-white" strokeWidth={3} />}
      </span>
      {icon && <span className="mt-0.5 text-blue">{icon}</span>}
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-bold text-text">{title}</span>
          {badge && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold text-white"
              style={{ background: badge.bg }}
            >
              {badge.label}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-xs text-muted">{note}</span>
      </span>
    </button>
  )
}
