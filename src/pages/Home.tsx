import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton"
import { Reveal } from "@/components/ui/reveal"
import { useProducts } from "@/hooks/use-catalog"
import { useSeo } from "@/hooks/use-seo"
import { BrandsStrip } from "@/pages/home/BrandsStrip"
import { CategoryGrid } from "@/pages/home/CategoryGrid"
import { CtaBand } from "@/pages/home/CtaBand"
import { DealsBand } from "@/pages/home/DealsBand"
import { Hero } from "@/pages/home/Hero"
import { ProductGridSection } from "@/pages/home/ProductGridSection"
import { ShopBySolution } from "@/pages/home/ShopBySolution"
import { Testimonials } from "@/pages/home/Testimonials"
import { TrustChips } from "@/pages/home/TrustChips"
import { WhyChooseUs } from "@/pages/home/WhyChooseUs"

export default function Home() {
  useSeo({
    title: "Solar & Electrical Products in Bangladesh",
    description:
      "Genuine solar panels, inverters, batteries, MCB & MCCB and complete power solutions — delivered nationwide with COD, bKash & Nagad.",
  })

  const bestSellers = useProducts({ sort: "rating", pageSize: 4 })
  const newArrivals = useProducts({ sort: "newest", pageSize: 4 })

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
          products={bestSellers.data?.products ?? []}
          isLoading={bestSellers.isLoading}
        />
      </Reveal>
      <Reveal><DealsBand /></Reveal>
      <Reveal><ShopBySolution /></Reveal>
      <Reveal>
        <ProductGridSection
          kicker="Just landed"
          kickerColor="#67A70E"
          title="New arrivals"
          linkLabel="Browse all"
          products={newArrivals.data?.products ?? []}
          isLoading={newArrivals.isLoading}
        />
      </Reveal>
      <Reveal><BrandsStrip /></Reveal>
      <Reveal><WhyChooseUs /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><CtaBand /></Reveal>
      <FloatingWhatsAppButton />
    </main>
  )
}
