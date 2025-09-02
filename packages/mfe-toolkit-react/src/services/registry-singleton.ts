import { MFERegistryService } from '@mfe-toolkit/core';

let registryInstance: MFERegistryService | null = null;

export type RegistrySingletonConfig = {
  url?: string;
  cacheDuration?: number;
  environment?: string;
};

export function getRegistrySingleton(config?: RegistrySingletonConfig): MFERegistryService {
  if (!registryInstance) {
    const registryUrl = config?.url || '/mfe-registry.json';
    const environment = config?.environment || 'development';
    const cacheDuration = config?.cacheDuration || 
      (environment === 'production' ? 30 * 60 * 1000 : 5 * 60 * 1000);

    registryInstance = new MFERegistryService({
      url: registryUrl,
      cacheDuration,
    });
  }

  return registryInstance;
}

export function resetRegistrySingleton(): void {
  registryInstance = null;
}