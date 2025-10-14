import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { User } from '../../App';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for demo
  const mockUsers = [
    {
      id: '1',
      email: 'customer@demo.com',
      name: 'John Customer',
      type: 'customer' as const,
      height: 180,
      weight: 75,
      calorieGoal: 2200,
      goalType: 'daily' as const
    },
    {
      id: '2',
      email: 'restaurant@demo.com',
      name: 'Pizza Palace',
      type: 'restaurant_owner' as const,
      restaurantId: 'rest1'
    },
    {
      id: '3',
      email: 'staff@demo.com',
      name: 'Sarah Staff',
      type: 'staff' as const,
      restaurantId: 'rest1'
    }
  ];

  const handleLogin = async (e: React.FormEvent, userType: 'customer' | 'restaurant') => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find mock user
    const user = mockUsers.find(u => 
      u.email === email && 
      (userType === 'customer' ? u.type === 'customer' : u.type !== 'customer')
    );

    if (user) {
      onLogin(user);
      toast.success('Login successful!');
    } else {
      toast.error('Invalid credentials');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = (userType: 'customer' | 'restaurant' | 'staff') => {
    const user = mockUsers.find(u => u.type === userType);
    if (user) {
      onLogin(user);
      toast.success(`Logged in as ${userType}!`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Welcome to FoodApp</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer" className="space-y-4">
              <form onSubmit={(e) => handleLogin(e, 'customer')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-password">Password</Label>
                  <Input
                    id="customer-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDemoLogin('customer')}
                >
                  Try Customer Demo
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="restaurant" className="space-y-4">
              <form onSubmit={(e) => handleLogin(e, 'restaurant')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-email">Email</Label>
                  <Input
                    id="restaurant-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurant-password">Password</Label>
                  <Input
                    id="restaurant-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDemoLogin('restaurant')}
                >
                  Try Restaurant Demo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDemoLogin('staff')}
                >
                  Try Staff Demo
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground">
              Customer: customer@demo.com<br/>
              Restaurant: restaurant@demo.com<br/>
              Staff: staff@demo.com<br/>
              Password: any
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;