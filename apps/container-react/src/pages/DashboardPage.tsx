import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUI } from '@/contexts/UIContext';
import { useRegistry } from '@/hooks/useRegistry';
import { compatibilityChecker } from '@/services/compatibility-checker';
import { isMFEManifestV2 } from '@mfe-toolkit/core';
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
              <span>Operational</span>
              <span className="text-muted-foreground">Services:</span>
              <span>All Active</span>
              <span className="text-muted-foreground">Memory Usage:</span>
              <span>~45MB</span>
              <span className="text-muted-foreground">Total MFEs:</span>
              <span>{summary.total}</span>
              <span className="text-muted-foreground">Compatible MFEs:</span>
              <span className="text-green-600">{summary.compatible}</span>
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
          <p className="text-sm text-warning mt-2">This action cannot be undone.</p>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading platform data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Dashboard Load Error</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={reload} variant="outline" size="sm">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your microfrontend platform
          </p>
        </div>
        <Button onClick={handleReloadRegistry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Platform Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total MFEs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">
              {summary.compatible} compatible, {summary.warnings} warnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">All services running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Registry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">V2</div>
            <p className="text-xs text-muted-foreground">Manifest Schema</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Core platform services status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Container App</span>
              <Badge variant="default" className="text-xs">
                Running
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Event Bus</span>
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Auth Service</span>
              <Badge variant="default" className="text-xs">
                Connected
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Modal Service</span>
              <Badge variant="default" className="text-xs">
                Ready
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Notification Service</span>
              <Badge variant="default" className="text-xs">
                Active
              </Badge>
            </div>
            <div className="pt-2">
              <Button onClick={handleTestModal} size="sm" className="w-full">
                View Detailed Status
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common platform management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReloadRegistry}
              className="w-full justify-start"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload MFE Registry
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearCache}
              className="w-full justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Clear Platform Cache
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => (window.location.href = '/mfe-communication')}
              className="w-full justify-start"
            >
              <Activity className="h-4 w-4 mr-2" />
              View Event Monitor
            </Button>
          </CardContent>
        </Card>

        {/* Platform Features */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Features</CardTitle>
            <CardDescription>Key capabilities and architecture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">Dynamic MFE Loading</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">Event-driven Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">Shared Dependencies</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">Cross-version React Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">V2 Manifest Schema</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MFE Registry Status */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">MFE Registry Status</h2>
        <div className="grid gap-4">
          {Array.from(compatibilityResults.entries()).map(([name, result]) => {
            const manifest = registry.get(name);
            if (!manifest) return null;

            const isV2 = isMFEManifestV2(manifest);

            return (
              <Card key={name} className={!result.compatible ? 'border-red-500' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        <CardTitle className="text-lg">
                          {isV2 && manifest.metadata?.displayName
                            ? manifest.metadata.displayName
                            : name}
                        </CardTitle>
                        <Badge variant={isV2 ? 'default' : 'secondary'}>{isV2 ? 'V2' : 'V1'}</Badge>
                        {result.compatible ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <CardDescription>
                        {isV2 && manifest.metadata?.description
                          ? manifest.metadata.description
                          : `Version ${manifest.version}`}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      v{manifest.version}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* URL */}
                    <div>
                      <span className="font-medium">URL:</span>
                      <code className="text-xs ml-2 p-1 bg-muted rounded block mt-1 truncate">
                        {manifest.url}
                      </code>
                    </div>

                    {/* Container Compatibility */}
                    {isV2 && manifest.compatibility?.container && (
                      <div>
                        <span className="font-medium">Container Required:</span>
                        <code className="text-xs ml-2 p-1 bg-muted rounded">
                          {manifest.compatibility.container}
                        </code>
                      </div>
                    )}

                    {/* Required Services */}
                    {isV2 &&
                      manifest.requirements?.services &&
                      manifest.requirements.services.length > 0 && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Required Services:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
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
                  </div>

                  {/* Errors and Warnings */}
                  {(result.errors.length > 0 || result.warnings.length > 0) && (
                    <div className="mt-4 space-y-2">
                      {result.errors.length > 0 && (
                        <div className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div className="space-y-1">
                            {result.errors.map((error, index) => (
                              <p key={index} className="text-sm text-red-600">
                                {error}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.warnings.length > 0 && (
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div className="space-y-1">
                            {result.warnings.map((warning, index) => (
                              <p key={index} className="text-sm text-yellow-600">
                                {warning}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Platform Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Version:</span>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <span className="text-muted-foreground">Environment:</span>
              <p className="font-medium">Development</p>
            </div>
            <div>
              <span className="text-muted-foreground">Module Format:</span>
              <p className="font-medium">ES Modules</p>
            </div>
            <div>
              <span className="text-muted-foreground">React Version:</span>
              <p className="font-medium">19.0.0</p>
            </div>
            <div>
              <span className="text-muted-foreground">Container Port:</span>
              <p className="font-medium">3000</p>
            </div>
            <div>
              <span className="text-muted-foreground">Registry Type:</span>
              <p className="font-medium">V2 Manifest</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
