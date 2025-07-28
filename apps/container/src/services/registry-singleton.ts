import { MFERegistryService } from '@mfe/dev-kit';

let registryInstance: MFERegistryService | null = null;

export function getRegistrySingleton(): MFERegistryService {
  if (!registryInstance) {
    const registryUrl = import.meta.env.VITE_MFE_REGISTRY_URL || '/mfe-registry.json';
    const environment = import.meta.env.MODE;
    
    registryInstance = new MFERegistryService({
      url: registryUrl,
      fallbackUrl: `/mfe-registry.${environment}.json`,
      cacheDuration: environment === 'production' ? 30 * 60 * 1000 : 5 * 60 * 1000,
    });
  }
  
  return registryInstance;
}

export function resetRegistrySingleton(): void {
  registryInstance = null;
}