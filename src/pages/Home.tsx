import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton"
import { Reveal } from "@/components/ui/reveal"
import { SEO_KEYWORDS, SITE_DESCRIPTION } from "@/data/company"
import { useProducts, useProductsByPlacement } from "@/hooks/use-catalog"
import { useSeo } from "@/hooks/use-seo"
import { CategoryChips } from "@/pages/home/CategoryChips"
import { CategoryProductSections } from "@/pages/home/CategoryProductSections"
import { DealsGrid } from "@/pages/home/DealsGrid"
import { FeaturedTabs } from "@/pages/home/FeaturedTabs"
import { HeroSlider } from "@/pages/home/HeroSlider"
import { NewsletterStrip } from "@/pages/home/NewsletterStrip"
import { OurCategory } from "@/pages/home/OurCategory"
import { PackagesSection } from "@/pages/home/PackagesSection"
import { ProductGridSection } from "@/pages/home/ProductGridSection"
import { WhyChooseUs } from "@/pages/home/WhyChooseUs"

export default function Home() {
  useSeo({
    title: "Solar & Electrical Products in Bangladesh",
    description: SITE_DESCRIPTION,
    keywords: SEO_KEYWORDS,
  })

  // Admin-pinned best sellers win; with none pinned the top-rated list stands in
  // so the shelf is never empty.
  const pinnedBestSellers = useProductsByPlacement("is_best_seller", 8)
  const autoBestSellers = useProducts({ sort: "rating", pageSize: 8 })
  const bestSellerProducts = pinnedBestSellers.data?.length
    ? pinnedBestSellers.data
    : (autoBestSellers.data?.products ?? [])

  return (
    <main>
      <HeroSlider />
      <Reveal><DealsGrid /></Reveal>
      <Reveal><CategoryChips /></Reveal>
      {/* Solar panels, inverters, batteries, charge controllers, then the rest. */}
      <CategoryProductSections />
      <Reveal><PackagesSection /></Reveal>
      <Reveal>
        <ProductGridSection
          kicker="Loved by installers"
          kickerColor="#F49E09"
          title="Best of Rising Sun"
          linkLabel="See more"
          products={bestSellerProducts}
          isLoading={pinnedBestSellers.isLoading || autoBestSellers.isLoading}
        />
      </Reveal>
      <Reveal><OurCategory /></Reveal>
      <Reveal><FeaturedTabs /></Reveal>
      <Reveal><WhyChooseUs /></Reveal>
      <Reveal><NewsletterStrip /></Reveal>
      <FloatingWhatsAppButton />
    </main>
  )
}
