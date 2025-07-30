import { MFEServices } from '../types';

export class MFEServiceContainer {
  private services: MFEServices;
  private serviceProxies: Map<keyof MFEServices, any> = new Map();

  constructor(services: MFEServices) {
    this.services = services;
  }

  getService<T extends keyof MFEServices>(serviceName: T): MFEServices[T] {
    if (!this.hasService(serviceName)) {
      throw new Error(`Service "${serviceName}" not found in container`);
    }

    // Return cached proxy if available
    if (this.serviceProxies.has(serviceName)) {
      return this.serviceProxies.get(serviceName);
    }

    // Create a proxy to ensure service isolation
    const service = this.services[serviceName];
    const proxy = this.createServiceProxy(serviceName, service);
    this.serviceProxies.set(serviceName, proxy);

    return proxy;
  }

  hasService(serviceName: keyof MFEServices): boolean {
    return serviceName in this.services;
  }

  getAllServices(): MFEServices {
    return this.services;
  }

  // Create a proxy to add logging, validation, etc.
  private createServiceProxy<T extends keyof MFEServices>(
    serviceName: T,
    service: MFEServices[T]
  ): MFEServices[T] {
    if (typeof service !== 'object' || service === null) {
      return service;
    }

    return new Proxy(service, {
      get: (target, prop) => {
        const value = (target as any)[prop];

        // If it's a function, wrap it for logging/monitoring
        if (typeof value === 'function') {
          return (...args: any[]) => {
            try {
              const result = value.apply(target, args);
              // Could add performance monitoring, logging, etc. here
              return result;
            } catch (error) {
              console.error(`Error in ${serviceName}.${String(prop)}:`, error);
              throw error;
            }
          };
        }

        return value;
      },
    });
  }

  // Create a scoped container with additional services or overrides
  createScoped(overrides: Partial<MFEServices>): MFEServiceContainer {
    return new MFEServiceContainer({
      ...this.services,
      ...overrides,
    });
  }

  // Dispose of any resources
  dispose(): void {
    this.serviceProxies.clear();
  }
}

// Factory function for creating service containers
export const createServiceContainer = (services: MFEServices): MFEServiceContainer => {
  return new MFEServiceContainer(services);
};
