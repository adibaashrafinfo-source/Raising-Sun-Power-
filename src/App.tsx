import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"

import { RequireAdmin, RequireAuth } from "@/components/auth/RequireAuth"
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

const AdminLayout = lazy(() =>
  import("@/components/layout/AdminLayout").then((m) => ({ default: m.AdminLayout })),
)
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"))
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"))
const AdminProductsPage = lazy(() => import("@/pages/admin/AdminProductsPage"))
const AdminCategoriesPage = lazy(() => import("@/pages/admin/AdminCategoriesPage"))
const AdminBrandsPage = lazy(() => import("@/pages/admin/AdminBrandsPage"))
const AdminCustomersPage = lazy(() => import("@/pages/admin/AdminCustomersPage"))
const AdminCouponsPage = lazy(() => import("@/pages/admin/AdminCouponsPage"))
const AdminLeadsPage = lazy(() => import("@/pages/admin/AdminLeadsPage"))
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage"))

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

      <Route element={<RequireAdmin />}>
        <Route
          path="admin"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="orders"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminOrdersPage />
              </Suspense>
            }
          />
          <Route
            path="products"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminProductsPage />
              </Suspense>
            }
          />
          <Route
            path="categories"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminCategoriesPage />
              </Suspense>
            }
          />
          <Route
            path="brands"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminBrandsPage />
              </Suspense>
            }
          />
          <Route
            path="customers"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminCustomersPage />
              </Suspense>
            }
          />
          <Route
            path="coupons"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminCouponsPage />
              </Suspense>
            }
          />
          <Route
            path="leads"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminLeadsPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminSettingsPage />
              </Suspense>
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}

function AdminFallback() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Loading…</div>
}
