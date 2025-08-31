/**
 * Authorization Service Provider
 */

import type { ServiceProvider, ServiceContainer } from '../../services/registry/types';
import type { AuthorizationService, AuthorizationConfig } from '../../types/authorization';
import { AUTHZ_SERVICE_KEY } from '../../types/authorization';
import { AuthorizationServiceImpl } from './authorization-service';

export interface AuthorizationProviderOptions extends AuthorizationConfig {
  // Additional provider-specific options can be added here
}

/**
 * Create an authorization service provider
 */
export function createAuthorizationProvider(options?: AuthorizationProviderOptions): ServiceProvider<AuthorizationService> {
  return {
    name: AUTHZ_SERVICE_KEY,
    version: '1.0.0',
    dependencies: ['logger'],
    
    create(container: ServiceContainer): AuthorizationService {
      const logger = container.get('logger');
      const service = new AuthorizationServiceImpl(options);
      
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
export const authorizationServiceProvider = createAuthorizationProvider();