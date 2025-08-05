export class MFERegistryService {
    constructor(options = {}) {
        this.manifests = new Map();
        this.lastFetch = 0;
        this.cacheKey = 'mfe-registry-cache';
        this.options = {
            cacheDuration: 5 * 60 * 1000, // 5 minutes default
            autoReload: false,
            ...options,
        };
    }
    async loadFromUrl(url) {
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
            const config = await response.json();
            this.loadFromConfig(config);
            // Cache the registry
            this.saveToCache(config);
            this.lastFetch = Date.now();
        }
        catch (error) {
            console.error('Failed to load registry from URL:', error);
            // Try fallback URL if available
            if (this.options.fallbackUrl && url !== this.options.fallbackUrl) {
                await this.loadFromUrl(this.options.fallbackUrl);
            }
            else {
                // Try to use cached version as last resort
                const cached = this.loadFromCache();
                if (!cached) {
                    throw error;
                }
            }
        }
    }
    loadFromConfig(config) {
        this.clear();
        config.mfes.forEach((manifest) => {
            this.register(manifest);
        });
    }
    loadFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                const config = JSON.parse(cached);
                this.loadFromConfig(config);
                return config;
            }
        }
        catch (error) {
            console.error('Failed to load from cache:', error);
        }
        return null;
    }
    saveToCache(config) {
        try {
            localStorage.setItem(this.cacheKey, JSON.stringify(config));
        }
        catch (error) {
            console.error('Failed to save to cache:', error);
        }
    }
    isCacheExpired() {
        return Date.now() - this.lastFetch > (this.options.cacheDuration || 0);
    }
    register(manifest) {
        this.manifests.set(manifest.name, manifest);
    }
    unregister(name) {
        this.manifests.delete(name);
    }
    get(name) {
        return this.manifests.get(name);
    }
    getAll() {
        return Object.fromEntries(this.manifests);
    }
    has(name) {
        return this.manifests.has(name);
    }
    clear() {
        this.manifests.clear();
    }
    async refresh() {
        if (this.options.url) {
            await this.loadFromUrl();
        }
    }
}
export const createMFERegistry = (options) => new MFERegistryService(options);
