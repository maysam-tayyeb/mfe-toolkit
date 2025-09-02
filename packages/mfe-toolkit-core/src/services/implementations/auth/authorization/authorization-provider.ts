/**
 * Authorization Service Provider
 */

import type { ServiceProvider, ServiceContainer } from '../../../../registry/types';
import type { AuthzService, AuthorizationConfig } from "../../../../services/types";
import { AUTHZ_SERVICE_KEY } from "../../../../services/types";
import { AuthzServiceImpl } from './authorization-service';

export interface AuthorizationProviderOptions extends AuthorizationConfig {
  // Additional provider-specific options can be added here
}

/**
 * Create an authorization service provider
 */
export function createAuthzProvider(options?: AuthorizationProviderOptions): ServiceProvider<AuthzService> {
  return {
    name: AUTHZ_SERVICE_KEY,
    version: '1.0.0',
    dependencies: ['logger'],
    
    create(container: ServiceContainer): AuthzService {
      const logger = container.get('logger');
      const service = new AuthzServiceImpl(options);
      
      if (logger) {
        logger.info('Authorization service initialized');
        
        // Wrap updateAuthorization with logging
        const originalUpdate = service.updateAuthorization?.bind(service);
        if (originalUpdate) {
          service.updateAuthorization = (roles, permissions) => {
            logger.info('Authorization updated', { roles, permissions });
            return originalUpdate(roles, permissions);
          };
        }
      }
      
      return service;
    },
    
    dispose(): void {
      // Cleanup handled by service
    },
  };
}

/**
 * Default authorization service provider
 */
export const authzServiceProvider = createAuthzProvider();