# MFE Build Utilities

## Why This Approach is Better

### Previous Approach: Post-Build Import Remapping
```javascript
// Build normally
await esbuild.build(config);

// Then parse and modify the output file
await remapImports({
  outputFile: 'dist/bundle.js',
  manifestPath: 'manifest.json'
});
```

**Problems:**
- ❌ Requires parsing and rewriting built JS files (fragile)
- ❌ Can break with minification or certain code patterns
- ❌ Happens after build (slower)
- ❌ Source maps get out of sync
- ❌ Complex regex patterns needed

### New Approach: Build-Time Aliasing
```javascript
import { buildMFE } from '@mfe-toolkit/core';

await buildMFE({
  entryPoint: 'src/main.tsx',
  outfile: 'dist/bundle.js',
  manifestPath: './manifest.json'
});
```

**Benefits:**
- ✅ Uses esbuild's native `alias` feature
- ✅ Happens during build (faster, more reliable)
- ✅ Source maps stay accurate
- ✅ Auto-detects React version from manifest
- ✅ Type-safe configuration
- ✅ One line replaces entire build script

## How It Works

1. **Auto-Detection**: Reads `manifest.json` to determine React version
2. **Alias Configuration**: Sets up esbuild aliases based on detected version
3. **JSX Handling**: Configures JSX transform appropriately for each React version
4. **External Dependencies**: Marks the right versioned imports as external

### React 17 Example
```json
// manifest.json
{
  "dependencies": {
    "runtime": {
      "react": "^17.0.2"
    }
  }
}
```

Generated esbuild config:
```javascript
{
  jsx: 'transform',
  alias: {
    'react': 'react@17',
    'react-dom': 'react-dom@17'
  },
  external: ['react@17', 'react-dom@17']
}
```

### React 18 Example
```json
// manifest.json
{
  "dependencies": {
    "runtime": {
      "react": "^18.3.1"
    }
  }
}
```

Generated esbuild config:
```javascript
{
  jsx: 'automatic',
  jsxImportSource: 'react@18',
  alias: {
    'react': 'react@18',
    'react-dom': 'react-dom@18',
    'react-dom/client': 'react-dom@18/client',
    'react/jsx-runtime': 'react@18/jsx-runtime'
  },
  external: ['react@18', 'react-dom@18', ...]
}
```

## Alternative Approaches Considered

1. **Import Map Scopes** - Too complex, requires runtime support
2. **Bundling React** - Goes against microfrontend principles, large bundles
3. **Runtime Detection** - Adds complexity and overhead
4. **Proxy Modules** - Extra abstraction layer, runtime overhead
5. **Post-build Processing** - Current approach, fragile and slow

## Migration Guide

### From Old Build Script:
```javascript
// build.js (old)
import * as esbuild from 'esbuild';
import { remapImports } from '@mfe-toolkit/core';

const config = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  jsx: 'transform',
  external: ['react', 'react-dom', '@mfe-toolkit/core'],
  sourcemap: true,
  minify: !watch,
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
  },
};

await esbuild.build(config);
await remapImports({
  outputFile: 'dist/bundle.js',
  manifestPath: 'manifest.json'
});
```

### To New Build Script:
```javascript
// build.js (new)
import { buildMFE } from '@mfe-toolkit/core';

await buildMFE({
  entryPoint: 'src/main.tsx',
  outfile: 'dist/bundle.js',
  manifestPath: './manifest.json'
});
```

That's it! The toolkit handles everything else.