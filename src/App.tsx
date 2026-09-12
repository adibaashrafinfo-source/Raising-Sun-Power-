import { Route, Routes } from "react-router-dom"

import { RequireAuth } from "@/components/auth/RequireAuth"
import { AccountLayout } from "@/components/layout/AccountLayout"
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
import LoginPage from "@/pages/LoginPage"
import RegisterPage from "@/pages/RegisterPage"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import AccountDashboardPage from "@/pages/account/AccountDashboardPage"
import AccountOrdersPage from "@/pages/account/AccountOrdersPage"
import AccountOrderDetailPage from "@/pages/account/AccountOrderDetailPage"
import AccountWishlistPage from "@/pages/account/AccountWishlistPage"
import AccountAddressesPage from "@/pages/account/AccountAddressesPage"
import AccountProfilePage from "@/pages/account/AccountProfilePage"

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
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<RequireAuth />}>
          <Route path="account" element={<AccountLayout />}>
            <Route index element={<AccountDashboardPage />} />
            <Route path="orders" element={<AccountOrdersPage />} />
            <Route path="orders/:orderId" element={<AccountOrderDetailPage />} />
            <Route path="wishlist" element={<AccountWishlistPage />} />
            <Route path="addresses" element={<AccountAddressesPage />} />
            <Route path="profile" element={<AccountProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<ComingSoon title="Page not found" />} />
      </Route>
    </Routes>
  )
}
