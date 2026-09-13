import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchRoiSettings, updateRoiSettings } from "@/lib/queries/roi-calculator"

export function useRoiSettings() {
  return useQuery({ queryKey: ["roi-settings"], queryFn: fetchRoiSettings, staleTime: 5 * 60_000 })
}

export function useUpdateRoiSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRoiSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roi-settings"] }),
  })
}
