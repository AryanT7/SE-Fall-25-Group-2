import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Search,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { User, Order } from '../../App';
import { toast } from 'sonner@2.0.3';

interface OrderManagementProps {
  user: User;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Mock orders data
    const mockOrders: Order[] = [
      {
        id: '1',
        userId: 'user1',
        restaurantId: user.restaurantId || 'rest1',
        items: [
          {
            menuItem: {
              id: 'item1',
              restaurantId: user.restaurantId || 'rest1',
              name: 'Margherita Pizza',
              description: 'Classic pizza with fresh mozzarella',
              price: 16.99,
              calories: 720,
              ingredients: ['Mozzarella', 'Tomato Sauce', 'Basil'],
              category: 'Pizza',
              isVegetarian: true,
              isNonVeg: false,
              servings: 1,
              image: ''
            },
            quantity: 1
          }
        ],
        totalAmount: 16.99,
        totalCalories: 720,
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
        paymentMethod: 'credit_card'
      },
      {
        id: '2',
        userId: 'user2',
        restaurantId: user.restaurantId || 'rest1',
        items: [
          {
            menuItem: {
              id: 'item2',
              restaurantId: user.restaurantId || 'rest1',
              name: 'Caesar Salad',
              description: 'Fresh romaine lettuce with parmesan',
              price: 12.99,
              calories: 320,
              ingredients: ['Romaine', 'Parmesan', 'Croutons'],
              category: 'Salads',
              isVegetarian: true,
              isNonVeg: false,
              servings: 1,
              image: ''
            },
            quantity: 2
          }
        ],
        totalAmount: 25.98,
        totalCalories: 640,
        status: 'preparing',
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
        paymentMethod: 'debit_card'
      },
      {
        id: '3',
        userId: 'user3',
        restaurantId: user.restaurantId || 'rest1',
        items: [],
        totalAmount: 32.75,
        totalCalories: 950,
        status: 'ready',
        createdAt: new Date(Date.now() - 25 * 60 * 1000),
        paymentMethod: 'credit_card'
      },
      {
        id: '4',
        userId: 'user4',
        restaurantId: user.restaurantId || 'rest1',
        items: [],
        totalAmount: 45.20,
        totalCalories: 1200,
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        pickupTime: new Date(Date.now() - 90 * 60 * 1000),
        paymentMethod: 'cash'
      }
    ];

    setOrders(mockOrders);
  }, [user.restaurantId]);

  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by time
    const now = new Date();
    if (timeFilter === 'today') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === now.toDateString();
      });
    } else if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(order => new Date(order.createdAt) >= weekAgo);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.id.includes(searchQuery) ||
        order.userId.includes(searchQuery)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, timeFilter, searchQuery]);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus,
            pickupTime: newStatus === 'completed' ? new Date() : order.pickupTime
          } 
        : order
    ));
    
    const statusMessages = {
      accepted: 'Order accepted',
      preparing: 'Order is being prepared',
      ready: 'Order is ready for pickup',
      completed: 'Order marked as completed',
      cancelled: 'Order cancelled'
    };
    
    toast.success(statusMessages[newStatus]);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextActions = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return [
          { label: 'Accept', status: 'accepted' as const, variant: 'default' as const },
          { label: 'Decline', status: 'cancelled' as const, variant: 'destructive' as const }
        ];
      case 'accepted':
        return [
          { label: 'Start Preparing', status: 'preparing' as const, variant: 'default' as const }
        ];
      case 'preparing':
        return [
          { label: 'Mark Ready', status: 'ready' as const, variant: 'default' as const }
        ];
      case 'ready':
        return [
          { label: 'Complete Order', status: 'completed' as const, variant: 'default' as const }
        ];
      default:
        return [];
    }
  };

  const getOrderStatistics = () => {
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const ready = orders.filter(o => o.status === 'ready').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    
    return { pending, preparing, ready, completed };
  };

  const stats = getOrderStatistics();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">Manage incoming orders and track their progress</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preparing</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.preparing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No orders found</h3>
              <p className="text-muted-foreground">
                {statusFilter === 'all' ? 'No orders match your current filters' : `No ${statusFilter} orders found`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle>Order #{order.id}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Customer ID: {order.userId}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{order.totalCalories} cal</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Order Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                          <div>
                            <span className="font-medium">{item.menuItem.name}</span>
                            <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                            {item.assignedTo && (
                              <span className="text-blue-600 ml-2">for {item.assignedTo}</span>
                            )}
                          </div>
                          <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Order Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order Time</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                  {order.pickupTime && (
                    <div>
                      <p className="text-muted-foreground">Pickup Time</p>
                      <p className="font-medium">{new Date(order.pickupTime).toLocaleTimeString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">ID: {order.userId}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {getNextActions(order.status).map((action) => (
                    <Button
                      key={action.label}
                      variant={action.variant}
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, action.status)}
                    >
                      {action.label}
                    </Button>
                  ))}
                  
                  {order.status === 'ready' && (
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-1" />
                      Call Customer
                    </Button>
                  )}
                </div>

                {/* Status-specific alerts */}
                {order.status === 'pending' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⏰ New order requires your attention
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Please accept or decline this order promptly
                    </p>
                  </div>
                )}

                {order.status === 'ready' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      🎉 Order is ready for pickup
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Customer should be notified to collect their order
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderManagement;