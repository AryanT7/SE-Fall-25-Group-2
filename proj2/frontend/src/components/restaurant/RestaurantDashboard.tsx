import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Bell, ChefHat, DollarSign, Package, TrendingUp, Clock, Users } from 'lucide-react';
import { User } from '../../api/types';

interface RestaurantDashboardProps {
  user: User;
}

const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({ user }) => {
  const navigate = useNavigate();

  // Static mock stats
  const stats = {
    todayRevenue: 120.5,
    todayOrders: 6,
    avgOrderValue: 20.08,
    pendingOrders: 2
  };

  // Static mock recent orders
  const recentOrders = [
    { id: 101, status: 'pending', totalAmount: 25.5, createdAt: new Date().toISOString() },
    { id: 102, status: 'preparing', totalAmount: 18.0, createdAt: new Date().toISOString() },
  ];

  // Quick actions
  const quickActions = [
    { title: 'Manage Menu', description: 'Add, edit, or remove menu items', icon: ChefHat, href: '/restaurant/menu', color: 'bg-blue-50 text-blue-600' },
    { title: 'View Orders', description: 'Manage incoming orders', icon: Package, href: '/restaurant/orders', color: 'bg-green-50 text-green-600' },
    { title: 'Staff Management', description: 'Manage staff accounts', icon: Users, href: '/restaurant/staff', color: 'bg-purple-50 text-purple-600' },
    { title: 'Analytics', description: 'View performance reports', icon: TrendingUp, href: '/restaurant/analytics', color: 'bg-orange-50 text-orange-600' },
    { title: 'Review Insights', description: 'AI-powered feedback analysis', icon: Bell, href: '/restaurant/reviews', color: 'bg-pink-50 text-pink-600' }
  ];

  // Status badge helper
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700';
      case 'preparing': return 'bg-orange-50 text-orange-700';
      case 'ready': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Here's what's happening today.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingOrders} pending orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+5.2% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Latest orders requiring your attention</CardDescription>
          </div>
          <Link to="/restaurant/orders">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No recent orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Order #{order.id}</h4>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${order.totalAmount.toFixed(2)} • {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'pending' && <Button size="sm">Accept</Button>}
                    {order.status === 'preparing' && <Button size="sm" variant="outline">Mark Ready</Button>}
                    <Link to={`/restaurant/orders`}><Button variant="ghost" size="sm">View</Button></Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <Card
              key={action.href}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(action.href)}
            >
              <CardHeader className="space-y-4">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Restaurant Hours</p>
                <p className="text-sm text-muted-foreground">Open: 11:00 AM - 10:00 PM</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">Open Now</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 border rounded-lg">
                <p className="font-medium text-sm">Peak Hours</p>
                <p className="text-xs text-muted-foreground">12:00 PM - 2:00 PM, 6:00 PM - 8:00 PM</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="font-medium text-sm">Staff on Duty</p>
                <p className="text-xs text-muted-foreground">3 kitchen staff, 2 front desk</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantDashboard;

















// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { Button } from '../ui/button';
// import { Badge } from '../ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
// import { 
//   TrendingUp, 
//   DollarSign, 
//   Clock, 
//   Users, 
//   ChefHat, 
//   Bell,
//   Calendar,
//   Package
// } from 'lucide-react';
// import { User, Order } from '../../api/types';

// interface RestaurantDashboardProps {
//   user: User;
// }

// const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({ user }) => {
//   const [todayOrders, setTodayOrders] = useState<Order[]>([]);
//   const [recentOrders, setRecentOrders] = useState<Order[]>([]);
//   const [stats, setStats] = useState({
//     todayRevenue: 0,
//     todayOrders: 0,
//     avgOrderValue: 0,
//     pendingOrders: 0
//   });

//   // useEffect(() => {
//   //   // Mock data for restaurant dashboard
//   //   const mockOrders: Order[] = [
//   //     {
//   //       id: '1',
//   //       userId: 'user1',
//   //       restaurantId: user.restaurantId || 'rest1',
//   //       items: [],
//   //       totalAmount: 25.99,
//   //       totalCalories: 850,
//   //       status: 'pending',
//   //       createdAt: new Date(Date.now() - 5 * 60 * 1000),
//   //       paymentMethod: 'credit_card'
//   //     },
//   //     {
//   //       id: '2',
//   //       userId: 'user2',
//   //       restaurantId: user.restaurantId || 'rest1',
//   //       items: [],
//   //       totalAmount: 18.50,
//   //       totalCalories: 720,
//   //       status: 'preparing',
//   //       createdAt: new Date(Date.now() - 15 * 60 * 1000),
//   //       paymentMethod: 'debit_card'
//   //     },
//   //     {
//   //       id: '3',
//   //       userId: 'user3',
//   //       restaurantId: user.restaurantId || 'rest1',
//   //       items: [],
//   //       totalAmount: 32.75,
//   //       totalCalories: 950,
//   //       status: 'ready',
//   //       createdAt: new Date(Date.now() - 25 * 60 * 1000),
//   //       paymentMethod: 'credit_card'
//   //     },
//   //     {
//   //       id: '4',
//   //       userId: 'user4',
//   //       restaurantId: user.restaurantId || 'rest1',
//   //       items: [],
//   //       totalAmount: 45.20,
//   //       totalCalories: 1200,
//   //       status: 'completed',
//   //       createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
//   //       paymentMethod: 'cash'
//   //     }
//   //   ];

//   //   setTodayOrders(mockOrders);
//   //   setRecentOrders(mockOrders.slice(0, 3));

//   //   // Calculate stats
//   //   const todayRevenue = mockOrders
//   //     .filter(order => order.status === 'completed')
//   //     .reduce((sum, order) => sum + order.totalAmount, 0);
    
//   //   const pendingOrders = mockOrders.filter(order => 
//   //     ['pending', 'accepted', 'preparing'].includes(order.status)
//   //   ).length;

//   //   setStats({
//   //     todayRevenue,
//   //     todayOrders: mockOrders.length,
//   //     avgOrderValue: todayRevenue / Math.max(mockOrders.filter(o => o.status === 'completed').length, 1),
//   //     pendingOrders
//   //   });
//   // }, [user.restaurantId]);

//   // const getStatusColor = (status: Order['status']) => {
//   //   switch (status) {
//   //     case 'pending':
//   //       return 'bg-yellow-100 text-yellow-800';
//   //     case 'accepted':
//   //       return 'bg-blue-100 text-blue-800';
//   //     case 'preparing':
//   //       return 'bg-orange-100 text-orange-800';
//   //     case 'ready':
//   //       return 'bg-green-100 text-green-800';
//   //     case 'completed':
//   //       return 'bg-gray-100 text-gray-800';
//   //     case 'cancelled':
//   //       return 'bg-red-100 text-red-800';
//   //     default:
//   //       return 'bg-gray-100 text-gray-800';
//   //   }
//   // };

//   const quickActions = [
//     {
//       title: 'Manage Menu',
//       description: 'Add, edit, or remove menu items',
//       icon: ChefHat,
//       href: '/restaurant/menu',
//       color: 'bg-blue-50 text-blue-600'
//     },
//     {
//       title: 'View Orders',
//       description: 'Manage incoming orders',
//       icon: Package,
//       href: '/restaurant/orders',
//       color: 'bg-green-50 text-green-600'
//     },
//     {
//       title: 'Staff Management',
//       description: 'Manage staff accounts',
//       icon: Users,
//       href: '/restaurant/staff',
//       color: 'bg-purple-50 text-purple-600'
//     },
//     {
//       title: 'Analytics',
//       description: 'View performance reports',
//       icon: TrendingUp,
//       href: '/restaurant/analytics',
//       color: 'bg-orange-50 text-orange-600'
//     },
//     {
//       title: 'Review Insights',
//       description: 'AI-powered feedback analysis',
//       icon: Bell,
//       href: '/restaurant/reviews',
//       color: 'bg-pink-50 text-pink-600'
//     }
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col space-y-2">
//         <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
//         <p className="text-muted-foreground">
//           Welcome back, {user.name}! Here's what's happening today.
//         </p>
//       </div>

//       {/* Stats Overview */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">${stats.todayRevenue.toFixed(2)}</div>
//             <p className="text-xs text-muted-foreground">
//               +20.1% from yesterday
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
//             <Package className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.todayOrders}</div>
//             <p className="text-xs text-muted-foreground">
//               {stats.pendingOrders} pending orders
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">${stats.avgOrderValue.toFixed(2)}</div>
//             <p className="text-xs text-muted-foreground">
//               +5.2% from last week
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
//             <Clock className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.pendingOrders}</div>
//             <p className="text-xs text-muted-foreground">
//               Need attention
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Orders */}
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <div>
//             <CardTitle className="flex items-center gap-2">
//               <Bell className="h-5 w-5" />
//               Recent Orders
//             </CardTitle>
//             <CardDescription>Latest orders requiring your attention</CardDescription>
//           </div>
//           <Link to="/restaurant/orders">
//             <Button variant="outline" size="sm">View All</Button>
//           </Link>
//         </CardHeader>
//         <CardContent>
//           {recentOrders.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="text-muted-foreground">No recent orders</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {recentOrders.map((order) => (
//                 <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2">
//                       <h4 className="font-medium">Order #{order.id}</h4>
//                       <Badge className={getStatusColor(order.status)}>
//                         {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//                       </Badge>
//                     </div>
//                     <p className="text-sm text-muted-foreground">
//                       ${order.totalAmount.toFixed(2)} • {new Date(order.createdAt).toLocaleTimeString()}
//                     </p>
//                   </div>
//                   <div className="flex gap-2">
//                     {order.status === 'pending' && (
//                       <Button size="sm">Accept</Button>
//                     )}
//                     {order.status === 'preparing' && (
//                       <Button size="sm" variant="outline">Mark Ready</Button>
//                     )}
//                     <Link to={`/restaurant/orders`}>
//                       <Button variant="ghost" size="sm">View</Button>
//                     </Link>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Quick Actions */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         {quickActions.map((action) => {
//           const Icon = action.icon;
//           return (
//             <Link key={action.href} to={action.href}>
//               <Card className="hover:shadow-md transition-shadow cursor-pointer">
//                 <CardHeader className="space-y-4">
//                   <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
//                     <Icon className="h-6 w-6" />
//                   </div>
//                   <div className="space-y-1">
//                     <CardTitle className="text-lg">{action.title}</CardTitle>
//                     <CardDescription>{action.description}</CardDescription>
//                   </div>
//                 </CardHeader>
//               </Card>
//             </Link>
//           );
//         })}
//       </div>

//       {/* Today's Schedule */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Calendar className="h-5 w-5" />
//             Today's Schedule
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
//               <div>
//                 <p className="font-medium">Restaurant Hours</p>
//                 <p className="text-sm text-muted-foreground">Open: 11:00 AM - 10:00 PM</p>
//               </div>
//               <Badge variant="outline" className="bg-green-50 text-green-700">
//                 Open Now
//               </Badge>
//             </div>
            
//             <div className="grid gap-3 md:grid-cols-2">
//               <div className="p-3 border rounded-lg">
//                 <p className="font-medium text-sm">Peak Hours</p>
//                 <p className="text-xs text-muted-foreground">12:00 PM - 2:00 PM, 6:00 PM - 8:00 PM</p>
//               </div>
//               <div className="p-3 border rounded-lg">
//                 <p className="font-medium text-sm">Staff on Duty</p>
//                 <p className="text-xs text-muted-foreground">3 kitchen staff, 2 front desk</p>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default RestaurantDashboard;