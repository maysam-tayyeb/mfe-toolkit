// Re-export manifest types
export type {
  MFEManifest,
  MFEManifestV1,
  MFEManifestV2,
  MFERegistry,
  MFEDependencies,
  MFECompatibility,
  MFECapabilities,
  MFERequirements,
  MFEMetadata,
  MFEConfig,
  MFESecurity,
  MFELifecycle,
} from '@/types/manifest';

export { isMFEManifestV1, isMFEManifestV2 } from '@/types/manifest';

export interface AuthSession {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
}

export interface EventPayload<T = any> {
  type: string;
  data: T;
  timestamp: number;
  source: string;
}

export interface ModalConfig {
  title: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClose?: () => void;
  onConfirm?: () => void;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export interface NotificationConfig {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

export interface MFEServices {
  logger: Logger;
  auth: AuthService;
  eventBus: EventBus;
  modal: ModalService;
  notification: NotificationService;
  stateManager?: any; // Added for Universal State Demo
}

export interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

export interface AuthService {
  getSession: () => AuthSession | null;
  isAuthenticated: () => boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export interface EventBus {
  emit: <T = any>(event: string, payload: T) => void;
  on: <T = any>(event: string, handler: (payload: EventPayload<T>) => void) => () => void;
  off: (event: string, handler: (payload: EventPayload<any>) => void) => void;
  once: <T = any>(event: string, handler: (payload: EventPayload<T>) => void) => void;
}

export interface ModalService {
  open: (config: ModalConfig) => void;
  close: () => void;
}

export interface NotificationService {
  show: (config: NotificationConfig) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

export interface MFEModule {
  mount: (element: HTMLElement, services: MFEServices) => void;
  unmount: () => void;
}

export interface MFEWindow extends Window {
  __MFE_SERVICES__?: MFEServices;
  [key: string]: any;
}
