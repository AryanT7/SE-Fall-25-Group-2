import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Clock,
  Star,
  Calendar,
  BarChart3
} from 'lucide-react';
import { User } from '../../App';

interface AnalyticsData {
  revenue: { current: number; previous: number; change: number };
  orders: { current: number; previous: number; change: number };
  avgOrderValue: { current: number; previous: number; change: number };
  customers: { current: number; previous: number; change: number };
}

interface PopularItem {
  name: string;
  orders: number;
  revenue: number;
  category: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

interface AnalyticsProps {
  user: User;
}

const Analytics: React.FC<AnalyticsProps> = ({ user }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  useEffect(() => {
    // Mock analytics data
    const mockAnalytics: AnalyticsData = {
      revenue: { current: 2847.50, previous: 2234.20, change: 27.4 },
      orders: { current: 156, previous: 134, change: 16.4 },
      avgOrderValue: { current: 18.25, previous: 16.67, change: 9.5 },
      customers: { current: 89, previous: 76, change: 17.1 }
    };

    const mockPopularItems: PopularItem[] = [
      { name: 'Margherita Pizza', orders: 45, revenue: 764.55, category: 'Pizza' },
      { name: 'Caesar Salad', orders: 32, revenue: 415.68, category: 'Salads' },
      { name: 'Pepperoni Pizza', orders: 28, revenue: 559.72, category: 'Pizza' },
      { name: 'Garlic Bread', orders: 24, revenue: 167.76, category: 'Appetizers' },
      { name: 'Tiramisu', orders: 18, revenue: 161.82, category: 'Desserts' }
    ];

    // Mock revenue data for chart
    const mockRevenueData: RevenueData[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      mockRevenueData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 500) + 300,
        orders: Math.floor(Math.random() * 30) + 15
      });
    }

    setAnalytics(mockAnalytics);
    setPopularItems(mockPopularItems);
    setRevenueData(mockRevenueData);
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? '↗' : '↘';
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your restaurant's performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.current)}</div>
            <p className={`text-xs ${getChangeColor(analytics.revenue.change)}`}>
              {getChangeIcon(analytics.revenue.change)} {formatPercentage(analytics.revenue.change)} from last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.orders.current}</div>
            <p className={`text-xs ${getChangeColor(analytics.orders.change)}`}>
              {getChangeIcon(analytics.orders.change)} {formatPercentage(analytics.orders.change)} from last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.avgOrderValue.current)}</div>
            <p className={`text-xs ${getChangeColor(analytics.avgOrderValue.change)}`}>
              {getChangeIcon(analytics.avgOrderValue.change)} {formatPercentage(analytics.avgOrderValue.change)} from last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.customers.current}</div>
            <p className={`text-xs ${getChangeColor(analytics.customers.change)}`}>
              {getChangeIcon(analytics.customers.change)} {formatPercentage(analytics.customers.change)} from last {timeRange}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="popular">Popular Items</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Daily Revenue
                </CardTitle>
                <CardDescription>Revenue trend over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.map((data, index) => {
                    const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
                    const percentage = (data.revenue / maxRevenue) * 100;
                    const date = new Date(data.date);
                    
                    return (
                      <div key={data.date} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span className="font-medium">{formatCurrency(data.revenue)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {data.orders} orders
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
                <CardDescription>Current order status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'Completed', count: 142, color: 'bg-green-500' },
                    { status: 'Preparing', count: 8, color: 'bg-orange-500' },
                    { status: 'Ready', count: 4, color: 'bg-blue-500' },
                    { status: 'Pending', count: 2, color: 'bg-yellow-500' }
                  ].map((item) => {
                    const total = 156; // Total from analytics
                    const percentage = (item.count / total) * 100;
                    
                    return (
                      <div key={item.status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.status}</span>
                          <span className="font-medium">{item.count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`${item.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Peak Hours Analysis
              </CardTitle>
              <CardDescription>Busiest times during the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Lunch Rush</h4>
                  <p className="text-2xl font-bold">12:00 - 2:00 PM</p>
                  <p className="text-sm text-muted-foreground">42% of daily orders</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Dinner Peak</h4>
                  <p className="text-2xl font-bold">6:00 - 8:00 PM</p>
                  <p className="text-sm text-muted-foreground">38% of daily orders</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Off Hours</h4>
                  <p className="text-2xl font-bold">3:00 - 5:00 PM</p>
                  <p className="text-sm text-muted-foreground">20% of daily orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Items</CardTitle>
              <CardDescription>Top performing menu items this {timeRange}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.orders} orders
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.revenue)}</p>
                      <p className="text-sm text-muted-foreground">total revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Revenue breakdown by menu category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { category: 'Pizza', revenue: 1324.27, orders: 73, percentage: 46.5 },
                  { category: 'Salads', revenue: 623.45, orders: 48, percentage: 21.9 },
                  { category: 'Appetizers', revenue: 456.78, orders: 35, percentage: 16.0 },
                  { category: 'Desserts', revenue: 443.00, orders: 28, percentage: 15.6 }
                ].map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(category.revenue)}</span>
                      <span>{category.orders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Customer Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Customer Satisfaction
                </CardTitle>
                <CardDescription>Average ratings and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">4.8</div>
                    <div className="flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Based on 127 reviews</p>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { stars: 5, count: 89, percentage: 70 },
                      { stars: 4, count: 28, percentage: 22 },
                      { stars: 3, count: 7, percentage: 5 },
                      { stars: 2, count: 2, percentage: 2 },
                      { stars: 1, count: 1, percentage: 1 }
                    ].map((rating) => (
                      <div key={rating.stars} className="flex items-center gap-2 text-sm">
                        <span className="w-3">{rating.stars}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${rating.percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-right">{rating.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operational Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Operational Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Prep Time</span>
                    <span className="font-medium">18 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Accuracy</span>
                    <span className="font-medium text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>On-Time Pickup</span>
                    <span className="font-medium text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancellation Rate</span>
                    <span className="font-medium text-red-600">2.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Repeat Customers</span>
                    <span className="font-medium">67%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goals and Targets */}
          <Card>
            <CardHeader>
              <CardTitle>Goals & Targets</CardTitle>
              <CardDescription>Track progress towards your business objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Monthly Revenue Goal</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(8547)} / {formatCurrency(10000)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Customer Rating Goal</span>
                    <span className="text-sm text-green-600">Achieved</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    4.8 / 4.5 stars
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Order Volume Goal</span>
                    <span className="text-sm text-muted-foreground">78%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    468 / 600 orders
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;