import { MFEServices } from './index';
import { MFEServiceContainer } from '../services/service-container';

// Enhanced MFE module interface that supports dependency injection
export interface MFEModuleV2 {
  // New mount method with service container
  mount: (element: HTMLElement, container: MFEServiceContainer) => void | Promise<void>;
  
  // Unmount now receives the container for cleanup
  unmount: (container: MFEServiceContainer) => void | Promise<void>;
  
  // Optional metadata about the MFE
  metadata?: {
    name: string;
    version: string;
    requiredServices?: (keyof MFEServices)[];
    capabilities?: string[];
  };
  
  // Optional lifecycle hooks
  beforeMount?: (container: MFEServiceContainer) => void | Promise<void>;
  afterMount?: (container: MFEServiceContainer) => void | Promise<void>;
  beforeUnmount?: (container: MFEServiceContainer) => void | Promise<void>;
}

// Adapter to support legacy MFEModule interface
export class MFEModuleAdapter implements MFEModuleV2 {
  private legacyModule: { mount: (element: HTMLElement, services: MFEServices) => void; unmount: () => void };
  
  constructor(legacyModule: any) {
    this.legacyModule = legacyModule;
  }
  
  mount(element: HTMLElement, container: MFEServiceContainer): void {
    const services = container.getAllServices();
    this.legacyModule.mount(element, services);
  }
  
  unmount(_container: MFEServiceContainer): void {
    this.legacyModule.unmount();
  }
}

// Helper to detect and adapt MFE modules
export const adaptMFEModule = (module: any): MFEModuleV2 => {
  // Check if it's already a V2 module
  if (module.mount && module.mount.length >= 2 && 
      module.unmount && module.unmount.length >= 1) {
    // Check if mount accepts a container (has container methods)
    return module as MFEModuleV2;
  }
  
  // Otherwise, wrap legacy module
  return new MFEModuleAdapter(module);
};