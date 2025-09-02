import {
  getRegistrySingleton as getRegistrySingletonFromReact,
  resetRegistrySingleton as resetFromReact,
} from '@mfe-toolkit/react';
import type { MFERegistryService } from '@mfe-toolkit/core';

export function getRegistrySingleton(): MFERegistryService {
  const registryUrl = import.meta.env.VITE_MFE_REGISTRY_URL || '/mfe-registry.json';
  const environment = import.meta.env.MODE;

  return getRegistrySingletonFromReact({
    url: registryUrl,
    environment,
  });
}

export const resetRegistrySingleton = resetFromReact;
