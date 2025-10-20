import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Home, Store, ShoppingCart, Clock, Target, Sparkles, Brain } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';


interface NavigationProps {
  user: {
    name: string;
    role: 'USER' | 'OWNER' | 'STAFF' | 'ADMIN';
  };
}

const Navigation: React.FC<NavigationProps> = ({ user }) => {
  // if (!user || user.role !== 'USER') return null;
  const location = useLocation();
  // const { user } = useAuth();
  if (!user || user.role !== 'USER') return null;

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: Home },
    { path: '/restaurants', label: 'Restaurants', icon: Store },
    { path: '/ai-recommendations', label: 'AI Suggestions', icon: Sparkles },
    { path: '/cart', label: 'Cart', icon: ShoppingCart },
    { path: '/orders', label: 'Orders', icon: Clock },
    { path: '/emotional-insights', label: 'Insights', icon: Brain },
    { path: '/settings/calories', label: 'Goals', icon: Target },
  ];

  return (
    <nav className="sticky top-16 z-40 w-full border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive ? "default" : "ghost"} 
                  size="sm" 
                  className="flex items-center space-x-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;