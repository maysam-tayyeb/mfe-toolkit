import { MFEManifest } from '../types';
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
export declare class MFERegistryService {
    private manifests;
    private options;
    private lastFetch;
    private cacheKey;
    constructor(options?: RegistryOptions);
    loadFromUrl(url?: string): Promise<void>;
    loadFromConfig(config: RegistryConfig): void;
    private loadFromCache;
    private saveToCache;
    private isCacheExpired;
    register(manifest: MFEManifest): void;
    unregister(name: string): void;
    get(name: string): MFEManifest | undefined;
    getAll(): Record<string, MFEManifest>;
    has(name: string): boolean;
    clear(): void;
    refresh(): Promise<void>;
}
export declare const createMFERegistry: (options?: RegistryOptions) => MFERegistryService;
//# sourceMappingURL=mfe-registry.d.ts.map