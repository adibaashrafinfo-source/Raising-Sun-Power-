import { Outlet } from "react-router-dom"

import { CartDrawer } from "@/components/layout/CartDrawer"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { MobileMenu } from "@/components/layout/MobileMenu"

export function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <Outlet />
      <Footer />
      <div className="h-[70px] lg:hidden" />
      <MobileBottomNav />
      <CartDrawer />
      <MobileMenu />
    </div>
  )
}
