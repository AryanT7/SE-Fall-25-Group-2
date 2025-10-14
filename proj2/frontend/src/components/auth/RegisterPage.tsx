import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { User } from '../../App';
import { toast } from 'sonner@2.0.3';

interface RegisterPageProps {
  onLogin: (user: User) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    height: '',
    weight: '',
    restaurantName: '',
    cuisine: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent, userType: 'customer' | 'restaurant') => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newUser: User = {
      id: Date.now().toString(),
      email: formData.email,
      name: userType === 'customer' ? formData.name : formData.restaurantName,
      type: userType === 'customer' ? 'customer' : 'restaurant_owner',
      ...(userType === 'customer' ? {
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        calorieGoal: 2200, // Default goal
        goalType: 'daily' as const
      } : {
        restaurantId: `rest_${Date.now()}`
      })
    };

    onLogin(newUser);
    toast.success('Registration successful!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Join FoodApp to start ordering or managing your restaurant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer" className="space-y-4">
              <form onSubmit={(e) => handleRegister(e, 'customer')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="180"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Customer Account'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="restaurant" className="space-y-4">
              <form onSubmit={(e) => handleRegister(e, 'restaurant')} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input
                    id="restaurantName"
                    placeholder="Enter restaurant name"
                    value={formData.restaurantName}
                    onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine Type</Label>
                  <Select onValueChange={(value) => handleInputChange('cuisine', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                      <SelectItem value="mexican">Mexican</SelectItem>
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="thai">Thai</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your restaurant"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-restaurant">Email</Label>
                  <Input
                    id="email-restaurant"
                    type="email"
                    placeholder="Restaurant email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-restaurant">Password</Label>
                  <Input
                    id="password-restaurant"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword-restaurant">Confirm Password</Label>
                  <Input
                    id="confirmPassword-restaurant"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Restaurant Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;