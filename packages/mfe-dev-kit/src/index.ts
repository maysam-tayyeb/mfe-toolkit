// Types
export * from './types';

// Services
export { createLogger } from './services/logger';
export { createEventBus, EventBusImpl } from './services/event-bus';
export { createMFERegistry, MFERegistryService } from './services/mfe-registry';

// Components
export { MFELoader } from './components/MFELoader';
export { MFEPage } from './components/MFEPage';

// Utility function to get services from window
import { MFEServices, MFEWindow } from './types';

export const getMFEServices = (): MFEServices | undefined => {
  return (window as MFEWindow).__MFE_SERVICES__;
};