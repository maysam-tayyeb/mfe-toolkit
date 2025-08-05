// Components
export { MFELoader } from './components/MFELoader';
export { MFEPage } from './components/MFEPage';
export { MFEErrorBoundary, withMFEErrorBoundary } from './components/MFEErrorBoundary';

// Services
export { MFEProvider, useMFEServices } from './services/dependency-injection';

// State Management
export * from './state/mfe-store-factory';
export * from './state/mfe-store-hooks';

// Types
export type { ModalConfig } from './types';
