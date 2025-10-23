import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { CalendarDays, Target, TrendingUp, Utensils } from 'lucide-react';

import { User, CartSummary } from '../../api/types';
import FoodSuggestions from './FoodSuggestions';
import { cartApi } from '../../api/cart';

interface UserDashboardProps {
  user: User;
}

interface CalorieData {
  date: string;
  consumed: number;
  goal: number;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const [calorieData, setCalorieData] = useState<CalorieData[]>([]);
  const [todayCalories, setTodayCalories] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [sampleMenuItems, setSampleMenuItems] = useState<any[]>([]); // keep empty until you have a menu items API
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Normalize goal & body stats based on your types
  const goal = useMemo(
    () => Number(user?.daily_calorie_goal ?? 2200),
    [user?.daily_calorie_goal]
  );
  const heightCm = user?.height_cm;
  const weightKg = user?.weight_kg;

  // --- Fetch live cart summary for today's calories / price ---
  useEffect(() => {
    let mounted = true;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await cartApi.getSummary(); // -> { data?: CartSummary }
        if (res.error) throw new Error(res.error);

        const summary = res.data as CartSummary | undefined;
        const caloriesToday = Number(summary?.total_calories ?? 0);

        if (!mounted) return;

        setTodayCalories(caloriesToday);

        // Seed a 7-day chart: today = live value, previous 6 days = 0 (until you add a history endpoint)
        const today = new Date();
        const sevenDays: CalorieData[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          sevenDays.push({
            date: d.toISOString().split('T')[0],
            consumed: i === 0 ? caloriesToday : 0,
            goal,
          });
        }
        setCalorieData(sevenDays);

        // Recent orders placeholder (backend provided doesn't expose orders yet)
        setRecentOrders([]); // When you add /orders endpoint, populate here.
        setSampleMenuItems([]); // When you add a menu items endpoint, populate and show FoodSuggestions.
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSummary();
    return () => {
      mounted = false;
    };
  }, [goal]);

  const getCalorieProgress = () => {
    if (!goal) return 0;
    return Math.min((todayCalories / goal) * 100, 100);
  };

  const getCalorieStatus = () => {
    if (!goal) return 'Set your calorie goal';
    const remaining = goal - todayCalories;
    return remaining > 0
      ? `${remaining} calories remaining`
      : `${Math.abs(remaining)} calories over goal`;
  };

  const getRecommendedCalories = () => {
    // Simple BMR (Harris-Benedict, male) with a moderate activity factor
    if (!heightCm || !weightKg) return 2200;
    const bmr = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * 30; // assume age=30
    return Math.round(bmr * 1.5);
  };

  const averageWeeklyCalories =
    calorieData.length > 0
      ? Math.round(calorieData.reduce((sum, day) => sum + day.consumed, 0) / calorieData.length)
      : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}!` : '!'}</h1>
          <p className="text-muted-foreground">Loading your dashboard…</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Calorie Overview</CardTitle>
            <CardDescription>Fetching your live data</CardDescription>
          </CardHeader>
          <CardContent>…</CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">We couldn’t load your data.</p>
        </div>
        <Card>
          <CardContent className="text-red-600 py-6">{error}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {user.name?.split(' ')[0] || 'there'}!</h1>
        <p className="text-muted-foreground">Track your calories and manage your food orders</p>
      </div>

      {/* Calorie Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calories (from Cart)</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCalories}</div>
            <p className="text-xs text-muted-foreground">{getCalorieStatus()}</p>
            <Progress value={getCalorieProgress()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageWeeklyCalories}</div>
            <p className="text-xs text-muted-foreground">calories per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goal || 'Not set'}</div>
            <p className="text-xs text-muted-foreground capitalize">daily target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommended</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getRecommendedCalories()}</div>
            <p className="text-xs text-muted-foreground">based on your profile</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Food Suggestions (kept hidden until you have real menu items) */}
      {goal && sampleMenuItems.length > 0 && (
        <FoodSuggestions
          user={user as any}
          menuItems={sampleMenuItems}
          currentCaloriesToday={todayCalories}
        />
      )}

      {/* Recent Orders (placeholder until you expose orders endpoint) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest food orders</CardDescription>
          </div>
          <Link to="/orders">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent orders</p>
              <Link to="/restaurants">
                <Button className="mt-4">Start Ordering</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{order.restaurantName}</h4>
                      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.totalCalories} calories • ${order.totalAmount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/orders/${order.id}/track`}>
                      <Button variant="outline" size="sm">Track</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Calorie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Calorie Intake</CardTitle>
          <CardDescription>Your calorie consumption over the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calorieData.map((day) => {
              const percentage = goal ? (day.consumed / goal) * 100 : 0;
              const date = new Date(day.date);
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={day.date} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isToday ? 'font-medium' : ''}>
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {isToday && ' (Today)'}
                    </span>
                    <span>{day.consumed} / {day.goal} cal</span>
                  </div>
                  <Progress value={Math.min(percentage, 100)} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
