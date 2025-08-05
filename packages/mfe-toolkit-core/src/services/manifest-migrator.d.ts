import { MFEManifestV1, MFEManifestV2, MFERegistry } from '../types/manifest';
export interface MigrationResult {
    success: boolean;
    manifest?: MFEManifestV2;
    errors?: string[];
    warnings?: string[];
}
export interface RegistryMigrationResult {
    success: boolean;
    registry?: MFERegistry;
    results: Map<string, MigrationResult>;
}
export declare class ManifestMigrator {
    /**
     * Migrate a single manifest from V1 to V2
     */
    migrateManifest(v1Manifest: MFEManifestV1): MigrationResult;
    /**
     * Migrate an entire registry
     */
    migrateRegistry(registry: any): RegistryMigrationResult;
    /**
     * Generate a migration report
     */
    generateReport(result: RegistryMigrationResult): string;
    /**
     * Generate example manifests for documentation
     */
    generateExamples(): Record<string, MFEManifestV2>;
}
export declare const manifestMigrator: ManifestMigrator;
//# sourceMappingURL=manifest-migrator.d.ts.map