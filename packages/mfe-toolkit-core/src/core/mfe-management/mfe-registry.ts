import { MFEManifest } from '../../types';

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
  private manifests: Map<string, MFEManifest> = new Map();
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

      this.saveToCache(config);
      this.lastFetch = Date.now();
    } catch (error) {
      console.error('Failed to load registry from URL:', error);

      if (this.options.fallbackUrl && url !== this.options.fallbackUrl) {
        await this.loadFromUrl(this.options.fallbackUrl);
      } else {
        const cached = this.loadFromCache();
        if (!cached) {
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
    this.manifests.set(manifest.name, manifest);
  }

  unregister(name: string): void {
    this.manifests.delete(name);
  }

  get(name: string): MFEManifest | undefined {
    return this.manifests.get(name);
  }

  getAll(): Record<string, MFEManifest> {
    return Object.fromEntries(this.manifests);
  }

  has(name: string): boolean {
    return this.manifests.has(name);
  }

  clear(): void {
    this.manifests.clear();
  }

  async refresh(): Promise<void> {
    if (this.options.url) {
      await this.loadFromUrl();
    }
  }
}

export const createMFERegistry = (options?: RegistryOptions): MFERegistryService =>
  new MFERegistryService(options);
