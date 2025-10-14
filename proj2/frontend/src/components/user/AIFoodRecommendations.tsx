import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Sparkles, Brain, TrendingUp, Apple, Zap, Info } from 'lucide-react';
import { User, MenuItem } from '../../App';
import FoodSuggestions from './FoodSuggestions';
import { Link } from 'react-router-dom';

interface AIFoodRecommendationsProps {
  user: User;
}

const AIFoodRecommendations: React.FC<AIFoodRecommendationsProps> = ({ user }) => {
  const [todayCalories, setTodayCalories] = useState(0);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    // Calculate today's calories
    const orders = localStorage.getItem('orders');
    if (orders) {
      const parsedOrders = JSON.parse(orders);
      const today = new Date().toDateString();
      const todayOrders = parsedOrders.filter((order: any) => 
        new Date(order.createdAt).toDateString() === today
      );
      const totalCalories = todayOrders.reduce((sum: number, order: any) => 
        sum + (order.totalCalories || 0), 0
      );
      setTodayCalories(totalCalories);
    }

    // Mock comprehensive menu items from various restaurants
    const mockMenuItems: MenuItem[] = [
      // Healthy Options
      {
        id: 'healthy1',
        restaurantId: 'health-cafe',
        name: 'Quinoa Power Bowl',
        description: 'Quinoa with roasted vegetables, chickpeas, and tahini dressing',
        price: 14.99,
        calories: 380,
        ingredients: ['Quinoa', 'Chickpeas', 'Broccoli', 'Sweet Potato', 'Tahini'],
        category: 'Bowls',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGhlYWx0aHklMjBmb29kfGVufDF8fHx8MTc1OTA4MDI3NHww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'healthy2',
        restaurantId: 'health-cafe',
        name: 'Grilled Salmon Salad',
        description: 'Fresh salmon with mixed greens, avocado, and lemon vinaigrette',
        price: 17.99,
        calories: 420,
        ingredients: ['Salmon', 'Mixed Greens', 'Avocado', 'Cherry Tomatoes', 'Lemon'],
        category: 'Salads',
        isVegetarian: false,
        isNonVeg: true,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGhlYWx0aHklMjBmb29kfGVufDF8fHx8MTc1OTA4MDI3NHww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'healthy3',
        restaurantId: 'health-cafe',
        name: 'Greek Yogurt Parfait',
        description: 'Layers of Greek yogurt, granola, and fresh berries',
        price: 8.99,
        calories: 280,
        ingredients: ['Greek Yogurt', 'Granola', 'Blueberries', 'Strawberries', 'Honey'],
        category: 'Breakfast',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'healthy4',
        restaurantId: 'health-cafe',
        name: 'Chicken & Veggie Wrap',
        description: 'Grilled chicken with vegetables in a whole wheat wrap',
        price: 11.99,
        calories: 390,
        ingredients: ['Chicken Breast', 'Whole Wheat Wrap', 'Lettuce', 'Tomatoes', 'Hummus'],
        category: 'Wraps',
        isVegetarian: false,
        isNonVeg: true,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      // Light Snacks
      {
        id: 'snack1',
        restaurantId: 'snack-bar',
        name: 'Hummus & Veggie Sticks',
        description: 'Fresh vegetables with creamy hummus',
        price: 6.99,
        calories: 180,
        ingredients: ['Hummus', 'Carrots', 'Celery', 'Bell Peppers', 'Cucumbers'],
        category: 'Snacks',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGhlYWx0aHklMjBmb29kfGVufDF8fHx8MTc1OTA4MDI3NHww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'snack2',
        restaurantId: 'snack-bar',
        name: 'Protein Smoothie',
        description: 'Banana, protein powder, almond milk, and peanut butter',
        price: 7.99,
        calories: 320,
        ingredients: ['Banana', 'Protein Powder', 'Almond Milk', 'Peanut Butter', 'Ice'],
        category: 'Beverages',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'snack3',
        restaurantId: 'snack-bar',
        name: 'Fruit & Nut Mix',
        description: 'Mixed nuts with dried fruits',
        price: 5.99,
        calories: 220,
        ingredients: ['Almonds', 'Cashews', 'Dried Cranberries', 'Raisins', 'Walnuts'],
        category: 'Snacks',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      // Protein-Rich Options
      {
        id: 'protein1',
        restaurantId: 'protein-kitchen',
        name: 'Grilled Chicken Breast',
        description: 'Lean chicken breast with herbs and a side salad',
        price: 13.99,
        calories: 340,
        ingredients: ['Chicken Breast', 'Herbs', 'Olive Oil', 'Side Salad'],
        category: 'Mains',
        isVegetarian: false,
        isNonVeg: true,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'protein2',
        restaurantId: 'protein-kitchen',
        name: 'Tofu Stir Fry',
        description: 'Crispy tofu with mixed vegetables in teriyaki sauce',
        price: 12.99,
        calories: 360,
        ingredients: ['Tofu', 'Broccoli', 'Bell Peppers', 'Snap Peas', 'Teriyaki Sauce'],
        category: 'Mains',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'protein3',
        restaurantId: 'protein-kitchen',
        name: 'Turkey Meatballs',
        description: 'Lean turkey meatballs with marinara sauce',
        price: 14.99,
        calories: 410,
        ingredients: ['Ground Turkey', 'Marinara Sauce', 'Herbs', 'Parmesan'],
        category: 'Mains',
        isVegetarian: false,
        isNonVeg: true,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      // Low Calorie Options
      {
        id: 'lowcal1',
        restaurantId: 'light-bites',
        name: 'Veggie Soup',
        description: 'Hearty vegetable soup with herbs',
        price: 7.99,
        calories: 150,
        ingredients: ['Tomatoes', 'Carrots', 'Celery', 'Onions', 'Vegetable Broth'],
        category: 'Soups',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGhlYWx0aHklMjBmb29kfGVufDF8fHx8MTc1OTA4MDI3NHww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: 'lowcal2',
        restaurantId: 'light-bites',
        name: 'Zucchini Noodles',
        description: 'Spiralized zucchini with light pesto sauce',
        price: 10.99,
        calories: 210,
        ingredients: ['Zucchini', 'Pesto', 'Cherry Tomatoes', 'Parmesan'],
        category: 'Pasta',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGhlYWx0aHklMjBmb29kfGVufDF8fHx8MTc1OTA4MDI3NHww&ixlib=rb-4.1.0&q=80&w=1080'
      }
    ];

    setAllMenuItems(mockMenuItems);
  }, []);

  const getLowCalorieItems = () => {
    return allMenuItems.filter(item => item.calories < 300);
  };

  const getBalancedItems = () => {
    return allMenuItems.filter(item => item.calories >= 300 && item.calories <= 500);
  };

  const getVegetarianItems = () => {
    return allMenuItems.filter(item => item.isVegetarian);
  };

  const getProteinRichItems = () => {
    return allMenuItems.filter(item => 
      item.category === 'Mains' || item.ingredients.some(ing => 
        ing.toLowerCase().includes('chicken') || 
        ing.toLowerCase().includes('salmon') ||
        ing.toLowerCase().includes('tofu') ||
        ing.toLowerCase().includes('turkey')
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Food Recommendations</h1>
        </div>
        <p className="text-muted-foreground">
          Personalized meal suggestions powered by artificial intelligence based on your calorie goals and preferences
        </p>
      </div>

      {/* How It Works */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            How AI Suggestions Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Calorie Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes your daily goal and remaining calories to suggest perfect portions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-600 text-white p-2 rounded-lg">
                <Apple className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Nutritional Balance</h4>
                <p className="text-sm text-muted-foreground">
                  Recommendations consider proteins, vegetables, and overall nutritional value
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">Meal Timing</h4>
                <p className="text-sm text-muted-foreground">
                  Suggestions adapt based on time of day for breakfast, lunch, dinner, or snacks
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Suggestions */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="balanced">Balanced</TabsTrigger>
          <TabsTrigger value="light">Light</TabsTrigger>
          <TabsTrigger value="protein">Protein</TabsTrigger>
          <TabsTrigger value="veggie">Veggie</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <FoodSuggestions
            user={user}
            menuItems={allMenuItems}
            currentCaloriesToday={todayCalories}
          />
        </TabsContent>

        <TabsContent value="balanced" className="space-y-4">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle>Balanced Meals (300-500 calories)</CardTitle>
              <CardDescription>
                Perfect portion sizes for main meals that keep you satisfied
              </CardDescription>
            </CardHeader>
          </Card>
          <FoodSuggestions
            user={user}
            menuItems={getBalancedItems()}
            currentCaloriesToday={todayCalories}
          />
        </TabsContent>

        <TabsContent value="light" className="space-y-4">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle>Light Options (Under 300 calories)</CardTitle>
              <CardDescription>
                Perfect for snacks or when you're watching your intake
              </CardDescription>
            </CardHeader>
          </Card>
          <FoodSuggestions
            user={user}
            menuItems={getLowCalorieItems()}
            currentCaloriesToday={todayCalories}
          />
        </TabsContent>

        <TabsContent value="protein" className="space-y-4">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle>Protein-Rich Options</CardTitle>
              <CardDescription>
                High-protein meals to support muscle and keep you full longer
              </CardDescription>
            </CardHeader>
          </Card>
          <FoodSuggestions
            user={user}
            menuItems={getProteinRichItems()}
            currentCaloriesToday={todayCalories}
          />
        </TabsContent>

        <TabsContent value="veggie" className="space-y-4">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle>Vegetarian Options</CardTitle>
              <CardDescription>
                Plant-based meals packed with nutrients
              </CardDescription>
            </CardHeader>
          </Card>
          <FoodSuggestions
            user={user}
            menuItems={getVegetarianItems()}
            currentCaloriesToday={todayCalories}
          />
        </TabsContent>
      </Tabs>

      {/* Need to Set Goal */}
      {!user.calorieGoal && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900">Set Your Calorie Goal</h4>
                <p className="text-sm text-amber-700 mt-1 mb-3">
                  To get the most accurate AI recommendations, please set your daily calorie goal in settings.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/settings/calories">Configure Goal</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIFoodRecommendations;
