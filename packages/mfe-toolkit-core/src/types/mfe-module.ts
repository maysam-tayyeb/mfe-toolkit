import { MFEServices } from './index';
import { MFEServiceContainer } from '../services/service-container';

// MFE module interface with service container support
export interface MFEModule {
  // Mount method with service container
  mount: (element: HTMLElement, container: MFEServiceContainer) => void | Promise<void>;

  // Unmount receives the container for cleanup
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