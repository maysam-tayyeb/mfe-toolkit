import { useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MFECommunicationPage } from '@/pages/MFECommunicationPage';
import { UniversalStateDemoPage } from '@/pages/UniversalStateDemoPage';
import { MFEPage } from '@mfe/dev-kit';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';
import { useRegistryContext } from '@/contexts/RegistryContext';
import { getGlobalStateManager } from '@mfe/universal-state';

export function AppContent() {
  const { registry, isLoading } = useRegistryContext();
  const mfeServices = useMemo(() => getMFEServicesSingleton(), []);

  useEffect(() => {
    // Set up global theme management
    const stateManager = getGlobalStateManager();
    
    // Subscribe to theme changes
    const unsubscribe = stateManager.subscribe('theme', (value) => {
      if (value === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
    
    // Set initial theme
    const currentTheme = stateManager.get('theme');
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return unsubscribe;
  }, [mfeServices]);

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
          <Route path="universal-state-demo" element={<UniversalStateDemoPage />} />
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
