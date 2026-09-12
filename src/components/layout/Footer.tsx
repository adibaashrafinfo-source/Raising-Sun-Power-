import { MapPin } from "lucide-react"
import { Link } from "react-router-dom"

const shopLinks = ["Solar Panels", "Inverters", "Batteries", "MCB & MCCB", "Cables & Switchgear"]
const serviceLinks = ["Track order", "Returns", "Warranty", "FAQ"]
const companyLinks = ["About", "Contact", "Blog", "B2B pricing"]

export function Footer() {
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
              href="https://wa.me/8801705742208"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-[#053a1d] no-underline"
            >
              +880 1705-742208
            </a>
          </div>

          <FooterCol title="Shop" links={shopLinks} />
          <FooterCol title="Customer service" links={serviceLinks} />
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
            <PaymentBadge bg="#67A70E" color="#fff">COD</PaymentBadge>
            <PaymentBadge bg="#F4D560" color="#052C6E">Steadfast</PaymentBadge>
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
  links: string[]
  extra?: { label: string; to: string }
}) {
  return (
    <div>
      <div className="mb-3.5 font-heading text-sm font-bold text-white">{title}</div>
      <div className="flex flex-col gap-2.5">
        {links.map((link) => (
          <Link key={link} to="/products" className="text-[13.5px] text-[#9DB6DA] no-underline hover:text-orange-400">
            {link}
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
