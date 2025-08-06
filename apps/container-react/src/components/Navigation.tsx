import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MFE_CONFIG } from '@mfe/shared';
import { Theme } from '@mfe-toolkit/core';
import { getThemeService } from '@/services/theme-service';
import { 
  Moon, Sun, Menu, X, Home, LayoutDashboard, Layers, Radio, 
  Database, AlertCircle, Package, ChevronRight, Sparkles
} from 'lucide-react';

interface NavSection {
  title: string;
  items: Array<{
    path: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string;
    description?: string;
  }>;
}

interface NavItemProps {
  item: NavSection['items'][0];
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, collapsed, onClick }) => {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted text-muted-foreground hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      {/* Icon */}
      <div className="flex items-center justify-center">
        {item.icon}
      </div>
      
      {/* Label */}
      {!collapsed && (
        <span className="font-medium text-sm">{item.label}</span>
      )}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className={cn(
          "absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground rounded shadow-sm",
          "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
          "transition-opacity z-50 whitespace-nowrap text-sm"
        )}>
          {item.label}
        </div>
      )}
    </Link>
  );
};

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const themeService = getThemeService();

  useEffect(() => {
    // Subscribe to theme changes from the theme service
    const unsubscribe = themeService.subscribe((newTheme) => {
      setTheme(newTheme);
    });

    return unsubscribe;
  }, [themeService]);

  const cycleTheme = () => {
    if (themeService.cycleTheme) {
      themeService.cycleTheme();
    } else {
      // Fallback for basic light/dark toggle
      const newTheme = theme === 'light' ? 'dark' : 'light';
      themeService.setTheme(newTheme);
    }
  };

  const navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { 
          path: '/', 
          label: 'Home', 
          icon: <Home className="h-4 w-4" />
        },
        { 
          path: '/dashboard', 
          label: 'Dashboard', 
          icon: <LayoutDashboard className="h-4 w-4" />
        },
      ]
    },
    {
      title: 'Services',
      items: [
        { 
          path: '/services/modal', 
          label: 'Modal', 
          icon: <Layers className="h-4 w-4" />
        },
        { 
          path: '/services/event-bus', 
          label: 'Event Bus', 
          icon: <Radio className="h-4 w-4" />
        },
      ]
    },
    {
      title: 'Features',
      items: [
        { 
          path: '/mfe-communication', 
          label: 'Communication', 
          icon: <Radio className="h-4 w-4" />
        },
        { 
          path: '/universal-state-demo', 
          label: 'State', 
          icon: <Database className="h-4 w-4" />
        },
        { 
          path: '/error-boundary-demo', 
          label: 'Errors', 
          icon: <AlertCircle className="h-4 w-4" />
        },
      ]
    },
    {
      title: 'MFEs',
      items: [
        {
          path: `/mfe/${MFE_CONFIG.serviceExplorer.id}`,
          label: 'Explorer',
          icon: <Package className="h-4 w-4" />
        },
        {
          path: `/mfe/${MFE_CONFIG.legacyServiceExplorer.id}`,
          label: 'Legacy',
          icon: <Package className="h-4 w-4" />
        },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm border shadow-sm"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 h-full transition-all duration-300 z-50",
        "bg-background border-r",
        collapsed ? "w-16" : "w-56",
        // Mobile styles
        "lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              {!collapsed && (
                <Link 
                  to="/" 
                  className="flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm">MFE Platform</span>
                </Link>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="h-8 w-8 hidden lg:flex"
                aria-label="Toggle sidebar"
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="flex-1 overflow-y-auto py-2 px-2">
            {navSections.map((section) => (
              <div key={section.title} className="mb-4">
                {!collapsed && (
                  <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase mb-2">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavItem
                      key={item.path}
                      item={item}
                      isActive={location.pathname === item.path}
                      collapsed={collapsed}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t p-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "sm"}
              onClick={cycleTheme}
              className={cn(
                "w-full justify-start gap-2",
                collapsed && "justify-center"
              )}
              aria-label="Change theme"
            >
              {theme === 'dark' ? 
                <Sun className="h-4 w-4" /> : 
                <Moon className="h-4 w-4" />
              }
              {!collapsed && (
                <span className="text-sm">
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
};