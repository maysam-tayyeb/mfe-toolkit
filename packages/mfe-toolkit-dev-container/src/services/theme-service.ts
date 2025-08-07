/**
 * Development Theme Service
 * Provides theme management for MFE development
 */

import type { ThemeService } from '@mfe-toolkit/core';

export type Theme = 'light' | 'dark' | 'auto';

export class DevThemeService implements ThemeService {
  private currentTheme: Theme;
  private listeners: Set<(theme: Theme) => void> = new Set();

  constructor(initialTheme: Theme = 'light') {
    this.currentTheme = initialTheme;
    this.applyTheme(initialTheme);
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    if (this.currentTheme !== theme) {
      this.currentTheme = theme;
      this.applyTheme(theme);
      this.notifyListeners(theme);
      console.log('[DevThemeService] Theme changed to:', theme);
    }
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  onThemeChange(callback: (theme: Theme) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    
    // Apply theme class to root
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Also set data attribute for compatibility
    root.setAttribute('data-theme', theme);
  }

  private notifyListeners(theme: Theme): void {
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('[DevThemeService] Error in theme change listener:', error);
      }
    });
  }
}