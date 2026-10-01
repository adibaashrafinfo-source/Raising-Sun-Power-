import { Navigate, Outlet, useLocation } from "react-router-dom"

import { adminLandingPath, canAccessAdminPath, isAdminRole } from "@/lib/admin-access"
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

// Gates the whole /admin tree. Any role with some admin access gets in; which
// pages they may open is decided by RequireAdminAccess below, from the same
// map the sidebar is built from.
export function RequireInventoryStaff() {
  const { session, profile, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (!isAdminRole(profile?.role)) return <Navigate to="/account" replace />

  return <Outlet />
}

// Nested inside RequireInventoryStaff: checks the page itself against the
// role's allowed sections, and sends anyone who does not belong here to their
// own landing page rather than out of the panel.
export function RequireAdminAccess() {
  const { profile, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null
  if (!canAccessAdminPath(profile?.role, location.pathname)) {
    const landing = adminLandingPath(profile?.role)
    // Guard against a role whose landing page is itself out of bounds.
    if (landing === location.pathname) return <Navigate to="/account" replace />
    return <Navigate to={landing} replace />
  }

  return <Outlet />
}
