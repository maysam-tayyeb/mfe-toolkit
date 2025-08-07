import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
    <div className="ds-page">
      <div className="mb-4">
        <h1 className="ds-page-title text-blue-500">MFE Made Easy</h1>
        <p className="text-gray-600 text-sm mt-1">
          A framework-agnostic microfrontend platform supporting any JavaScript framework with
          dynamic loading and universal state management
        </p>
      </div>

      {/* Key Features Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <div className="ds-card">
          <div className="p-3">
            <div className="ds-card-title flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Dynamic Loading
            </div>
            <div className="text-lg font-bold text-blue-600">ES Modules</div>
            <p className="text-xs text-gray-500">On-demand loading</p>
          </div>
        </div>

        <div className="ds-card">
          <div className="p-3">
            <div className="ds-card-title flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-emerald-500" />
              Universal State
            </div>
            <div className="text-lg font-bold text-emerald-600">Real-time</div>
            <p className="text-xs text-gray-500">Cross-MFE & cross-tab sync</p>
          </div>
        </div>

        <div className="ds-card">
          <div className="p-3">
            <div className="ds-card-title flex items-center gap-2 mb-2">
              <Radio className="h-4 w-4 text-purple-500" />
              Event System
            </div>
            <div className="text-lg font-bold text-purple-600">Type-safe</div>
            <p className="text-xs text-gray-500">Typed event bus</p>
          </div>
        </div>

        <div className="ds-card">
          <div className="p-3">
            <div className="ds-card-title flex items-center gap-2 mb-2">
              <Blocks className="h-4 w-4 text-orange-500" />
              Framework Support
            </div>
            <div className="text-lg font-bold text-orange-600">∞</div>
            <p className="text-xs text-gray-500">Any JS framework</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Explore Demos */}
        <div className="ds-card">
          <div className="p-3">
            <h2 className="ds-section-title mb-1">Explore Demos</h2>
            <p className="text-xs text-gray-600 mb-3">Interactive demonstrations of platform capabilities</p>
            <div className="space-y-2">
              <Link
                to="/universal-state-demo"
                className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Universal State Demo</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>

              <Link
                to="/mfe-communication"
                className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Event Communication</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>

              <Link
                to="/error-boundary-demo"
                className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Error Boundaries</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
            <div className="pt-2">
              <Button asChild size="sm" className="w-full h-8">
                <Link to="/dashboard">
                  <ArrowRight className="h-3 w-3 mr-1" />
                  View All Features
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Available MFEs */}
        <div className="ds-card">
          <div className="p-3">
            <h2 className="ds-section-title mb-1">Available MFEs</h2>
            <p className="text-xs text-gray-600 mb-3">Microfrontend applications ready to explore</p>
            <div className="space-y-2">
              <Link
                to={`/mfe/${MFE_CONFIG.serviceExplorer.id}`}
                className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Service Explorer</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  React 19
                </Badge>
              </Link>

              <Link
                to={`/mfe/${MFE_CONFIG.legacyServiceExplorer.id}`}
                className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Legacy Explorer</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  React 17
                </Badge>
              </Link>

              <Link
                to="/mfe/eventDemo"
                className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Event Demo</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Events
                </Badge>
              </Link>
            </div>
            <div className="pt-2">
              <p className="text-xs text-gray-500">
                All MFEs receive injected services at mount time
              </p>
            </div>
          </div>
        </div>

        {/* Platform Status */}
        <div className="ds-card">
          <div className="p-3">
            <h2 className="ds-section-title mb-1">Platform Status</h2>
            <p className="text-xs text-gray-600 mb-3">Real-time platform health and activity</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Active MFEs</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {activeMFEs}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Event Messages</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {eventBusMessages}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Type Safety</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {typeSafetyCoverage}%
                </Badge>
              </div>
            </div>
            <div className="pt-2">
              <Button asChild size="sm" className="w-full h-8">
                <Link to="/dashboard">
                  <Users className="h-3 w-3 mr-1" />
                  View System Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Benefits */}
      <div className="ds-card">
        <div className="p-4">
          <h2 className="ds-section-title text-center mb-4">Why Choose This Platform?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-600">{bundleReduction}%</div>
              <p className="text-sm font-medium">Bundle Reduction</p>
              <p className="text-xs text-gray-500">Import maps</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-emerald-600">∞</div>
              <p className="text-sm font-medium">Framework Agnostic</p>
              <p className="text-xs text-gray-500">Any JS framework</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-600">{stateSyncLatency}ms</div>
              <p className="text-sm font-medium">State Sync</p>
              <p className="text-xs text-gray-500">Real-time updates</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-orange-600">{typeSafetyCoverage}%</div>
              <p className="text-sm font-medium">Type Safety</p>
              <p className="text-xs text-gray-500">End-to-end TS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
