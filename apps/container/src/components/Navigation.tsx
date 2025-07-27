import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/mfe-communication', label: 'MFE Communication' },
    { path: '/mfe/example', label: 'Example MFE' },
    { path: '/mfe/react17', label: 'React 17 MFE' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link to="/" className="text-lg md:text-xl font-bold">
              MFE Platform
            </Link>
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    location.pathname === item.path
                      ? 'text-foreground border-b-2 border-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Menu</span>
              {mobileMenuOpen ? '✕' : '☰'}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-4 py-2 text-sm font-medium transition-colors hover:bg-muted',
                  location.pathname === item.path
                    ? 'text-primary bg-muted'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-4 py-2 sm:hidden">
              <Button variant="outline" size="sm" className="w-full">
                Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
