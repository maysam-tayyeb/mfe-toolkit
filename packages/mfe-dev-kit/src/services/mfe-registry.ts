import { MFEManifest, MFERegistry } from '../types';

export interface RegistryConfig {
  mfes: MFEManifest[];
  version?: string;
  lastUpdated?: string;
  environment?: string;
}

export interface RegistryOptions {
  url?: string;
  fallbackUrl?: string;
  cacheDuration?: number;
  autoReload?: boolean;
}

export class MFERegistryService {
  private registry: MFERegistry = {};
  private options: RegistryOptions;
  private lastFetch: number = 0;
  private cacheKey = 'mfe-registry-cache';

  constructor(options: RegistryOptions = {}) {
    this.options = {
      cacheDuration: 5 * 60 * 1000, // 5 minutes default
      autoReload: false,
      ...options,
    };
  }

  async loadFromUrl(url?: string): Promise<void> {
    const targetUrl = url || this.options.url;
    if (!targetUrl) {
      throw new Error('No registry URL provided');
    }

    try {
      // Check cache first
      const cached = this.loadFromCache();
      if (cached && !this.isCacheExpired()) {
        return;
      }

      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Failed to load registry: ${response.statusText}`);
      }

      const config: RegistryConfig = await response.json();
      this.loadFromConfig(config);
      
      // Cache the registry
      this.saveToCache(config);
      this.lastFetch = Date.now();
    } catch (error) {
      console.error('Failed to load registry from URL:', error);
      
      // Try fallback URL if available
      if (this.options.fallbackUrl && url !== this.options.fallbackUrl) {
        console.log('Attempting to load from fallback URL...');
        await this.loadFromUrl(this.options.fallbackUrl);
      } else {
        // Try to use cached version as last resort
        const cached = this.loadFromCache();
        if (cached) {
          console.log('Using cached registry as fallback');
        } else {
          throw error;
        }
      }
    }
  }

  loadFromConfig(config: RegistryConfig): void {
    this.clear();
    config.mfes.forEach((manifest) => {
      this.register(manifest);
    });
  }

  private loadFromCache(): RegistryConfig | null {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const config = JSON.parse(cached);
        this.loadFromConfig(config);
        return config;
      }
    } catch (error) {
      console.error('Failed to load from cache:', error);
    }
    return null;
  }

  private saveToCache(config: RegistryConfig): void {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }

  private isCacheExpired(): boolean {
    return Date.now() - this.lastFetch > (this.options.cacheDuration || 0);
  }

  register(manifest: MFEManifest): void {
    this.registry[manifest.name] = manifest;
  }

  unregister(name: string): void {
    delete this.registry[name];
  }

  get(name: string): MFEManifest | undefined {
    return this.registry[name];
  }

  getAll(): MFERegistry {
    return { ...this.registry };
  }

  has(name: string): boolean {
    return name in this.registry;
  }

  clear(): void {
    this.registry = {};
  }

  async refresh(): Promise<void> {
    if (this.options.url) {
      await this.loadFromUrl();
    }
  }
}

export const createMFERegistry = (options?: RegistryOptions): MFERegistryService => 
  new MFERegistryService(options);
