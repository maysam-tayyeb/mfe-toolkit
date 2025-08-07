/**
 * MFE Development Container
 * Main entry point for the package
 */

export { DevContainerServer } from './server';
export { createDevServices, initializeDevContainer } from './services';
export type { DevContainerConfig, AuthMockConfig } from './services';

// Re-export services
export { DevModalService } from './services/modal-service';
export { DevNotificationService } from './services/notification-service';
export { DevAuthService } from './services/auth-service';
export { DevThemeService } from './services/theme-service';
export { DevStateManager } from './services/state-service';