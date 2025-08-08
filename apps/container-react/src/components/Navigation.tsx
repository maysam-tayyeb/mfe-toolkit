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
  LayoutDashboard,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Package,
  Bell,
  MessageSquare,
  Settings,
  Activity,
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
      title: 'Platform',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { path: '/mfe-registry', label: 'MFE Registry', icon: <Package className="h-4 w-4" /> },
      ],
    },
    {
      title: 'Services',
      items: [
        {
          path: '/services/event-bus',
          label: 'Event Bus',
          icon: <MessageSquare className="h-4 w-4" />,
        },
        {
          path: '/services/notifications',
          label: 'Notifications',
          icon: <Bell className="h-4 w-4" />,
        },
        {
          path: '/error-boundary-demo',
          label: 'Error Handling',
          icon: <AlertCircle className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Developer',
      items: [
        {
          path: '/dev/metrics',
          label: 'Metrics',
          icon: <Activity className="h-4 w-4" />,
        },
        {
          path: '/dev/settings',
          label: 'Settings',
          icon: <Settings className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="mx-auto">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 mr-8 group">
              <div className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all transform group-hover:scale-105">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm hidden sm:block" style={{ color: theme === 'dark' ? '#ffffff' : '#0f172a' }}>MFE Platform</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navSections.map((section, index) => (
                <React.Fragment key={section.title}>
                  {index > 0 && (
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                  )}
                  <div 
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(section.title)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                  <button
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200',
                      section.items.some((item) => location.pathname.startsWith(item.path))
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-800 hover:text-black hover:bg-slate-100/80 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-700/50'
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
                    <div className="absolute top-full left-0 pt-1">
                      <div className="w-48 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                      {section.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setActiveDropdown(null)}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md transition-all duration-150',
                            location.pathname === item.path
                              ? 'bg-blue-600 text-white font-semibold dark:bg-blue-700'
                              : 'text-slate-800 hover:text-black hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-700/70'
                          )}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      ))}
                      </div>
                    </div>
                  )}
                </div>
                </React.Fragment>
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
              className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              {theme === 'dark' ? 
                <Sun className="h-4 w-4 text-amber-400" /> : 
                <Moon className="h-4 w-4 text-slate-800" />
              }
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="block lg:!hidden h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              {mobileMenuOpen ? <X className="h-4 w-4 text-slate-800 dark:text-slate-200" /> : <Menu className="h-4 w-4 text-slate-800 dark:text-slate-200" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="px-3 pt-3 pb-4 space-y-2">
              {navSections.map((section) => (
                <div key={section.title} className="mb-2">
                  <div className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    {section.title}
                  </div>
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                        location.pathname === item.path
                          ? 'bg-blue-600 text-white font-semibold dark:bg-blue-700'
                          : 'text-slate-800 hover:text-black hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-700/70'
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
