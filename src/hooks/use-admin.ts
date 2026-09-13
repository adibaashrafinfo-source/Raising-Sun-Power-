import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  adjustStock,
  deleteBrand,
  deleteCategory,
  deleteCoupon,
  deleteProduct,
  fetchAllBrands,
  fetchAllCategories,
  fetchAllCoupons,
  fetchAllLeads,
  fetchAllOrders,
  fetchAllProductsAdmin,
  fetchCustomers,
  fetchDashboardStats,
  fetchLocations,
  fetchProductStock,
  fetchProductStockTotals,
  transferStock,
  updateLead,
  updateOrderStatus,
  updateSettings,
  upsertBrand,
  upsertCategory,
  upsertCoupon,
  upsertProduct,
} from "@/lib/queries/admin"
import type { LeadStatus, OrderStatus } from "@/types/database"

export function useDashboardStats() {
  return useQuery({ queryKey: ["admin-dashboard"], queryFn: fetchDashboardStats })
}

export function useAllOrders(filters: { status?: OrderStatus; search?: string }) {
  return useQuery({ queryKey: ["admin-orders", filters], queryFn: () => fetchAllOrders(filters) })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  })
}

export function useAllProductsAdmin() {
  return useQuery({ queryKey: ["admin-products"], queryFn: fetchAllProductsAdmin })
}

export function useUpsertProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  })
}

export function useAllCategoriesAdmin() {
  return useQuery({ queryKey: ["admin-categories"], queryFn: fetchAllCategories })
}

export function useUpsertCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
  })
}

export function useAllBrandsAdmin() {
  return useQuery({ queryKey: ["admin-brands"], queryFn: fetchAllBrands })
}

export function useUpsertBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] })
      queryClient.invalidateQueries({ queryKey: ["brands"] })
    },
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-brands"] }),
  })
}

export function useCustomers() {
  return useQuery({ queryKey: ["admin-customers"], queryFn: fetchCustomers })
}

export function useAllCoupons() {
  return useQuery({ queryKey: ["admin-coupons"], queryFn: fetchAllCoupons })
}

export function useUpsertCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
  })
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }),
  })
}

export function useAllLeads(filters: { status?: LeadStatus }) {
  return useQuery({ queryKey: ["admin-leads", filters], queryFn: () => fetchAllLeads(filters) })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateLead>[1] }) =>
      updateLead(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-leads"] }),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] }),
  })
}

// ---------- Locations ----------
export function useLocations() {
  return useQuery({ queryKey: ["admin-locations"], queryFn: fetchLocations })
}

// ---------- Stock ----------
export function useProductStock() {
  return useQuery({ queryKey: ["admin-product-stock"], queryFn: fetchProductStock })
}

export function useProductStockTotals() {
  return useQuery({ queryKey: ["admin-product-stock-totals"], queryFn: fetchProductStockTotals })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product-stock"] })
      queryClient.invalidateQueries({ queryKey: ["admin-product-stock-totals"] })
    },
  })
}

export function useTransferStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: transferStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product-stock"] })
      queryClient.invalidateQueries({ queryKey: ["admin-product-stock-totals"] })
    },
  })
}
