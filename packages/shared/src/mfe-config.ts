/**
 * Centralized MFE configuration
 * Update MFE names and metadata in one place
 */

export const MFE_CONFIG = {
  serviceExplorer: {
    id: 'serviceExplorer',
    name: 'Service Explorer',
    displayName: 'Service Explorer MFE',
    description: 'Demonstrates modern React 19 features with shared container services',
    port: 3001,
    packageName: '@mfe/example-mfe',
    version: '1.0.0',
    bundleSize: '~14KB',
    format: 'ESM Module',
  },
  legacyServiceExplorer: {
    id: 'legacyServiceExplorer',
    name: 'Legacy Service Explorer',
    displayName: 'Legacy Service Explorer MFE',
    description: 'Shows cross-version React compatibility',
    port: 3002,
    packageName: '@mfe/react17-mfe',
    version: '1.0.0',
    bundleSize: '~159KB',
    format: 'ESM Module',
  },
} as const;

export type MFEId = keyof typeof MFE_CONFIG;
export type MFEInfo = (typeof MFE_CONFIG)[MFEId];
