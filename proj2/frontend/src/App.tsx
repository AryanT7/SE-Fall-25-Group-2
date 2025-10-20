import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth';


// Components
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

import UserDashboard from './components/user/UserDashboard';
import RestaurantList from './components/user/RestaurantList';
import MenuPage from './components/user/MenuPage';
import CartPage from './components/user/CartPage';
import OrderHistory from './components/user/OrderHistory';
import OrderTracking from './components/user/OrderTracking';
import CalorieSettings from './components/user/CalorieSettings';
import AIFoodRecommendations from './components/user/AIFoodRecommendations';
import EmotionalInsights from './components/user/EmotionalInsights';
import RestaurantReviews from './components/user/RestaurantReviews';
import RestaurantDashboard from './components/restaurant/RestaurantDashboard';
import ReviewInsights from './components/restaurant/ReviewInsights';
import MenuManagement from './components/restaurant/MenuManagement';
import OrderManagement from './components/restaurant/OrderManagement';
import StaffManagement from './components/restaurant/StaffManagement';
import Analytics from './components/restaurant/Analytics';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import ApplicationPoster from './components/poster/ApplicationPoster';


function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        {/* Pass user explicitly to Header */}
        {isAuthenticated && user && <Header user={user} logout={logout} />}
        <Toaster position="top-center" />

        {isAuthenticated && user?.role === 'USER' && <Navigation user={user} />}

        <main className="container mx-auto px-4 py-6">
        <Routes>
          {/* ---------------- PUBLIC ROUTES ---------------- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ---------------- USER ROUTES ---------------- */}
          {isAuthenticated && user?.role === 'USER' && (
            <>
              {/* <Route path="/dashboard" element=<UserDashboard /> /> */}
              <Route path="/restaurants" element={<RestaurantList />} />
              <Route path="/menu/:restaurantId" element={<MenuPage />} />
              <Route path="/restaurant/:restaurantId/reviews" element={<RestaurantReviews />} />
              <Route path="/orders/:orderId/track" element={<OrderTracking />} />
              <Route path="/poster" element={<ApplicationPoster />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}

          {/* ---------------- OWNER/STAFF ROUTES ---------------- */}
          {isAuthenticated && ['OWNER', 'STAFF'].includes(user?.role || '') && (
            <>
              <Route path="/restaurant/dashboard" element={<div>{/* <RestaurantDashboard /> */}</div>} />
              <Route path="/restaurant/menu" element={<MenuManagement />} />
              <Route path="/poster" element={<ApplicationPoster />} />
              <Route path="/" element={<Navigate to="/restaurant/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/restaurant/dashboard" replace />} />
            </>
          )}

          {/* ---------------- ADMIN ROUTES ---------------- */}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <>
              <Route path="/admin/dashboard" element={<div>{/* <AdminDashboard /> */}</div>} />
              <Route path="/poster" element={<ApplicationPoster />} />
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </>
          )}

          {/* ---------------- UNAUTHORIZED / FALLBACK ---------------- */}
          {!isAuthenticated && <Route path="*" element={<Navigate to="/login" replace />} />}

          {/* Unsupported role */}
          {isAuthenticated && !['USER', 'OWNER', 'STAFF', 'ADMIN'].includes(user?.role || '') && (
            <Route
              path="*"
              element={
                <main className="container mx-auto px-4 py-6">
                  <h2>Unauthorized or unsupported role: {user?.role}</h2>
                  <button onClick={logout} className="mt-4 text-blue-600 underline">
                    Log out
                  </button>
                </main>
              }
            />
          )}
        </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;