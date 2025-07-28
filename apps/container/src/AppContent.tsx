import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MFECommunicationPage } from '@/pages/MFECommunicationPage';
import { MFEPage } from '@mfe/dev-kit';
import { createMFEServices } from '@/services/mfe-services';
import { useRegistryContext } from '@/contexts/RegistryContext';

export function AppContent() {
  const { registry, isLoading } = useRegistryContext();
  const mfeServices = useMemo(() => createMFEServices(), []);

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
          <Route path="mfe-communication" element={<MFECommunicationPage />} />
          <Route
            path="mfe/:mfeName"
            element={
              <MFEPage
                services={mfeServices}
                registry={registry}
                fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading MFE...</p>
                    </div>
                  </div>
                }
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
