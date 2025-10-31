// src/components/user/MenuPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Minus, Search, Star, Clock, Leaf, AlertCircle, MessageSquare } from 'lucide-react';
import { MenuItem, User } from '../../api/types';
import { getCafe } from '../../api/cafes';
import { cartApi } from '../../api/cart';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';

// -------------------------------
// Local types
// -------------------------------
type LocalCafe = {
  id: string | number;
  name: string;
  description?: string;
  cuisine?: string;
  rating?: number;
  deliveryTime?: string;
  minimumOrder?: number;
  image?: string;
  ownerId?: string | number;
};

type LocalCartItem = { menuItem: MenuItem; quantity: number };

const API_BASE = 'http://127.0.0.1:8000';

// Cart key per user
const getCartKey = (user?: { id?: string | number; email?: string | null }) =>
  `cart_${user?.id ?? user?.email ?? 'guest'}`;

function adaptApiMenuToMenuItems(raw: any[], cafeId: string | number): MenuItem[] {
  if (!Array.isArray(raw)) return [];
  const cafeIdStr = String(cafeId);
  return raw.map((i) => {
    const id = i.id ?? i.menu_item_id ?? Date.now() + Math.floor(Math.random() * 1000);
    const name = i.name ?? i.title ?? 'Item';
    const description = i.description ?? '';
    const price =
      typeof i.price === 'number'
        ? i.price
        : Number(String(i.price ?? '0').replace(/[^\d.]/g, '')) || 0;
    const calories =
      typeof i.calories === 'number'
        ? i.calories
        : Number(String(i.calories ?? '0').replace(/[^\d.]/g, '')) || 0;
    const category = i.category ?? 'Uncategorized';
    const ingredients = Array.isArray(i.ingredients)
      ? i.ingredients
      : typeof i.ingredients === 'string'
      ? i.ingredients.split(/,\s*/g)
      : [];
    const image = i.image ?? i.image_url ?? '';
    const item: MenuItem = {
      id,
      restaurantId: cafeIdStr,
      cafe_id: cafeIdStr,
      name,
      description,
      price,
      calories,
      category,
      ingredients,
      image,
      isVegetarian: !!(i.isVegetarian ?? i.vegetarian ?? i.is_vegetarian ?? false),
      active: i.active ?? true,
    };
    return item;
  });
}

async function fetchCafeMenu(cafeId: string): Promise<MenuItem[]> {
  try {
    const resp = await fetch(`${API_BASE}/cafes/${encodeURIComponent(cafeId)}/menu`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!resp.ok) return [];
    const data = await resp.json().catch(() => []);
    const items = Array.isArray(data) ? data : (data?.items ?? []);
    return adaptApiMenuToMenuItems(items, cafeId);
  } catch {
    return [];
  }
}

const MenuPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [cafe, setCafe] = useState<LocalCafe | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user and migrate cart
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }
  }, []);

  // Migrate legacy cart keys and load per-user cart
  useEffect(() => {
    const key = getCartKey({ id: (user as any)?.id, email: user?.email });

    // Migrate legacy 'cart' key
    const legacy = localStorage.getItem('cart');
    if (legacy && !localStorage.getItem(key)) {
      localStorage.setItem(key, legacy);
    }
    if (legacy) localStorage.removeItem('cart');

    // Migrate guest cart
    const guest = localStorage.getItem('cart_guest');
    if (user && guest && !localStorage.getItem(key)) {
      localStorage.setItem(key, guest);
    }
    if (guest && user) localStorage.removeItem('cart_guest');

    // Load cart
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {}
    }
  }, [user]);

  // Load cafe & menu
  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: cafeData } = await getCafe(Number(restaurantId));
        const stub: LocalCafe = cafeData
          ? (cafeData as unknown as LocalCafe)
          : {
              id: restaurantId,
              name: 'Restaurant',
              description: 'Fresh & tasty meals',
              cuisine: 'International',
              rating: 4.6,
              deliveryTime: '25-35 min',
              minimumOrder: 15,
              image: '',
              ownerId: '0',
            };
        if (!cancelled) setCafe(stub);

        const items = await fetchCafeMenu(restaurantId);
        if (!cancelled) {
          setMenuItems(items);
          if (items.length === 0) {
            toast.message('This restaurant has no published menu yet.');
          }
        }
      } catch {
        if (!cancelled) {
          toast.error('Failed to load restaurant or menu.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  // Search + filter
  useEffect(() => {
    let filtered = menuItems;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          ((item as any).ingredients || []).some((ing: string) => ing.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }
    setFilteredItems(filtered);
  }, [menuItems, searchQuery, selectedCategory]);

  const categories = ['all', ...Array.from(new Set(menuItems.map((item) => item.category)))];

  // Persist cart to localStorage
  const persistCart = (next: LocalCartItem[]) => {
    const key = getCartKey({ id: (user as any)?.id, email: user?.email });
    localStorage.setItem(key, JSON.stringify(next));
    setCart(next);
  };

  // Sync add to backend
  const addToBackend = async (menuItem: MenuItem, quantity: number = 1) => {
    try {
      if (!user) return;
      // Only sync if item id is numeric (backend expects integer)
      if (!/^\d+$/.test(String(menuItem.id))) return;
      await cartApi.addToCart({
        item_id: Number(menuItem.id),
        quantity,
        assignee_email: user.email || undefined,
      } as any);
    } catch (err) {
      console.warn('Backend cart sync failed:', err);
    }
  };

  const getItemQuantityInCart = (itemId: string | number): number => {
    const idStr = String(itemId);
    const ci = cart.find((c) => String(c.menuItem.id) === idStr);
    return ci ? ci.quantity : 0;
  };

  const addToCart = (menuItem: MenuItem) => {
    const idStr = String(menuItem.id);
    const idx = cart.findIndex((c) => String(c.menuItem.id) === idStr);
    let next: LocalCartItem[];
    if (idx > -1) {
      next = [...cart];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
    } else {
      next = [...cart, { menuItem, quantity: 1 }];
    }
    persistCart(next);
    addToBackend(menuItem, 1);
    toast.success(`${menuItem.name} added to cart`);
  };

  const removeFromCart = (itemId: string | number) => {
    const idStr = String(itemId);
    const idx = cart.findIndex((c) => String(c.menuItem.id) === idStr);
    if (idx === -1) return;
    const next = [...cart];
    if (next[idx].quantity > 1) {
      next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
    } else {
      next.splice(idx, 1);
    }
    persistCart(next);
    // Backend doesn't have decrement, so we skip backend sync on remove
  };

  const getTotalCartItems = () => cart.reduce((t, c) => t + c.quantity, 0);

  if (!cafe || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cafe Header */}
      <div className="relative">
        <div className="aspect-[3/1] relative rounded-lg overflow-hidden">
          <ImageWithFallback src={cafe.image} alt={cafe.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-3xl font-bold">{cafe.name}</h1>
            <p className="text-lg opacity-90">{cafe.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span>{cafe.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-5 w-5" />
                <span>{cafe.deliveryTime}</span>
              </div>
              <Badge variant="secondary">{cafe.cuisine}</Badge>
              {getTotalCartItems() > 0 && (
                <Link to="/cart">
                  <Button variant="secondary" size="sm" className="gap-1">
                    View Cart ({getTotalCartItems()})
                  </Button>
                </Link>
              )}
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

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {getTotalCartItems() > 0 && (
          <Link to="/cart">
            <Button className="flex items-center gap-2">View Cart ({getTotalCartItems()})</Button>
          </Link>
        )}
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {category === 'all' ? 'All' : category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No items found in this category</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredItems.map((item) => {
                const quantityInCart = getItemQuantityInCart(item.id as any);
                return (
                  <Card key={String(item.id)} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0">
                        <ImageWithFallback
                          src={(item as any).image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <CardHeader className="p-0 space-y-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                            <div className="flex gap-1">
                              {(item as any).isVegetarian && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <Leaf className="h-3 w-3 mr-1" />
                                  Veg
                                </Badge>
                              )}
                              {(item as any).isNonVeg && (
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
                              <p className="text-sm text-muted-foreground">{(item as any).calories} cal</p>
                            </div>
                            {quantityInCart === 0 ? (
                              <Button onClick={() => addToCart(item)} size="sm" className="ml-2">
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id as any)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">{quantityInCart}</span>
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
    </div>
  );
};

export default MenuPage;