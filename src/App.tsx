import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { CartProvider } from "./contexts/CartContext";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/HomePage";
import { ProductsPage } from "./components/ProductsPage";
import { CartPage } from "./components/CartPage";
import { CheckoutPage } from "./components/CheckoutPage";
import { OrdersPage } from "./components/OrdersPage";
import { ProfilePage } from "./components/ProfilePage";
import { SignInPage } from "./components/SignInPage";
import SignUpVerifyPage from "./components/SignUpVerifyPage";
import ForgotPasswordEmailPage from "./components/ForgotPasswordEmailPage";
import ForgotVerifyPage from "./components/ForgotVerifyPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import ProductDetailPage from "./components/ProductDetailPage";
import { AboutPage } from "./components/AboutPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import { NorthPage } from "./components/NorthPage";
import { MiddlePage } from "./components/MiddlePage";
import { SouthPage } from "./components/SouthPage";
import { AllProductsPage } from "./components/AllProductsPage";
import { VungCaoPage } from "./components/VungCaoPage";
import { ManageOrdersPage } from "./components/ManageOrdersPage";

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgot" element={<ForgotPasswordEmailPage />} />
        <Route path="/forgot/verify" element={<ForgotVerifyPage />} />
        <Route path="/forgot/reset" element={<ResetPasswordPage />} />
        <Route path="/signup/verify" element={<SignUpVerifyPage />} />
        <Route element={<Layout />}>
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products/all" element={<AllProductsPage />} />
          <Route path="/north" element={<NorthPage />} />
          <Route path="/central" element={<MiddlePage />} />
          <Route path="/south" element={<SouthPage />} />
          <Route path="/highlands" element={<VungCaoPage />} />
          <Route
            path="/products/north"
            element={<ProductsPage filterRegion="Miền Bắc" />}
          />
          <Route
            path="/products/central"
            element={<ProductsPage filterRegion="Miền Trung" />}
          />
          <Route
            path="/products/south"
            element={<ProductsPage filterRegion="Miền Nam" />}
          />
          <Route
            path="/products/special"
            element={<ProductsPage filterRegion="Đặc Sản" />}
          />
          {/* Cart page with real-time API sync and manual input */}
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/manageorders" element={<ManageOrdersPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <CartProvider>
          <div className="min-h-screen bg-white">
            <AppRoutes />
          </div>
        </CartProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
// end of App
