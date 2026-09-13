import { useState } from "react"
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  ListTree,
  LogOut,
  Menu,
  Package,
  RotateCcw,
  Settings,
  ShoppingBag,
  Tags,
  Ticket,
  Truck,
  Users,
} from "lucide-react"
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"

import { useSeo } from "@/hooks/use-seo"
import { useAuth } from "@/lib/auth-provider"
import { signOut } from "@/lib/queries/auth"
import { cn } from "@/lib/utils"

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/inventory/stock", label: "Stock", icon: Boxes },
  { to: "/admin/inventory/suppliers", label: "Suppliers", icon: Truck },
  { to: "/admin/inventory/purchases", label: "Purchases", icon: ClipboardList },
  { to: "/admin/inventory/purchase-returns", label: "Purchase Returns", icon: RotateCcw },
  { to: "/admin/categories", label: "Categories", icon: ListTree },
  { to: "/admin/brands", label: "Brands", icon: Tags },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminLayout() {
  useSeo({ title: "Admin", noIndex: true })
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  return (
    <div className="flex min-h-screen bg-bg text-text">
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-all lg:sticky lg:top-0 lg:h-screen",
          collapsed ? "w-[76px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2 no-underline">
              <span className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-white">
                <img src="/logo.jpg" alt="RSP" className="size-full object-cover" />
              </span>
              <span className="font-heading text-sm font-extrabold text-text">RSP Admin</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden size-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2 lg:flex"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold no-underline transition-colors",
                  isActive ? "bg-orange-500/12 text-orange-500" : "text-muted hover:bg-surface-2",
                )
              }
            >
              <link.icon className="size-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="size-[18px] shrink-0" />
            {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-border bg-surface px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg border border-border text-text"
          >
            <Menu className="size-[18px]" />
          </button>
          <span className="font-heading text-sm font-extrabold text-text">RSP Admin</span>
        </header>
        <div className="flex items-center justify-end gap-3 border-b border-border px-6 py-3">
          <span className="text-sm text-muted">{profile?.full_name}</span>
        </div>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
