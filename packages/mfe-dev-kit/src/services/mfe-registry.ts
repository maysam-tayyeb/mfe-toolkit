import { MFEManifest, MFERegistry } from '../types';

export class MFERegistryService {
  private registry: MFERegistry = {};

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
}

export const createMFERegistry = (): MFERegistryService => new MFERegistryService();
