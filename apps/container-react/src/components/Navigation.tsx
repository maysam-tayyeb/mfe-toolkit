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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="mx-auto">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 mr-8 group">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all transform group-hover:scale-105">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-sm hidden sm:block bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">MFE Platform</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navSections.map((section, index) => (
                <React.Fragment key={section.title}>
                  {index > 0 && (
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                  )}
                  <div className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(activeDropdown === section.title ? null : section.title)
                    }
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
                      section.items.some((item) => location.pathname.startsWith(item.path))
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-700/50'
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
                      <div className="absolute top-full left-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                        {section.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setActiveDropdown(null)}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 text-xs rounded-md transition-all duration-150',
                              location.pathname === item.path
                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-400'
                                : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
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
                <Sun className="h-4 w-4 text-amber-500" /> : 
                <Moon className="h-4 w-4 text-slate-600" />
              }
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              {mobileMenuOpen ? <X className="h-4 w-4 text-slate-600 dark:text-slate-400" /> : <Menu className="h-4 w-4 text-slate-600 dark:text-slate-400" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="px-3 pt-3 pb-4 space-y-2">
              {navSections.map((section) => (
                <div key={section.title} className="mb-2">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </div>
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-all',
                        location.pathname === item.path
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-400'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
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
