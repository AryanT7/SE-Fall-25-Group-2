import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { CalendarDays, Target, TrendingUp, Utensils, Sparkles } from 'lucide-react';
import { User, MenuItem } from '../../App';
import FoodSuggestions from './FoodSuggestions';

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
  const [todayCalories, setTodayCalories] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [sampleMenuItems, setSampleMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    // Mock calorie data for the past week
    const mockCalorieData: CalorieData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const consumed = Math.floor(Math.random() * 800) + 1200; // Random calories between 1200-2000
      
      mockCalorieData.push({
        date: date.toISOString().split('T')[0],
        consumed,
        goal: user.calorieGoal || 2200
      });
    }
    
    setCalorieData(mockCalorieData);
    setTodayCalories(mockCalorieData[mockCalorieData.length - 1]?.consumed || 0);

    // Mock recent orders
    setRecentOrders([
      {
        id: '1',
        restaurantName: 'Pizza Palace',
        totalAmount: 25.99,
        status: 'delivered',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        totalCalories: 850
      },
      {
        id: '2',
        restaurantName: 'Burger Hub',
        totalAmount: 18.50,
        status: 'preparing',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        totalCalories: 720
      }
    ]);

    // Sample menu items for AI suggestions
    setSampleMenuItems([
      {
        id: 'sample1',
        restaurantId: 'rest1',
        name: 'Greek Salad',
        description: 'Fresh vegetables with feta cheese and olives',
        price: 11.99,
        calories: 280,
        ingredients: ['Lettuce', 'Tomatoes', 'Cucumber', 'Feta', 'Olives', 'Olive Oil'],
        category: 'Salads',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGhlYWx0aHklMjBmb29kfGVufDF8fHx8MTc1OTA4MDI3NHww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'sample2',
        restaurantId: 'rest2',
        name: 'Grilled Chicken Breast',
        description: 'Lean protein with herbs and spices',
        price: 14.99,
        calories: 350,
        ingredients: ['Chicken', 'Herbs', 'Spices', 'Olive Oil'],
        category: 'Mains',
        isVegetarian: false,
        isNonVeg: true,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'sample3',
        restaurantId: 'rest3',
        name: 'Veggie Bowl',
        description: 'Quinoa with roasted vegetables',
        price: 13.99,
        calories: 420,
        ingredients: ['Quinoa', 'Broccoli', 'Carrots', 'Bell Peppers', 'Chickpeas'],
        category: 'Bowls',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGhlYWx0aHklMjBmb29kfGVufDF8fHx8MTc1OTA4MDI3NHww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'sample4',
        restaurantId: 'rest1',
        name: 'Fruit Smoothie',
        description: 'Fresh fruits blended with yogurt',
        price: 7.99,
        calories: 220,
        ingredients: ['Banana', 'Berries', 'Yogurt', 'Honey'],
        category: 'Beverages',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'sample5',
        restaurantId: 'rest2',
        name: 'Turkey Sandwich',
        description: 'Whole wheat bread with turkey and vegetables',
        price: 9.99,
        calories: 380,
        ingredients: ['Whole Wheat Bread', 'Turkey', 'Lettuce', 'Tomato', 'Mustard'],
        category: 'Sandwiches',
        isVegetarian: false,
        isNonVeg: true,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'sample6',
        restaurantId: 'rest3',
        name: 'Protein Bar',
        description: 'High-protein energy bar',
        price: 4.99,
        calories: 180,
        ingredients: ['Oats', 'Protein Powder', 'Nuts', 'Honey'],
        category: 'Snacks',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080'
      }
    ]);
  }, [user.calorieGoal]);

  const getCalorieProgress = () => {
    if (!user.calorieGoal) return 0;
    return Math.min((todayCalories / user.calorieGoal) * 100, 100);
  };

  const getCalorieStatus = () => {
    if (!user.calorieGoal) return 'Set your calorie goal';
    const remaining = user.calorieGoal - todayCalories;
    if (remaining > 0) {
      return `${remaining} calories remaining`;
    } else {
      return `${Math.abs(remaining)} calories over goal`;
    }
  };

  const getRecommendedCalories = () => {
    if (!user.height || !user.weight) return 2200;
    // Simple BMR calculation (Harris-Benedict for men)
    const bmr = 88.362 + (13.397 * user.weight) + (4.799 * user.height) - (5.677 * 30); // Assuming age 30
    return Math.round(bmr * 1.5); // Moderate activity level
  };

  const averageWeeklyCalories = calorieData.length > 0 
    ? Math.round(calorieData.reduce((sum, day) => sum + day.consumed, 0) / calorieData.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Track your calories and manage your food orders</p>
      </div>

      {/* Calorie Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calories</CardTitle>
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
            <div className="text-2xl font-bold">{user.calorieGoal || 'Not set'}</div>
            <p className="text-xs text-muted-foreground capitalize">
              {user.goalType || 'daily'} target
            </p>
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

      {/* AI Food Suggestions */}
      {user.calorieGoal && sampleMenuItems.length > 0 && (
        <FoodSuggestions
          user={user}
          menuItems={sampleMenuItems}
          currentCaloriesToday={todayCalories}
        />
      )}

      {/* Recent Orders */}
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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Find Food</CardTitle>
            <CardDescription>Discover restaurants and healthy options</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/restaurants">
              <Button className="w-full">Browse Restaurants</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calorie Goals</CardTitle>
            <CardDescription>Set and track your daily calorie targets</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/settings/calories">
              <Button variant="outline" className="w-full">Manage Goals</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Calorie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Calorie Intake</CardTitle>
          <CardDescription>Your calorie consumption over the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calorieData.map((day, index) => {
              const percentage = user.calorieGoal ? (day.consumed / user.calorieGoal) * 100 : 0;
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