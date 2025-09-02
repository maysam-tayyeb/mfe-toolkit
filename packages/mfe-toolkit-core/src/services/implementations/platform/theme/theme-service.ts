/**
 * Theme Service Implementation
 */

import type { Theme, ThemeService } from "../../../../services/types";

export class ThemeServiceImpl implements ThemeService {
  private theme: Theme;
  private availableThemes: Theme[];
  private listeners = new Set<(theme: Theme) => void>();
  private storageKey = 'mfe-theme';

  constructor(defaultTheme: Theme = 'light', availableThemes: Theme[] = ['light', 'dark']) {
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

/**
 * Create a theme service instance
 */
export function createThemeService(defaultTheme?: Theme, availableThemes?: Theme[]): ThemeService {
  return new ThemeServiceImpl(defaultTheme, availableThemes);
}

// Generic alias following the pattern
export const createTheme = createThemeService;