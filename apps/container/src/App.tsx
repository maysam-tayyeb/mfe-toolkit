import { useRef, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { UIProvider } from '@/contexts/UIContext';
import { RegistryProvider } from '@/contexts/RegistryContext';
import { ContextBridge, ContextBridgeRef } from '@/services/context-bridge';
import { setContextBridge } from '@/services/mfe-services';
import { AppContent } from './AppContent';

function App() {
  const contextBridgeRef = useRef<ContextBridgeRef>(null);

  useEffect(() => {
    // Initialize the context bridge once it's available
    if (contextBridgeRef.current) {
      setContextBridge(contextBridgeRef.current);
    }
  }, []);

  return (
    <AuthProvider>
      <UIProvider>
        <ContextBridge ref={contextBridgeRef}>
          <RegistryProvider>
            <AppContent />
          </RegistryProvider>
        </ContextBridge>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;
