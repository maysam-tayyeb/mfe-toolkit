import { useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ErrorBoundaryDemoPage } from '@/pages/ErrorBoundaryDemoPage';
import { MFERegistryPage } from '@/pages/MFERegistryPage';
import { EventBusPageV2 as EventBusPage } from '@/pages/services/EventBusPageV2';
import { NotificationsPage } from '@/pages/services/NotificationsPage';
import { MetricsPage } from '@/pages/dev/MetricsPage';
import { SettingsPage } from '@/pages/dev/SettingsPage';
import { CompatibleMFELoader } from '@/components/CompatibleMFELoader';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';
import { useRegistryContext } from '@/contexts/RegistryContext';
import { initializePlatformMetrics, updatePlatformMetric } from '@/store/platform-metrics';

// Simple MFE Page component to replace the missing MFEPage from @mfe-toolkit/react
function MFEPage() {
  const { mfeName } = useParams<{ mfeName: string }>();
  const { registry } = useRegistryContext();
  const mfeServices = useMemo(() => getMFEServicesSingleton(), []);

  if (!mfeName || !registry) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const manifest = registry.get(mfeName);
  if (!manifest) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">MFE '{mfeName}' not found</p>
      </div>
    );
  }

  return (
    <CompatibleMFELoader
      manifest={manifest}
      services={mfeServices}
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading MFE...</p>
          </div>
        </div>
      }
    />
  );
}

export function AppContent() {
  const { registry, isLoading } = useRegistryContext();

  useEffect(() => {
    // Initialize platform metrics
    initializePlatformMetrics();
  }, []);

  useEffect(() => {
    // Update MFE counts when registry changes
    if (registry) {
      const totalMFEs = Object.keys(registry.getAll()).length;
      updatePlatformMetric('totalMFEs', totalMFEs);
      // We'll track active MFEs through the MFELoader component
    }
  }, [registry]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading MFE Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="mfe-registry" element={<MFERegistryPage />} />
          <Route path="error-boundary-demo" element={<ErrorBoundaryDemoPage />} />
          <Route path="services/event-bus" element={<EventBusPage />} />
          <Route path="services/notifications" element={<NotificationsPage />} />
          <Route path="dev/metrics" element={<MetricsPage />} />
          <Route path="dev/settings" element={<SettingsPage />} />
          <Route path="mfe/:mfeName" element={<MFEPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
