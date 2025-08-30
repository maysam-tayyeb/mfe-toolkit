/**
 * @mfe-toolkit/service-theme
 * Theme management service for MFE Toolkit
 */

import type { ServiceProvider, ServiceContainer } from '@mfe-toolkit/core';

// Types
export type Theme = string;

export interface ThemeService {
  getTheme(): Theme;
  setTheme(theme: Theme): void;
  subscribe(callback: (theme: Theme) => void): () => void;
  getAvailableThemes?(): Theme[];
  cycleTheme?(): void;
}

export const THEME_SERVICE_KEY = 'theme';

// Implementation
class ThemeServiceImpl implements ThemeService {
  private theme: Theme;
  private availableThemes: Theme[];
  private listeners = new Set<(theme: Theme) => void>();
  private storageKey = 'mfe-theme';

  constructor(defaultTheme = 'light', availableThemes = ['light', 'dark']) {
    this.availableThemes = availableThemes;
    this.theme = this.loadTheme() || defaultTheme;
    this.applyTheme();
  }

  getTheme(): Theme {
    return this.theme;
  }

  setTheme(theme: Theme): void {
    if (this.theme === theme) return;
    
    this.theme = theme;
    this.saveTheme();
    this.applyTheme();
    this.notifyListeners();
  }

  subscribe(callback: (theme: Theme) => void): () => void {
    this.listeners.add(callback);
    callback(this.theme);
    return () => this.listeners.delete(callback);
  }

  getAvailableThemes(): Theme[] {
    return [...this.availableThemes];
  }

  cycleTheme(): void {
    const currentIndex = this.availableThemes.indexOf(this.theme);
    const nextIndex = (currentIndex + 1) % this.availableThemes.length;
    this.setTheme(this.availableThemes[nextIndex]);
  }

  private loadTheme(): Theme | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.storageKey);
  }

  private saveTheme(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, this.theme);
  }

  private applyTheme(): void {
    if (typeof window === 'undefined') return;
    document.documentElement.setAttribute('data-theme', this.theme);
    document.documentElement.className = document.documentElement.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .concat(`theme-${this.theme}`)
      .join(' ');
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.theme));
  }
}

// Provider
export function createThemeProvider(
  defaultTheme = 'light',
  availableThemes = ['light', 'dark']
): ServiceProvider<ThemeService> {
  return {
    name: THEME_SERVICE_KEY,
    version: '1.0.0',
    dependencies: ['logger'],
    
    create(container: ServiceContainer): ThemeService {
      const logger = container.get('logger');
      const service = new ThemeServiceImpl(defaultTheme, availableThemes);
      
      if (logger) {
        const originalSetTheme = service.setTheme.bind(service);
        service.setTheme = (theme) => {
          logger.info(`Changing theme to: ${theme}`);
          originalSetTheme(theme);
        };
      }
      
      return service;
    },
  };
}

export const themeServiceProvider = createThemeProvider();

// Module augmentation
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    theme: ThemeService;
  }
}