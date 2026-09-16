import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton"
import { Reveal } from "@/components/ui/reveal"
import { SEO_KEYWORDS, SITE_DESCRIPTION } from "@/data/company"
import { useProducts, useProductsByPlacement } from "@/hooks/use-catalog"
import { useSeo } from "@/hooks/use-seo"
import { AllProductsSection } from "@/pages/home/AllProductsSection"
import { BrandsStrip } from "@/pages/home/BrandsStrip"
import { CategoryGrid } from "@/pages/home/CategoryGrid"
import { CtaBand } from "@/pages/home/CtaBand"
import { FeaturedProducts } from "@/pages/home/FeaturedProducts"
import { Hero } from "@/pages/home/Hero"
import { ProductGridSection } from "@/pages/home/ProductGridSection"
import { TrustChips } from "@/pages/home/TrustChips"
import { WhyChooseUs } from "@/pages/home/WhyChooseUs"

export default function Home() {
  useSeo({
    title: "Solar & Electrical Products in Bangladesh",
    description: SITE_DESCRIPTION,
    keywords: SEO_KEYWORDS,
  })

  // Admin-pinned products win; when a section has none pinned we fall back to
  // the automatic list so the homepage is never empty.
  const pinnedBestSellers = useProductsByPlacement("is_best_seller", 4)
  const pinnedNewArrivals = useProductsByPlacement("is_new_arrival", 4)
  const autoBestSellers = useProducts({ sort: "rating", pageSize: 4 })
  const autoNewArrivals = useProducts({ sort: "newest", pageSize: 4 })

  const bestSellerProducts = pinnedBestSellers.data?.length
    ? pinnedBestSellers.data
    : (autoBestSellers.data?.products ?? [])
  const newArrivalProducts = pinnedNewArrivals.data?.length
    ? pinnedNewArrivals.data
    : (autoNewArrivals.data?.products ?? [])

  return (
    <main>
      <Hero />
      <Reveal><TrustChips /></Reveal>
      <Reveal><CategoryGrid /></Reveal>
      <Reveal>
        <ProductGridSection
          kicker="Loved by installers"
          kickerColor="#67A70E"
          title="Best sellers this month"
          linkLabel="See more"
          products={bestSellerProducts}
          isLoading={pinnedBestSellers.isLoading || autoBestSellers.isLoading}
        />
      </Reveal>
      <Reveal><FeaturedProducts /></Reveal>
      <Reveal>
        <ProductGridSection
          kicker="Just landed"
          kickerColor="#67A70E"
          title="New arrivals"
          linkLabel="Browse all"
          products={newArrivalProducts}
          isLoading={pinnedNewArrivals.isLoading || autoNewArrivals.isLoading}
        />
      </Reveal>
      <Reveal><AllProductsSection /></Reveal>
      <Reveal><BrandsStrip /></Reveal>
      <Reveal><WhyChooseUs /></Reveal>
      <Reveal><CtaBand /></Reveal>
      <FloatingWhatsAppButton />
    </main>
  )
}
