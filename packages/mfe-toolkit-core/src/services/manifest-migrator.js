import { manifestValidator } from './manifest-validator';
export class ManifestMigrator {
    /**
     * Migrate a single manifest from V1 to V2
     */
    migrateManifest(v1Manifest) {
        try {
            // Use the validator's migration method
            const v2Manifest = manifestValidator.migrateToV2(v1Manifest);
            // Validate the migrated manifest
            const validation = manifestValidator.validate(v2Manifest);
            if (!validation.valid) {
                return {
                    success: false,
                    errors: validation.errors?.map((e) => `${e.field}: ${e.message}`),
                };
            }
            return {
                success: true,
                manifest: v2Manifest,
                warnings: validation.warnings?.map((w) => `${w.field}: ${w.message}`),
            };
        }
        catch (error) {
            return {
                success: false,
                errors: [`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
            };
        }
    }
    /**
     * Migrate an entire registry
     */
    migrateRegistry(registry) {
        const results = new Map();
        const migratedMfes = [];
        // Handle both old and new registry formats
        const mfes = Array.isArray(registry) ? registry : registry.mfes || [];
        for (const manifest of mfes) {
            const validation = manifestValidator.validate(manifest);
            if (validation.version === 'v1') {
                // Migrate V1 to V2
                const result = this.migrateManifest(manifest);
                results.set(manifest.name, result);
                if (result.success && result.manifest) {
                    migratedMfes.push(result.manifest);
                }
            }
            else {
                // Already V2, just add it
                results.set(manifest.name, {
                    success: true,
                    manifest: manifest,
                });
                migratedMfes.push(manifest);
            }
        }
        const allSuccess = Array.from(results.values()).every((r) => r.success);
        const newRegistry = {
            $schema: 'https://mfe-made-easy.com/schemas/mfe-registry.schema.json',
            version: '2.0.0',
            environment: registry.environment || 'development',
            lastUpdated: new Date().toISOString(),
            mfes: migratedMfes,
        };
        return {
            success: allSuccess,
            registry: allSuccess ? newRegistry : undefined,
            results,
        };
    }
    /**
     * Generate a migration report
     */
    generateReport(result) {
        const lines = [];
        lines.push('# MFE Manifest Migration Report');
        lines.push(`Date: ${new Date().toISOString()}`);
        lines.push(`Overall Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
        lines.push('');
        lines.push('## Migration Results');
        result.results.forEach((mfeResult, name) => {
            lines.push(`\n### ${name}`);
            lines.push(`Status: ${mfeResult.success ? '✅ Success' : '❌ Failed'}`);
            if (mfeResult.errors && mfeResult.errors.length > 0) {
                lines.push('\nErrors:');
                mfeResult.errors.forEach((error) => {
                    lines.push(`- ${error}`);
                });
            }
            if (mfeResult.warnings && mfeResult.warnings.length > 0) {
                lines.push('\nWarnings:');
                mfeResult.warnings.forEach((warning) => {
                    lines.push(`- ${warning}`);
                });
            }
            if (mfeResult.success && mfeResult.manifest) {
                lines.push('\nMigrated Configuration:');
                lines.push('```json');
                lines.push(JSON.stringify(mfeResult.manifest, null, 2));
                lines.push('```');
            }
        });
        if (result.success && result.registry) {
            lines.push('\n## New Registry Format');
            lines.push('```json');
            lines.push(JSON.stringify(result.registry, null, 2));
            lines.push('```');
        }
        lines.push('\n## Next Steps');
        if (result.success) {
            lines.push('1. Review the migrated manifests above');
            lines.push('2. Update any custom configurations as needed');
            lines.push('3. Replace your current registry with the new format');
            lines.push('4. Test your MFEs with the new manifests');
        }
        else {
            lines.push('1. Fix the errors listed above');
            lines.push('2. Re-run the migration');
            lines.push('3. Contact support if you need assistance');
        }
        return lines.join('\n');
    }
    /**
     * Generate example manifests for documentation
     */
    generateExamples() {
        const basicReactMFE = {
            $schema: 'https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json',
            name: 'example-react-mfe',
            version: '1.0.0',
            url: 'http://localhost:8080/example-mfe/bundle.js',
            dependencies: {
                runtime: {
                    axios: '^1.0.0',
                    'date-fns': '^2.0.0',
                },
                peer: {
                    react: '^18.0.0 || ^19.0.0',
                    'react-dom': '^18.0.0 || ^19.0.0',
                },
            },
            compatibility: {
                container: '>=1.0.0',
                browsers: {
                    chrome: '>=90',
                    firefox: '>=88',
                    safari: '>=14',
                    edge: '>=90',
                },
                frameworks: {
                    react: '>=18.0.0',
                },
            },
            capabilities: {
                emits: ['example:data-loaded', 'example:user-action'],
                listens: ['user:login', 'user:logout'],
                routes: [
                    { path: '/example', exact: true },
                    { path: '/example/:id', exact: false },
                ],
            },
            requirements: {
                services: [
                    { name: 'logger', version: '>=1.0.0' },
                    { name: 'eventBus', version: '>=1.0.0' },
                    { name: 'auth', optional: true },
                    { name: 'notification', optional: true },
                ],
                permissions: ['read:data', 'write:data'],
            },
            metadata: {
                displayName: 'Example React MFE',
                description: 'A sample React micro frontend demonstrating V2 manifest features',
                icon: '⚛️',
                author: {
                    name: 'MFE Team',
                    email: 'team@example.com',
                },
                repository: 'https://github.com/example/react-mfe',
                documentation: 'https://docs.example.com/react-mfe',
                tags: ['react', 'example', 'demo'],
                category: 'demo',
            },
            config: {
                loading: {
                    timeout: 30000,
                    retries: 3,
                    retryDelay: 1000,
                    priority: 10,
                },
                runtime: {
                    isolation: 'none',
                    keepAlive: true,
                    singleton: true,
                },
            },
            security: {
                csp: {
                    'default-src': ["'self'"],
                    'script-src': ["'self'", "'unsafe-inline'"],
                    'style-src': ["'self'", "'unsafe-inline'"],
                    'connect-src': ["'self'", 'https://api.example.com'],
                },
                permissions: {
                    required: ['core:access'],
                    optional: ['admin:access'],
                },
            },
        };
        const vueMFE = {
            $schema: 'https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json',
            name: 'dashboard-vue-mfe',
            version: '2.1.0',
            url: 'http://localhost:8080/dashboard-mfe/bundle.js',
            dependencies: {
                runtime: {
                    '@vueuse/core': '^10.0.0',
                    pinia: '^2.1.0',
                },
                peer: {
                    vue: '^3.4.0',
                },
            },
            compatibility: {
                container: '>=1.2.0',
                frameworks: {
                    vue: '>=3.4.0',
                },
            },
            requirements: {
                services: [
                    { name: 'logger' },
                    { name: 'eventBus' },
                    { name: 'stateManager', version: '>=2.0.0' },
                ],
            },
            metadata: {
                displayName: 'Dashboard Vue MFE',
                description: 'Vue-based dashboard micro frontend',
                icon: '💚',
                tags: ['vue', 'dashboard', 'analytics'],
            },
        };
        return {
            'react-basic': basicReactMFE,
            'vue-dashboard': vueMFE,
        };
    }
}
// Export singleton instance
export const manifestMigrator = new ManifestMigrator();
