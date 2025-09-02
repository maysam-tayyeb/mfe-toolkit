import { useMemo } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { UIProvider } from '@/contexts/UIContext';
import { RegistryProvider } from '@/contexts/RegistryContext';
import { ServiceProvider } from '@/contexts/ServiceContext';
import { AppContent } from './AppContent';
import { ContextBridge } from '@/services/context-bridge';
import { createServiceContainer } from '@/services/service-container';

function App() {
  // Create service container once on mount
  const serviceContainer = useMemo(() => createServiceContainer(), []);

  return (
    <ServiceProvider serviceContainer={serviceContainer}>
      <AuthProvider>
        <UIProvider>
          <ContextBridge>
            <RegistryProvider>
              <AppContent />
            </RegistryProvider>
          </ContextBridge>
        </UIProvider>
      </AuthProvider>
    </ServiceProvider>
  );
}

export default App;