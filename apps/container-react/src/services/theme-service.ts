import { Theme, ThemeService } from '@mfe-toolkit/core';

type ThemeChangeListener = (theme: Theme) => void;

export class ThemeServiceImpl implements ThemeService {
  private listeners: Set<ThemeChangeListener> = new Set();
  private currentTheme: Theme;

  constructor() {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.applyTheme(this.currentTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        // Only update if user hasn't set a preference
        const newTheme = e.matches ? 'dark' : 'light';
        this.setTheme(newTheme);
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
      localStorage.setItem('theme', theme);
      this.notifyListeners(theme);
    }
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
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

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
    }
  }

  private notifyListeners(theme: Theme): void {
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }
}

// Singleton instance
let themeService: ThemeServiceImpl | null = null;

export const getThemeService = (): ThemeServiceImpl => {
  if (!themeService) {
    themeService = new ThemeServiceImpl();
  }
  return themeService;
};