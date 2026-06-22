import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "components/layout/Navbar";
import Footer from "components/layout/Footer";
import BottomNav from "components/layout/BottomNav";
import Chatbot from "components/features/chatbot";
import { AuthProvider, useAuthContext } from "hooks/AuthContext";
import HomePage from "pages/HomePage";
import NearbyRestaurants from "pages/NearbyRestaurants";
import FeaturesPage from "pages/FeaturesPage";
import PricingPage from "pages/PricingPage";
import DashboardPage from "pages/DashboardPage";
import LoginPage from "pages/LoginPage";
import SignupPage from "pages/SignupPage";
import PaymentSuccessPage from "pages/PaymentSuccessPage";
import PaymentCancelPage from "pages/PaymentCancelPage";
import RestaurantsPage from "pages/RestaurantsPage";
import RestaurantDetailPage from "pages/RestaurantDetailPage";
import CartPage from "pages/CartPage";
import OrdersPage from "pages/OrdersPage";
import ProfilePage from "pages/ProfilePage";
import AdminDashboard from "pages/AdminDashboard";
import AdminOrders from "pages/AdminOrders";
import AdminMenu from "pages/AdminMenu";
import AdminAnalytics from "pages/AdminAnalytics";
import { CartProvider } from "hooks/CartContext";
import { OrdersProvider } from "hooks/OrdersContext";
import "styles/global.css";

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated, user } = useAuthContext();
  const isAdmin = user?.role === 'admin';
  return (isAuthenticated && isAdmin) ? children : <Navigate to="/dashboard" replace />;
};

const AppShell = () => (
  <div style={{ display: "flex", minHeight: "100vh" }}>
    <Navbar />
    <div style={{ flex: 1, minWidth: 0, paddingLeft: "var(--sidebar-width, 220px)" }} className="main-content-area">
      <main style={{ paddingTop: 0 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/nearby" element={<NearbyRestaurants />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/billing/success" element={<PaymentSuccessPage />} />
          <Route path="/billing/cancel" element={<PaymentCancelPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <AdminRoute>
                <AdminMenu />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <AdminAnalytics />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
    <BottomNav />
    <Chatbot />
  </div>
);

const App = () => (
  <AuthProvider>
    <OrdersProvider>
      <CartProvider>
        <AppShell />
      </CartProvider>
    </OrdersProvider>
  </AuthProvider>
);

export default App;
