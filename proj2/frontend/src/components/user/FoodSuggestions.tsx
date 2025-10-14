import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Sparkles, TrendingUp, Leaf, Zap, Heart, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { MenuItem, User, Order } from '../../App';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Progress } from '../ui/progress';

interface FoodSuggestionsProps {
  user: User;
  menuItems: MenuItem[];
  onAddToCart?: (item: MenuItem) => void;
  currentCaloriesToday?: number;
}

interface SuggestionScore {
  item: MenuItem;
  score: number;
  reasons: string[];
  caloriesFit: 'perfect' | 'good' | 'high' | 'low';
  tags: string[];
}

const FoodSuggestions: React.FC<FoodSuggestionsProps> = ({
  user,
  menuItems,
  onAddToCart,
  currentCaloriesToday = 0
}) => {
  const [suggestions, setSuggestions] = useState<SuggestionScore[]>([]);
  const [mealTime, setMealTime] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  useEffect(() => {
    // Determine meal time based on current hour
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) setMealTime('breakfast');
    else if (hour >= 11 && hour < 15) setMealTime('lunch');
    else if (hour >= 15 && hour < 18) setMealTime('snack');
    else setMealTime('dinner');
  }, []);

  useEffect(() => {
    if (!user.calorieGoal || menuItems.length === 0) return;

    const analyzedSuggestions = analyzeMenuItems();
    setSuggestions(analyzedSuggestions);
  }, [user, menuItems, currentCaloriesToday, mealTime]);

  const analyzeMenuItems = (): SuggestionScore[] => {
    const remainingCalories = (user.calorieGoal || 2200) - currentCaloriesToday;
    const targetMealCalories = calculateTargetMealCalories(remainingCalories);

    return menuItems.map(item => {
      const score = calculateAIScore(item, targetMealCalories, remainingCalories);
      return score;
    }).sort((a, b) => b.score - a.score).slice(0, 6);
  };

  const calculateTargetMealCalories = (remainingCalories: number): number => {
    // AI logic for meal calorie distribution
    const mealDistribution = {
      breakfast: 0.25, // 25% of daily calories
      lunch: 0.35,     // 35% of daily calories
      dinner: 0.30,    // 30% of daily calories
      snack: 0.10      // 10% of daily calories
    };

    const dailyGoal = user.calorieGoal || 2200;
    const idealMealCalories = dailyGoal * mealDistribution[mealTime];

    // Adjust based on remaining calories
    if (remainingCalories < idealMealCalories) {
      return Math.max(remainingCalories * 0.8, 200); // Use 80% of remaining, minimum 200
    }

    return idealMealCalories;
  };

  const calculateAIScore = (
    item: MenuItem,
    targetCalories: number,
    remainingCalories: number
  ): SuggestionScore => {
    let score = 0;
    const reasons: string[] = [];
    const tags: string[] = [];
    let caloriesFit: 'perfect' | 'good' | 'high' | 'low' = 'good';

    // 1. Calorie Fit Analysis (40 points)
    const calorieDiff = Math.abs(item.calories - targetCalories);
    const caloriePercentDiff = calorieDiff / targetCalories;

    if (item.calories <= remainingCalories) {
      if (caloriePercentDiff < 0.1) {
        score += 40;
        caloriesFit = 'perfect';
        reasons.push(`Perfect calorie match for ${mealTime}`);
        tags.push('Ideal Portion');
      } else if (caloriePercentDiff < 0.25) {
        score += 30;
        caloriesFit = 'good';
        reasons.push(`Good calorie fit for ${mealTime}`);
      } else if (item.calories < targetCalories * 0.5) {
        score += 20;
        caloriesFit = 'low';
        reasons.push('Light option, pairs well with sides');
        tags.push('Light');
      } else {
        score += 25;
        caloriesFit = 'good';
      }
    } else {
      score += 10;
      caloriesFit = 'high';
      reasons.push('Higher in calories - consider sharing');
      tags.push('Indulgent');
    }

    // 2. Nutritional Balance (25 points)
    const caloriesPerServing = item.calories / item.servings;
    if (caloriesPerServing < 400) {
      score += 15;
      reasons.push('Nutrient-dense, portion-controlled');
      tags.push('Balanced');
    } else if (caloriesPerServing < 600) {
      score += 10;
    }

    // Vegetarian bonus for health
    if (item.isVegetarian) {
      score += 10;
      reasons.push('Plant-based option');
      tags.push('Veggie');
    }

    // 3. Meal Time Appropriateness (20 points)
    const mealTimeScore = getMealTimeAppropriatenessScore(item);
    score += mealTimeScore.score;
    if (mealTimeScore.reason) {
      reasons.push(mealTimeScore.reason);
      if (mealTimeScore.tag) tags.push(mealTimeScore.tag);
    }

    // 4. Calorie Efficiency (15 points) - Good value for calories
    const pricePerCalorie = item.price / item.calories;
    if (pricePerCalorie < 0.02) {
      score += 15;
      reasons.push('Great value for nutrition');
    } else if (pricePerCalorie < 0.03) {
      score += 10;
    } else if (pricePerCalorie < 0.04) {
      score += 5;
    }

    // 5. Smart recommendations based on remaining calories
    const percentOfRemaining = (item.calories / remainingCalories) * 100;
    if (percentOfRemaining > 80 && percentOfRemaining < 120) {
      score += 10;
      reasons.push('Fits perfectly in your remaining calories');
      tags.push('Smart Choice');
    } else if (percentOfRemaining > 120) {
      score -= 10;
      tags.push('Over Budget');
    }

    // 6. Category-based recommendations
    if (mealTime === 'breakfast' && item.category === 'Appetizers') {
      score += 5;
      reasons.push('Light start to your day');
    }
    if (mealTime === 'lunch' && item.category === 'Salads') {
      score += 8;
      reasons.push('Refreshing lunch option');
      tags.push('Energizing');
    }
    if (mealTime === 'snack' && item.calories < 350) {
      score += 10;
      reasons.push('Perfect snack size');
      tags.push('Snack');
    }

    // 7. Healthy ingredient bonus
    const healthyIngredients = ['lettuce', 'tomato', 'vegetables', 'salad', 'olive oil'];
    const hasHealthyIngredients = item.ingredients.some(ing => 
      healthyIngredients.some(healthy => ing.toLowerCase().includes(healthy))
    );
    if (hasHealthyIngredients) {
      score += 5;
      tags.push('Fresh');
    }

    return {
      item,
      score,
      reasons: reasons.slice(0, 2), // Top 2 reasons
      caloriesFit,
      tags: tags.slice(0, 3) // Top 3 tags
    };
  };

  const getMealTimeAppropriatenessScore = (item: MenuItem): { score: number; reason?: string; tag?: string } => {
    const category = item.category.toLowerCase();
    const calories = item.calories;

    switch (mealTime) {
      case 'breakfast':
        if (calories < 500 && item.isVegetarian) {
          return { score: 20, reason: 'Light breakfast choice', tag: 'Morning' };
        }
        if (calories < 600) {
          return { score: 15, reason: 'Good breakfast portion' };
        }
        return { score: 5 };

      case 'lunch':
        if (calories > 400 && calories < 800) {
          return { score: 20, reason: 'Satisfying lunch portion', tag: 'Midday' };
        }
        if (category.includes('salad')) {
          return { score: 18, reason: 'Fresh lunch option', tag: 'Wholesome' };
        }
        return { score: 10 };

      case 'dinner':
        if (calories > 500 && calories < 900) {
          return { score: 20, reason: 'Hearty dinner option', tag: 'Evening' };
        }
        if (item.isNonVeg) {
          return { score: 15, reason: 'Protein-rich dinner' };
        }
        return { score: 10 };

      case 'snack':
        if (calories < 400) {
          return { score: 20, reason: 'Perfect snack size', tag: 'Quick Bite' };
        }
        if (calories < 300) {
          return { score: 18, reason: 'Light snack', tag: 'Light' };
        }
        return { score: 5 };

      default:
        return { score: 0 };
    }
  };

  const getCaloriesFitColor = (fit: 'perfect' | 'good' | 'high' | 'low') => {
    switch (fit) {
      case 'perfect':
        return 'text-green-600 border-green-600';
      case 'good':
        return 'text-blue-600 border-blue-600';
      case 'high':
        return 'text-orange-600 border-orange-600';
      case 'low':
        return 'text-purple-600 border-purple-600';
    }
  };

  const getCaloriesFitIcon = (fit: 'perfect' | 'good' | 'high' | 'low') => {
    switch (fit) {
      case 'perfect':
        return <CheckCircle className="h-4 w-4" />;
      case 'good':
        return <TrendingUp className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <Zap className="h-4 w-4" />;
    }
  };

  const remainingCalories = (user.calorieGoal || 2200) - currentCaloriesToday;
  const percentConsumed = user.calorieGoal ? (currentCaloriesToday / user.calorieGoal) * 100 : 0;

  if (!user.calorieGoal) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Set Your Calorie Goal</h4>
              <p className="text-sm text-blue-700 mt-1">
                Configure your daily calorie goal to get personalized food suggestions powered by AI.
              </p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <a href="/settings/calories">Set Goal Now</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calorie Overview */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI Calorie Assistant</CardTitle>
            </div>
            <Badge variant="secondary" className="capitalize">
              {mealTime}
            </Badge>
          </div>
          <CardDescription>
            Personalized recommendations based on your daily goal and current intake
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Today's Goal</p>
              <p className="text-2xl font-bold">{user.calorieGoal}</p>
              <p className="text-xs text-muted-foreground">calories</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Consumed</p>
              <p className="text-2xl font-bold">{currentCaloriesToday}</p>
              <p className="text-xs text-muted-foreground">calories</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${remainingCalories < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {remainingCalories}
              </p>
              <p className="text-xs text-muted-foreground">calories</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Progress</span>
              <span>{Math.round(percentConsumed)}%</span>
            </div>
            <Progress value={Math.min(percentConsumed, 100)} className="h-2" />
          </div>
          {remainingCalories < 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                You've exceeded your daily goal. Consider lighter options or adjust your goal.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <CardTitle>Recommended For You</CardTitle>
          </div>
          <CardDescription>
            Smart suggestions tailored to your calorie budget and {mealTime} preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No menu items available for analysis</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {suggestions.map((suggestion, index) => (
                <Card key={suggestion.item.id} className={`overflow-hidden ${
                  index === 0 ? 'border-2 border-primary/50' : ''
                }`}>
                  {index === 0 && (
                    <div className="bg-primary text-primary-foreground px-3 py-1 text-xs flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Top AI Pick</span>
                    </div>
                  )}
                  <div className="flex">
                    <div className="w-24 h-24 flex-shrink-0">
                      <ImageWithFallback
                        src={suggestion.item.image}
                        alt={suggestion.item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-3 space-y-2">
                      <div>
                        <h4 className="font-medium leading-tight">{suggestion.item.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {suggestion.item.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {suggestion.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCaloriesFitColor(suggestion.caloriesFit)}`}
                        >
                          {getCaloriesFitIcon(suggestion.caloriesFit)}
                          <span className="ml-1">{suggestion.item.calories} cal</span>
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        {suggestion.reasons.map((reason, i) => (
                          <p key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="font-semibold">${suggestion.item.price}</span>
                        {onAddToCart && (
                          <Button 
                            size="sm" 
                            onClick={() => onAddToCart(suggestion.item)}
                            className="h-8"
                          >
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {remainingCalories > 1000 && (
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <p className="text-sm">
                You have plenty of calories remaining. Consider a full meal with sides.
              </p>
            </div>
          )}
          {remainingCalories > 400 && remainingCalories <= 1000 && (
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm">
                You're on track! A moderate portion meal fits well in your remaining budget.
              </p>
            </div>
          )}
          {remainingCalories > 0 && remainingCalories <= 400 && (
            <div className="flex items-start gap-2">
              <Leaf className="h-4 w-4 text-green-600 mt-0.5" />
              <p className="text-sm">
                Consider lighter options like salads or appetizers to stay within your goal.
              </p>
            </div>
          )}
          {remainingCalories <= 0 && (
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm">
                You've reached your daily goal. If you're still hungry, choose low-calorie options or adjust tomorrow's planning.
              </p>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Heart className="h-4 w-4 text-red-500 mt-0.5" />
            <p className="text-sm">
              Remember to balance your meals with proteins, vegetables, and healthy fats for optimal nutrition.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodSuggestions;
