import { useMutation } from "@tanstack/react-query"

import { createContactMessage } from "@/lib/queries/contact"

export function useCreateContactMessage() {
  return useMutation({ mutationFn: createContactMessage })
}
