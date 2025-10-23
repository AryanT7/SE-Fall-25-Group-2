import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Clock, MapPin, Star, RotateCcw, Package } from 'lucide-react';
import { User } from '../../api/types';
import { toast } from 'sonner';
import { getMyOrders, cancelOrder as cancelOrderApi } from '../../api/orders';

// Local Order interface for the component
interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: any[];
  totalAmount: number;
  totalCalories: number;
  status: string;
  createdAt: Date;
  pickupTime?: Date;
  paymentMethod: string;
  canCancelUntil?: Date;
}

interface OrderHistoryProps {
  user: User;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Fetch orders from API
    const fetchOrders = async () => {
      try {
        const response = await getMyOrders();
        if (response.data) {
          // Transform API orders to match component's expected format
          const transformedOrders: Order[] = response.data.map((order) => ({
            id: order.id.toString(),
            userId: user.id.toString(),
            restaurantId: order.cafe_id.toString(),
            items: [], // TODO: Fetch order items separately if needed
            totalAmount: order.total_price,
            totalCalories: order.total_calories,
            status: order.status.toLowerCase(),
            createdAt: new Date(order.created_at),
            paymentMethod: 'credit_card', // TODO: Get payment method from API
            canCancelUntil: new Date(order.can_cancel_until)
          }));
          setOrders(transformedOrders);
          setFilteredOrders(transformedOrders);
        } else if (response.error) {
          toast.error(`Failed to load orders: ${response.error}`);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      }
    };

    fetchOrders();
  }, [user.id]);

  useEffect(() => {
    let filtered = orders;
    
    switch (activeTab) {
      case 'active':
        filtered = orders.filter(order => 
          ['pending', 'accepted', 'preparing', 'ready'].includes(order.status)
        );
        break;
      case 'completed':
        filtered = orders.filter(order => order.status === 'completed');
        break;
      case 'cancelled':
        filtered = orders.filter(order => order.status === 'cancelled');
        break;
      default:
        filtered = orders;
    }

    setFilteredOrders(filtered);
  }, [orders, activeTab]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRestaurantName = (restaurantId: string) => {
    const restaurantNames: { [key: string]: string } = {
      'rest1': 'Pizza Palace',
      'rest2': 'Burger Hub',
      'rest3': 'Sushi Zen',
      'rest4': 'Taco Fiesta',
      'rest5': 'Green Garden',
      'rest6': 'Curry House'
    };
    return restaurantNames[restaurantId] || 'Restaurant';
  };

  const canCancelOrder = (order: Order) => {
    if (!order.canCancelUntil) return false;
    const now = Date.now();
    const cancelUntil = new Date(order.canCancelUntil).getTime();
    return now < cancelUntil && ['pending', 'accepted'].includes(order.status.toLowerCase());
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const response = await cancelOrderApi(parseInt(orderId));
      if (response.data) {
        // Update the order in the list
        const updatedOrders = orders.map(order => 
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        );
        setOrders(updatedOrders);
        toast.success('Order cancelled successfully');
      } else if (response.error) {
        toast.error(`Failed to cancel order: ${response.error}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const reorderItems = (order: Order) => {
    if (order.items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(order.items));
      toast.success('Items added to cart');
    } else {
      toast.error('Cannot reorder - no items found');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Order History</h1>
        <p className="text-muted-foreground">Track your past and current orders</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        {['all', 'active', 'completed', 'cancelled'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="space-y-4">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">No orders found</h3>
                      <p className="text-muted-foreground">
                        {tab === 'all' 
                          ? "You haven't placed any orders yet" 
                          : `No ${tab} orders`
                        }
                      </p>
                    </div>
                    {tab === 'all' && (
                      <Link to="/restaurants">
                        <Button>Start Ordering</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="flex items-center gap-2">
                            {getRestaurantName(order.restaurantId)}
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Order #{order.id} • {new Date(order.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${order.totalAmount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{order.totalCalories} cal</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Ordered {new Date(order.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {order.pickupTime && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>
                                Picked up {new Date(order.pickupTime).toLocaleTimeString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Link to={`/orders/${order.id}/track`}>
                            <Button variant="outline" size="sm">
                              Track Order
                            </Button>
                          </Link>
                          
                          {order.status === 'completed' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => reorderItems(order)}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Reorder
                              </Button>
                              <Link to={`/restaurants/${order.restaurantId}/review`}>
                                <Button variant="outline" size="sm">
                                  <Star className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </Link>
                            </>
                          )}
                          
                          {canCancelOrder(order) && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => cancelOrder(order.id)}
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>

                        {order.status === 'ready' && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800 font-medium">
                              🎉 Your order is ready for pickup!
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              Please collect your order from {getRestaurantName(order.restaurantId)}
                            </p>
                          </div>
                        )}

                        {order.status === 'preparing' && (
                          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-800 font-medium">
                              👨‍🍳 Your order is being prepared
                            </p>
                            <p className="text-xs text-orange-700 mt-1">
                              Estimated ready time: {new Date(new Date(order.createdAt).getTime() + 30 * 60 * 1000).toLocaleTimeString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default OrderHistory;