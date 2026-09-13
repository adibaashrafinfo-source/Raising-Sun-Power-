import { bestSellers, newArrivals } from "@/data/home-content"
import { useSeo } from "@/hooks/use-seo"
import { BrandsStrip } from "@/pages/home/BrandsStrip"
import { CategoryGrid } from "@/pages/home/CategoryGrid"
import { CtaBand } from "@/pages/home/CtaBand"
import { DealsBand } from "@/pages/home/DealsBand"
import { Hero } from "@/pages/home/Hero"
import { Newsletter } from "@/pages/home/Newsletter"
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

  return (
    <main>
      <Hero />
      <TrustChips />
      <CategoryGrid />
      <ProductGridSection
        kicker="Loved by installers"
        kickerColor="#67A70E"
        title="Best sellers this month"
        linkLabel="See more"
        products={bestSellers}
      />
      <DealsBand />
      <ShopBySolution />
      <ProductGridSection
        kicker="Just landed"
        kickerColor="#67A70E"
        title="New arrivals"
        linkLabel="Browse all"
        products={newArrivals}
      />
      <BrandsStrip />
      <WhyChooseUs />
      <Testimonials />
      <CtaBand />
      <Newsletter />
    </main>
  )
}
