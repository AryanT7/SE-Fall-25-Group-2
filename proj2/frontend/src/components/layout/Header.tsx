import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { User, LogOut, Settings, ShoppingCart, FileImage } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: 'USER' | 'OWNER' | 'DRIVER';
  };
  logout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, logout }) => {

  // const { user, logout } = useAuth();
  // const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    // navigate('/login', {replace:true})
 
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">F</span>
            </div>
            <span className="text-xl font-bold">CalorieConnect</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user.role === 'USER' && (
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="User menu"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[60]" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              {user.role === 'USER' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem asChild>
                    <Link to="/settings/calories" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Calorie Settings</span>
                    </Link>
                  </DropdownMenuItem> */}
                </>
              )}
              {(user.role === 'OWNER') && (
                <DropdownMenuItem asChild>
                  <Link to="/restaurant/dashboard" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Restaurant Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {user.role === 'DRIVER' && (
                <DropdownMenuItem asChild>
                  <Link to="/driver/dashboard" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Driver Dashboard</span>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/poster" className="flex items-center">
                  <FileImage className="mr-2 h-4 w-4" />
                  <span>App Showcase</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer focus:bg-destructive/10 focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;