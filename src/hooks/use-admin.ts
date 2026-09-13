import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  adjustStock,
  createExpense,
  createPurchase,
  createPurchaseReturn,
  createSalesReturn,
  deleteBrand,
  deleteCashBankAccount,
  deleteCategory,
  deleteCoupon,
  deleteProduct,
  deleteSupplier,
  fetchAllBrands,
  fetchAllCategories,
  fetchAllCoupons,
  fetchAllLeads,
  fetchAllOrders,
  fetchAllProductsAdmin,
  fetchCashBankAccounts,
  fetchCustomerDueOrders,
  fetchCustomerDueTotal,
  fetchCustomers,
  fetchDashboardStats,
  fetchExpenseCategories,
  fetchExpenses,
  fetchLedgerSummary,
  fetchLocations,
  fetchLowStockAlert,
  fetchMonthlyExpenseSummary,
  fetchOrderPayments,
  fetchProductStock,
  fetchProductStockTotals,
  fetchProfitLossMonthly,
  fetchPurchaseHistoryReport,
  fetchPurchaseItems,
  fetchPurchaseReturns,
  fetchPurchases,
  fetchSalesReturns,
  fetchStockValuation,
  fetchSupplierDuesView,
  fetchSupplierPayments,
  fetchSupplierPurchases,
  fetchSuppliers,
  recordCustomerPayment,
  recordSupplierPayment,
  transferStock,
  updateLead,
  updateOrderStatus,
  updateSettings,
  upsertBrand,
  upsertCashBankAccount,
  upsertCategory,
  upsertCoupon,
  upsertProduct,
  upsertSupplier,
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

// ---------- Suppliers ----------
export function useSuppliers() {
  return useQuery({ queryKey: ["admin-suppliers"], queryFn: fetchSuppliers })
}

export function useUpsertSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertSupplier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] }),
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] }),
  })
}

export function useSupplierPurchases(supplierId: string | undefined) {
  return useQuery({
    queryKey: ["admin-supplier-purchases", supplierId],
    queryFn: () => fetchSupplierPurchases(supplierId!),
    enabled: !!supplierId,
  })
}

export function useSupplierPayments(supplierId: string | undefined) {
  return useQuery({
    queryKey: ["admin-supplier-payments", supplierId],
    queryFn: () => fetchSupplierPayments(supplierId!),
    enabled: !!supplierId,
  })
}

// ---------- Purchases ----------
export function usePurchases() {
  return useQuery({ queryKey: ["admin-purchases"], queryFn: fetchPurchases })
}

export function usePurchaseItems(purchaseId: string | undefined) {
  return useQuery({
    queryKey: ["admin-purchase-items", purchaseId],
    queryFn: () => fetchPurchaseItems(purchaseId!),
    enabled: !!purchaseId,
  })
}

export function useCreatePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-purchases"] })
      queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] })
      queryClient.invalidateQueries({ queryKey: ["admin-product-stock"] })
      queryClient.invalidateQueries({ queryKey: ["admin-product-stock-totals"] })
    },
  })
}

export function useRecordSupplierPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recordSupplierPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-purchases"] })
      queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] })
      queryClient.invalidateQueries({ queryKey: ["admin-supplier-purchases"] })
      queryClient.invalidateQueries({ queryKey: ["admin-supplier-payments"] })
    },
  })
}

// ---------- Purchase Returns ----------
export function usePurchaseReturns() {
  return useQuery({ queryKey: ["admin-purchase-returns"], queryFn: fetchPurchaseReturns })
}

export function useCreatePurchaseReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createPurchaseReturn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-purchase-returns"] })
      queryClient.invalidateQueries({ queryKey: ["admin-product-stock"] })
      queryClient.invalidateQueries({ queryKey: ["admin-product-stock-totals"] })
    },
  })
}

// ---------- Customer Payments ----------
export function useOrderPayments(orderId: string | undefined) {
  return useQuery({
    queryKey: ["admin-order-payments", orderId],
    queryFn: () => fetchOrderPayments(orderId!),
    enabled: !!orderId,
  })
}

export function useRecordCustomerPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recordCustomerPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
      queryClient.invalidateQueries({ queryKey: ["admin-order-payments"] })
    },
  })
}

// ---------- Sales Returns ----------
export function useSalesReturns() {
  return useQuery({ queryKey: ["admin-sales-returns"], queryFn: fetchSalesReturns })
}

export function useCreateSalesReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createSalesReturn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sales-returns"] })
      queryClient.invalidateQueries({ queryKey: ["admin-product-stock"] })
      queryClient.invalidateQueries({ queryKey: ["admin-product-stock-totals"] })
    },
  })
}

// ---------- Expenses ----------
export function useExpenseCategories() {
  return useQuery({ queryKey: ["admin-expense-categories"], queryFn: fetchExpenseCategories })
}

export function useExpenses(filters: { categoryId?: string; fromDate?: string; toDate?: string }) {
  return useQuery({ queryKey: ["admin-expenses", filters], queryFn: () => fetchExpenses(filters) })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-expenses"] }),
  })
}

// ---------- Cash & Bank Accounts ----------
export function useCashBankAccounts() {
  return useQuery({ queryKey: ["admin-cash-bank-accounts"], queryFn: fetchCashBankAccounts })
}

export function useUpsertCashBankAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: upsertCashBankAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-cash-bank-accounts"] }),
  })
}

export function useDeleteCashBankAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCashBankAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-cash-bank-accounts"] }),
  })
}

// ---------- Reports & Finance Dashboard ----------
export function useStockValuation() {
  return useQuery({ queryKey: ["admin-stock-valuation"], queryFn: fetchStockValuation })
}

export function useLowStockAlert() {
  return useQuery({ queryKey: ["admin-low-stock-alert"], queryFn: fetchLowStockAlert })
}

export function useSupplierDuesView() {
  return useQuery({ queryKey: ["admin-supplier-dues-view"], queryFn: fetchSupplierDuesView })
}

export function useMonthlyExpenseSummary() {
  return useQuery({ queryKey: ["admin-monthly-expense-summary"], queryFn: fetchMonthlyExpenseSummary })
}

export function useLedgerSummary() {
  return useQuery({ queryKey: ["admin-ledger-summary"], queryFn: fetchLedgerSummary })
}

export function useProfitLossMonthly() {
  return useQuery({ queryKey: ["admin-profit-loss-monthly"], queryFn: fetchProfitLossMonthly })
}

export function useCustomerDueTotal() {
  return useQuery({ queryKey: ["admin-customer-due-total"], queryFn: fetchCustomerDueTotal })
}

export function useCustomerDueOrders() {
  return useQuery({ queryKey: ["admin-customer-due-orders"], queryFn: fetchCustomerDueOrders })
}

export function usePurchaseHistoryReport(filters: { fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: ["admin-purchase-history-report", filters],
    queryFn: () => fetchPurchaseHistoryReport(filters),
  })
}
