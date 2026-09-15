import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"

import { RequireAdminOnly, RequireAuth, RequireInventoryStaff } from "@/components/auth/RequireAuth"
import { AccountLayout } from "@/components/layout/AccountLayout"
import { AppLayout } from "@/components/layout/AppLayout"
import Home from "@/pages/Home"
import AboutPage from "@/pages/AboutPage"
import ContactPage from "@/pages/ContactPage"
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

const SolarROICalculatorPage = lazy(() => import("@/pages/SolarROICalculatorPage"))
const SolarAssessmentPage = lazy(() => import("@/pages/SolarAssessmentPage"))
const WholesalePage = lazy(() => import("@/pages/WholesalePage"))
const BlogPage = lazy(() => import("@/pages/BlogPage"))
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"))

const AdminLayout = lazy(() =>
  import("@/components/layout/AdminLayout").then((m) => ({ default: m.AdminLayout })),
)
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"))
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"))
const AdminProductsPage = lazy(() => import("@/pages/admin/AdminProductsPage"))
const AdminStockPage = lazy(() => import("@/pages/admin/AdminStockPage"))
const AdminSuppliersPage = lazy(() => import("@/pages/admin/AdminSuppliersPage"))
const AdminPurchasesPage = lazy(() => import("@/pages/admin/AdminPurchasesPage"))
const AdminPurchaseReturnsPage = lazy(() => import("@/pages/admin/AdminPurchaseReturnsPage"))
const AdminSalesReturnsPage = lazy(() => import("@/pages/admin/AdminSalesReturnsPage"))
const AdminExpensesPage = lazy(() => import("@/pages/admin/AdminExpensesPage"))
const AdminAccountsPage = lazy(() => import("@/pages/admin/AdminAccountsPage"))
const AdminFinanceDashboardPage = lazy(() => import("@/pages/admin/AdminFinanceDashboardPage"))
const AdminInventoryReportsPage = lazy(() => import("@/pages/admin/AdminInventoryReportsPage"))
const AdminCategoriesPage = lazy(() => import("@/pages/admin/AdminCategoriesPage"))
const AdminBrandsPage = lazy(() => import("@/pages/admin/AdminBrandsPage"))
const AdminCustomersPage = lazy(() => import("@/pages/admin/AdminCustomersPage"))
const AdminCouponsPage = lazy(() => import("@/pages/admin/AdminCouponsPage"))
const AdminLeadsPage = lazy(() => import("@/pages/admin/AdminLeadsPage"))
const AdminContactMessagesPage = lazy(() => import("@/pages/admin/AdminContactMessagesPage"))
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage"))
const AdminCmsPage = lazy(() => import("@/pages/admin/AdminCmsPage"))
const AdminRoiSettingsPage = lazy(() => import("@/pages/admin/AdminRoiSettingsPage"))
const AdminStaffPage = lazy(() => import("@/pages/admin/AdminStaffPage"))

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
        <Route
          path="solar-roi-calculator"
          element={
            <Suspense fallback={<PageFallback />}>
              <SolarROICalculatorPage />
            </Suspense>
          }
        />
        <Route path="get-quotation" element={<GetQuotationPage />} />
        <Route path="quotation-received/:refId" element={<QuotationReceivedPage />} />
        <Route
          path="solar-assessment"
          element={
            <Suspense fallback={<PageFallback />}>
              <SolarAssessmentPage />
            </Suspense>
          }
        />
        <Route
          path="wholesale"
          element={
            <Suspense fallback={<PageFallback />}>
              <WholesalePage />
            </Suspense>
          }
        />
        <Route
          path="blog"
          element={
            <Suspense fallback={<PageFallback />}>
              <BlogPage />
            </Suspense>
          }
        />
        <Route
          path="blog/:slug"
          element={
            <Suspense fallback={<PageFallback />}>
              <BlogPostPage />
            </Suspense>
          }
        />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
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

      <Route element={<RequireInventoryStaff />}>
        <Route
          path="admin"
          element={
            <Suspense fallback={<PageFallback />}>
              <AdminLayout />
            </Suspense>
          }
        >
          <Route element={<RequireAdminOnly />}>
            <Route
              index
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminDashboardPage />
                </Suspense>
              }
            />
            <Route
              path="orders"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminOrdersPage />
                </Suspense>
              }
            />
            <Route
              path="products"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminProductsPage />
                </Suspense>
              }
            />
            <Route
              path="categories"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminCategoriesPage />
                </Suspense>
              }
            />
            <Route
              path="brands"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminBrandsPage />
                </Suspense>
              }
            />
            <Route
              path="customers"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminCustomersPage />
                </Suspense>
              }
            />
            <Route
              path="coupons"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminCouponsPage />
                </Suspense>
              }
            />
            <Route
              path="leads"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminLeadsPage />
                </Suspense>
              }
            />
            <Route
              path="messages"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminContactMessagesPage />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminSettingsPage />
                </Suspense>
              }
            />
            <Route
              path="roi-calculator"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminRoiSettingsPage />
                </Suspense>
              }
            />
            <Route
              path="cms"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminCmsPage />
                </Suspense>
              }
            />
            <Route
              path="staff"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AdminStaffPage />
                </Suspense>
              }
            />
          </Route>

          <Route
            path="inventory/stock"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminStockPage />
              </Suspense>
            }
          />
          <Route
            path="inventory/suppliers"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminSuppliersPage />
              </Suspense>
            }
          />
          <Route
            path="inventory/purchases"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminPurchasesPage />
              </Suspense>
            }
          />
          <Route
            path="inventory/purchase-returns"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminPurchaseReturnsPage />
              </Suspense>
            }
          />
          <Route
            path="inventory/sales-returns"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminSalesReturnsPage />
              </Suspense>
            }
          />
          <Route
            path="finance/expenses"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminExpensesPage />
              </Suspense>
            }
          />
          <Route
            path="finance/accounts"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminAccountsPage />
              </Suspense>
            }
          />
          <Route
            path="finance/dashboard"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminFinanceDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="inventory/reports"
            element={
              <Suspense fallback={<PageFallback />}>
                <AdminInventoryReportsPage />
              </Suspense>
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}

function PageFallback() {
  return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Loading…</div>
}
