import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { MFEManifest } from '../types/manifest';
import manifestSchema from '../schemas/mfe-manifest.schema.json';

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  warnings?: Array<{
    field: string;
    message: string;
  }>;
  version?: string;
}

export class ManifestValidator {
  private ajv: Ajv;
  private validateManifest: ValidateFunction<MFEManifest>;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
    });

    // Add format validators
    addFormats(this.ajv);

    // Add custom formats
    this.addCustomFormats();

    // Compile schema
    this.validateManifest = this.ajv.compile<MFEManifest>(manifestSchema);
  }

  private addCustomFormats() {
    // Semantic version format
    this.ajv.addFormat('semantic-version', {
      type: 'string',
      validate: (data: string) => {
        return /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/.test(data);
      },
    });

    // Module URL format
    this.ajv.addFormat('module-url', {
      type: 'string',
      validate: (data: string) => {
        return data.endsWith('.js') || data.endsWith('.mjs');
      },
    });
  }

  /**
   * Validate a manifest
   */
  validate(manifest: any): ValidationResult {
    if (!manifest || typeof manifest !== 'object') {
      return {
        valid: false,
        errors: [{ field: 'root', message: 'Invalid manifest format' }],
      };
    }

    // Validate with schema
    const valid = this.validateManifest(manifest);

    if (!valid) {
      return {
        valid: false,
        errors: this.formatErrors(this.validateManifest.errors || []),
        version: 'current',
      };
    }

    // Check for warnings
    const warnings = this.checkWarnings(manifest as MFEManifest);

    return {
      valid: true,
      warnings,
      version: 'current',
    };
  }

  /**
   * Format validation errors
   */
  private formatErrors(errors: any[]): ValidationResult['errors'] {
    return errors.map((e: any) => ({
      field: e.instancePath || 'root',
      message: e.message || 'Validation error',
    }));
  }

  /**
   * Check for warnings (non-critical issues)
   */
  private checkWarnings(manifest: MFEManifest): ValidationResult['warnings'] {
    const warnings: ValidationResult['warnings'] = [];

    // Check if manifest is deprecated
    if (manifest.deprecated) {
      warnings.push({
        field: 'deprecated',
        message: `MFE is deprecated since ${manifest.deprecated.since}`,
      });
    }

    // Check for missing optional but recommended fields
    if (!manifest.metadata?.description) {
      warnings.push({
        field: 'metadata.description',
        message: 'Missing description - recommended for better documentation',
      });
    }

    if (!manifest.metadata?.tags || manifest.metadata.tags.length === 0) {
      warnings.push({
        field: 'metadata.tags',
        message: 'No tags specified - consider adding tags for better discoverability',
      });
    }

    // Check for outdated dependencies
    if (manifest.dependencies?.peer) {
      Object.entries(manifest.dependencies.peer).forEach(([lib, version]) => {
        if (lib === 'react' && version.includes('16')) {
          warnings.push({
            field: `dependencies.peer.${lib}`,
            message: 'React 16 is outdated - consider upgrading to React 18+',
          });
        }
      });
    }

    return warnings.length > 0 ? warnings : undefined;
  }

  /**
   * Get validation summary
   */
  getSummary(result: ValidationResult): string {
    const lines: string[] = [];

    if (result.valid) {
      lines.push('✅ Manifest is valid');
    } else {
      lines.push('❌ Manifest validation failed');
    }

    if (result.errors && result.errors.length > 0) {
      lines.push('\nErrors:');
      result.errors.forEach((e) => {
        lines.push(`  - ${e.field}: ${e.message}`);
      });
    }

    if (result.warnings && result.warnings.length > 0) {
      lines.push('\nWarnings:');
      result.warnings.forEach((w) => {
        lines.push(`  - ${w.field}: ${w.message}`);
      });
    }

    return lines.join('\n');
  }
}

// Export singleton instance
export const manifestValidator = new ManifestValidator();