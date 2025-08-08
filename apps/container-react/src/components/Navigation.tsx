import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Theme } from '@mfe-toolkit/core';
import { getThemeService } from '@/services/theme-service';
import {
  Moon,
  Sun,
  Menu,
  X,
  Home,
  LayoutDashboard,
  AlertCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [theme, setTheme] = useState<Theme>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const themeService = getThemeService();

  useEffect(() => {
    const unsubscribe = themeService.subscribe((newTheme) => {
      setTheme(newTheme);
    });
    return unsubscribe;
  }, [themeService]);

  const cycleTheme = () => {
    if (themeService.cycleTheme) {
      themeService.cycleTheme();
    } else {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      themeService.setTheme(newTheme);
    }
  };

  const navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { path: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Services',
      items: [
        {
          path: '/error-boundary-demo',
          label: 'Error Handling',
          icon: <AlertCircle className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 ds-navbar">
      <div className="mx-auto">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 mr-6">
              <Sparkles className="h-5 w-5 ds-accent-primary" />
              <span className="font-semibold ds-text-sm hidden sm:block">MFE Platform</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navSections.map((section) => (
                <div key={section.title} className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(activeDropdown === section.title ? null : section.title)
                    }
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1.5 ds-text-xs font-medium rounded-md transition-colors',
                      section.items.some((item) => location.pathname === item.path)
                        ? 'ds-nav-item-active'
                        : 'ds-nav-item ds-nav-hover'
                    )}
                  >
                    {section.title}
                    <ChevronDown
                      className={cn(
                        'h-3 w-3 transition-transform',
                        activeDropdown === section.title && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === section.title && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                      <div className="absolute top-full left-0 mt-1 w-44 py-1 ds-dropdown-menu z-50">
                        {section.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setActiveDropdown(null)}
                            className={cn(
                              'flex items-center gap-2 px-3 py-1.5 ds-text-xs transition-colors',
                              location.pathname === item.path
                                ? 'ds-nav-item-active'
                                : 'ds-nav-item ds-nav-hover'
                            )}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTheme}
              aria-label="Toggle theme"
              className="h-8 w-8"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-8 w-8"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t ds-bg-base">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navSections.map((section) => (
                <div key={section.title} className="mb-2">
                  <div className="px-3 py-2 ds-text-xs font-semibold ds-text-muted uppercase">
                    {section.title}
                  </div>
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 ds-text-sm rounded-md transition-colors',
                        location.pathname === item.path
                          ? 'ds-nav-item-active'
                          : 'ds-nav-item ds-nav-hover'
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
