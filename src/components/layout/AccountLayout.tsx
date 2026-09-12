import { Heart, LayoutDashboard, MapPin, Package, User } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

import { useSeo } from "@/hooks/use-seo"
import { cn } from "@/lib/utils"

const links = [
  { to: "/account", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/account/orders", label: "Orders", icon: Package },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/profile", label: "Profile", icon: User },
]

export function AccountLayout() {
  useSeo({ title: "My Account", noIndex: true })

  return (
    <main className="mx-auto max-w-[1100px] px-4 pb-16 pt-6 sm:px-6">
      <h1 className="mb-6 font-heading text-2xl font-extrabold tracking-tight text-text">My Account</h1>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold no-underline transition-colors",
                  isActive ? "bg-orange-500/12 text-orange-500" : "text-muted hover:bg-surface-2",
                )
              }
            >
              <link.icon className="size-[18px]" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
