import { COMPANY } from "@/data/company"
import type { SiteContent } from "@/types/database"

export type Office = { name: string; address: string }

/**
 * The offices shown in the footer and on the About and Contact pages. Every
 * entry is CMS-editable, with the values in company.ts as the fallback, and an
 * office is dropped from the list when its name and address are both cleared.
 */
export function officesFrom(cms?: SiteContent | null): Office[] {
  return [
    {
      name: cms?.showroom_1_name || COMPANY.headOffice.label,
      address: cms?.showroom_1_address || COMPANY.headOffice.address,
    },
    {
      name: cms?.showroom_2_name || COMPANY.localOffice1.label,
      address: cms?.showroom_2_address || COMPANY.localOffice1.address,
    },
    {
      name: cms?.showroom_3_name || COMPANY.localOffice2.label,
      address: cms?.showroom_3_address || COMPANY.localOffice2.address,
    },
  ].filter((office) => office.name && office.address)
}
