import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Lightbulb, Target } from 'lucide-react';
import FoodSuggestions from './FoodSuggestions';
import { MenuItem, User } from '../../api/types';
import { goalsApi, itemsApi } from '../../api';

interface AIFoodRecommendationsProps {
  user: User;
}

const AIFoodRecommendations: React.FC<AIFoodRecommendationsProps> = ({ user }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [todayCalories, setTodayCalories] = useState(0);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [effectiveUser, setEffectiveUser] = useState<User>(user);
  const [restaurantsById, setRestaurantsById] = useState<Record<string | number, any>>({});

  // ---------- helpers ----------
  const coerceNumber = (v: unknown): number | undefined => {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v);
    return undefined;
  };

  const calcAge = (dob?: string): number | undefined => {
    if (!dob) return undefined;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return undefined;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const normalizeActivity = (raw: any):
    | 'sedentary'
    | 'light'
    | 'moderate'
    | 'active'
    | 'very active' => {
    const s = String(raw ?? '').toLowerCase().trim();
    if (['sedentary', 'none', 'rest', '1'].includes(s)) return 'sedentary';
    if (['light', 'lightly active', 'lightly_active', '2'].includes(s)) return 'light';
    if (['moderate', 'moderately active', 'moderately_active', '3', 'avg', 'medium'].includes(s)) return 'moderate';
    if (['active', '4', 'high'].includes(s)) return 'active';
    if (
      ['very active', 'very_active', 'veryactive', 'extremely active', 'extremely_active', '5', 'extreme'].includes(s)
    )
      return 'very active';
    return 'moderate';
  };

  const activityMultiplier = (level?: string): number => {
    const l = normalizeActivity(level).toLowerCase();
    switch (l) {
      case 'sedentary': return 1.2;
      case 'light': return 1.375;
      case 'moderate': return 1.55;
      case 'active': return 1.725;
      case 'very active': return 1.9; // ensure "very active" is highest
      default: return 1.55;
    }
  };

  // Only used as a final fallback if no daily_calorie_goal exists
  const computeHarrisBenedict = (u: any): number | null => {
    const height_cm = coerceNumber(u?.height_cm ?? u?.height);
    const weight_kg = coerceNumber(u?.weight_kg ?? u?.weight);
    const sex = (u?.sex || u?.gender || '').toString().toUpperCase(); // 'M' or 'F'
    const age_years = calcAge(u?.dob);
    if (!height_cm || !weight_kg || !age_years || (sex !== 'M' && sex !== 'F')) return null;

    let bmr: number;
    if (sex === 'M') {
      bmr = 88.362 + 13.397 * weight_kg + 4.799 * height_cm - 5.677 * age_years;
    } else {
      bmr = 447.593 + 9.247 * weight_kg + 3.098 * height_cm - 4.330 * age_years;
    }
    console.log("AI REC user.age =", age_years);
    console.log("AI REC user.height =", height_cm);
    console.log("AI REC user.weight =", weight_kg);
    console.log("AI REC user.sex =", sex);
    console.log("AI REC user.activityLevel =", activityMultiplier(u?.activityLevel));

    const mult = activityMultiplier(u?.activityLevel ?? u?.activity_level ?? u?.activity);
    return Math.max(1, Math.round(bmr * mult));
  };

  // ---------- load data ----------
  useEffect(() => {
    const run = async () => {
      setLoading(true);

      // 0) Hydrate user; prefer server-provided prop, use localStorage to fill in missing fields
      try {
        const stored = localStorage.getItem(`user:${user.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          const level = normalizeActivity(parsed?.activityLevel ?? parsed?.activity_level ?? parsed?.activity);
          setEffectiveUser({ ...parsed, ...user, activityLevel: level } as any);
        } else {
          const level = normalizeActivity((user as any)?.activityLevel ?? (user as any)?.activity_level);
          setEffectiveUser({ ...user, activityLevel: level } as any);
        }
      } catch {
        const level = normalizeActivity((user as any)?.activityLevel ?? (user as any)?.activity_level);
        setEffectiveUser({ ...user, activityLevel: level } as any);
      }

      // 1) Today's calories: backend → local fallback
      try {
        const res = await goalsApi.getTodayIntake();
        if (res?.data?.calories !== undefined) {
          setTodayCalories(res.data.calories);
        } else {
          throw new Error('No backend data');
        }
      } catch {
        try {
          const orders = localStorage.getItem('orders');
          if (orders) {
            const parsed = JSON.parse(orders);
            const today = new Date().toDateString();
            const todayOrders = parsed.filter(
              (o: any) => new Date(o.createdAt).toDateString() === today
            );
            const total = todayOrders.reduce(
              (sum: number, o: any) => sum + (o.totalCalories || 0),
              0
            );
            setTodayCalories(total);
          } else {
            setTodayCalories(0);
          }
        } catch {
          setTodayCalories(0);
        }
      }

      // 2) Menu items (map cafe_id → restaurantId, ensure defaults)
      try {
        const res = await itemsApi.listAll();
        if (res?.data && Array.isArray(res.data)) {
          const transformed = res.data.map((item: any) => ({
            ...item,
            restaurantId: item.cafe_id ?? item.restaurantId,
            category: item.category || 'Main',
            isVegetarian: item.is_vegetarian ?? item.isVegetarian ?? false,
            isNonVeg: item.is_non_veg ?? item.isNonVeg ?? false,
            image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
            servings: item.servings || 1,
          }));
          setAllMenuItems(transformed);
        } else {
          setAllMenuItems([]);
        }
      } catch {
        setAllMenuItems([]);
      }

      // 3) Restaurants list for name/address under each suggestion
      try {
        let map: Record<string | number, any> = {};

        // Try backend
        try {
          const rres = await fetch('/api/restaurants');
          if (rres.ok) {
            const data = await rres.json();
            if (Array.isArray(data)) {
              for (const r of data) map[r.id] = r;
            }
          }
        } catch {
          // ignore; fallback below
        }

        // Fallback: localStorage
        if (Object.keys(map).length === 0) {
          const stored = localStorage.getItem('restaurants');
          if (stored) {
            const arr = JSON.parse(stored);
            if (Array.isArray(arr)) {
              for (const r of arr) map[r.id] = r;
            }
          }
        }

        setRestaurantsById(map);
      } catch {
        setRestaurantsById({});
      }

      setLoading(false);
    };

    run();
  }, [user.id]);

  // ---------- goal resolution ----------
  // Use daily_calorie_goal first. If missing, fallback to user.calorieGoal.
  // As a last resort, compute via Harris–Benedict from profile; default 2000 if still missing.
  const resolvedGoal = useMemo(() => {
    const fromDaily = coerceNumber((effectiveUser as any).daily_calorie_goal);
    if (typeof fromDaily === 'number') return fromDaily;

    const direct = coerceNumber((effectiveUser as any).calorieGoal);
    if (typeof direct === 'number') return direct;

    const hb = computeHarrisBenedict(effectiveUser);
    if (typeof hb === 'number' && Number.isFinite(hb) && hb > 0) return hb;

    return 2000;
  }, [effectiveUser]);

  const progress = Math.min((todayCalories / resolvedGoal) * 100, 100);
  const remaining = Math.max(0, resolvedGoal - todayCalories);

  // Personalized list: closest fits to remaining cals, else lightest items
  const personalizedMenu = useMemo(() => {
    if (!Array.isArray(allMenuItems) || allMenuItems.length === 0) return [];
    const fit = allMenuItems.filter((it) => typeof it.calories === 'number' && it.calories <= remaining);
    if (fit.length > 0) {
      return fit.sort((a, b) => {
        const da = Math.abs((a.calories || 0) - remaining);
        const db = Math.abs((b.calories || 0) - remaining);
        return da - db;
      });
    }
    return [...allMenuItems]
      .filter((it) => typeof it.calories === 'number')
      .sort((a, b) => (a.calories || 0) - (b.calories || 0));
  }, [allMenuItems, remaining]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Lightbulb className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Food Recommendations</h1>
          <p className="text-muted-foreground">
            Personalized suggestions based on your daily goal and today’s intake
          </p>
        </div>
      </div>

      {/* Progress Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Progress
          </CardTitle>
          <CardDescription>
            {`We’re using your daily goal of ${resolvedGoal} cal`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Today's Progress</span>
            <span className="font-medium">
              {todayCalories} / {resolvedGoal} cal
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {remaining > 0 ? `${remaining} calories remaining for today` : 'Daily goal reached!'}
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All (Personalized)</TabsTrigger>
          <TabsTrigger value="vegetarian">Vegetarian</TabsTrigger>
          <TabsTrigger value="low-cal">Low Calorie</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <FoodSuggestions
            user={{ ...(effectiveUser as any), calorieGoal: resolvedGoal }}
            menuItems={personalizedMenu}
            currentCaloriesToday={todayCalories}
            restaurantsById={restaurantsById}
          />
        </TabsContent>

        <TabsContent value="vegetarian" className="space-y-4">
          <FoodSuggestions
            user={{ ...(effectiveUser as any), calorieGoal: resolvedGoal }}
            menuItems={allMenuItems.filter((it) => (it as any).isVegetarian === true)}
            currentCaloriesToday={todayCalories}
            restaurantsById={restaurantsById}
          />
        </TabsContent>

        <TabsContent value="low-cal" className="space-y-4">
          <FoodSuggestions
            user={{ ...(effectiveUser as any), calorieGoal: resolvedGoal }}
            menuItems={allMenuItems.filter((it) => (it.calories || 0) < 300)}
            currentCaloriesToday={todayCalories}
            restaurantsById={restaurantsById}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIFoodRecommendations;