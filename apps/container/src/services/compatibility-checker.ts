import { MFEManifest, isMFEManifestV2 } from '@mfe/dev-kit';
import semver from 'semver';

export interface CompatibilityCheckResult {
  compatible: boolean;
  errors: string[];
  warnings: string[];
}

export class CompatibilityChecker {
  private containerVersion: string;
  private availableServices: Map<string, string>;

  constructor(containerVersion: string = '1.0.0') {
    this.containerVersion = containerVersion;
    this.availableServices = new Map([
      ['logger', '1.0.0'],
      ['eventBus', '2.0.0'],
      ['auth', '1.0.0'],
      ['modal', '1.0.0'],
      ['notification', '1.0.0'],
      ['stateManager', '2.0.0'],
    ]);
  }

  /**
   * Check if an MFE is compatible with the container
   */
  checkCompatibility(manifest: MFEManifest): CompatibilityCheckResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Handle V1 manifests with basic checks
    if (!isMFEManifestV2(manifest)) {
      warnings.push('MFE uses legacy V1 manifest format. Consider upgrading to V2.');
      return { compatible: true, errors, warnings };
    }

    // Check container version compatibility
    if (manifest.compatibility?.container) {
      try {
        if (!semver.satisfies(this.containerVersion, manifest.compatibility.container)) {
          errors.push(
            `Container version ${this.containerVersion} does not satisfy requirement ${manifest.compatibility.container}`
          );
        }
      } catch (error) {
        errors.push(`Invalid container version requirement: ${manifest.compatibility.container}`);
      }
    }

    // Check required services
    if (manifest.requirements?.services) {
      for (const service of manifest.requirements.services) {
        if (!service.optional) {
          const serviceVersion = this.availableServices.get(service.name);

          if (!serviceVersion) {
            errors.push(`Required service '${service.name}' is not available`);
          } else if (service.version) {
            try {
              if (!semver.satisfies(serviceVersion, service.version)) {
                errors.push(
                  `Service '${service.name}' version ${serviceVersion} does not satisfy requirement ${service.version}`
                );
              }
            } catch (error) {
              errors.push(
                `Invalid version requirement for service '${service.name}': ${service.version}`
              );
            }
          }
        }
      }
    }

    // Check browser compatibility (warnings only)
    if (manifest.compatibility?.browsers) {
      const userAgent = navigator.userAgent.toLowerCase();

      if (userAgent.includes('chrome') && manifest.compatibility.browsers.chrome) {
        const chromeMatch = userAgent.match(/chrome\/(\d+)/);
        if (chromeMatch) {
          const chromeVersion = parseInt(chromeMatch[1], 10);
          const requiredVersion = parseInt(
            manifest.compatibility.browsers.chrome.replace(/[^0-9]/g, ''),
            10
          );

          if (chromeVersion < requiredVersion) {
            warnings.push(
              `Chrome version ${chromeVersion} is below recommended version ${requiredVersion}`
            );
          }
        }
      }
    }

    // Check deprecated MFEs
    if (manifest.deprecated) {
      warnings.push(
        `MFE has been deprecated since version ${manifest.deprecated.since}` +
          (manifest.deprecated.replacement
            ? `. Use '${manifest.deprecated.replacement}' instead.`
            : '')
      );
    }

    return {
      compatible: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check all MFEs in a registry
   */
  checkRegistry(manifests: MFEManifest[]): Map<string, CompatibilityCheckResult> {
    const results = new Map<string, CompatibilityCheckResult>();

    for (const manifest of manifests) {
      results.set(manifest.name, this.checkCompatibility(manifest));
    }

    return results;
  }

  /**
   * Get a summary of compatibility checks
   */
  getSummary(results: Map<string, CompatibilityCheckResult>): {
    total: number;
    compatible: number;
    incompatible: number;
    warnings: number;
  } {
    let compatible = 0;
    let warnings = 0;

    results.forEach((result) => {
      if (result.compatible) {
        compatible++;
      }
      if (result.warnings.length > 0) {
        warnings++;
      }
    });

    return {
      total: results.size,
      compatible,
      incompatible: results.size - compatible,
      warnings,
    };
  }
}

// Export singleton instance
export const compatibilityChecker = new CompatibilityChecker();
