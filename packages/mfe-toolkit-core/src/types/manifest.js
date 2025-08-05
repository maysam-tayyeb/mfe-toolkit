/**
 * MFE Manifest Types
 *
 * Comprehensive type definitions for MFE manifests with full type safety,
 * validation support, and extensibility.
 */
/**
 * Type guard to check if manifest is V2
 */
export function isMFEManifestV2(manifest) {
    return ('dependencies' in manifest &&
        typeof manifest.dependencies === 'object' &&
        'runtime' in manifest.dependencies);
}
/**
 * Type guard to check if manifest is V1
 */
export function isMFEManifestV1(manifest) {
    return !isMFEManifestV2(manifest);
}
