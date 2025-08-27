import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildMFE } from './mfe-build';
import * as fs from 'fs';
import * as esbuild from 'esbuild';

// Mock the modules
vi.mock('fs');
vi.mock('esbuild');

describe('buildMFE', () => {
  const mockManifest = {
    dependencies: {
      runtime: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
      },
      peer: {
        '@mfe-toolkit/core': '^1.0.0',
      },
    },
  };

  const mockManifestString = JSON.stringify(mockManifest);

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(fs.readFileSync).mockReturnValue(mockManifestString);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(esbuild.build).mockResolvedValue({ errors: [], warnings: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic functionality', () => {
    it('should build with minimal options', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          entryPoints: ['src/main.tsx'],
          outfile: 'dist/bundle.js',
          bundle: true,
          format: 'esm',
        })
      );
    });

    it('should handle multiple entry points', async () => {
      await buildMFE({
        entry: ['src/main.tsx', 'src/worker.ts'],
        outdir: 'dist',
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          entryPoints: ['src/main.tsx', 'src/worker.ts'],
          outdir: 'dist',
        })
      );
    });

    it('should use production mode by default', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          minify: true,
          sourcemap: false,
        })
      );
    });

    it('should handle development mode', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
        mode: 'development',
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          minify: false,
          sourcemap: 'inline',
        })
      );
    });
  });

  describe('dependency detection', () => {
    it('should read and parse manifest.json', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
        manifestPath: './custom-manifest.json',
      });

      expect(fs.readFileSync).toHaveBeenCalledWith('./custom-manifest.json', 'utf-8');
    });

    it('should externalize dependencies from manifest', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          external: expect.arrayContaining(['react@18', 'react-dom@18', '@mfe-toolkit/core@1']),
        })
      );
    });

    it('should handle unversioned imports when useVersionedImports is false', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
        useVersionedImports: false,
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          external: expect.arrayContaining(['react', 'react-dom', '@mfe-toolkit/core']),
        })
      );
    });

    it('should handle additional external dependencies', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
        additionalExternal: ['lodash', 'moment'],
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          external: expect.arrayContaining(['lodash', 'moment']),
        })
      );
    });

    it('should handle manifest with different dependency structures', async () => {
      const alternativeManifest = {
        dependencies: {
          vue: '^3.0.0',
        },
        peerDependencies: {
          'solid-js': '^1.0.0',
        },
        devDependencies: {
          typescript: '^5.0.0',
        },
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(alternativeManifest));

      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          external: expect.arrayContaining(['vue@3', 'solid-js@1', 'typescript@5']),
        })
      );
    });

    it('should extract major version correctly', async () => {
      const manifestWithVariousVersions = {
        dependencies: {
          'package-a': '^1.2.3',
          'package-b': '~2.3.4',
          'package-c': '>=3.0.0',
          'package-d': '4.x',
          'package-e': '5',
        },
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(manifestWithVariousVersions));

      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          external: expect.arrayContaining([
            'package-a@1',
            'package-b@2',
            'package-c@3',
            'package-d@4',
            'package-e@5',
          ]),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle missing manifest file gracefully', async () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
      });

      // Should still build but without external dependencies
      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          external: [],
        })
      );
    });

    it('should handle invalid JSON in manifest', async () => {
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json');

      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
      });

      // Should still build but without external dependencies
      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          external: [],
        })
      );
    });

    it('should propagate esbuild errors', async () => {
      const error = new Error('Build failed');
      vi.mocked(esbuild.build).mockRejectedValue(error);

      await expect(
        buildMFE({
          entry: 'src/main.tsx',
          outfile: 'dist/bundle.js',
        })
      ).rejects.toThrow('Build failed');
    });
  });

  describe('JSX configuration', () => {
    it('should detect React 18 and use automatic JSX transform', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          jsx: 'automatic',
        })
      );
    });

    it('should use classic JSX transform for React 16', async () => {
      const react16Manifest = {
        dependencies: {
          react: '^16.14.0',
        },
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(react16Manifest));

      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          jsx: 'transform',
        })
      );
    });

    it('should use classic JSX transform for React 17', async () => {
      const react17Manifest = {
        dependencies: {
          react: '^17.0.2',
        },
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(react17Manifest));

      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          jsx: 'transform',
        })
      );
    });

    it('should handle non-React builds', async () => {
      const vueManifest = {
        dependencies: {
          vue: '^3.0.0',
        },
      };

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(vueManifest));

      await buildMFE({
        entry: 'src/main.ts',
        outfile: 'dist/bundle.js',
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          jsx: undefined,
        })
      );
    });
  });

  describe('alias plugin', () => {
    it('should create aliases for versioned imports', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
      });

      const buildCall = vi.mocked(esbuild.build).mock.calls[0][0];
      expect(buildCall.plugins).toBeDefined();
      expect(buildCall.plugins).toHaveLength(1);
      expect(buildCall.plugins![0].name).toBe('import-alias');
    });

    it('should not create aliases when useVersionedImports is false', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
        useVersionedImports: false,
      });

      const buildCall = vi.mocked(esbuild.build).mock.calls[0][0];
      expect(buildCall.plugins).toBeUndefined();
    });
  });

  describe('custom esbuild options', () => {
    it('should merge custom esbuild options', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
        esbuildOptions: {
          target: 'es2020',
          platform: 'browser',
          loader: {
            '.svg': 'text',
          },
        },
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          target: 'es2020',
          platform: 'browser',
          loader: {
            '.svg': 'text',
          },
        })
      );
    });

    it('should not allow overriding critical options', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
        esbuildOptions: {
          entryPoints: ['wrong.ts'],
          bundle: false,
          format: 'cjs' as any,
        },
      });

      expect(esbuild.build).toHaveBeenCalledWith(
        expect.objectContaining({
          entryPoints: ['src/main.tsx'], // Should not be overridden
          bundle: true, // Should not be overridden
          format: 'esm', // Should not be overridden
        })
      );
    });
  });

  describe('file paths', () => {
    it('should default to ./manifest.json', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
      });

      expect(fs.readFileSync).toHaveBeenCalledWith('./manifest.json', 'utf-8');
    });

    it('should accept custom manifest path', async () => {
      await buildMFE({
        entry: 'src/main.tsx',
        outfile: 'dist/bundle.js',
        manifestPath: 'config/mfe-manifest.json',
      });

      expect(fs.readFileSync).toHaveBeenCalledWith('config/mfe-manifest.json', 'utf-8');
    });

    it('should require either outfile or outdir', async () => {
      await expect(
        buildMFE({
          entry: 'src/main.tsx',
        } as any)
      ).rejects.toThrow();
    });

    it('should not allow both outfile and outdir', async () => {
      await expect(
        buildMFE({
          entry: 'src/main.tsx',
          outfile: 'dist/bundle.js',
          outdir: 'dist',
        })
      ).rejects.toThrow();
    });
  });
});