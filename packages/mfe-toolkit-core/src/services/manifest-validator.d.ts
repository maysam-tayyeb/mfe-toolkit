import { MFEManifestV1, MFEManifestV2 } from '../types/manifest';
export interface ValidationResult {
    valid: boolean;
    errors?: Array<{
        field: string;
        message: string;
        value?: any;
    }>;
    warnings?: Array<{
        field: string;
        message: string;
        suggestion?: string;
    }>;
    version: 'v1' | 'v2';
}
export declare class ManifestValidator {
    private ajv;
    private validateV2;
    constructor();
    /**
     * Validate an MFE manifest
     */
    validate(manifest: unknown): ValidationResult;
    /**
     * Check if manifest appears to be V2 format
     */
    private looksLikeV2;
    /**
     * Validate V2 manifest
     */
    private validateV2Manifest;
    /**
     * Validate V1 manifest (legacy)
     */
    private validateV1Manifest;
    /**
     * Check for best practice warnings in V2 manifest
     */
    private checkV2Warnings;
    /**
     * Migrate V1 manifest to V2 format
     */
    migrateToV2(v1Manifest: MFEManifestV1): MFEManifestV2;
    /**
     * Get a human-readable summary of validation results
     */
    getSummary(result: ValidationResult): string;
}
export declare const manifestValidator: ManifestValidator;
//# sourceMappingURL=manifest-validator.d.ts.map