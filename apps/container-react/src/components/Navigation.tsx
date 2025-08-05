import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MFE_CONFIG } from '@mfe/shared';
import { Theme } from '@mfe-toolkit/core';
import { getThemeService } from '@/services/theme-service';
import { Moon, Sun, Menu, X, ChevronRight, Home, LayoutDashboard, Layers, Radio, Database, AlertCircle, Package, BookOpen } from 'lucide-react';

interface NavSection {
  title: string;
  items: Array<{
    path: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
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
        { path: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
        { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      ]
    },
    {
      title: 'Service Demos',
      items: [
        { path: '/services/modal', label: 'Modal Service', icon: <Layers className="h-4 w-4" /> },
      ]
    },
    {
      title: 'Platform Features',
      items: [
        { path: '/mfe-communication', label: 'MFE Communication', icon: <Radio className="h-4 w-4" /> },
        { path: '/universal-state-demo', label: 'State Demo', icon: <Database className="h-4 w-4" /> },
        { path: '/error-boundary-demo', label: 'Error Demo', icon: <AlertCircle className="h-4 w-4" /> },
      ]
    },
    {
      title: 'Example MFEs',
      items: [
        {
          path: `/mfe/${MFE_CONFIG.serviceExplorer.id}`,
          label: MFE_CONFIG.serviceExplorer.displayName,
          icon: <Package className="h-4 w-4" />
        },
        {
          path: `/mfe/${MFE_CONFIG.legacyServiceExplorer.id}`,
          label: MFE_CONFIG.legacyServiceExplorer.displayName,
          icon: <Package className="h-4 w-4" />
        },
      ]
    }
  ];

  return (
    <nav className={cn(
      "fixed left-0 top-0 h-full bg-background border-r transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link to="/" className={cn(
            "font-bold transition-opacity",
            collapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            MFE Platform
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className={cn(
                "px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 transition-opacity",
                collapsed ? "opacity-0" : "opacity-100"
              )}>
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted",
                      location.pathname === item.path
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                      collapsed && "justify-center"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {item.icon}
                    <span className={cn(
                      "transition-opacity",
                      collapsed ? "opacity-0 w-0" : "opacity-100"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={cycleTheme}
            className={cn(
              "w-full",
              collapsed && "h-8 w-8"
            )}
            aria-label="Change theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span className="ml-2">Toggle Theme</span>}
          </Button>
        </div>
      </div>
    </nav>
  );
};