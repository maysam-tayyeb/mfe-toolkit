import React, { createContext, useContext, useMemo } from 'react';
import { MFEServices } from '../types';

export interface ServiceContainer {
  getService<T extends keyof MFEServices>(serviceName: T): MFEServices[T];
  hasService(serviceName: keyof MFEServices): boolean;
  getAllServices(): MFEServices;
}

const MFEServicesContext = createContext<ServiceContainer | null>(null);

export interface MFEServicesProviderProps {
  services: MFEServices;
  children: React.ReactNode;
}

export const MFEServicesProvider: React.FC<MFEServicesProviderProps> = ({ services, children }) => {
  const container = useMemo<ServiceContainer>(
    () => ({
      getService<T extends keyof MFEServices>(serviceName: T): MFEServices[T] {
        if (!(serviceName in services)) {
          throw new Error(`Service "${serviceName}" not found in container`);
        }
        return services[serviceName];
      },
      hasService(serviceName: keyof MFEServices): boolean {
        return serviceName in services;
      },
      getAllServices(): MFEServices {
        return services;
      },
    }),
    [services]
  );

  return <MFEServicesContext.Provider value={container}>{children}</MFEServicesContext.Provider>;
};

export const useMFEServices = (): ServiceContainer => {
  const context = useContext(MFEServicesContext);
  if (!context) {
    throw new Error('useMFEServices must be used within MFEServicesProvider');
  }
  return context;
};

export const useMFEService = <T extends keyof MFEServices>(serviceName: T): MFEServices[T] => {
  const container = useMFEServices();
  return container.getService(serviceName);
};

export const withMFEServices = <P extends object>(
  Component: React.ComponentType<P & { services: MFEServices }>
): React.ComponentType<P> => {
  return (props: P) => {
    const container = useMFEServices();
    return <Component {...props} services={container.getAllServices()} />;
  };
};
