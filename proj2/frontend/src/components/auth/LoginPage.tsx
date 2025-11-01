import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'USER' | 'OWNER' | 'DRIVER'>('USER');
  const { user, login, isLoading, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const loggedInUser = await login({ 
      email, 
      password, 
      role: selectedRole 
    });
    
    if (loggedInUser) {
      toast.success('Login successful!');
      // ✅ Redirect after login
      const redirects: Record<string, string> = {
        USER: '/dashboard',
        OWNER: '/restaurant/dashboard',
        DRIVER: '/driver/dashboard',
        // ADMIN: '/admin/dashboard',
      };
      navigate(redirects[loggedInUser.role] || '/dashboard', { replace: true });
      // navigate(redirects[loggedInUser.role]);
    } else {
      toast.error(error || 'Login failed');
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    clearError();
    
    const loggedInUser = await login({ email: demoEmail, password: demoPassword });
    
    if (loggedInUser) {
      toast.success('Demo login successful!');
    } else {
      toast.error('Demo login failed');
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
        <Tabs defaultValue="customer" className="w-full" onValueChange={(value) => {
            const roleMap = {
              'customer': 'USER' as const,
              'restaurant': 'OWNER' as const,
              'driver': 'DRIVER' as const,
            };
            setSelectedRole(roleMap[value as keyof typeof roleMap]);
          }}>
          <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="driver">Driver</TabsTrigger> 
        </TabsList>
            
            <TabsContent value="customer" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
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
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              {/* <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDemoLogin('customer@demo.com', 'demo123')}
                  disabled={isLoading}
                >
                  Try Customer Demo
                </Button>
              </div> */}
            </TabsContent>
            
            <TabsContent value="restaurant" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
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
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              {/* <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDemoLogin('restaurant@demo.com', 'demo123')}
                  disabled={isLoading}
                >
                  Try Restaurant Demo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleDemoLogin('staff@demo.com', 'demo123')}
                  disabled={isLoading}
                >
                  Try Staff Demo
                </Button>
              </div> */}
            </TabsContent>
            <TabsContent value="driver" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="driver-email">Email</Label>
                  <Input
                    id="driver-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver-password">Password</Label>
                  <Input
                    id="driver-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              {/* <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDemoLogin('driver@demo.com', 'demo123')}
                  disabled={isLoading}
                >
                  Try Driver Demo
                </Button>
              </div> */}
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

          {/* <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">Demo Credentials:</p>
            <p className="text-xs text-muted-foreground">
              Customer: customer@demo.com<br/>
              Restaurant: restaurant@demo.com<br/>
              Staff: staff@demo.com<br/>
              Password: demo123
            </p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;