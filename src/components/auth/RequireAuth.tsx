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
