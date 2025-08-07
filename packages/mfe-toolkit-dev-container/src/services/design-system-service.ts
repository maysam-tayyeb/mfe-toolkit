/**
 * Design System Service for MFE Development Container
 * Provides design system components to MFEs without global pollution
 */

import type { MFEServices } from '@mfe-toolkit/core';

export interface DesignSystemService {
  getReactComponents(): Promise<any>;
  getVueComponents(): Promise<any>;
  getVanillaHelpers(): Promise<any>;
  getTokens(): Promise<any>;
}

export class DevDesignSystemService implements DesignSystemService {
  private reactComponents: any = null;
  private vueComponents: any = null;
  private vanillaHelpers: any = null;
  private tokens: any = null;
  private framework: string = 'react'; // Default

  constructor(framework?: string) {
    if (framework) {
      this.framework = framework;
    }
  }

  /**
   * Detect framework from MFE configuration
   */
  private detectFramework(): string {
    // This would be determined from MFE config or package.json
    // For now, return the configured framework
    return this.framework;
  }

  /**
   * Initialize and load appropriate design system
   */
  async initialize(): Promise<void> {
    const framework = this.detectFramework();
    
    // Always load tokens
    try {
      this.tokens = await import('@mfe/design-system/tokens');
    } catch (error) {
      console.warn('Design system tokens not available:', error);
    }

    // Load framework-specific components
    switch (framework) {
      case 'react':
      case 'react17':
      case 'react19':
        try {
          // For now, use the main design system package
          // In future, this would be @mfe/design-system-react
          const designSystem = await import('@mfe/design-system');
          this.reactComponents = designSystem;
        } catch (error) {
          console.warn('React design system not available:', error);
        }
        break;
      
      case 'vue':
      case 'vue3':
        try {
          // Future: @mfe/design-system-vue
          console.log('Vue design system will be loaded when available');
        } catch (error) {
          console.warn('Vue design system not available:', error);
        }
        break;
      
      case 'vanilla':
      case 'typescript':
        try {
          // Future: @mfe/design-system-vanilla
          console.log('Vanilla design system will be loaded when available');
        } catch (error) {
          console.warn('Vanilla design system not available:', error);
        }
        break;
    }
  }

  async getReactComponents(): Promise<any> {
    if (!this.reactComponents) {
      await this.initialize();
    }
    return this.reactComponents || {};
  }

  async getVueComponents(): Promise<any> {
    if (!this.vueComponents) {
      await this.initialize();
    }
    return this.vueComponents || {};
  }

  async getVanillaHelpers(): Promise<any> {
    if (!this.vanillaHelpers) {
      await this.initialize();
    }
    return this.vanillaHelpers || {};
  }

  async getTokens(): Promise<any> {
    if (!this.tokens) {
      await this.initialize();
    }
    return this.tokens || {};
  }
}

/**
 * Create a design system service instance for injection into MFEs
 */
export function createDesignSystemService(framework?: string): DesignSystemService {
  return new DevDesignSystemService(framework);
}