import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { MFE_CONFIG } from '@mfe-toolkit/shared';
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

      {/* Key Features Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Dynamic Loading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ES Modules</div>
            <p className="text-xs text-muted-foreground">On-demand loading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Universal State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Real-time</div>
            <p className="text-xs text-muted-foreground">Cross-MFE & cross-tab sync</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Event System
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Type-safe</div>
            <p className="text-xs text-muted-foreground">Typed event bus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Blocks className="h-4 w-4" />
              Framework Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">∞</div>
            <p className="text-xs text-muted-foreground">Any JS framework</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Explore Demos */}
        <Card>
          <CardHeader>
            <CardTitle>Explore Demos</CardTitle>
            <CardDescription>Interactive demonstrations of platform capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Link
                to="/universal-state-demo"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Universal State Demo</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                to="/mfe-communication"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Event Communication</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                to="/error-boundary-demo"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Error Boundaries</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
            <div className="pt-2">
              <Button asChild size="sm" className="w-full">
                <Link to="/dashboard">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View All Features
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available MFEs */}
        <Card>
          <CardHeader>
            <CardTitle>Available MFEs</CardTitle>
            <CardDescription>Microfrontend applications ready to explore</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Link
                to={`/mfe/${MFE_CONFIG.serviceExplorer.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Service Explorer</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  React 19
                </Badge>
              </Link>

              <Link
                to={`/mfe/${MFE_CONFIG.legacyServiceExplorer.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Legacy Explorer</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  React 17
                </Badge>
              </Link>

              <Link
                to="/mfe/eventDemo"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Event Demo</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Events
                </Badge>
              </Link>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                All MFEs receive injected services at mount time
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Status */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Status</CardTitle>
            <CardDescription>Real-time platform health and activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Active MFEs</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {activeMFEs}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Event Messages</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {eventBusMessages}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Type Safety</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {typeSafetyCoverage}%
                </Badge>
              </div>
            </div>
            <div className="pt-2">
              <Button asChild size="sm" className="w-full">
                <Link to="/dashboard">
                  <Users className="h-4 w-4 mr-2" />
                  View System Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Why Choose This Platform?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold">{bundleReduction}%</div>
              <p className="text-sm font-medium">Bundle Reduction</p>
              <p className="text-xs text-muted-foreground">Import maps</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">∞</div>
              <p className="text-sm font-medium">Framework Agnostic</p>
              <p className="text-xs text-muted-foreground">Any JS framework</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{stateSyncLatency}ms</div>
              <p className="text-sm font-medium">State Sync</p>
              <p className="text-xs text-muted-foreground">Real-time updates</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{typeSafetyCoverage}%</div>
              <p className="text-sm font-medium">Type Safety</p>
              <p className="text-xs text-muted-foreground">End-to-end TS</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
