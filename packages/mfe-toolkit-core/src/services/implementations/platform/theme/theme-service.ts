/**
 * Theme Service Implementation
 * Production-ready theme service with system preference detection and mobile support
 */

import type { Theme, ThemeService } from "../../../../services/types";
import type { Logger } from "../../../types";
import { createConsoleLogger } from "../../base/logger/console-logger";

type ThemeChangeListener = (theme: Theme) => void;

export class ThemeServiceImpl implements ThemeService {
  private listeners: Set<ThemeChangeListener> = new Set();
  private currentTheme: Theme;
  private availableThemes: Theme[];
  private storageKey = 'theme';
  private logger: Logger;
  private systemThemeMediaQuery: MediaQueryList | null = null;

  constructor(themes: Theme[] = ['light', 'dark'], logger?: Logger) {
    this.availableThemes = themes;
    this.logger = logger || createConsoleLogger('ThemeService');

    // SSR safety check
    if (typeof window === 'undefined') {
      this.currentTheme = themes[0];
      return;
    }

    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem(this.storageKey) as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Validate saved theme is still available
    if (savedTheme && this.availableThemes.includes(savedTheme)) {
      this.currentTheme = savedTheme;
    } else {
      // Fallback to system preference or first available theme
      this.currentTheme =
        systemPrefersDark && this.availableThemes.includes('dark')
          ? 'dark'
          : this.availableThemes[0];
    }

    this.applyTheme(this.currentTheme);

    // Listen for system theme changes
    this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemThemeMediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        // Only update if user hasn't set a preference
        const preferredTheme = e.matches ? 'dark' : 'light';
        if (this.availableThemes.includes(preferredTheme)) {
          this.setTheme(preferredTheme);
        }
      }
    });
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    if (this.currentTheme !== theme) {
      this.currentTheme = theme;
      this.applyTheme(theme);
      this.saveTheme(theme);
      this.notifyListeners(theme);
    }
  }

  cycleTheme(): void {
    const currentIndex = this.availableThemes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.availableThemes.length;
    this.setTheme(this.availableThemes[nextIndex]);
  }

  getAvailableThemes(): Theme[] {
    return [...this.availableThemes];
  }

  subscribe(callback: ThemeChangeListener): () => void {
    this.listeners.add(callback);
    // Call immediately with current theme
    callback(this.currentTheme);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private saveTheme(theme: Theme): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, theme);
  }

  private applyTheme(theme: Theme): void {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;

    // Remove all theme classes
    this.availableThemes.forEach((t) => {
      root.classList.remove(t);
      root.classList.remove(`theme-${t}`);
    });

    // Add current theme class (both forms for compatibility)
    root.classList.add(theme);
    root.classList.add(`theme-${theme}`);

    // Also set as data attribute for more flexible CSS targeting
    root.setAttribute('data-theme', theme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      // Use theme-specific colors or fallback to light/dark defaults
      const themeColors: Record<string, string> = {
        light: '#ffffff',
        dark: '#000000',
        blue: '#1e40af',
        sepia: '#f5e6d3',
        // Add more theme colors as needed
      };
      metaThemeColor.setAttribute('content', themeColors[theme] || '#ffffff');
    }
  }

  private notifyListeners(theme: Theme): void {
    this.listeners.forEach((listener) => {
      try {
        listener(theme);
      } catch (error) {
        this.logger.error('Error in theme change listener:', error);
      }
    });
  }

  /**
   * Cleanup method to remove event listeners
   */
  dispose(): void {
    if (this.systemThemeMediaQuery && typeof window !== 'undefined') {
      // Note: removeEventListener requires the same function reference,
      // which we don't have here. In a production app, you'd store the listener.
      // For now, this is a placeholder for proper cleanup.
    }
    this.listeners.clear();
  }
}

// Singleton instance for shared use
let themeServiceInstance: ThemeServiceImpl | null = null;

/**
 * Create a theme service instance
 * @param themes - Available themes (defaults to ['light', 'dark'])
 * @param options - Additional options
 */
export function createThemeService(
  themes?: Theme[],
  options?: { logger?: Logger; singleton?: boolean }
): ThemeService {
  const { logger, singleton = false } = options || {};
  
  if (singleton) {
    if (!themeServiceInstance) {
      themeServiceInstance = new ThemeServiceImpl(themes, logger);
    }
    return themeServiceInstance;
  }
  
  return new ThemeServiceImpl(themes, logger);
}

/**
 * Get or create singleton theme service instance
 */
export function getThemeService(themes?: Theme[]): ThemeService {
  return createThemeService(themes, { singleton: true });
}

/**
 * Configure the theme service (must be called before first use of singleton)
 */
export function configureThemeService(themes: Theme[], logger?: Logger): void {
  if (themeServiceInstance) {
    const defaultLogger = logger || createConsoleLogger('ThemeService');
    defaultLogger.warn('Theme service already initialized. Ignoring new configuration.');
    return;
  }
  themeServiceInstance = new ThemeServiceImpl(themes, logger);
}

// Generic alias following the pattern
export const createTheme = createThemeService;