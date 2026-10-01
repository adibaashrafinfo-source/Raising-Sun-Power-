import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  type CalculatorApplianceInput,
  deleteCalculatorAppliance,
  fetchCalculatorAppliances,
  fetchCalculatorAppliancesAdmin,
  fetchCalculatorSettings,
  updateCalculatorSettings,
  upsertCalculatorAppliance,
} from "@/lib/queries/calculator"
import type { CalculatorSettings } from "@/types/database"

export function useCalculatorSettings() {
  return useQuery({
    queryKey: ["calculator-settings"],
    queryFn: fetchCalculatorSettings,
    staleTime: 5 * 60_000,
  })
}

export function useCalculatorAppliances() {
  return useQuery({
    queryKey: ["calculator-appliances"],
    queryFn: fetchCalculatorAppliances,
    staleTime: 5 * 60_000,
  })
}

export function useCalculatorAppliancesAdmin() {
  return useQuery({ queryKey: ["admin-calculator-appliances"], queryFn: fetchCalculatorAppliancesAdmin })
}

/** Every change refreshes both the public and the admin lists. */
function useCalculatorMutation<TArgs>(fn: (args: TArgs) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calculator-settings"] })
      queryClient.invalidateQueries({ queryKey: ["calculator-appliances"] })
      queryClient.invalidateQueries({ queryKey: ["admin-calculator-appliances"] })
    },
  })
}

export function useUpdateCalculatorSettings() {
  return useCalculatorMutation((patch: Partial<CalculatorSettings>) => updateCalculatorSettings(patch))
}

export function useUpsertCalculatorAppliance() {
  return useCalculatorMutation((appliance: CalculatorApplianceInput) =>
    upsertCalculatorAppliance(appliance),
  )
}

export function useDeleteCalculatorAppliance() {
  return useCalculatorMutation((id: string) => deleteCalculatorAppliance(id))
}
