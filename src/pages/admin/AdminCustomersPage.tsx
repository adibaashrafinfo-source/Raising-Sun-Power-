import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useCustomers } from "@/hooks/use-admin"

export default function AdminCustomersPage() {
  const { data: customers = [], isLoading } = useCustomers()

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl font-extrabold text-text">Customers</h1>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        ) : customers.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No customers yet.</p>
        ) : (
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-semibold text-text">{customer.full_name || "—"}</td>
                  <td className="px-4 py-3 text-muted">{customer.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={customer.role === "admin" ? "blue" : "neutral"}>{customer.role}</Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-muted">
                    {new Date(customer.created_at).toLocaleDateString()}
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
