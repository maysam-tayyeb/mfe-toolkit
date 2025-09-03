/**
 * Modal Service Package
 * 
 * This package provides the Modal service for MFE Toolkit.
 * It extends the ServiceMap interface via TypeScript module augmentation.
 */

import type { ModalService } from './types';

// Module augmentation to extend ServiceMap
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    modal: ModalService;
  }
}

// Export types
export type { 
  ModalService, 
  BaseModalConfig, 
  ModalStackEntry, 
  ModalServiceConfig 
} from './types';

// Export implementation (tree-shakable)
export { ModalServiceImpl, createModalService } from './implementation';

// Export provider
export { modalServiceProvider } from './provider';

// Export service key constant
export const MODAL_SERVICE_KEY = 'modal';