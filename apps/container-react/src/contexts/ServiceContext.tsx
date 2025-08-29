/**
 * Service Context - Provides service container to React components
 */

import React, { createContext, useContext } from 'react';
import type { ServiceContainer } from '@mfe-toolkit/core';

interface ServiceContextValue {
  services: ServiceContainer;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

export interface ServiceProviderProps {
  services: ServiceContainer;
  children: React.ReactNode;
}

export function ServiceProvider({ services, children }: ServiceProviderProps) {
  return (
    <ServiceContext.Provider value={{ services }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices(): ServiceContainer {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within ServiceProvider');
  }
  return context.services;
}

// Convenience hooks for specific services
export function useLogger() {
  const services = useServices();
  return services.require('logger');
}

export function useEventBus() {
  const services = useServices();
  return services.require('eventBus');
}

export function useAuthService() {
  const services = useServices();
  return services.get('@mfe-toolkit/auth');
}

export function useModalService() {
  const services = useServices();
  return services.get('@mfe-toolkit/modal');
}

export function useNotificationService() {
  const services = useServices();
  return services.get('@mfe-toolkit/notification');
}

export function useThemeService() {
  const services = useServices();
  return services.get('@mfe-toolkit/theme');
}

export function useAnalyticsService() {
  const services = useServices();
  return services.get('@mfe-toolkit/analytics');
}