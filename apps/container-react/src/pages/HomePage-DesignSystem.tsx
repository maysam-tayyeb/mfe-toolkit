import React from 'react';
import { Link } from 'react-router-dom';
// Design System imports
import { Card, CardHeader, CardContent, Button } from '@mfe/design-system';
// Keep using ShadCN for components we haven't migrated yet
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Zap,
  Package,
  Radio,
  Database,
  AlertCircle,
  Activity,
  Blocks,
  Shield,
  Users,
} from 'lucide-react';
import { MFE_CONFIG } from '@mfe/shared';
import { usePlatformMetrics } from '@/hooks/usePlatformMetrics';
import { useRegistryContext } from '@/contexts/RegistryContext';

export const HomePage: React.FC = () => {
  const metrics = usePlatformMetrics();
  const { registry } = useRegistryContext();

  // Default values for when metrics are not yet loaded
  const bundleReduction = metrics?.bundleReduction ?? 97;
  const stateSyncLatency = metrics?.stateSyncLatency ?? 0;
  const typeSafetyCoverage = metrics?.typeSafetyCoverage ?? 100;
  const activeMFEs = metrics?.activeMFEs ?? (registry ? Object.keys(registry.getAll()).length : 0);
  const eventBusMessages = metrics?.eventBusMessages ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MFE Made Easy</h1>
          <p className="text-muted-foreground mt-2">
            A framework-agnostic microfrontend platform supporting any JavaScript framework with
            dynamic loading and universal state management
          </p>
        </div>
      </div>

      {/* Key Features Grid - Using Design System Card */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card variant="default" padding="compact">
          <CardHeader 
            title="Dynamic Loading" 
            description="ES Modules"
          />
          <CardContent spacing="compact">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <p className="text-sm text-muted-foreground">On-demand loading</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" padding="compact">
          <CardHeader 
            title="Universal State" 
            description="Real-time"
          />
          <CardContent spacing="compact">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <p className="text-sm text-muted-foreground">Cross-MFE & cross-tab sync</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" padding="compact">
          <CardHeader 
            title="Event System" 
            description="Type-safe"
          />
          <CardContent spacing="compact">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              <p className="text-sm text-muted-foreground">Typed event bus</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" padding="compact">
          <CardHeader 
            title="Framework Support" 
            description="∞"
          />
          <CardContent spacing="compact">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <p className="text-sm text-muted-foreground">Any JS framework</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - Mixed Design System and ShadCN for transition */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Explore Demos - Design System Card */}
        <Card variant="elevated" className="md:col-span-1">
          <CardHeader>
            <h3 className="text-lg font-semibold">Explore Demos</h3>
            <p className="text-sm text-muted-foreground">
              Interactive demonstrations of platform capabilities
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link
                to="/universal-state-demo"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4" />
                  <span className="text-sm font-medium">Universal State Demo</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/mfe-communication"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Radio className="h-4 w-4" />
                  <span className="text-sm font-medium">Event Communication</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/error-boundary-demo"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Error Boundaries</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <Link to="/dashboard" className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                View All Features
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Available MFEs - Design System Card */}
        <Card variant="elevated" className="md:col-span-1">
          <CardHeader>
            <h3 className="text-lg font-semibold">Available MFEs</h3>
            <p className="text-sm text-muted-foreground">
              Microfrontend applications ready to explore
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registry && Object.entries(registry.getAll()).slice(0, 3).map(([key, config]) => (
                <Link
                  key={key}
                  to={`/mfe/${key}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.metadata?.icon || '📦'}</span>
                    <span className="text-sm font-medium">
                      {config.metadata?.displayName || config.name}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {config.version}
                  </Badge>
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              All MFEs receive injected services at mount time
            </p>
          </CardContent>
        </Card>

        {/* Platform Status - Design System Card */}
        <Card variant="elevated" className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <h3 className="text-lg font-semibold">Platform Status</h3>
            <p className="text-sm text-muted-foreground">
              Real-time platform health and activity
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-bold">{activeMFEs}</div>
                  <div className="text-xs text-muted-foreground">Active MFEs</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Radio className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-bold">{eventBusMessages}</div>
                  <div className="text-xs text-muted-foreground">Event Messages</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="text-2xl font-bold">{typeSafetyCoverage}%</div>
                  <div className="text-xs text-muted-foreground">Type Safety</div>
                </div>
              </div>
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  View System Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Benefits - Using Design System Card */}
      <Card variant="bordered">
        <CardHeader>
          <h3 className="text-lg font-semibold">Why Choose This Platform?</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{bundleReduction}%</div>
              <p className="text-sm font-medium">Bundle Reduction</p>
              <p className="text-xs text-muted-foreground">Import maps</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">∞</div>
              <p className="text-sm font-medium">Framework Agnostic</p>
              <p className="text-xs text-muted-foreground">Any JS framework</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stateSyncLatency}ms</div>
              <p className="text-sm font-medium">State Sync</p>
              <p className="text-xs text-muted-foreground">Real-time updates</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{typeSafetyCoverage}%</div>
              <p className="text-sm font-medium">Type Safety</p>
              <p className="text-xs text-muted-foreground">End-to-end TS</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};