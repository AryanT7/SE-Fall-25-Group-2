import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Minus, Search, Star, Clock, Leaf, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';
import { Restaurant, MenuItem, CartItem, User } from '../../App';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import FoodSuggestions from './FoodSuggestions';

const MenuPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [todayCalories, setTodayCalories] = useState(0);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Load user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Calculate today's calories from orders
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
  }, []);

  useEffect(() => {
    if (!restaurantId) return;

    // Mock restaurant data
    const mockRestaurant: Restaurant = {
      id: restaurantId,
      name: restaurantId === 'rest1' ? 'Pizza Palace' : 'Restaurant',
      description: 'Authentic Italian pizzas with fresh ingredients',
      cuisine: 'Italian',
      rating: 4.8,
      deliveryTime: '25-35 min',
      minimumOrder: 15,
      image: 'https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU5MDc1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      ownerId: '2'
    };

    const mockMenuItems: MenuItem[] = [
      {
        id: 'item1',
        restaurantId: restaurantId,
        name: 'Margherita Pizza',
        description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
        price: 16.99,
        calories: 720,
        ingredients: ['Mozzarella', 'Tomato Sauce', 'Basil', 'Olive Oil'],
        category: 'Pizza',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhwaXp6YSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU5MDc1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'item2',
        restaurantId: restaurantId,
        name: 'Pepperoni Pizza',
        description: 'Spicy pepperoni with mozzarella cheese and tomato sauce',
        price: 19.99,
        calories: 890,
        ingredients: ['Pepperoni', 'Mozzarella', 'Tomato Sauce'],
        category: 'Pizza',
        isVegetarian: false,
        isNonVeg: true,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhwaXp6YSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU5MDc1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'item3',
        restaurantId: restaurantId,
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan, croutons, and caesar dressing',
        price: 12.99,
        calories: 320,
        ingredients: ['Romaine Lettuce', 'Parmesan', 'Croutons', 'Caesar Dressing'],
        category: 'Salads',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhzYWxhZCUyMGhlYWx0aHklMjBmb29kfGVufDF8fHx8MTc1OTA4MDI3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'item4',
        restaurantId: restaurantId,
        name: 'Spaghetti Carbonara',
        description: 'Creamy pasta with bacon, eggs, and parmesan cheese',
        price: 18.99,
        calories: 650,
        ingredients: ['Spaghetti', 'Bacon', 'Eggs', 'Parmesan', 'Cream'],
        category: 'Pasta',
        isVegetarian: false,
        isNonVeg: true,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1749169337822-d875fd6f4c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhwYXN0YSUyMGl0YWxpYW4lMjBmb29kfGVufDF8fHx8MTc1OTAwNjg5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'item5',
        restaurantId: restaurantId,
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter and herbs',
        price: 6.99,
        calories: 240,
        ingredients: ['Bread', 'Garlic', 'Butter', 'Herbs'],
        category: 'Appetizers',
        isVegetarian: true,
        isNonVeg: false,
        servings: 4,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      },
      {
        id: 'item6',
        restaurantId: restaurantId,
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee and mascarpone',
        price: 8.99,
        calories: 450,
        ingredients: ['Mascarpone', 'Coffee', 'Ladyfingers', 'Cocoa'],
        category: 'Desserts',
        isVegetarian: true,
        isNonVeg: false,
        servings: 1,
        image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      }
    ];

    setRestaurant(mockRestaurant);
    setMenuItems(mockMenuItems);
  }, [restaurantId]);

  useEffect(() => {
    let filtered = menuItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [menuItems, searchQuery, selectedCategory]);

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const getItemQuantityInCart = (itemId: string): number => {
    const cartItem = cart.find(item => item.menuItem.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const addToCart = (menuItem: MenuItem) => {
    const existingItemIndex = cart.findIndex(item => item.menuItem.id === menuItem.id);
    let newCart;

    if (existingItemIndex > -1) {
      newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
    } else {
      newCart = [...cart, { menuItem, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success(`${menuItem.name} added to cart`);
  };

  const removeFromCart = (itemId: string) => {
    const existingItemIndex = cart.findIndex(item => item.menuItem.id === itemId);
    if (existingItemIndex === -1) return;

    let newCart = [...cart];
    if (newCart[existingItemIndex].quantity > 1) {
      newCart[existingItemIndex].quantity -= 1;
    } else {
      newCart.splice(existingItemIndex, 1);
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Restaurant Header */}
      <div className="relative">
        <div className="aspect-[3/1] relative rounded-lg overflow-hidden">
          <ImageWithFallback
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="text-lg opacity-90">{restaurant.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span>{restaurant.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-5 w-5" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <Badge variant="secondary">{restaurant.cuisine}</Badge>
              <Link to={`/restaurant/${restaurantId}/reviews`}>
                <Button variant="secondary" size="sm" className="gap-1">
                  <MessageSquare className="h-4 w-4" />
                  Reviews
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showSuggestions ? "default" : "outline"}
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {showSuggestions ? 'Hide' : 'Show'} AI Suggestions
        </Button>
        {getTotalCartItems() > 0 && (
          <Link to="/cart">
            <Button className="flex items-center gap-2">
              View Cart ({getTotalCartItems()})
            </Button>
          </Link>
        )}
      </div>

      {/* AI Food Suggestions */}
      {showSuggestions && user && (
        <FoodSuggestions
          user={user}
          menuItems={menuItems}
          currentCaloriesToday={todayCalories}
          onAddToCart={addToCart}
        />
      )}

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category === 'all' ? 'All' : category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-6">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No items found in this category</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredItems.map((item) => {
                  const quantityInCart = getItemQuantityInCart(item.id);
                  
                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0">
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4">
                          <CardHeader className="p-0 space-y-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                              <div className="flex gap-1">
                                {item.isVegetarian && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    <Leaf className="h-3 w-3 mr-1" />
                                    Veg
                                  </Badge>
                                )}
                                {item.isNonVeg && (
                                  <Badge variant="outline" className="text-red-600 border-red-600">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Non-Veg
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <CardDescription className="text-sm">
                              {item.description}
                            </CardDescription>
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="font-semibold text-lg">${item.price}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.calories} cal • {item.servings} serving{item.servings > 1 ? 's' : ''}
                                </p>
                              </div>
                              
                              {quantityInCart === 0 ? (
                                <Button
                                  onClick={() => addToCart(item)}
                                  size="sm"
                                  className="ml-2"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center font-medium">
                                    {quantityInCart}
                                  </span>
                                  <Button
                                    size="sm"
                                    onClick={() => addToCart(item)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardHeader>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Minimum Order Warning */}
      {cart.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm">
                Minimum order: ${restaurant.minimumOrder}
                {cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0) < restaurant.minimumOrder && (
                  <span className="text-amber-700 ml-1">
                    - Add ${(restaurant.minimumOrder - cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0)).toFixed(2)} more
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MenuPage;