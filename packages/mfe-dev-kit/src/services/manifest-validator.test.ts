import { describe, it, expect } from 'vitest';
import { ManifestValidator } from './manifest-validator';
import { MFEManifestV1, MFEManifestV2 } from '../types/manifest';

describe('ManifestValidator', () => {
  const validator = new ManifestValidator();

  describe('V1 Manifest Validation', () => {
    it('should validate a valid V1 manifest', () => {
      const v1Manifest: MFEManifestV1 = {
        name: 'test-mfe',
        version: '1.0.0',
        url: 'http://localhost:8080/test.js',
        dependencies: ['react', 'react-dom'],
        metadata: {
          displayName: 'Test MFE',
          description: 'Test description',
          icon: '🎯',
        },
      };

      const result = validator.validate(v1Manifest);
      expect(result.valid).toBe(true);
      expect(result.version).toBe('v1');
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some((w) => w.message.includes('legacy V1 format'))).toBe(true);
    });

    it('should fail validation for invalid V1 manifest', () => {
      const invalidManifest = {
        name: '',
        version: '1.0.0',
        url: 'not-a-url',
      };

      const result = validator.validate(invalidManifest);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('V2 Manifest Validation', () => {
    it('should validate a valid V2 manifest', () => {
      const v2Manifest: MFEManifestV2 = {
        name: 'test-mfe',
        version: '1.0.0',
        url: 'http://localhost:8080/test.js',
        dependencies: {
          runtime: {},
          peer: {
            react: '^18.0.0',
          },
        },
        compatibility: {
          container: '>=1.0.0',
        },
        requirements: {
          services: [{ name: 'logger' }, { name: 'eventBus' }],
        },
        metadata: {
          displayName: 'Test MFE',
          description: 'Test description',
        },
      };

      const result = validator.validate(v2Manifest);
      expect(result.valid).toBe(true);
      expect(result.version).toBe('v2');
    });

    it('should provide warnings for missing best practices', () => {
      const minimalV2: MFEManifestV2 = {
        name: 'minimal-mfe',
        version: '1.0.0',
        url: 'http://localhost:8080/minimal.js',
        dependencies: {
          runtime: {},
          peer: {},
        },
        compatibility: {
          container: '>=1.0.0',
        },
        requirements: {
          services: [],
        },
        metadata: {
          displayName: 'Minimal MFE',
          description: 'Minimal description',
        },
      };

      const result = validator.validate(minimalV2);
      expect(result.valid).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some((w) => w.field === 'security')).toBe(true);
    });
  });

  describe('V1 to V2 Migration', () => {
    it('should migrate V1 manifest to V2', () => {
      const v1Manifest: MFEManifestV1 = {
        name: 'legacy-mfe',
        version: '1.0.0',
        url: 'http://localhost:8080/legacy.js',
        dependencies: ['react', 'react-dom', 'axios'],
        sharedLibs: ['redux', 'react-redux'],
        metadata: {
          displayName: 'Legacy MFE',
          description: 'Legacy app',
          icon: '📦',
        },
      };

      const v2Manifest = validator.migrateToV2(v1Manifest);

      expect(v2Manifest.name).toBe('legacy-mfe');
      expect(v2Manifest.dependencies.peer['react']).toBeDefined();
      expect(v2Manifest.dependencies.peer['react-dom']).toBeDefined();
      expect(v2Manifest.dependencies.runtime['axios']).toBeDefined();
      expect(v2Manifest.dependencies.peer['redux']).toBeDefined();
      expect(v2Manifest.metadata.displayName).toBe('Legacy MFE');
      expect(v2Manifest.metadata.icon).toBe('📦');
    });
  });
});
