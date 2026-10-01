import type { ProfileRole } from "@/types/database"

/** Every role that may open some part of the admin panel. */
export const ADMIN_ROLES = [
  "admin",
  "manager",
  "staff",
  "sales",
  "accountant",
  "delivery",
  "content_editor",
] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]

export const ROLE_LABELS: Record<ProfileRole, string> = {
  customer: "Customer",
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  sales: "Sales",
  accountant: "Accountant",
  delivery: "Delivery",
  content_editor: "Content Editor",
}

export const ROLE_SUMMARIES: Record<ProfileRole, string> = {
  customer: "No admin access.",
  admin: "Everything, including settings and staff.",
  manager: "Inventory and finance.",
  staff: "Inventory and finance.",
  sales: "Orders, leads, customers, messages and coupons.",
  accountant: "Finance, inventory reports and orders (read-only).",
  delivery: "Orders only — to move them through dispatch.",
  content_editor: "Catalogue, packages and site content.",
}

/**
 * Which admin paths each role may open. "*" is everything; otherwise a path is
 * allowed when it equals an entry or sits under one. The database enforces the
 * same split through RLS — this only decides what the panel offers, so a role
 * is never shown a page whose data it cannot load.
 */
const ACCESS: Record<AdminRole, "*" | string[]> = {
  admin: "*",
  manager: ["/admin/inventory", "/admin/finance"],
  staff: ["/admin/inventory", "/admin/finance"],
  sales: ["/admin/orders", "/admin/leads", "/admin/customers", "/admin/messages", "/admin/coupons"],
  accountant: ["/admin/finance", "/admin/inventory/reports", "/admin/orders"],
  delivery: ["/admin/orders"],
  content_editor: [
    "/admin/products",
    "/admin/categories",
    "/admin/brands",
    "/admin/packages",
    "/admin/cms",
    "/admin/hero-slider",
  ],
}

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role)
}

export function canAccessAdminPath(role: string | null | undefined, path: string): boolean {
  if (!isAdminRole(role)) return false
  const allowed = ACCESS[role]
  if (allowed === "*") return true
  return allowed.some((entry) => path === entry || path.startsWith(`${entry}/`))
}

/** Where a role lands when it opens /admin, or is sent somewhere it cannot go. */
export function adminLandingPath(role: string | null | undefined): string {
  if (!isAdminRole(role)) return "/account"
  const allowed = ACCESS[role]
  if (allowed === "*") return "/admin"
  // Sections are listed most-relevant first, and a few are parents rather than
  // real routes, so the landing page is spelled out where that matters.
  const FIRST_PAGE: Record<string, string> = {
    "/admin/inventory": "/admin/inventory/stock",
    "/admin/finance": "/admin/finance/dashboard",
  }
  const first = allowed[0]
  return FIRST_PAGE[first] ?? first
}
