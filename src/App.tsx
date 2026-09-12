import { Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import Home from "@/pages/Home"
import ComingSoon from "@/pages/ComingSoon"
import ProductListPage from "@/pages/ProductListPage"
import ProductDetailPage from "@/pages/ProductDetailPage"

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="category/:slug" element={<ProductListPage />} />
        <Route path="product/:slug" element={<ProductDetailPage />} />
        <Route path="cart" element={<ComingSoon title="Shopping Cart" />} />
        <Route path="checkout" element={<ComingSoon title="Checkout" />} />
        <Route path="solar-calculator" element={<ComingSoon title="Solar Calculator" />} />
        <Route path="get-quotation" element={<ComingSoon title="Get Quotation" />} />
        <Route path="account" element={<ComingSoon title="My Account" />} />
        <Route path="login" element={<ComingSoon title="Login" />} />
        <Route path="register" element={<ComingSoon title="Register" />} />
        <Route path="*" element={<ComingSoon title="Page not found" />} />
      </Route>
    </Routes>
  )
}
