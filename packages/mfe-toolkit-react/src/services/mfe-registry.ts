import { MFEManifest } from '../types';

export async function loadMFEFromRegistry(
  registry: MFEManifest[],
  mfeName: string
): Promise<MFEManifest | undefined> {
  return registry.find((mfe) => mfe.name === mfeName);
}