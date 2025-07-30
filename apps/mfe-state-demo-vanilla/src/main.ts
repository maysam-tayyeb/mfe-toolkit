// Vanilla TypeScript State Demo MFE
import type { MFEServices } from '@mfe/dev-kit';
import { UniversalStateManager } from '@mfe/universal-state';
import valtioMFE from './valtio-main';

// Check if we're using UniversalStateManager (Valtio implementation)
const isUniversalStateManager = (services: MFEServices): boolean => {
  return services.stateManager instanceof UniversalStateManager;
};

// Export the appropriate implementation based on the state manager type
const StateDemoVanillaMFE = {
  mount: (element: HTMLElement, services: MFEServices) => {
    if (isUniversalStateManager(services)) {
      return valtioMFE.mount(element, services);
    }
    // For now, fall back to Universal State Manager implementation
    console.log('[Vanilla State Demo] Using Universal State Manager implementation');
    return valtioMFE.mount(element, services);
  },
  unmount: (element: HTMLElement) => {
    return valtioMFE.unmount(element);
  }
};

export default StateDemoVanillaMFE;