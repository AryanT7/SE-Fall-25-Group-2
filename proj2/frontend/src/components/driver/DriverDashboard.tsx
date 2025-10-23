import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Truck, MapPin } from 'lucide-react';

import { User, Order } from '../../api/types';
import { driversApi } from '../../api/drivers';

interface DriverDashboardProps {
  user: User;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await driversApi.getAssignedOrders(user.id);
      if (res.error) {
        setError(res.error);
        setOrders([]);
      } else {
        setOrders(res.data || []);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load assigned orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (!user) return;
    (async () => {
      await fetchAssigned();
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handlePickup = async (orderId: number) => {
    try {
      setLoading(true);
      const res = await driversApi.pickupOrder(user.id, orderId);
      if (res.error) setError(res.error);
      await fetchAssigned();
    } catch (e: any) {
      setError(e?.message || 'Failed to pickup order');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliver = async (orderId: number) => {
    try {
      setLoading(true);
      const res = await driversApi.deliverOrder(user.id, orderId);
      if (res.error) setError(res.error);
      await fetchAssigned();
    } catch (e: any) {
      setError(e?.message || 'Failed to mark order delivered');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Driver Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name?.split(' ')[0] || 'driver'} — here are your assigned orders.</p>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Assigned Orders</CardTitle>
            <CardDescription>Orders assigned to you for pickup and delivery</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <Link to="/driver/dashboard">
              <Button variant="outline" size="sm">Refresh</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading assigned orders…</div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">Order #{order.id}</h4>
                      <Badge variant={order.status === 'DELIVERED' || order.status === 'PICKED_UP' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Cafe: {order.cafe_name || order.cafe_id}</p>
                    {order.created_at && (
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {order.status === 'READY' && (
                      <Button onClick={() => handlePickup(order.id)} size="sm">Pickup</Button>
                    )}
                    {order.status === 'PICKED_UP' && (
                      <Button onClick={() => handleDeliver(order.id)} size="sm">Deliver</Button>
                    )}
                    {order.status !== 'READY' && order.status !== 'PICKED_UP' && (
                      <Button variant="ghost" size="sm" disabled>
                        <MapPin className="mr-2" /> Track
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverDashboard;
