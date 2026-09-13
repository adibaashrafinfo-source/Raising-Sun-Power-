import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-provider"
import { useCustomers, useUpdateProfileRole } from "@/hooks/use-admin"
import type { ProfileRole } from "@/types/database"

const ROLE_VARIANT = { admin: "orange", manager: "blue", staff: "green", customer: "neutral" } as const
const ROLES: ProfileRole[] = ["customer", "staff", "manager", "admin"]

export default function AdminStaffPage() {
  const { data: profiles = [], isLoading } = useCustomers()
  const updateRole = useUpdateProfileRole()
  const { user } = useAuth()

  const handleRoleChange = async (profileId: string, role: ProfileRole) => {
    try {
      await updateRole.mutateAsync({ userId: profileId, role })
      toast.success("Role updated")
    } catch {
      toast.error("Couldn't update this role")
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-text">Staff Management</h1>
        <p className="mt-0.5 text-sm text-muted">
          Manager and staff roles can access Inventory and Finance. Only admin can access everything else and
          delete records.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Current Role</th>
                <th className="px-4 py-3 font-semibold">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-semibold text-text">{p.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ROLE_VARIANT[p.role]}>{p.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.role}
                      disabled={p.id === user?.id}
                      onChange={(e) => handleRoleChange(p.id, e.target.value as ProfileRole)}
                      className="h-9 rounded-lg border border-border bg-surface-2 px-2.5 text-xs font-semibold text-text outline-none disabled:opacity-50"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
