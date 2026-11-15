import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchSiteContent, updateSiteContent } from "@/lib/queries/site-content"
import type { SiteContent } from "@/types/database"
import { supabase } from "@/lib/supabase"

/**
 * Logos, badges and text edited in the admin CMS. Kept fresh so a saved change
 * reaches open pages quickly: it refetches when the tab regains focus and every
 * 30 seconds, and the live subscription below makes it near-instant.
 */
const CACHE_KEY = "rsp_site_content_v1"

function readCache(): SiteContent | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as SiteContent) : undefined
  } catch {
    return undefined
  }
}

async function fetchAndRemember(): Promise<SiteContent> {
  const content = await fetchSiteContent()
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(content))
  } catch {
    // Private mode or full storage: the cache is only a head start.
  }
  return content
}

/**
 * The logo (and the rest of the CMS) comes from the database, so on a first
 * paint there is a moment before it arrives. The last copy this browser saw is
 * shown straight away, so a returning visitor sees the current logo at once
 * rather than a default that is then swapped. Callers should hold the logo back
 * (render nothing) while `data` is still undefined instead of showing a default.
 */
export function useSiteContent() {
  return useQuery({
    queryKey: ["site-content"],
    queryFn: fetchAndRemember,
    placeholderData: readCache,
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
