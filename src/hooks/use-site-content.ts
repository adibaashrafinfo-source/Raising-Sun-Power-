import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchSiteContent, updateSiteContent } from "@/lib/queries/site-content"
import { supabase } from "@/lib/supabase"

/**
 * Logos, badges and text edited in the admin CMS. Kept fresh so a saved change
 * reaches open pages quickly: it refetches when the tab regains focus and every
 * 30 seconds, and the live subscription below makes it near-instant.
 */
export function useSiteContent() {
  return useQuery({
    queryKey: ["site-content"],
    queryFn: fetchSiteContent,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

/** Mount once (the public layout does): re-reads the content the moment an admin saves. */
export function useSiteContentLive() {
  const queryClient = useQueryClient()
  useEffect(() => {
    const channel = supabase
      .channel("site-content-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_content" }, () => {
        queryClient.invalidateQueries({ queryKey: ["site-content"] })
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient])
}

export function useUpdateSiteContent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSiteContent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["site-content"] }),
  })
}
