import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchSiteContent, updateSiteContent } from "@/lib/queries/site-content"

export function useSiteContent() {
  return useQuery({ queryKey: ["site-content"], queryFn: fetchSiteContent, staleTime: 5 * 60_000 })
}

export function useUpdateSiteContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSiteContent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["site-content"] }),
  })
}
