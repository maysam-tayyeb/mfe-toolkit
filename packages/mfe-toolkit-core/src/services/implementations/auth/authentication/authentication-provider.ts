/**
 * Authentication Service Provider
 */

import type { ServiceProvider, ServiceContainer } from '../../services/registry/types';
import type { AuthService, AuthConfig } from "../../../../services/types";
import { AUTH_SERVICE_KEY } from "../../../../services/types";
import { AuthServiceImpl } from './auth-service';

export interface AuthProviderOptions extends AuthConfig {
  // Additional provider-specific options can be added here
}

/**
 * Create an authentication service provider
 */
export function createAuthProvider(options?: AuthProviderOptions): ServiceProvider<AuthService> {
  return {
    name: AUTH_SERVICE_KEY,
    version: '1.0.0',
    dependencies: ['logger'],
    
    create(container: ServiceContainer): AuthService {
      const logger = container.get('logger');
      const service = new AuthServiceImpl(options);
      
      if (logger) {
        logger.info('Authentication service initialized');
        
        // Wrap methods with logging
        const originalLogin = service.login?.bind(service);
        if (originalLogin) {
          service.login = async (credentials) => {
            logger.info('User login attempt');
            try {
              const result = await originalLogin(credentials);
              logger.info(`User logged in: ${result.username}`);
              return result;
            } catch (error) {
              logger.error('Login failed:', error);
              throw error;
            }
          };
        }
        
        const originalLogout = service.logout?.bind(service);
        if (originalLogout) {
          service.logout = async () => {
            const session = service.getSession();
            if (session) {
              logger.info(`User logged out: ${session.username}`);
            }
            return originalLogout();
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
 * Default authentication service provider
 */
export const authServiceProvider = createAuthProvider();