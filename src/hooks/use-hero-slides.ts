import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  type HeroSlideInput,
  deleteHeroSlide,
  fetchHeroSlides,
  fetchHeroSlidesAdmin,
  upsertHeroSlide,
} from "@/lib/queries/hero-slides"

export function useHeroSlides() {
  return useQuery({ queryKey: ["hero-slides"], queryFn: fetchHeroSlides, staleTime: 5 * 60_000 })
}

export function useHeroSlidesAdmin() {
  return useQuery({ queryKey: ["admin-hero-slides"], queryFn: fetchHeroSlidesAdmin })
}

/** Both lists are refreshed after any change so the homepage never lags behind. */
function useHeroSlideMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-slides"] })
      queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] })
    },
  })
}

export function useUpsertHeroSlide() {
  return useHeroSlideMutation((slide: HeroSlideInput) => upsertHeroSlide(slide))
}

export function useDeleteHeroSlide() {
  return useHeroSlideMutation((id: string) => deleteHeroSlide(id))
}
