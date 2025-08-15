# Library Versioning Strategy

## Overview

This document describes the library versioning strategy used in the MFE platform. The strategy ensures that multiple versions of libraries can coexist peacefully, allowing different MFEs to use different versions of the same library without conflicts.

## Core Principles

1. **Container uses non-versioned imports** - The main container application uses standard imports (`react`, `react-dom`)
2. **MFEs use versioned imports** - All MFEs use explicitly versioned imports (`react@17`, `react@18`, `react@19`)
3. **Build-time aliasing** - Version mapping happens at build time via esbuild aliases, not runtime
4. **Zero runtime overhead** - No performance impact; imports are resolved at build time
5. **Framework agnostic** - Works with any library, not just React

## Import Map Structure

The import map in `apps/container-react/index.html` follows this pattern:

```html
<script type="importmap">
{
  "imports": {
    // Container dependencies (non-versioned)
    "react": "https://esm.sh/react@19.1.0",
    "react-dom": "https://esm.sh/react-dom@19.1.0",
    "react-dom/client": "https://esm.sh/react-dom@19.1.0/client",
    
    // MFE dependencies (versioned)
    "react@17": "https://esm.sh/react@17.0.2",
    "react@18": "https://esm.sh/react@18.3.1",
    "react@19": "https://esm.sh/react@19.1.0",
    
    // Other libraries with versions
    "vue@3": "https://esm.sh/vue@3.4.0",
    "solid-js@1": "https://esm.sh/solid-js@1.8.19",
    "zustand@5": "https://esm.sh/zustand@5.0.6"
  }
}
</script>
```

## How It Works

### 1. MFE Development

MFEs are written with standard imports:

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
```

### 2. Manifest Configuration

Each MFE declares its dependencies in `manifest.json`:

```json
{
  "dependencies": {
    "runtime": {
      "react": "^17.0.2",
      "react-dom": "^17.0.2"
    }
  }
}
```

### 3. Build Process

The build system automatically:
1. Reads the manifest to detect library versions
2. Applies the appropriate aliasing strategy
3. Transforms imports at build time

```javascript
// build.js
import { buildMFE } from '@mfe-toolkit/core';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/bundle.js',
  manifestPath: './manifest.json'  // Auto-detects versions
});
```

### 4. Build Output

After build, imports are transformed:

```javascript
// dist/bundle.js
import React from 'react@17';       // Transformed!
import ReactDOM from 'react-dom@17'; // Transformed!
```

### 5. Runtime Resolution

Browser resolves versioned imports from the import map:
- `react@17` → `https://esm.sh/react@17.0.2`
- `react@18` → `https://esm.sh/react@18.3.1`
- `react@19` → `https://esm.sh/react@19.1.0`

## Supported Libraries

### Default Strategies

The toolkit includes built-in strategies for common libraries:

| Library | Versions | Import Pattern | Additional Imports |
|---------|----------|----------------|-------------------|
| React | 17, 18, 19 | `react@{version}` | `react-dom`, JSX runtime |
| Vue | 2, 3 | `vue@{version}` | `vue-router`, state management |
| Solid.js | 1 | `solid-js@1` | `/web`, `/store` |
| Lodash | 4 | `lodash@4` | `lodash-es` |
| RxJS | 6, 7 | `rxjs@{version}` | `/operators` |
| Zustand | 4, 5 | `zustand@{version}` | `/middleware` |
| Angular | 15+ | `@angular/core@{version}` | Common Angular packages |

### Custom Libraries

Add strategies for your own libraries:

```javascript
import { buildMFE, createAliasStrategy } from '@mfe-toolkit/core';

const myLibStrategy = createAliasStrategy(
  '@company/ui-lib',     // Library name
  /^2\./,                // Version pattern
  '@v2',                 // Suffix to use
  {
    additionalImports: [
      '@company/ui-lib/components',
      '@company/ui-lib/hooks'
    ]
  }
);

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/bundle.js',
  manifestPath: './manifest.json',
  customStrategies: [myLibStrategy]
});
```

## Migration Guide

### From Non-Versioned to Versioned MFE

#### Before (manual version handling):
```javascript
// Complex build configuration
import * as esbuild from 'esbuild';

const config = {
  // ... lots of configuration
  external: ['react@17', 'react-dom@17'],
  // ... manual setup
};

await esbuild.build(config);
```

#### After (automatic version handling):
```javascript
import { buildMFE } from '@mfe-toolkit/core';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/bundle.js',
  manifestPath: './manifest.json'
});
```

## Best Practices

### 1. Always Declare Versions in Manifest

```json
{
  "dependencies": {
    "runtime": {
      "react": "^18.3.1",    // Be explicit
      "lodash": "^4.17.21"   // Version everything
    }
  }
}
```

### 2. Use Semantic Versioning

- Major version for breaking changes: `react@17` vs `react@18`
- Minor version when needed: `vue@3.4` vs `vue@3.5`
- Patch versions typically not needed in imports

### 3. Test Version Compatibility

```bash
# Build with version detection
pnpm build

# Check the output
cat dist/bundle.js | grep "import.*@"
# Should show: import ... from 'react@18'
```

### 4. Document Version Requirements

In your MFE's README:
```markdown
## Dependencies
- React 17 (uses `react@17` imports)
- Lodash 4 (uses `lodash@4` imports)
```

## Troubleshooting

### Issue: MFE Not Using Correct Version

**Symptom**: MFE uses wrong React version

**Solution**:
1. Check `manifest.json` has correct version
2. Rebuild with `pnpm build`
3. Verify import map has the version

### Issue: Import Not Found

**Symptom**: Browser error "Failed to resolve module specifier"

**Solution**:
1. Ensure import map includes the versioned import
2. Check additional imports (e.g., `react@18/jsx-runtime`)

### Issue: Build Fails

**Symptom**: Build error about missing imports

**Solution**:
1. Update `@mfe-toolkit/core` to latest
2. Check custom strategies are correct
3. Verify manifest.json is valid JSON

## Advanced Configuration

### Explicit Version Override

```javascript
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/bundle.js',
  libraryVersions: {
    'react': '17',      // Force React 17
    'lodash': '4',      // Force Lodash 4
    'moment': '2'       // Force Moment 2
  }
});
```

### Multiple Entry Points

```javascript
await buildMFE({
  entry: ['src/main.tsx', 'src/worker.ts'],
  outdir: 'dist',
  manifestPath: './manifest.json'
});
```

### Custom Build Options

```javascript
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/bundle.js',
  manifestPath: './manifest.json',
  esbuildOptions: {
    minify: true,
    sourcemap: 'inline',
    target: 'es2022'
  }
});
```

## Architecture Decisions

### Why Versioned Imports for MFEs?

1. **Clarity**: Explicit about which version is used
2. **Isolation**: MFEs can't accidentally use wrong version
3. **Predictability**: No surprises about which React loads
4. **Debugging**: Clear in network tab which version loads

### Why Non-Versioned for Container?

1. **Simplicity**: Container code stays clean
2. **Authority**: Container defines the "default" versions
3. **Flexibility**: Easy to upgrade container independently

### Why Build-Time Aliasing?

1. **Performance**: Zero runtime overhead
2. **Reliability**: No regex parsing of built files
3. **Native**: Uses esbuild's built-in feature
4. **Type Safety**: TypeScript understands the imports

## Future Enhancements

### Planned Features

1. **Version Range Support**
   ```javascript
   "react": ">=17.0.0 <19.0.0"  // Use best available
   ```

2. **Automatic Version Deduplication**
   - Detect when multiple MFEs use same version
   - Optimize import map automatically

3. **Version Compatibility Matrix**
   - Validate version combinations
   - Warn about known incompatibilities

4. **Dynamic Version Loading**
   - Load versions on demand
   - Reduce initial bundle size

## Examples

### React 17 MFE
```javascript
// manifest.json
{ "dependencies": { "runtime": { "react": "^17.0.2" } } }

// build.js
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe.js',
  manifestPath: './manifest.json'
});

// Output uses: react@17, react-dom@17
```

### Vue 3 MFE
```javascript
// manifest.json
{ "dependencies": { "runtime": { "vue": "^3.4.0" } } }

// build.js
await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/mfe.js',
  manifestPath: './manifest.json'
});

// Output uses: vue@3
```

### Mixed Versions in Monorepo
```javascript
// Three MFEs, three React versions
await Promise.all([
  buildMFE({ entry: 'apps/legacy/src/main.tsx', libraryVersions: { react: '17' } }),
  buildMFE({ entry: 'apps/current/src/main.tsx', libraryVersions: { react: '18' } }),
  buildMFE({ entry: 'apps/next/src/main.tsx', libraryVersions: { react: '19' } })
]);
```

## Summary

The versioning strategy provides:
- ✅ **Multiple library versions** coexisting peacefully
- ✅ **Zero configuration** for common libraries
- ✅ **Build-time transformation** for performance
- ✅ **Framework agnostic** solution
- ✅ **Future-proof** architecture

This approach scales from simple React apps to complex enterprise systems with dozens of libraries and versions.