import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUI } from '@/contexts/UIContext';
import { useRegistry } from '@/hooks/useRegistry';
import { compatibilityChecker } from '@/services/compatibility-checker';
import { isMFEManifestV2 } from '@mfe-toolkit/core';
import { Hero, MetricCard, LoadingState, EmptyState, TabGroup } from '@mfe/design-system-react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Package,
  Activity,
  Shield,
  Zap,
  Settings,
  Server,
  Globe,
  Database,
  TrendingUp,
  Cpu,
  HardDrive,
  Gauge,
  GitBranch,
  Clock,
  ChevronRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { openModal, addNotification } = useUI();
  const { registry, isLoading, error, reload } = useRegistry();

  const compatibilityResults = useMemo(() => {
    const allMfes = registry.getAll();
    const manifests = Object.values(allMfes);
    return compatibilityChecker.checkRegistry(manifests);
  }, [registry]);

  const summary = useMemo(
    () => compatibilityChecker.getSummary(compatibilityResults),
    [compatibilityResults]
  );

  const handleTestModal = () => {
    openModal({
      title: 'Platform Health Check',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">System Status</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Platform:</span>
              <span className="ds-accent-success">Operational</span>
              <span className="text-muted-foreground">Services:</span>
              <span className="ds-accent-success">All Active</span>
              <span className="text-muted-foreground">Memory Usage:</span>
              <span>~45MB</span>
              <span className="text-muted-foreground">Total MFEs:</span>
              <span>{summary.total}</span>
              <span className="text-muted-foreground">Compatible MFEs:</span>
              <span className="ds-accent-success">{summary.compatible}</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Platform Info</h3>
            <p className="text-sm text-muted-foreground">
              All platform services are running normally. Registry is using V2 Manifest Schema.
            </p>
          </div>
        </div>
      ),
      size: 'md',
    });
  };

  const handleClearCache = () => {
    openModal({
      title: 'Clear Platform Cache',
      content: (
        <div className="space-y-2">
          <p>This will clear all cached data including:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            <li>MFE module cache</li>
            <li>Service worker cache</li>
            <li>Local storage data</li>
          </ul>
          <p className="text-sm ds-accent-warning mt-2">This action cannot be undone.</p>
        </div>
      ),
      size: 'md',
      onConfirm: () => {
        localStorage.clear();
        sessionStorage.clear();
        addNotification({
          type: 'success',
          title: 'Cache Cleared',
          message: 'All platform caches have been successfully cleared.',
        });
      },
    });
  };

  const handleReloadRegistry = () => {
    addNotification({
      type: 'info',
      title: 'Registry Reloading',
      message: 'Refreshing MFE registry...',
    });

    reload();

    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Registry Updated',
        message: 'MFE registry has been successfully reloaded.',
      });
    }, 1500);
  };

  const platformInfoTabs = [
    {
      id: 'services',
      label: 'Services',
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 ds-card-compact">
            <div className="flex items-center gap-3">
              <div className="ds-status-dot ds-status-online"></div>
              <span className="text-sm font-medium">Container App</span>
            </div>
            <Badge variant="default" className="text-xs">
              Running
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 ds-card-compact">
            <div className="flex items-center gap-3">
              <div className="ds-status-dot ds-status-online"></div>
              <span className="text-sm font-medium">Event Bus</span>
            </div>
            <Badge variant="default" className="text-xs">
              Active
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 ds-card-compact">
            <div className="flex items-center gap-3">
              <div className="ds-status-dot ds-status-online"></div>
              <span className="text-sm font-medium">Auth Service</span>
            </div>
            <Badge variant="default" className="text-xs">
              Connected
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 ds-card-compact">
            <div className="flex items-center gap-3">
              <div className="ds-status-dot ds-status-online"></div>
              <span className="text-sm font-medium">Modal Service</span>
            </div>
            <Badge variant="default" className="text-xs">
              Ready
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 ds-card-compact">
            <div className="flex items-center gap-3">
              <div className="ds-status-dot ds-status-online"></div>
              <span className="text-sm font-medium">Notification Service</span>
            </div>
            <Badge variant="default" className="text-xs">
              Active
            </Badge>
          </div>
        </div>
      ),
    },
    {
      id: 'configuration',
      label: 'Configuration',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs ds-text-muted">Version</p>
            <p className="text-sm font-medium">1.0.0</p>
          </div>
          <div>
            <p className="text-xs ds-text-muted">Environment</p>
            <p className="text-sm font-medium">Development</p>
          </div>
          <div>
            <p className="text-xs ds-text-muted">Module Format</p>
            <p className="text-sm font-medium">ES Modules</p>
          </div>
          <div>
            <p className="text-xs ds-text-muted">React Version</p>
            <p className="text-sm font-medium">19.0.0</p>
          </div>
          <div>
            <p className="text-xs ds-text-muted">Container Port</p>
            <p className="text-sm font-medium">3000</p>
          </div>
          <div>
            <p className="text-xs ds-text-muted">Registry Type</p>
            <p className="text-sm font-medium">V2 Manifest</p>
          </div>
        </div>
      ),
    },
    {
      id: 'features',
      label: 'Features',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 ds-icon-success" />
            <span className="text-sm">Dynamic MFE Loading</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 ds-icon-success" />
            <span className="text-sm">Event-driven Architecture</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 ds-icon-success" />
            <span className="text-sm">Shared Dependencies</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 ds-icon-success" />
            <span className="text-sm">Cross-version React Support</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 ds-icon-success" />
            <span className="text-sm">V2 Manifest Schema</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 ds-icon-success" />
            <span className="text-sm">Zero Global Pollution</span>
          </div>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <LoadingState
        size="lg"
        text="Loading platform data..."
        subtext="Fetching registry and service status"
      />
    );
  }

  if (error) {
    return (
      <div className="ds-page">
        <EmptyState
          title="Dashboard Load Error"
          description={error.message}
          icon={<XCircle className="h-16 w-16 ds-icon-danger" />}
          action={
            <Button onClick={reload} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="ds-page">
      {/* Hero Section */}
      <Hero
        title="Platform Dashboard"
        description="Monitor and manage your microfrontend platform in real-time"
        gradient
        actions={
          <Button onClick={handleReloadRegistry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Registry
          </Button>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ds-mb-lg">
        <MetricCard
          label="Platform Health"
          value="Healthy"
          trend={{ value: 'All systems operational', direction: 'up' }}
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          label="Total MFEs"
          value={summary.total}
          trend={{
            value: `${summary.compatible} compatible`,
            direction: summary.warnings > 0 ? 'neutral' : 'up',
          }}
          icon={<Package className="h-4 w-4" />}
        />
        <MetricCard
          label="Active Services"
          value="5"
          trend={{ value: 'All running', direction: 'up' }}
          icon={<Shield className="h-4 w-4" />}
        />
        <MetricCard
          label="Registry Version"
          value="V2"
          trend={{ value: 'Latest schema', direction: 'up' }}
          icon={<Zap className="h-4 w-4" />}
        />
      </div>

      {/* Performance Metrics */}
      <div className="ds-mb-lg">
        <h2 className="ds-section-title ds-mb-md">Performance Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="ds-card-compact">
            <div className="flex items-center gap-3">
              <Gauge className="h-4 w-4 ds-icon-primary" />
              <div>
                <p className="text-xs ds-text-muted">Load Time</p>
                <p className="text-sm font-semibold">1.2s</p>
              </div>
            </div>
          </div>
          <div className="ds-card-compact">
            <div className="flex items-center gap-3">
              <Cpu className="h-4 w-4 ds-icon-warning" />
              <div>
                <p className="text-xs ds-text-muted">CPU Usage</p>
                <p className="text-sm font-semibold">12%</p>
              </div>
            </div>
          </div>
          <div className="ds-card-compact">
            <div className="flex items-center gap-3">
              <HardDrive className="h-4 w-4 ds-icon-success" />
              <div>
                <p className="text-xs ds-text-muted">Memory</p>
                <p className="text-sm font-semibold">45MB</p>
              </div>
            </div>
          </div>
          <div className="ds-card-compact">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 ds-icon-info" />
              <div>
                <p className="text-xs ds-text-muted">Throughput</p>
                <p className="text-sm font-semibold">1.2K/s</p>
              </div>
            </div>
          </div>
          <div className="ds-card-compact">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 ds-icon-neutral" />
              <div>
                <p className="text-xs ds-text-muted">Uptime</p>
                <p className="text-sm font-semibold">99.9%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ds-mb-lg">
        {/* Platform Information */}
        <div className="lg:col-span-2">
          <div className="ds-card-padded">
            <h2 className="ds-section-title ds-mb-md">Platform Information</h2>
            <TabGroup tabs={platformInfoTabs} defaultTab="services" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="ds-card-padded">
          <h2 className="ds-section-title ds-mb-md">Quick Actions</h2>
          <div className="ds-stack-sm">
            <button
              onClick={handleTestModal}
              className="ds-card-compact ds-hover-scale flex items-center gap-3 w-full text-left"
            >
              <Activity className="h-4 w-4 ds-icon-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Health Check</p>
                <p className="text-xs ds-text-muted">View detailed status</p>
              </div>
              <ChevronRight className="h-4 w-4 ds-text-muted" />
            </button>

            <button
              onClick={handleReloadRegistry}
              className="ds-card-compact ds-hover-scale flex items-center gap-3 w-full text-left"
            >
              <RefreshCw className="h-4 w-4 ds-icon-success" />
              <div className="flex-1">
                <p className="text-sm font-medium">Reload Registry</p>
                <p className="text-xs ds-text-muted">Refresh MFE list</p>
              </div>
              <ChevronRight className="h-4 w-4 ds-text-muted" />
            </button>

            <button
              onClick={handleClearCache}
              className="ds-card-compact ds-hover-scale flex items-center gap-3 w-full text-left"
            >
              <Settings className="h-4 w-4 ds-icon-warning" />
              <div className="flex-1">
                <p className="text-sm font-medium">Clear Cache</p>
                <p className="text-xs ds-text-muted">Reset platform data</p>
              </div>
              <ChevronRight className="h-4 w-4 ds-text-muted" />
            </button>

            <button
              onClick={() => (window.location.href = '/mfe-communication')}
              className="ds-card-compact ds-hover-scale flex items-center gap-3 w-full text-left"
            >
              <Globe className="h-4 w-4 ds-icon-info" />
              <div className="flex-1">
                <p className="text-sm font-medium">Event Monitor</p>
                <p className="text-xs ds-text-muted">Track MFE events</p>
              </div>
              <ChevronRight className="h-4 w-4 ds-text-muted" />
            </button>
          </div>
        </div>
      </div>

      {/* MFE Registry */}
      <div className="ds-mb-lg">
        <h2 className="ds-section-title ds-mb-md">MFE Registry</h2>
        <div className="grid gap-4">
          {Array.from(compatibilityResults.entries()).map(([name, result]) => {
            const manifest = registry.get(name);
            if (!manifest) return null;

            const isV2 = isMFEManifestV2(manifest);
            const hasErrors = result.errors.length > 0;
            const hasWarnings = result.warnings.length > 0;

            return (
              <div
                key={name}
                className={`ds-card-padded ${
                  hasErrors
                    ? 'ds-border-accent-danger border-2'
                    : hasWarnings
                      ? 'ds-border-accent-warning'
                      : ''
                }`}
              >
                <div className="flex items-start justify-between ds-mb-sm">
                  <div className="flex items-center gap-3">
                    <Package
                      className={`h-5 w-5 ${
                        hasErrors
                          ? 'ds-icon-danger'
                          : hasWarnings
                            ? 'ds-icon-warning'
                            : 'ds-icon-primary'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="ds-card-title">
                          {isV2 && manifest.metadata?.displayName
                            ? manifest.metadata.displayName
                            : name}
                        </h3>
                        <Badge variant={isV2 ? 'default' : 'secondary'} className="text-xs">
                          {isV2 ? 'V2' : 'V1'}
                        </Badge>
                        {result.compatible ? (
                          <CheckCircle2 className="h-4 w-4 ds-icon-success" />
                        ) : (
                          <XCircle className="h-4 w-4 ds-icon-danger" />
                        )}
                      </div>
                      <p className="text-xs ds-text-muted mt-1">
                        {isV2 && manifest.metadata?.description
                          ? manifest.metadata.description
                          : `Version ${manifest.version}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    v{manifest.version}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs ds-text-muted mb-1">URL</p>
                    <code className="text-xs p-2 ds-bg-muted rounded block truncate">
                      {manifest.url}
                    </code>
                  </div>

                  {isV2 && manifest.compatibility?.container && (
                    <div>
                      <p className="text-xs ds-text-muted mb-1">Container Required</p>
                      <code className="text-xs p-2 ds-bg-muted rounded block">
                        {manifest.compatibility.container}
                      </code>
                    </div>
                  )}
                </div>

                {isV2 &&
                  manifest.requirements?.services &&
                  manifest.requirements.services.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs ds-text-muted mb-2">Required Services</p>
                      <div className="flex flex-wrap gap-2">
                        {manifest.requirements.services
                          .filter((s) => !s.optional)
                          .map((service) => (
                            <Badge key={service.name} variant="outline" className="text-xs">
                              {service.name}
                              {service.version && ` (${service.version})`}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                {(hasErrors || hasWarnings) && (
                  <div className="mt-3 pt-3 border-t ds-border-accent-neutral">
                    {hasErrors && (
                      <div className="flex items-start gap-2 mb-2">
                        <XCircle className="h-4 w-4 ds-icon-danger mt-0.5" />
                        <div className="space-y-1">
                          {result.errors.map((error, index) => (
                            <p key={index} className="text-sm ds-accent-danger">
                              {error}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {hasWarnings && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 ds-icon-warning mt-0.5" />
                        <div className="space-y-1">
                          {result.warnings.map((warning, index) => (
                            <p key={index} className="text-sm ds-accent-warning">
                              {warning}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Stats */}
      <div className="ds-card-padded ds-bg-accent-primary-soft">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <Server className="h-6 w-6 ds-icon-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{summary.total}</p>
            <p className="text-xs ds-text-muted">Total MFEs</p>
          </div>
          <div>
            <Database className="h-6 w-6 ds-icon-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{summary.compatible}</p>
            <p className="text-xs ds-text-muted">Compatible</p>
          </div>
          <div>
            <GitBranch className="h-6 w-6 ds-icon-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">{summary.warnings}</p>
            <p className="text-xs ds-text-muted">Warnings</p>
          </div>
          <div>
            <Shield className="h-6 w-6 ds-icon-info mx-auto mb-2" />
            <p className="text-2xl font-bold">100%</p>
            <p className="text-xs ds-text-muted">Type Safety</p>
          </div>
        </div>
      </div>
    </div>
  );
};
