/**
 * Theme Service Provider
 */

import type { ServiceProvider, ServiceContainer } from '../../../../registry/types';
import type { Theme, ThemeService } from '../../../../services/types';
import { THEME_SERVICE_KEY } from '../../../../services/types';
import { ThemeServiceImpl } from './theme-service';

export interface ThemeProviderOptions {
  availableThemes?: Theme[];
}

/**
 * Create a theme service provider
 */
export function createThemeProvider(options?: ThemeProviderOptions): ServiceProvider<ThemeService> {
  const { availableThemes = ['light', 'dark'] } = options || {};

  return {
    name: THEME_SERVICE_KEY,
    version: '1.0.0',
    dependencies: ['logger'],

    create(container: ServiceContainer): ThemeService {
      const logger = container.require('logger');
      const service = new ThemeServiceImpl(availableThemes, logger);

      logger.info('Theme service initialized');

      const originalSetTheme = service.setTheme.bind(service);
      service.setTheme = (theme) => {
        logger.info(`Changing theme to: ${theme}`);
        originalSetTheme(theme);
      };

      return service;
    },

    dispose(): void {
      // Cleanup handled by service
      // Note: In production, you might want to call service.dispose() here
    },
  };
}

/**
 * Default theme service provider
 */
export const themeServiceProvider = createThemeProvider();
