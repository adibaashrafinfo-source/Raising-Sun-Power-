import { Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import Home from "@/pages/Home"
import ComingSoon from "@/pages/ComingSoon"
import ProductListPage from "@/pages/ProductListPage"
import ProductDetailPage from "@/pages/ProductDetailPage"
import CartPage from "@/pages/CartPage"
import CheckoutPage from "@/pages/CheckoutPage"
import OrderConfirmationPage from "@/pages/OrderConfirmationPage"
import SolarCalculatorPage from "@/pages/SolarCalculatorPage"
import GetQuotationPage from "@/pages/GetQuotationPage"
import QuotationReceivedPage from "@/pages/QuotationReceivedPage"

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="category/:slug" element={<ProductListPage />} />
        <Route path="product/:slug" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
        <Route path="solar-calculator" element={<SolarCalculatorPage />} />
        <Route path="get-quotation" element={<GetQuotationPage />} />
        <Route path="quotation-received/:refId" element={<QuotationReceivedPage />} />
        <Route path="account" element={<ComingSoon title="My Account" />} />
        <Route path="login" element={<ComingSoon title="Login" />} />
        <Route path="register" element={<ComingSoon title="Register" />} />
        <Route path="*" element={<ComingSoon title="Page not found" />} />
      </Route>
    </Routes>
  )
}
