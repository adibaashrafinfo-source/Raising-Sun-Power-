import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  deleteQuotation,
  fetchQuotation,
  fetchQuotations,
  type QuotationDraft,
  type QuotationStatus,
  saveQuotation,
  setQuotationStatus,
} from "@/lib/queries/quotations"

export function useQuotations() {
  return useQuery({ queryKey: ["admin-quotations"], queryFn: fetchQuotations })
}

export function useQuotation(id: string | undefined) {
  return useQuery({ queryKey: ["admin-quotations", id], queryFn: () => fetchQuotation(id!), enabled: !!id })
}

export function useSaveQuotation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ draft, id }: { draft: QuotationDraft; id?: string }) => saveQuotation(draft, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-quotations"] }),
  })
}

export function useSetQuotationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, invoiceId }: { id: string; status: QuotationStatus; invoiceId?: string }) =>
      setQuotationStatus(id, status, invoiceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-quotations"] }),
  })
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteQuotation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-quotations"] }),
  })
}
