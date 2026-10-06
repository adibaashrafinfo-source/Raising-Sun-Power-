import { useState } from "react"
import {
  BarChart3,
  Boxes,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  GalleryHorizontal,
  Landmark,
  Layers,
  LayoutTemplate,
  ListTree,
  LogOut,
  Mail,
  Menu,
  Package,
  PieChart,
  Receipt,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Ticket,
  Truck,
  Users,
} from "lucide-react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"

import { useSeo } from "@/hooks/use-seo"
import { canAccessAdminPath } from "@/lib/admin-access"
import { useSiteContent } from "@/hooks/use-site-content"
import { useAuth } from "@/lib/auth-provider"
import { signOut } from "@/lib/queries/auth"
import { cn } from "@/lib/utils"

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/packages", label: "Packages", icon: Layers },
  { to: "/admin/couriers", label: "Courier Tracking", icon: Truck },
  { to: "/admin/inventory/stock", label: "Stock", icon: Boxes },
  { to: "/admin/inventory/suppliers", label: "Suppliers", icon: Truck },
  { to: "/admin/inventory/purchases", label: "Purchases", icon: ClipboardList },
  { to: "/admin/inventory/purchase-returns", label: "Purchase Returns", icon: RotateCcw },
  { to: "/admin/inventory/sales-returns", label: "Sales Returns", icon: RotateCcw },
  { to: "/admin/inventory/reports", label: "Inventory Reports", icon: BarChart3 },
  { to: "/admin/finance/dashboard", label: "Finance Dashboard", icon: PieChart },
  { to: "/admin/finance/expenses", label: "Expenses", icon: Receipt },
  { to: "/admin/finance/accounts", label: "Cash & Bank", icon: Landmark },
  { to: "/admin/categories", label: "Categories", icon: ListTree },
  { to: "/admin/brands", label: "Brands", icon: Tags },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/messages", label: "Contact Messages", icon: Mail },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/cms", label: "Site Content", icon: LayoutTemplate },
  { to: "/admin/hero-slider", label: "Hero Slider", icon: GalleryHorizontal },
  { to: "/admin/solar-calculator", label: "Solar Calculator", icon: Calculator },
  { to: "/admin/roi-calculator", label: "ROI Calculator", icon: Calculator },
  { to: "/admin/staff", label: "Staff Management", icon: ShieldCheck },
]

export function AdminLayout() {
  useSeo({ title: "Admin", noIndex: true })
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  // The label pill shown beside a collapsed icon. Tracked here rather than as a
  // pseudo-element because the rail scrolls, and a scroller clips its children.
  const [tip, setTip] = useState<{ label: string; top: number; left: number } | null>(null)
  const { profile } = useAuth()
  // The same logo the public site shows, so the panel is branded from the CMS
  // rather than from a file path baked in here.
  const { data: siteContent } = useSiteContent()
  const logo = siteContent?.header_logo_url || "/logo.png"
  const navigate = useNavigate()
  const location = useLocation()
  // The sidebar offers exactly what this role may open, from the same map the
  // route guard checks, so no link ever leads to a redirect.
  const visibleLinks = links.filter((link) => canAccessAdminPath(profile?.role, link.to))

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  return (
    <div className="rsp-admin relative flex min-h-screen text-text">
      {/* Colour for the glass to refract. Decorative only. */}
      <div aria-hidden="true" className="rsp-admin-backdrop">
        <span />
        <span />
        <span />
      </div>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={cn(
          "rsp-glass-panel fixed inset-y-0 left-0 z-50 flex flex-col transition-[width,transform] duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
          "lg:sticky lg:top-3 lg:ml-3 lg:h-[calc(100vh-24px)] lg:rounded-[26px]",
          collapsed ? "w-[80px]" : "w-[248px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-[var(--glass-panel-border)] px-3",
            collapsed ? "justify-center" : "justify-between px-4",
          )}
        >
          {!collapsed && (
            <Link to="/" className="flex min-w-0 items-center gap-2 no-underline">
              <img
                src={logo}
                alt="Rising Sun Power BD"
                className="h-9 w-auto max-w-[150px] object-contain"
              />
              <span className="font-heading text-sm font-extrabold text-text">Admin</span>
            </Link>
          )}
          <button
            onClick={() => {
              setTip(null)
              setCollapsed((c) => !c)
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden size-9 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:bg-surface-2 hover:text-text lg:flex"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMobileOpen(false)}
              // Collapsed to icons, the label rides out as a pill on hover;
              // the title attribute is the fallback where that cannot paint.
              title={collapsed ? link.label : undefined}
              onMouseEnter={(e) => {
                if (!collapsed) return
                const r = e.currentTarget.getBoundingClientRect()
                setTip({ label: link.label, top: r.top + r.height / 2, left: r.right + 16 })
              }}
              onMouseLeave={() => setTip(null)}
              className={({ isActive }) =>
                cn(
                  "rsp-nav-item mb-1 flex items-center gap-3 rounded-xl py-2.5 text-sm font-semibold no-underline transition-[background-color,color,transform] duration-200",
                  collapsed ? "justify-center px-0" : "px-3",
                  isActive ? "text-orange-500" : "text-muted hover:translate-x-0.5 hover:text-text",
                )
              }
            >
              <link.icon className="size-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--glass-panel-border)] p-3">
          <button
            onClick={handleSignOut}
            title={collapsed ? "Sign out" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10",
              collapsed ? "justify-center px-0" : "px-3",
            )}
          >
            <LogOut className="size-[18px] shrink-0" />
            {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      {collapsed && tip && (
        <div className="rsp-nav-tip hidden lg:block" style={{ top: tip.top, left: tip.left }}>
          {tip.label}
        </div>
      )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="rsp-glass-panel m-3 flex h-14 items-center gap-3 rounded-2xl px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex size-9 items-center justify-center rounded-lg border border-border text-text"
          >
            <Menu className="size-[18px]" />
          </button>
          <span className="font-heading text-sm font-extrabold text-text">RSP Admin</span>
        </header>
        <div className="hidden px-6 pt-3 lg:flex lg:justify-end">
          <div className="rsp-glass-panel flex items-center gap-2.5 rounded-full px-4 py-2">
            <span className="text-sm font-semibold text-text">{profile?.full_name}</span>
          </div>
        </div>
        {/* Keyed on the path so each page plays the entrance animation. */}
        <main key={location.pathname} className="rsp-page-enter relative z-10 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
