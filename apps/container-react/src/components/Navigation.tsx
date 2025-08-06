import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MFE_CONFIG } from '@mfe/shared';
import { Theme } from '@mfe-toolkit/core';
import { getThemeService } from '@/services/theme-service';
import { 
  Moon, Sun, Menu, X, Home, LayoutDashboard, Layers, Radio, 
  Database, AlertCircle, Package, ChevronRight, Sparkles,
  Settings, LogOut, User, Search, Bell, Command
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
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link
      to={item.path}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        isActive
          ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary"
          : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/40 text-muted-foreground hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full -ml-3 transition-all duration-300" />
      )}
      
      {/* Icon with animated background */}
      <div className={cn(
        "relative flex items-center justify-center transition-all duration-300",
        isActive && "animate-pulse"
      )}>
        {item.icon}
        {isHovered && !collapsed && (
          <div className="absolute inset-0 bg-primary/10 rounded-lg blur-xl -z-10 animate-pulse" />
        )}
      </div>
      
      {/* Label and description */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        collapsed ? "w-0 opacity-0" : "opacity-100"
      )}>
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{item.label}</span>
          {item.badge && (
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-primary/20 text-primary rounded">
              {item.badge}
            </span>
          )}
        </div>
        {item.description && !collapsed && (
          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
        )}
      </div>
      
      {/* Hover arrow */}
      {!collapsed && isHovered && (
        <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1" />
      )}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className={cn(
          "absolute left-full ml-2 px-3 py-2 bg-popover text-popover-foreground rounded-md shadow-sm",
          "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
          "transition-all duration-200 z-50 whitespace-nowrap",
          "border border-border/50 backdrop-blur-sm"
        )}>
          <div className="font-medium text-sm">{item.label}</div>
          {item.description && (
            <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
          )}
        </div>
      )}
    </Link>
  );
};

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [searchQuery, setSearchQuery] = useState('');
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
          icon: <Home className="h-5 w-5" />,
          description: 'Platform overview'
        },
        { 
          path: '/dashboard', 
          label: 'Dashboard', 
          icon: <LayoutDashboard className="h-5 w-5" />,
          badge: 'New',
          description: 'Analytics & metrics'
        },
      ]
    },
    {
      title: 'Service Demos',
      items: [
        { 
          path: '/services/modal', 
          label: 'Modal Service', 
          icon: <Layers className="h-5 w-5" />,
          description: 'Dialog management'
        },
        { 
          path: '/services/event-bus', 
          label: 'Event Bus', 
          icon: <Radio className="h-5 w-5" />,
          badge: '3',
          description: 'Real-time events'
        },
      ]
    },
    {
      title: 'Platform Features',
      items: [
        { 
          path: '/mfe-communication', 
          label: 'MFE Communication', 
          icon: <Radio className="h-5 w-5" />,
          description: 'Cross-MFE messaging'
        },
        { 
          path: '/universal-state-demo', 
          label: 'State Demo', 
          icon: <Database className="h-5 w-5" />,
          description: 'Shared state management'
        },
        { 
          path: '/error-boundary-demo', 
          label: 'Error Demo', 
          icon: <AlertCircle className="h-5 w-5" />,
          description: 'Error handling'
        },
      ]
    },
    {
      title: 'Example MFEs',
      items: [
        {
          path: `/mfe/${MFE_CONFIG.serviceExplorer.id}`,
          label: MFE_CONFIG.serviceExplorer.displayName,
          icon: <Package className="h-5 w-5" />,
          description: 'Service explorer'
        },
        {
          path: `/mfe/${MFE_CONFIG.legacyServiceExplorer.id}`,
          label: MFE_CONFIG.legacyServiceExplorer.displayName,
          icon: <Package className="h-5 w-5" />,
          badge: 'Legacy',
          description: 'React 17 example'
        },
      ]
    }
  ];
  
  // Filter navigation items based on search
  const filteredSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

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
        "fixed left-0 top-0 h-full transition-all duration-500 z-50",
        "bg-gradient-to-b from-background/95 to-background/98 backdrop-blur-xl",
        "border-r border-border/50",
        collapsed ? "w-20" : "w-72",
        // Mobile styles
        "lg:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header with glassmorphism effect */}
          <div className="relative p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <Link 
                to="/" 
                className={cn(
                  "flex items-center gap-2 transition-all duration-300",
                  collapsed ? "opacity-0 w-0" : "opacity-100"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary blur-xl opacity-50" />
                  <Sparkles className="h-6 w-6 text-primary relative z-10" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  MFE Platform
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="h-9 w-9 hidden lg:flex hover:bg-primary/10 transition-colors duration-300"
                aria-label="Toggle sidebar"
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Search Bar */}
            {!collapsed && (
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search navigation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-3 py-2 text-sm rounded-md",
                    "bg-background/50 border border-border/50",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                    "transition-all duration-300 placeholder:text-muted-foreground/50"
                  )}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Navigation Sections with custom scrollbar */}
          <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {(searchQuery ? filteredSections : navSections).map((section, sectionIndex) => (
              <div 
                key={section.title} 
                className="mb-6"
                style={{
                  animation: `fadeInUp 0.3s ease-out ${sectionIndex * 0.1}s both`
                }}
              >
                <h3 className={cn(
                  "px-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-wider mb-3 transition-all duration-300",
                  collapsed ? "opacity-0 h-0" : "opacity-100",
                  "flex items-center gap-2"
                )}>
                  <div className="h-px flex-1 bg-border/50" />
                  <span>{section.title}</span>
                  <div className="h-px flex-1 bg-border/50" />
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={item.path}
                      style={{
                        animation: `fadeInLeft 0.3s ease-out ${(sectionIndex * 0.1) + (itemIndex * 0.05)}s both`
                      }}
                    >
                      <NavItem
                        item={item}
                        isActive={location.pathname === item.path}
                        collapsed={collapsed}
                        onClick={() => setMobileMenuOpen(false)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {searchQuery && filteredSections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results found</p>
              </div>
            )}
          </div>

          {/* Footer with user actions */}
          <div className="border-t border-border/50 p-3 space-y-2 bg-gradient-to-t from-background/95 to-transparent">
            {/* Quick Actions */}
            {!collapsed && (
              <div className="flex gap-2 mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-primary/10 transition-colors duration-300"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-primary/10 transition-colors duration-300"
                  aria-label="Command palette"
                >
                  <Command className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-primary/10 transition-colors duration-300"
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "default"}
              onClick={cycleTheme}
              className={cn(
                "w-full justify-start gap-3 hover:bg-primary/10 transition-all duration-300",
                collapsed && "justify-center"
              )}
              aria-label="Change theme"
            >
              <div className="relative">
                {theme === 'dark' ? 
                  <Sun className="h-5 w-5 text-yellow-500" /> : 
                  <Moon className="h-5 w-5 text-blue-500" />
                }
              </div>
              {!collapsed && (
                <span className="text-sm font-medium">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </Button>
            
            {/* User Profile */}
            {!collapsed && (
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50 border border-border/50">
                <div className="h-10 w-10 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@mfe.dev</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors duration-300"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-primary\/20::-webkit-scrollbar-thumb {
          background-color: rgba(var(--primary), 0.2);
          border-radius: 3px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background-color: transparent;
        }
      `}</style>
    </>
  );
};