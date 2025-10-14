import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

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

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  type: 'customer' | 'restaurant_owner' | 'staff';
  restaurantId?: string;
  height?: number;
  weight?: number;
  calorieGoal?: number;
  goalType?: 'daily' | 'weekly' | 'monthly';
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  minimumOrder: number;
  image: string;
  ownerId: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  ingredients: string[];
  category: string;
  isVegetarian: boolean;
  isNonVeg: boolean;
  servings: number;
  image: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  assignedTo?: string; // User ID or email
}

export type EmotionalState = 'happiness' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust';

export interface EmotionalData {
  emotion: EmotionalState;
  intensity: number; // 1-5 scale
  timeOfDay: string; // HH:MM format
  hour: number; // 0-23
  dayOfWeek: string;
  timestamp: Date;
}

export interface OrderRegretData {
  regretted: boolean;
  feedbackTimestamp: Date;
}

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  restaurantId: string;
  rating: number; // 1-5
  comment: string;
  foodQuality: number; // 1-5
  serviceQuality: number; // 1-5
  valueForMoney: number; // 1-5
  categories: string[]; // e.g., ["Taste", "Portion Size", "Packaging"]
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: CartItem[];
  totalAmount: number;
  totalCalories: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
  pickupTime?: Date;
  paymentMethod: string;
  emotionalData?: EmotionalData;
  regretData?: OrderRegretData;
  reviewId?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-center" />
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header user={user} onLogout={handleLogout} />
        
        {user.type === 'customer' ? (
          <>
            <Navigation user={user} />
            <main className="container mx-auto px-4 py-6">
              <Routes>
                <Route path="/dashboard" element={<UserDashboard user={user} />} />
                <Route path="/restaurants" element={<RestaurantList />} />
                <Route path="/ai-recommendations" element={<AIFoodRecommendations user={user} />} />
                <Route path="/menu/:restaurantId" element={<MenuPage />} />
                <Route path="/restaurant/:restaurantId/reviews" element={<RestaurantReviews />} />
                <Route path="/cart" element={<CartPage user={user} />} />
                <Route path="/orders" element={<OrderHistory user={user} />} />
                <Route path="/orders/:orderId/track" element={<OrderTracking user={user} />} />
                <Route path="/settings/calories" element={<CalorieSettings user={user} />} />
                <Route path="/emotional-insights" element={<EmotionalInsights user={user} />} />
                <Route path="/poster" element={<ApplicationPoster />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          <main className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/restaurant/dashboard" element={<RestaurantDashboard user={user} />} />
              <Route path="/restaurant/menu" element={<MenuManagement user={user} />} />
              <Route path="/restaurant/orders" element={<OrderManagement user={user} />} />
              <Route path="/restaurant/staff" element={<StaffManagement user={user} />} />
              <Route path="/restaurant/analytics" element={<Analytics user={user} />} />
              <Route path="/restaurant/reviews" element={<ReviewInsights user={user} />} />
              <Route path="/poster" element={<ApplicationPoster />} />
              <Route path="/" element={<Navigate to="/restaurant/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/restaurant/dashboard" replace />} />
            </Routes>
          </main>
        )}
        
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

export default App;