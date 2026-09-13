import { useMutation } from "@tanstack/react-query"

import { createLead } from "@/lib/queries/leads"

export function useCreateLead() {
  return useMutation({ mutationFn: createLead })
}
