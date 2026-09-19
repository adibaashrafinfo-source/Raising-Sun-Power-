import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { COMPANY } from "@/data/company"
import { useSettings } from "@/hooks/use-checkout"
import { useCreateContactMessage } from "@/hooks/use-contact"
import { useSeo } from "@/hooks/use-seo"
import { useSiteContent } from "@/hooks/use-site-content"
import { officesFrom } from "@/lib/offices"
import { type ContactFormValues, contactSchema } from "@/lib/schemas/contact"
import { cn } from "@/lib/utils"

export default function ContactPage() {
  useSeo({
    title: "Contact Us",
    description:
      "Get in touch with Rising Sun Power BD — call, WhatsApp, email, or visit our Dhaka and Chattogram showrooms.",
  })
  const { data: settings } = useSettings()
  const { data: cms } = useSiteContent()
  const createMessage = useCreateContactMessage()

  const whatsappNumber = settings?.whatsapp_number || COMPANY.whatsappIntl
  const phone = settings?.support_phone || COMPANY.phone
  const email = settings?.contact_email || COMPANY.email
  const businessHours = cms?.business_hours || "Sat–Thu, 10am–8pm"
  const showrooms = officesFrom(cms)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) })

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await createMessage.mutateAsync({
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        subject: values.subject,
        message: values.message,
      })
      toast.success("Message sent — we'll get back to you soon!")
      reset()
    } catch {
      toast.error("Couldn't send your message. Please check your connection and try again.")
    }
  }

  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-4 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="-my-1 py-1 text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-text">Contact</span>
      </div>

      <div className="mx-auto mb-9 max-w-[640px] text-center">
        <h1 className="text-balance font-heading text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-tight text-text">
          Get in Touch
        </h1>
        <p className="mt-3.5 text-[clamp(15px,2vw,17px)] leading-relaxed text-muted">
          Questions about a product, an order, or want a custom solar quote? Reach us any of these ways.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ContactCard
          icon={Phone}
          color="#217CCA"
          tint="rgba(33,124,202,.14)"
          label="Call us"
          value={phone}
          href={`tel:${phone.replace(/\s|-/g, "")}`}
        />
        <ContactCard
          icon={MessageCircle}
          color="#25D366"
          tint="rgba(37,211,102,.16)"
          label="WhatsApp"
          value="Chat with us"
          href={`https://wa.me/${whatsappNumber}`}
        />
        <ContactCard icon={Mail} color="#F49E09" tint="rgba(244,158,9,.16)" label="Email" value={email} href={`mailto:${email}`} />
        <ContactCard icon={Clock} color="#67A70E" tint="rgba(103,167,14,.14)" label="Business hours" value={businessHours} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-[20px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-[26px]"
        >
          <div className="mb-1 font-heading text-lg font-extrabold text-text">Send us a message</div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Name *" error={errors.name?.message}>
              <Input placeholder="Your name" {...register("name")} />
            </Field>
            <Field label="Email *" error={errors.email?.message}>
              <Input placeholder="you@example.com" type="email" {...register("email")} />
            </Field>
            <Field label="Phone (optional)" className="sm:col-span-2" error={errors.phone?.message}>
              <Input placeholder="01XXX-XXXXXX" {...register("phone")} />
            </Field>
            <Field label="Subject *" className="sm:col-span-2" error={errors.subject?.message}>
              <Input placeholder="What's this about?" {...register("subject")} />
            </Field>
          </div>
          <Field label="Message *" error={errors.message?.message}>
            <textarea
              placeholder="Tell us how we can help…"
              {...register("message")}
              className="min-h-[130px] w-full resize-y rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3.5 py-3 text-base text-text outline-none sm:text-sm"
            />
          </Field>
          <Button size="lg" type="submit" disabled={createMessage.isPending} className="w-full">
            {createMessage.isPending ? "Sending…" : "Send Message"}
          </Button>
        </form>

        <div className="flex flex-col gap-4">
          {showrooms.map((s) => (
            <ShowroomCard key={s.name} name={s.name} address={s.address} />
          ))}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            className="flex items-center justify-center gap-2.5 rounded-[18px] bg-[#25D366] px-5 py-4 text-[15px] font-bold text-[#053a1d] no-underline shadow-[0_10px_26px_rgba(37,211,102,.3)]"
          >
            <MessageCircle className="size-[18px]" />
            Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </main>
  )
}

function ContactCard({
  icon: Icon,
  color,
  tint,
  label,
  value,
  href,
}: {
  icon: typeof Phone
  color: string
  tint: string
  label: string
  value: string
  href?: string
}) {
  const content = (
    <div className="rounded-[18px] border border-border bg-surface p-5 text-center shadow-[var(--shadow-sm)] transition-transform hover:-translate-y-0.5">
      <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl" style={{ background: tint }}>
        <Icon className="size-5" style={{ color }} />
      </span>
      <div className="text-[12.5px] font-semibold text-muted">{label}</div>
      <div className="mt-1 truncate font-heading text-sm font-bold text-text">{value}</div>
    </div>
  )
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="no-underline">
      {content}
    </a>
  ) : (
    content
  )
}

function ShowroomCard({ name, address }: { name: string; address: string }) {
  return (
    <div className="flex items-start gap-3.5 rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500/16">
        <MapPin className="size-5 text-orange-500" />
      </span>
      <div>
        <div className="font-heading text-base font-bold text-text">{name}</div>
        <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{address}</p>
      </div>
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
