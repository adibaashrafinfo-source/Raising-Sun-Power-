import { MapPin } from "lucide-react"
import { Link } from "react-router-dom"

import { FacebookIcon, InstagramIcon, LinkedinIcon, TiktokIcon, YoutubeIcon } from "@/components/icons/SocialIcons"
import { useSettings } from "@/hooks/use-checkout"

const shopLinks = ["Solar Panels", "Inverters", "Batteries", "MCB & MCCB", "Cables & Switchgear"]
const serviceLinks = ["Track order", "Returns", "Warranty", "FAQ"]
const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
]

export function Footer() {
  const { data: settings } = useSettings()
  const whatsappNumber = settings?.whatsapp_number || "8801786896390"

  const socialLinks = [
    { url: settings?.facebook_url, icon: FacebookIcon, label: "Facebook" },
    { url: settings?.instagram_url, icon: InstagramIcon, label: "Instagram" },
    { url: settings?.youtube_url, icon: YoutubeIcon, label: "YouTube" },
    { url: settings?.linkedin_url, icon: LinkedinIcon, label: "LinkedIn" },
    { url: settings?.tiktok_url, icon: TiktokIcon, label: "TikTok" },
  ].filter((s): s is typeof s & { url: string } => !!s.url)

  return (
    <footer className="bg-[linear-gradient(180deg,#052C6E,#041d49)] text-[#D6E4F7]">
      <div className="mx-auto max-w-[1280px] px-4 pb-6 pt-12 sm:px-6">
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-6">
          <div className="max-w-[340px] lg:col-span-6">
            <div className="flex items-center gap-3">
              <span className="flex size-[46px] items-center justify-center overflow-hidden rounded-xl bg-white">
                <img src="/logo.jpg" alt="RSP" className="size-full object-cover" />
              </span>
              <span className="font-heading text-[17px] font-extrabold text-white">
                Rising Sun Power BD
              </span>
            </div>
            <p className="my-4 max-w-[300px] text-[13.5px] leading-relaxed text-[#9DB6DA]">
              Genuine solar &amp; electrical products with engineered reliability — powering homes
              and businesses across Bangladesh.
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-[#053a1d] no-underline"
            >
              +880 1786-896390
            </a>
            {socialLinks.length > 0 && (
              <div className="mt-4 flex items-center gap-2.5">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-orange-500 hover:text-white"
                  >
                    <s.icon className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <FooterCol title="Shop" links={shopLinks.map((l) => ({ label: l, to: "/products" }))} />
          <FooterCol title="Customer service" links={serviceLinks.map((l) => ({ label: l, to: "/products" }))} />
          <FooterCol title="Company" links={companyLinks} extra={{ label: "Get Free Quotation", to: "/get-quotation" }} />

          <div className="lg:col-span-2">
            <div className="mb-3.5 font-heading text-sm font-bold text-white">Our shops</div>
            <div className="flex flex-col gap-4">
              <ShopAddress
                name="Dhaka Showroom"
                address="Nawabpur Road, Electrical Market, Dhaka 1100"
              />
              <ShopAddress
                name="Chattogram Branch"
                address="Reazuddin Bazar, Kotwali, Chattogram 4000"
              />
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
          <span className="text-[12.5px] text-[#7E98C2]">
            © 2026 Rising Sun Power BD. All rights reserved.
          </span>
          <div className="flex items-center gap-2.5">
            <PaymentBadge bg="#E2136E" color="#fff">bKash</PaymentBadge>
            <PaymentBadge bg="#EE6123" color="#fff">Nagad</PaymentBadge>
            <PaymentBadge bg="#0B3F94" color="#fff">Bank</PaymentBadge>
            <PaymentBadge bg="#67A70E" color="#fff">COD</PaymentBadge>
          </div>
          <span className="text-[12.5px] text-[#7E98C2]">
            Designed by <b className="text-gold-400">Abrar IT</b>
          </span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
  extra,
}: {
  title: string
  links: { label: string; to: string }[]
  extra?: { label: string; to: string }
}) {
  return (
    <div>
      <div className="mb-3.5 font-heading text-sm font-bold text-white">{title}</div>
      <div className="flex flex-col gap-2.5">
        {links.map((link) => (
          <Link key={link.label} to={link.to} className="text-[13.5px] text-[#9DB6DA] no-underline hover:text-orange-400">
            {link.label}
          </Link>
        ))}
        {extra && (
          <Link to={extra.to} className="text-[13.5px] text-[#9DB6DA] no-underline hover:text-orange-400">
            {extra.label}
          </Link>
        )}
      </div>
    </div>
  )
}

function ShopAddress({ name, address }: { name: string; address: string }) {
  return (
    <div className="flex gap-2.5">
      <MapPin className="mt-0.5 size-[17px] shrink-0 text-gold-400" />
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
      className="rounded-md px-2.5 py-1.5 text-[11px] font-extrabold"
      style={{ background: bg, color }}
    >
      {children}
    </span>
  )
}
