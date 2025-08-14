import type { ReactNode } from 'react';

// Re-export core types for convenience
export type {
  MFEServices,
  MFEModule,
  MFEServiceContainer,
  MFEManifest,
  Logger,
  EventBus,
  AuthService,
  ModalService,
  NotificationService,
  BaseModalConfig,
} from '@mfe-toolkit/core';

// React-specific types
export interface ModalConfig {
  title: string;
  content: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClose?: () => void;
  onConfirm?: () => void;
}
