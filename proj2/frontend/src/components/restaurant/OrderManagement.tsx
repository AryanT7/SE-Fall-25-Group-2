import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Clock, CheckCircle, XCircle, Filter, Search, Calendar, MapPin, RefreshCw } from 'lucide-react';
import { User, Order, OrderStatus } from '../../api/types';
import { ordersApi } from '../../api/orders';
import { toast } from 'sonner';

interface OrderManagementProps {
  user: User;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders
  // Fetch orders
const fetchOrders = async () => {
  if (!user?.cafe?.id) return;

  const cafeId = user.cafe.id;
  setLoading(true);
  setError(null);

  try {
    const { data, error } = await ordersApi.getCafeOrders(cafeId);

    if (error) {
      setError(error);
      toast.error('Failed to fetch orders');
      setOrders([]); // fallback
    } else if (data) {
      // ✅ Backend returns an array directly
      const orderArray = Array.isArray(data) ? data : [data];
      setOrders(orderArray);
      console.log('Fetched cafe orders:', orderArray);
    } else {
      setOrders([]);
    }
  } catch (err) {
    console.error('Error fetching orders:', err);
    setError('Failed to fetch orders');
    toast.error('Failed to fetch orders');
    setOrders([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchOrders();
  }, [user?.cafe?.id]);

  // Filter logic
  useEffect(() => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    // Time filter
    const now = new Date();
    if (timeFilter === 'today') {
      filtered = filtered.filter(o => new Date(o.created_at).toDateString() === now.toDateString());
    } else if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(o => new Date(o.created_at) >= weekAgo);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.id.toString().includes(query) ||
        o.status.toLowerCase().includes(query) ||
        o.total_price.toString().includes(query)
      );
    }



    setFilteredOrders(filtered);
  }, [orders, statusFilter, timeFilter, searchQuery]);

  // Update order status
  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const { data, error } = await ordersApi.updateOrderStatus(orderId, newStatus);
      if (error) {
        toast.error(error);
      } else if (data) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        toast.success(`Order #${orderId} status updated to ${newStatus}`);
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Stats
  const getStats = () => {
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const accepted = orders.filter(o => o.status === 'ACCEPTED').length;
    const ready = orders.filter(o => o.status === 'READY').length;
    const completed = orders.filter(o => o.status === 'PICKED_UP').length;
    return { pending, accepted, ready, completed };
  };

  const stats = getStats();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'READY': return 'bg-green-100 text-green-800 border-green-200';
      case 'PICKED_UP': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextActions = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return [
          { label: 'Accept', status: 'ACCEPTED' as OrderStatus },
          { label: 'Decline', status: 'DECLINED' as OrderStatus }
        ];
      case 'ACCEPTED':
        return [{ label: 'Mark Ready', status: 'READY' as OrderStatus }];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Manage incoming orders and track their progress</p>
        </div>
        <Button onClick={fetchOrders} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh Orders
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="flex justify-between"><CardTitle>Pending</CardTitle><Clock className="h-4 w-4 text-yellow-600"/></CardHeader><CardContent className="text-2xl font-bold text-yellow-600">{stats.pending}</CardContent></Card>
        <Card><CardHeader className="flex justify-between"><CardTitle>Accepted</CardTitle><CheckCircle className="h-4 w-4 text-blue-600"/></CardHeader><CardContent className="text-2xl font-bold text-blue-600">{stats.accepted}</CardContent></Card>
        <Card><CardHeader className="flex justify-between"><CardTitle>Ready</CardTitle><CheckCircle className="h-4 w-4 text-green-600"/></CardHeader><CardContent className="text-2xl font-bold text-green-600">{stats.ready}</CardContent></Card>
        <Card><CardHeader className="flex justify-between"><CardTitle>Completed</CardTitle><CheckCircle className="h-4 w-4 text-gray-600"/></CardHeader><CardContent className="text-2xl font-bold text-gray-600">{stats.completed}</CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="flex items-center gap-2"><Filter className="h-5 w-5"/>Filters</CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Input placeholder="Search by order or customer ID" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1"/>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="PICKED_UP">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={v => setTimeFilter(v as any)}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Time"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Orders list */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center py-12 text-gray-500">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No orders match your filters.</p>
        ) : filteredOrders.map(order => (
          <Card key={order.id}>
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CardTitle>Order #{order.id}</CardTitle>
                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              </div>
              <div>{new Date(order.created_at).toLocaleString()}</div>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              {getNextActions(order.status).map(action => (
                <Button key={action.label} size="sm" onClick={() => handleUpdateStatus(order.id, action.status)}>
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;
