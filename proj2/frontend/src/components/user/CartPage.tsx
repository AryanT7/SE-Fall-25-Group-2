import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Minus, Search, Star, Clock, Leaf, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { cartApi } from '../../api/cart';

type Restaurant = {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  minimumOrder: number;
  image: string;
  ownerId: string;
};

type MenuItem = {
  id: string; // if using real backend items, this should be numeric string
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
};

type CartItem = {
  menuItem: {
    id: string;
    restaurantId: string;
    name: string;
    price: number;
    calories: number;
    image: string;
  };
  quantity: number;
  assignedTo?: string;
};

const getCartKey = (user?: { id?: string | number; email?: string | null }) =>
  `cart_${user?.id ?? user?.email ?? 'guest'}`;

const MenuPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [todayCalories, setTodayCalories] = useState(0);

  // Migrate legacy keys and load cart for current user
  useEffect(() => {
    const key = getCartKey({ id: (user as any)?.id, email: user?.email });

    // migrate legacy shared key
    const legacy = localStorage.getItem('cart');
    if (legacy && !localStorage.getItem(key)) localStorage.setItem(key, legacy);
    if (legacy) localStorage.removeItem('cart');

    // migrate guest cart
    const guest = localStorage.getItem('cart_guest');
    if (user && guest && !localStorage.getItem(key)) localStorage.setItem(key, guest);
    if (guest && user) localStorage.removeItem('cart_guest');

    const saved = localStorage.getItem(key);
    setCart(saved ? JSON.parse(saved) : []);
  }, [user]);

  // Load mock restaurant/menu (replace with real API as needed)
  useEffect(() => {
    if (!restaurantId) return;

    const mockRestaurant: Restaurant = {
      id: restaurantId,
      name: 'Pizza Palace',
      description: 'Authentic Italian pizzas with fresh ingredients',
      cuisine: 'Italian',
      rating: 4.8,
      deliveryTime: '25-35 min',
      minimumOrder: 15,
      image:
        'https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU5MDc1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      ownerId: '2',
    };

    const mockMenuItems: MenuItem[] = [
      {
        id: '1',
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
        image:
          'https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhwaXp6YSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU5MDc1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      },
      {
        id: '2',
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
        image:
          'https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhwaXp6YSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU5MDc1NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      },
      {
        id: '3',
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
        image:
          'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhzYWxhZCUyMGhlYWx0aHklMjBmb29kfGVufDF8fHx8MTc1OTA4MDI3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      },
      {
        id: '4',
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
        image:
          'https://images.unsplash.com/photo-1749169337822-d875fd6f4c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhwYXN0YSUyMGl0YWxpYW4lMjBmb29kfGVufDF8fHx8MTc1OTAwNjg5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      },
      {
        id: '5',
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
        image:
          'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      },
      {
        id: '6',
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
        image:
          'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZHxlbnwxfHx8fDE3NTkxMDQ1NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      },
    ];

    setRestaurant(mockRestaurant);
    setMenuItems(mockMenuItems);

    // today's calories example
    const orders = localStorage.getItem('orders');
    if (orders) {
      const parsedOrders = JSON.parse(orders);
      const today = new Date().toDateString();
      const todayOrders = parsedOrders.filter(
        (order: any) => new Date(order.createdAt).toDateString() === today
      );
      const totalCalories = todayOrders.reduce(
        (sum: number, order: any) => sum + (order.totalCalories || 0),
        0
      );
      setTodayCalories(totalCalories);
    }
  }, [restaurantId]);

  // Filtering
  useEffect(() => {
    let filtered = menuItems;

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.ingredients.some((ing) =>
            ing.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }
    setFilteredItems(filtered);
  }, [menuItems, searchQuery, selectedCategory]);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(menuItems.map((i) => i.category)))],
    [menuItems]
  );

  // Persist local cart per-user
  const persistCart = (next: CartItem[]) => {
    const key = getCartKey({ id: (user as any)?.id, email: user?.email });
    localStorage.setItem(key, JSON.stringify(next));
    setCart(next);
  };

  // Best-effort sync for adds
  const addToBackend = async (menuItem: MenuItem) => {
    try {
      if (!user) return;
      // Only sync when id looks numeric and backend likely recognizes it
      if (!/^\d+$/.test(menuItem.id)) return;
      await cartApi.addToCart({
        item_id: Number(menuItem.id),
        quantity: 1,
        assignee_email: user.email || undefined,
      } as any);
    } catch {
      // ignore backend sync errors
    }
  };

  const getItemQuantityInCart = (itemId: string) => {
    const ci = cart.find((c) => c.menuItem.id === itemId);
    return ci ? ci.quantity : 0;
  };

  const addToCart = (menuItem: MenuItem) => {
    const idx = cart.findIndex((c) => c.menuItem.id === menuItem.id);
    let next: CartItem[];
    if (idx > -1) {
      next = [...cart];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
    } else {
      next = [...cart, { menuItem: { id: menuItem.id, restaurantId: restaurantId!, name: menuItem.name, price: menuItem.price, calories: menuItem.calories, image: menuItem.image }, quantity: 1 }];
    }
    persistCart(next);
    addToBackend(menuItem);
    toast.success(`${menuItem.name} added to cart`);
  };

  const removeFromCart = (itemId: string) => {
    const idx = cart.findIndex((c) => c.menuItem.id === itemId);
    if (idx === -1) return;
    const next = [...cart];
    if (next[idx].quantity > 1) {
      next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
    } else {
      next.splice(idx, 1);
    }
    persistCart(next);
    // Note: backend lacks decrement/remove; we keep local-only for now
  };

  const getTotalCartItems = () => cart.reduce((t, i) => t + i.quantity, 0);

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Restaurant Header */}
      <div className="relative">
        <div className="aspect-[3/1] relative rounded-lg overflow-hidden">
          <ImageWithFallback src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
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

      {/* Search and actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search menu items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Button variant={showSuggestions ? 'default' : 'outline'} onClick={() => setShowSuggestions(!showSuggestions)} className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          {showSuggestions ? 'Hide' : 'Show'} AI Suggestions
        </Button>
        {getTotalCartItems() > 0 && (
          <Link to="/cart">
            <Button className="flex items-center gap-2">View Cart ({getTotalCartItems()})</Button>
          </Link>
        )}
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <TabsTrigger key={c} value={c} className="text-xs">
              {c === 'all' ? 'All' : c}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items found</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredItems.map((item) => {
                const q = getItemQuantityInCart(item.id);
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0">
                        <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
                          <CardDescription className="text-sm">{item.description}</CardDescription>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-semibold text-lg">${item.price}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.calories} cal • {item.servings} serving{item.servings > 1 ? 's' : ''}
                              </p>
                            </div>
                            {q === 0 ? (
                              <Button onClick={() => addToCart(item)} size="sm" className="ml-2">
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => removeFromCart(item.id)}>
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">{q}</span>
                                <Button size="sm" onClick={() => addToCart(item)}>
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
      </Tabs>

      {/* Minimum Order Warning */}
      {cart.length > 0 && restaurant && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm">
                Minimum order: ${restaurant.minimumOrder}
                {cart.reduce((t, i) => t + i.menuItem.price * i.quantity, 0) < restaurant.minimumOrder && (
                  <span className="text-amber-700 ml-1">
                    - Add ${(restaurant.minimumOrder - cart.reduce((t, i) => t + i.menuItem.price * i.quantity, 0)).toFixed(2)} more
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