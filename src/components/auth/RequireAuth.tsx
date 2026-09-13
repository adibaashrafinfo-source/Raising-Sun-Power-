import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/lib/auth-provider"

export function RequireAuth() {
  const { session, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  return <Outlet />
}

export function RequireAdmin() {
  const { session, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!isAdmin) return <Navigate to="/account" replace />

  return <Outlet />
}

// Gates the whole /admin tree to admin/manager/staff. Nest <RequireAdminOnly />
// inside for pages that must stay admin-only (everything outside
// /admin/inventory and /admin/finance).
export function RequireInventoryStaff() {
  const { session, isInventoryStaff, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!isInventoryStaff) return <Navigate to="/account" replace />

  return <Outlet />
}

// Used nested inside RequireInventoryStaff for admin-only pages — redirects
// a signed-in manager/staff user to the inventory section instead of
// /account, since they do belong in /admin, just not on this specific page.
export function RequireAdminOnly() {
  const { isAdmin, isLoading } = useAuth()

  if (isLoading) return null
  if (!isAdmin) return <Navigate to="/admin/inventory/stock" replace />

  return <Outlet />
}
