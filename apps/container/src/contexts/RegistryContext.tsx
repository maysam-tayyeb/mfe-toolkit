import { createContext, useContext, ReactNode } from 'react';
import { MFERegistryService } from '@mfe/dev-kit';
import { useRegistry, UseRegistryResult } from '@/hooks/useRegistry';

interface RegistryContextValue extends UseRegistryResult {
  // Add any additional registry-related methods here
}

const RegistryContext = createContext<RegistryContextValue | undefined>(undefined);

export interface RegistryProviderProps {
  children: ReactNode;
}

export function RegistryProvider({ children }: RegistryProviderProps) {
  const registryResult = useRegistry();

  return (
    <RegistryContext.Provider value={registryResult}>
      {children}
    </RegistryContext.Provider>
  );
}

export function useRegistryContext(): RegistryContextValue {
  const context = useContext(RegistryContext);
  if (!context) {
    throw new Error('useRegistryContext must be used within a RegistryProvider');
  }
  return context;
}

// Convenience hook to get just the registry
export function useMFERegistry(): MFERegistryService {
  const { registry } = useRegistryContext();
  return registry;
}