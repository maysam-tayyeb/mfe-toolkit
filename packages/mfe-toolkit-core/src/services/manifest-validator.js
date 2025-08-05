import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import manifestSchemaV2 from '../schemas/mfe-manifest-v2.schema.json';
export class ManifestValidator {
    constructor() {
        this.ajv = new Ajv({
            allErrors: true,
            verbose: true,
            strict: false,
        });
        // Add format validators
        addFormats(this.ajv);
        // Compile schema
        this.validateV2 = this.ajv.compile(manifestSchemaV2);
    }
    /**
     * Validate an MFE manifest
     */
    validate(manifest) {
        // Check if it's a valid object
        if (!manifest || typeof manifest !== 'object') {
            return {
                valid: false,
                errors: [
                    {
                        field: 'manifest',
                        message: 'Manifest must be an object',
                    },
                ],
                version: 'v1',
            };
        }
        const manifestObj = manifest;
        // Detect version and validate accordingly
        if (this.looksLikeV2(manifestObj)) {
            return this.validateV2Manifest(manifestObj);
        }
        else {
            return this.validateV1Manifest(manifestObj);
        }
    }
    /**
     * Check if manifest appears to be V2 format
     */
    looksLikeV2(manifest) {
        return (manifest.dependencies &&
            typeof manifest.dependencies === 'object' &&
            ('runtime' in manifest.dependencies || 'peer' in manifest.dependencies));
    }
    /**
     * Validate V2 manifest
     */
    validateV2Manifest(manifest) {
        const valid = this.validateV2(manifest);
        if (!valid) {
            const errors = this.validateV2.errors?.map((error) => ({
                field: error.instancePath || error.schemaPath,
                message: error.message || 'Validation error',
                value: error.data,
            })) || [];
            return {
                valid: false,
                errors,
                version: 'v2',
            };
        }
        // Check for warnings (best practices)
        const warnings = this.checkV2Warnings(manifest);
        return {
            valid: true,
            warnings: warnings && warnings.length > 0 ? warnings : undefined,
            version: 'v2',
        };
    }
    /**
     * Validate V1 manifest (legacy)
     */
    validateV1Manifest(manifest) {
        const errors = [];
        const warnings = [];
        // Required fields
        if (!manifest.name) {
            errors.push({
                field: 'name',
                message: 'Name is required',
            });
        }
        else if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(manifest.name)) {
            errors.push({
                field: 'name',
                message: 'Name must start with a letter and contain only letters, numbers, hyphens, and underscores',
                value: manifest.name,
            });
        }
        if (!manifest.version) {
            errors.push({
                field: 'version',
                message: 'Version is required',
            });
        }
        if (!manifest.url) {
            errors.push({
                field: 'url',
                message: 'URL is required',
            });
        }
        else {
            try {
                new URL(manifest.url);
            }
            catch {
                errors.push({
                    field: 'url',
                    message: 'URL must be a valid URL',
                    value: manifest.url,
                });
            }
        }
        // Warnings for V1
        warnings.push({
            field: 'manifest',
            message: 'This manifest uses the legacy V1 format',
            suggestion: 'Consider migrating to V2 format for better type safety and features',
        });
        if (!manifest.metadata?.displayName) {
            warnings.push({
                field: 'metadata.displayName',
                message: 'Display name is recommended for better UX',
            });
        }
        if (!manifest.metadata?.description) {
            warnings.push({
                field: 'metadata.description',
                message: 'Description is recommended for documentation',
            });
        }
        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
            warnings: warnings.length > 0 ? warnings : undefined,
            version: 'v1',
        };
    }
    /**
     * Check for best practice warnings in V2 manifest
     */
    checkV2Warnings(manifest) {
        const warnings = [];
        // Security warnings
        if (!manifest.security) {
            warnings.push({
                field: 'security',
                message: 'Security configuration is recommended',
                suggestion: 'Add CSP directives and permission requirements',
            });
        }
        // Performance warnings
        if (!manifest.config?.loading?.timeout) {
            warnings.push({
                field: 'config.loading.timeout',
                message: 'Loading timeout is recommended',
                suggestion: 'Set a reasonable timeout (e.g., 30000ms) to handle slow networks',
            });
        }
        // Compatibility warnings
        if (!manifest.compatibility.browsers) {
            warnings.push({
                field: 'compatibility.browsers',
                message: 'Browser compatibility information is recommended',
                suggestion: 'Specify minimum browser versions for better user experience',
            });
        }
        // Documentation warnings
        if (!manifest.metadata.repository && !manifest.metadata.documentation) {
            warnings.push({
                field: 'metadata',
                message: 'Repository or documentation URL is recommended',
                suggestion: 'Add links to help users find more information',
            });
        }
        // Capability warnings
        if (manifest.capabilities?.emits && manifest.capabilities.emits.length > 0) {
            const hasEventDocs = manifest.metadata.documentation ||
                manifest.capabilities.emits.every((e) => e.includes(':'));
            if (!hasEventDocs) {
                warnings.push({
                    field: 'capabilities.emits',
                    message: 'Event documentation is recommended',
                    suggestion: 'Use namespaced events (e.g., "mfe:event") or provide documentation',
                });
            }
        }
        return warnings;
    }
    /**
     * Migrate V1 manifest to V2 format
     */
    migrateToV2(v1Manifest) {
        const v2Manifest = {
            $schema: 'https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json',
            name: v1Manifest.name,
            version: v1Manifest.version,
            url: v1Manifest.url,
            dependencies: {
                runtime: {},
                peer: {},
            },
            compatibility: {
                container: '>=1.0.0',
            },
            requirements: {
                services: [
                    { name: 'logger', optional: false },
                    { name: 'eventBus', optional: false },
                    { name: 'auth', optional: true },
                    { name: 'modal', optional: true },
                    { name: 'notification', optional: true },
                ],
            },
            metadata: {
                displayName: v1Manifest.metadata?.displayName || v1Manifest.name,
                description: v1Manifest.metadata?.description || `${v1Manifest.name} micro frontend`,
                icon: v1Manifest.metadata?.icon,
            },
        };
        // Migrate dependencies
        if (v1Manifest.dependencies) {
            v1Manifest.dependencies.forEach((dep) => {
                if (dep === 'react' || dep === 'react-dom') {
                    v2Manifest.dependencies.peer[dep] = '*';
                }
                else {
                    v2Manifest.dependencies.runtime[dep] = '*';
                }
            });
        }
        // Migrate shared libs
        if (v1Manifest.sharedLibs) {
            v1Manifest.sharedLibs.forEach((lib) => {
                v2Manifest.dependencies.peer[lib] = '*';
            });
        }
        // Copy over any additional metadata
        if (v1Manifest.metadata) {
            Object.entries(v1Manifest.metadata).forEach(([key, value]) => {
                if (key !== 'displayName' && key !== 'description' && key !== 'icon') {
                    v2Manifest.metadata[key] = value;
                }
            });
        }
        return v2Manifest;
    }
    /**
     * Get a human-readable summary of validation results
     */
    getSummary(result) {
        const lines = [];
        lines.push(`Manifest Version: ${result.version.toUpperCase()}`);
        lines.push(`Validation: ${result.valid ? '✅ PASSED' : '❌ FAILED'}`);
        if (result.errors && result.errors.length > 0) {
            lines.push('\nErrors:');
            result.errors.forEach((error) => {
                lines.push(`  - ${error.field}: ${error.message}`);
                if (error.value !== undefined) {
                    lines.push(`    Value: ${JSON.stringify(error.value)}`);
                }
            });
        }
        if (result.warnings && result.warnings.length > 0) {
            lines.push('\nWarnings:');
            result.warnings.forEach((warning) => {
                lines.push(`  - ${warning.field}: ${warning.message}`);
                if (warning.suggestion) {
                    lines.push(`    💡 ${warning.suggestion}`);
                }
            });
        }
        return lines.join('\n');
    }
}
// Export singleton instance
export const manifestValidator = new ManifestValidator();
