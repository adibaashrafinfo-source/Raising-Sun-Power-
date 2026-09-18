import { useQuery } from "@tanstack/react-query"

import {
  type HomePlacement,
  fetchBrands,
  fetchCategories,
  fetchProductBySlug,
  fetchProducts,
  fetchProductsByPlacement,
  fetchRelatedProducts,
  fetchReviews,
} from "@/lib/queries/catalog"
import type { ProductFilters } from "@/types/database"

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: fetchCategories })
}

export function useBrands() {
  return useQuery({ queryKey: ["brands"], queryFn: fetchBrands })
}

export function useProducts(filters: ProductFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
  })
}

/** Products pinned to a homepage section from the admin product form. */
export function useProductsByPlacement(flag: HomePlacement, limit = 8) {
  return useQuery({
    queryKey: ["products-placement", flag, limit],
    queryFn: () => fetchProductsByPlacement(flag, limit),
  })
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  })
}

export function useRelatedProducts(categoryId: string | null | undefined, excludeId: string | undefined) {
  return useQuery({
    queryKey: ["related-products", categoryId, excludeId],
    queryFn: () => fetchRelatedProducts(categoryId ?? null, excludeId!),
    enabled: !!excludeId,
  })
}

export function useReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => fetchReviews(productId!),
    enabled: !!productId,
  })
}
