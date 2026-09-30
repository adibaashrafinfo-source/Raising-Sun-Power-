import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  type PackageItemInput,
  deletePackage,
  deletePackageCategory,
  fetchAllPackagesAdmin,
  fetchPackageBySlug,
  fetchPackageCategories,
  fetchPackageItemsAdmin,
  fetchPackages,
  upsertPackage,
  upsertPackageCategory,
} from "@/lib/queries/packages"
import type { PackageCategory, SolarPackage } from "@/types/database"

export function usePackageCategories() {
  return useQuery({ queryKey: ["package-categories"], queryFn: fetchPackageCategories })
}

export function usePackages(filters?: { categorySlug?: string; featuredOnly?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ["packages", filters ?? {}],
    queryFn: () => fetchPackages(filters),
    placeholderData: (prev) => prev,
  })
}

export function usePackage(slug: string | undefined) {
  return useQuery({
    queryKey: ["package", slug],
    queryFn: () => fetchPackageBySlug(slug!),
    enabled: !!slug,
  })
}

export function useAllPackagesAdmin() {
  return useQuery({ queryKey: ["admin-packages"], queryFn: fetchAllPackagesAdmin })
}

export function usePackageItemsAdmin(packageId: string | undefined) {
  return useQuery({
    queryKey: ["admin-package-items", packageId],
    queryFn: () => fetchPackageItemsAdmin(packageId!),
    enabled: !!packageId,
  })
}

/** Every package mutation invalidates the same set, so no list goes stale. */
function usePackageMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] })
      queryClient.invalidateQueries({ queryKey: ["package"] })
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] })
      queryClient.invalidateQueries({ queryKey: ["admin-package-items"] })
      queryClient.invalidateQueries({ queryKey: ["package-categories"] })
    },
  })
}

export function useUpsertPackage() {
  return usePackageMutation(
    ({ pkg, items }: { pkg: Partial<SolarPackage> & { name: string; slug: string }; items: PackageItemInput[] }) =>
      upsertPackage(pkg, items),
  )
}

export function useDeletePackage() {
  return usePackageMutation((id: string) => deletePackage(id))
}

export function useUpsertPackageCategory() {
  return usePackageMutation((category: Partial<PackageCategory> & { name: string; slug: string }) =>
    upsertPackageCategory(category),
  )
}

export function useDeletePackageCategory() {
  return usePackageMutation((id: string) => deletePackageCategory(id))
}
