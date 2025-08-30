/**
 * Service Context - Provides service container to React components
 */

import React, { createContext, useContext } from 'react';
import type { ServiceContainer } from '@mfe-toolkit/core';

interface ServiceContextValue {
  serviceContainer: ServiceContainer;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

export interface ServiceProviderProps {
  serviceContainer: ServiceContainer;
  children: React.ReactNode;
}

export function ServiceProvider({ serviceContainer, children }: ServiceProviderProps) {
  return (
    <ServiceContext.Provider value={{ serviceContainer }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices(): ServiceContainer {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within ServiceProvider');
  }
  return context.serviceContainer;
}

// Convenience hooks for specific services
export function useLogger() {
  const serviceContainer = useServices();
  return serviceContainer.require('logger');
}

export function useEventBus() {
  const serviceContainer = useServices();
  return serviceContainer.require('eventBus');
}

export function useAuthService() {
  const serviceContainer = useServices();
  return serviceContainer.get('@mfe-toolkit/auth');
}

export function useModalService() {
  const serviceContainer = useServices();
  return serviceContainer.get('@mfe-toolkit/modal');
}

export function useNotificationService() {
  const serviceContainer = useServices();
  return serviceContainer.get('@mfe-toolkit/notification');
}

export function useThemeService() {
  const serviceContainer = useServices();
  return serviceContainer.get('@mfe-toolkit/theme');
}

export function useAnalyticsService() {
  const serviceContainer = useServices();
  return serviceContainer.get('@mfe-toolkit/analytics');
}