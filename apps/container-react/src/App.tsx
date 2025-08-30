import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { UIProvider } from '@/contexts/UIContext';
import { RegistryProvider } from '@/contexts/RegistryContext';
import { ServiceProvider } from '@/contexts/ServiceContext';
import { AppContent } from './AppContent';
import { initializeServices } from '@/services/container-services';
import type { ServiceContainer } from '@mfe-toolkit/core';

function App() {
  const [services, setServices] = useState<ServiceContainer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize services
    initializeServices()
      .then((container) => {
        setServices(container);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to initialize services:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="ds-flex ds-items-center ds-justify-center ds-min-h-screen">
        <div className="ds-text-lg">Initializing services...</div>
      </div>
    );
  }

  if (!services) {
    return (
      <div className="ds-flex ds-items-center ds-justify-center ds-min-h-screen">
        <div className="ds-text-lg ds-text-danger">Failed to initialize services</div>
      </div>
    );
  }

  return (
    <ServiceProvider serviceContainer={services}>
      <AuthProvider>
        <UIProvider>
          <RegistryProvider>
            <AppContent />
          </RegistryProvider>
        </UIProvider>
      </AuthProvider>
    </ServiceProvider>
  );
}

export default App;