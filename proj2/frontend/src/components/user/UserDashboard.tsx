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
import { goalsApi } from '../../api/goals';

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
  const [recommendedCalories, setRecommendedCalories] = useState<number | null>(null);

  // Merge user data with localStorage (CalorieSettings saves to localStorage)
  const mergedUserData = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const resolvedSex = (() => {
        const raw = (stored?.gender ?? (user as any)?.gender ?? (user as any)?.sex)?.toString()?.toUpperCase?.();
        return raw === 'M' || raw === 'F' ? raw : undefined;
      })();

      return {
        height_cm: Number(stored?.height) || user?.height_cm,
        weight_kg: Number(stored?.weight) || user?.weight_kg,
        age: Number(stored?.age) || (typeof (user as any)?.age !== 'undefined' ? Number((user as any).age) : undefined),
        sex: resolvedSex,
        activityLevel: stored?.activityLevel || (user as any)?.activityLevel || 'moderate',
        daily_calorie_goal: Number(stored?.daily_calorie_goal) || user?.daily_calorie_goal,
      };
    } catch {
      return {
        height_cm: user?.height_cm,
        weight_kg: user?.weight_kg,
        age: typeof (user as any)?.age !== 'undefined' ? Number((user as any).age) : undefined,
        sex: ((user as any)?.gender ?? (user as any)?.sex)?.toString()?.toUpperCase?.(),
        activityLevel: (user as any)?.activityLevel || 'moderate',
        daily_calorie_goal: user?.daily_calorie_goal,
      };
    }
  }, [user]);

  // Normalize goal & body stats based on your types
  const goal = useMemo(
    () => Number(mergedUserData.daily_calorie_goal ?? 2200),
    [mergedUserData.daily_calorie_goal]
  );
  const heightCm = mergedUserData.height_cm;
  const weightKg = mergedUserData.weight_kg;

  // --- Fetch live cart summary for today's calories / price ---
  useEffect(() => {
    let mounted = true;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[Dash] GET /cart/summary');
        const res = await cartApi.getSummary(); // -> { data?: CartSummary }
        console.log('[Dash] /cart/summary response', res);
        if (res.error) throw new Error(res.error);

        const summary = res.data as CartSummary | undefined;
        const caloriesFromSummary =
          (summary as any)?.calories_today ??
          (summary as any)?.caloriesToday ??
          0; // depending on your backend naming

        if (mounted) {
          setTodayCalories(Number(caloriesFromSummary) || 0);

          // build a simple 7-day graph using goal as baseline
          const today = new Date();
          const sevenDays: CalorieData[] = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (6 - i));
            return {
              date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              consumed: i === 6 ? Number(caloriesFromSummary) || 0 : 0, // show 0 for past days until you have history
              goal: goal || 2200,
            };
          });
          setCalorieData(sevenDays);

          // Recent orders placeholder (backend provided doesn't expose orders yet)
          setRecentOrders([]); // When you add /orders endpoint, populate here.
          setSampleMenuItems([]); // When you add a menu items endpoint, populate and show FoodSuggestions.
        }
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

  // --- Ask backend for recommended calories (uses your goalsApi) ---
  useEffect(() => {
    // pull normalized values
    const height_cm = heightCm;
    const weight_kg = weightKg;
    const age_years = mergedUserData.age;
    const sex = mergedUserData.sex; // 'M' or 'F'
    const activity = mergedUserData.activityLevel; // optional

    if (!height_cm || !weight_kg || !age_years || !sex) {
      setRecommendedCalories(null);
      return;
    }

    let cancelled = false;
    (async () => {
      console.log('[Dash] /goals/recommend request', { height_cm, weight_kg, sex, age_years, activity });
      const res = await goalsApi.getRecommendation({
        height_cm: height_cm!,
        weight_kg: weight_kg!,
        sex: sex!,
        age_years: age_years!,
        activity,
      });
      console.log('[Dash] /goals/recommend response', res);
      if (!cancelled) {
        if (res.data?.daily_calorie_goal) {
          setRecommendedCalories(Math.round(res.data.daily_calorie_goal));
        } else {
          setRecommendedCalories(null);
        }
      }
    })();

    return () => { cancelled = true; }
  }, [heightCm, weightKg, mergedUserData.age, mergedUserData.sex, mergedUserData.activityLevel]);

  const remainingCalories = () => {
    const remaining = (goal || 0) - (todayCalories || 0);
    return remaining >= 0
      ? `${remaining} calories remaining`
      : `${Math.abs(remaining)} calories over goal`;
  };

  const getRecommendedCalories = () => {
    const age = mergedUserData.age;
    const sex = ((mergedUserData as any).sex ?? (mergedUserData as any).gender)?.toString()?.toUpperCase?.();

    if (!heightCm || !weightKg || !age || !sex) return 2200;

    let bmr: number;
    if (sex === 'M') {
      bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
    } else if (sex === 'F') {
      bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
    } else {
      return 2200;
    }

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const level = (mergedUserData as any)?.activityLevel || 'moderate';
    const multiplier = activityMultipliers[level] ?? 1.55;
    return Math.round(bmr * multiplier);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}!` : '!'}</h1>         
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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here’s a snapshot of your day.
        </p>
      </div>

      {/* Top widgets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today’s Calories</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCalories}</div>
            <p className="text-xs text-muted-foreground">{remainingCalories()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {goal ? Math.max(0, Math.min(100, Math.round((todayCalories / goal) * 100))) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">of daily goal</p>
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
            <div className="text-2xl font-bold">{recommendedCalories ?? getRecommendedCalories()}</div>
            <p className="text-xs text-muted-foreground">based on your profile</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Food Suggestions (kept hidden until you have real menu items) */}
      {goal && sampleMenuItems.length > 0 && (
        <FoodSuggestions
          user={user as any}
          menuItems={sampleMenuItems}
        />
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest meals and their calorie impact</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent orders to display.</p>
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
          <CardTitle>Weekly Calories</CardTitle>
          <CardDescription>Progress toward your daily goal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calorieData.map((day, i) => {
              const percentage = day.goal ? Math.round((day.consumed / day.goal) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{day.date}</span>
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
