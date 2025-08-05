import React, { useMemo } from 'react';
import { useRegistry } from '@/hooks/useRegistry';
import { compatibilityChecker } from '@/services/compatibility-checker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Package } from 'lucide-react';
import { isMFEManifestV2 } from '@mfe-toolkit/core';

export const RegistryStatusPage: React.FC = () => {
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading registry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>Registry Load Error</AlertTitle>
          <AlertDescription>
            {error.message}
            <Button onClick={reload} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">MFE Registry Status</h1>
          <p className="text-muted-foreground mt-2">
            Monitor MFE compatibility and registry health
          </p>
        </div>
        <Button onClick={reload} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total MFEs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Compatible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.compatible}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Incompatible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.incompatible}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
          </CardContent>
        </Card>
      </div>

      {/* MFE List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">MFE Details</h2>
        {Array.from(compatibilityResults.entries()).map(([name, result]) => {
          const manifest = registry.get(name);
          if (!manifest) return null;

          const isV2 = isMFEManifestV2(manifest);

          return (
            <Card key={name} className={!result.compatible ? 'border-red-500' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      <CardTitle className="text-xl">
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
                  <div className="text-sm text-muted-foreground">v{manifest.version}</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* URL */}
                <div>
                  <span className="text-sm font-medium">URL:</span>
                  <code className="text-xs ml-2 p-1 bg-muted rounded">{manifest.url}</code>
                </div>

                {/* V2 specific info */}
                {isV2 && (
                  <>
                    {/* Container Compatibility */}
                    {manifest.compatibility?.container && (
                      <div>
                        <span className="text-sm font-medium">Container Required:</span>
                        <code className="text-xs ml-2 p-1 bg-muted rounded">
                          {manifest.compatibility.container}
                        </code>
                      </div>
                    )}

                    {/* Required Services */}
                    {manifest.requirements?.services &&
                      manifest.requirements.services.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Required Services:</span>
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
                  </>
                )}

                {/* Errors */}
                {result.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Compatibility Errors</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {result.errors.map((error, index) => (
                          <li key={index} className="text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warnings</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {result.warnings.map((warning, index) => (
                          <li key={index} className="text-sm">
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* V1 Migration Notice */}
                {!isV2 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Legacy Manifest</AlertTitle>
                    <AlertDescription>
                      This MFE uses the V1 manifest format. Consider upgrading to V2 for enhanced
                      features, better type safety, and improved compatibility checking.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
