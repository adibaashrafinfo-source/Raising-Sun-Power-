import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { Link } from "react-router-dom"

import { FacebookIcon, InstagramIcon, LinkedinIcon, TiktokIcon, YoutubeIcon } from "@/components/icons/SocialIcons"
import { useSettings } from "@/hooks/use-checkout"

const shopLinks = ["Solar Panels", "Inverters", "Batteries", "MCB & MCCB", "Cables & Switchgear"]
const serviceLinks = ["Track order", "Returns", "Warranty", "FAQ"]
const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Solar Calculator", to: "/solar-calculator" },
  { label: "Get Free Quotation", to: "/get-quotation" },
]

export function Footer() {
  const { data: settings } = useSettings()
  const whatsappNumber = settings?.whatsapp_number || "8801786896390"
  const phone = settings?.support_phone || "+8801786896390"
  const email = settings?.contact_email || "info@risingsunpowerbd.com"

  const socialLinks = [
    { url: settings?.facebook_url, icon: FacebookIcon, label: "Facebook" },
    { url: settings?.instagram_url, icon: InstagramIcon, label: "Instagram" },
    { url: settings?.youtube_url, icon: YoutubeIcon, label: "YouTube" },
    { url: settings?.linkedin_url, icon: LinkedinIcon, label: "LinkedIn" },
    { url: settings?.tiktok_url, icon: TiktokIcon, label: "TikTok" },
  ].filter((s): s is typeof s & { url: string } => !!s.url)

  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(180deg,#052C6E_0%,#04214f_55%,#03163a_100%)] text-[#D6E4F7]">
      {/* top brand-gradient accent line */}
      <div className="h-1 w-full bg-[linear-gradient(90deg,#217CCA,#F49E09_50%,#67A70E)]" />
      {/* ambient glows */}
      <div
        className="pointer-events-none absolute -left-[8%] top-[6%] size-[420px] rounded-full opacity-20 blur-[60px]"
        style={{ background: "radial-gradient(circle,#217CCA 0%,transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -right-[6%] bottom-[4%] size-[380px] rounded-full opacity-[0.18] blur-[60px]"
        style={{ background: "radial-gradient(circle,#67A70E 0%,transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-[1280px] px-4 pb-8 pt-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Brand + contact + social */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="flex size-[52px] items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,.25)]">
                <img src="/logo.jpg" alt="RSP" className="size-full object-cover" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-heading text-[18px] font-extrabold tracking-wide text-white">
                  Rising Sun Power
                </span>
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-gold-400">
                  Solar &amp; Electrical
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-[320px] text-[13.5px] leading-relaxed text-[#9DB6DA]">
              Genuine solar &amp; electrical products with engineered reliability — powering homes and
              businesses across Bangladesh with clean, renewable energy.
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              <ContactChip icon={Phone} href={`tel:${phone.replace(/\s|-/g, "")}`} label={phone} />
              <ContactChip icon={Mail} href={`mailto:${email}`} label={email} />
              <ContactChip
                icon={MessageCircle}
                href={`https://wa.me/${whatsappNumber}`}
                label="Chat on WhatsApp"
                external
                accent
              />
            </div>

            {socialLinks.length > 0 && (
              <div className="mt-5 flex items-center gap-2.5">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:bg-orange-500 hover:shadow-[0_8px_20px_rgba(244,158,9,.4)]"
                  >
                    <s.icon className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <FooterCol title="Shop" links={shopLinks.map((l) => ({ label: l, to: "/products" }))} />
            <FooterCol title="Customer Service" links={serviceLinks.map((l) => ({ label: l, to: "/products" }))} />
            <FooterCol title="Company" links={companyLinks} />
          </div>

          {/* Showrooms */}
          <div className="lg:col-span-3">
            <div className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-white">Our Shops</div>
            <div className="flex flex-col gap-4">
              <ShopAddress name="Dhaka Showroom" address="Nawabpur Road, Electrical Market, Dhaka 1100" />
              <ShopAddress name="Chattogram Branch" address="Reazuddin Bazar, Kotwali, Chattogram 4000" />
            </div>
          </div>
        </div>

        {/* Payment strip */}
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 sm:flex-row sm:justify-between">
          <span className="text-[13px] font-semibold text-[#B7D2F2]">We accept</span>
          <div className="flex flex-wrap items-center gap-2.5">
            <PaymentBadge bg="#E2136E" color="#fff">bKash</PaymentBadge>
            <PaymentBadge bg="#EE6123" color="#fff">Nagad</PaymentBadge>
            <PaymentBadge bg="#0B3F94" color="#fff">Bank</PaymentBadge>
            <PaymentBadge bg="#67A70E" color="#fff">Cash on Delivery</PaymentBadge>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
          <span className="text-[12.5px] text-[#7E98C2]">
            © {new Date().getFullYear()} Rising Sun Power BD. All rights reserved.
          </span>
          <span className="text-[12.5px] text-[#7E98C2]">
            Designed by <b className="text-gold-400">Abrar IT</b>
          </span>
        </div>
      </div>
    </footer>
  )
}

function ContactChip({
  icon: Icon,
  href,
  label,
  external,
  accent,
}: {
  icon: typeof Phone
  href: string
  label: string
  external?: boolean
  accent?: boolean
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group inline-flex w-fit items-center gap-2.5 text-[13.5px] font-medium text-[#C4D6EF] no-underline transition-colors hover:text-white"
    >
      <span
        className={
          accent
            ? "flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/20 text-[#3ee27f]"
            : "flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-gold-400"
        }
      >
        <Icon className="size-[15px]" />
      </span>
      {label}
    </a>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: { label: string; to: string }[]
}) {
  return (
    <div>
      <div className="mb-4 font-heading text-sm font-bold uppercase tracking-wide text-white">{title}</div>
      <div className="flex flex-col gap-2.5">
        {links.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className="group inline-flex w-fit items-center gap-1 text-[13.5px] text-[#9DB6DA] no-underline transition-colors hover:text-orange-400"
          >
            <ArrowUpRight className="size-0 opacity-0 transition-all duration-200 group-hover:size-3.5 group-hover:opacity-100" />
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function ShopAddress({ name, address }: { name: string; address: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 transition-colors hover:border-white/15">
      <MapPin className="mt-0.5 size-[18px] shrink-0 text-gold-400" />
      <div className="text-[13px] leading-relaxed text-[#9DB6DA]">
        <b className="text-[#EAF1FB]">{name}</b>
        <br />
        {address}
      </div>
    </div>
  )
}

function PaymentBadge({
  bg,
  color,
  children,
}: {
  bg: string
  color: string
  children: React.ReactNode
}) {
  return (
    <span
      className="rounded-lg px-3 py-1.5 text-[11px] font-extrabold shadow-[0_4px_12px_rgba(0,0,0,.25)]"
      style={{ background: bg, color }}
    >
      {children}
    </span>
  )
}
