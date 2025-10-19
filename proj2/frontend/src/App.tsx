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

  if (!isAuthenticated || !user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-center" />
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        {!isAuthenticated ? (
          <>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster position="top-center" />
          </>
        ) : (
          <>
            <Header />
            
            {user?.role === 'USER' ? (
              <>
                <Navigation />
                <main className="container mx-auto px-4 py-6">
                  <Routes>
                    {/* <Route path="/dashboard" element={<UserDashboard />} /> */}
                    <Route path="/restaurants" element={<RestaurantList />} />
                    {/* <Route path="/ai-recommendations" element={<AIFoodRecommendations />} /> */}
                    <Route path="/menu/:restaurantId" element={<MenuPage />} />
                    <Route path="/restaurant/:restaurantId/reviews" element={<RestaurantReviews />} />
                    {/* <Route path="/cart" element={<CartPage />} />
                    <Route path="/orders" element={<OrderHistory />} /> */}
                    <Route path="/orders/:orderId/track" element={<OrderTracking />} />
                    {/* <Route path="/settings/calories" element={<CalorieSettings />} />
                    <Route path="/emotional-insights" element={<EmotionalInsights />} /> */}
                    <Route path="/poster" element={<ApplicationPoster />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </>
            ) : user?.role === 'OWNER' ? (
              <main className="container mx-auto px-4 py-6">
                <Routes>
                  {/* <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} /> */}
                  <Route path="/restaurant/menu" element={<MenuManagement />} />
                  <Route path="/" element={<Navigate to="/restaurant/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/restaurant/dashboard" replace />} />
                  {/* <Route path="/restaurant/orders" element={<OrderManagement />} /> */}
                  {/* <Route path="/restaurant/staff" element={<StaffManagement />} /> */}
                  {/* <Route path="/restaurant/analytics" element={<Analytics />} /> */}
                  {/* <Route path="/restaurant/reviews" element={<ReviewInsights />} /> */}
                  <Route path="/poster" element={<ApplicationPoster />} />
                  
                </Routes>
              </main>
            ) : (
              // fallback (STAFF / ADMIN / unsupported)
              <main className="container mx-auto px-4 py-6">
                <h2>Unauthorized or unsupported role: {user?.role}</h2>
                <button
                  onClick={logout}
                  className="mt-4 text-blue-600 underline"
                >
                  Log out
                </button>
              </main>
            )}

            <Toaster position="top-center" />
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
