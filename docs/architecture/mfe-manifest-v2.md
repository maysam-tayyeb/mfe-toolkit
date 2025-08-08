# MFE Manifest V2 Implementation

## Overview

The MFE Manifest V2 is a comprehensive specification for describing microfrontends with full type safety, validation support, and extensibility. It provides rich metadata for dependency management, compatibility checking, and enhanced UI display.

## Implementation Status

✅ **Fully Implemented and Operational**

### Core Components

#### 1. Type System (`packages/mfe-toolkit-core/src/types/manifest.ts`)

The V2 manifest includes comprehensive type definitions:

```typescript
interface MFEManifestV2 {
  // Core identification
  name: string;
  version: SemanticVersion;
  url: string;

  // Dependencies and compatibility
  dependencies: MFEDependencies;
  compatibility: MFECompatibility;

  // Capabilities and requirements
  capabilities?: MFECapabilities;
  requirements: MFERequirements;

  // Rich metadata
  metadata: MFEMetadata;

  // Configuration options
  config?: MFEConfig;
  security?: MFESecurity;
  lifecycle?: MFELifecycle;

  // Build and deprecation info
  build?: BuildInfo;
  deprecated?: DeprecationInfo;
}
```

#### 2. Registry Configuration

All MFEs in `apps/container-react/public/mfe-registry.json` use V2 format:

- ✅ serviceExplorer
- ✅ legacyServiceExplorer
- ✅ eventDemo
- ✅ stateDemoReact
- ✅ stateDemoVue
- ✅ stateDemoVanilla
- ✅ mfe-react19-modal-demo

#### 3. Compatibility Checker (`apps/container-react/src/services/compatibility-checker.ts`)

Validates:

- Container version compatibility
- Required/optional service availability
- Service version requirements
- Browser compatibility
- Deprecation warnings

#### 4. UI Integration

- **Dashboard Page**: Shows V2 badges and compatibility status
- **Registry Status Page**: Displays detailed V2 manifest information
- **MFE Loader**: Uses V2 metadata for enhanced error handling

## Key Features

### Dependencies Management

```json
"dependencies": {
  "runtime": {
    "lodash": "^4.17.0"
  },
  "peer": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "optional": {
    "redux": "^4.0.0"
  }
}
```

### Compatibility Declaration

```json
"compatibility": {
  "container": ">=1.0.0",
  "browsers": {
    "chrome": ">=90",
    "firefox": ">=88"
  },
  "frameworks": {
    "react": ">=18.0.0"
  }
}
```

### Service Requirements

```json
"requirements": {
  "services": [
    {
      "name": "logger",
      "version": "^1.0.0",
      "optional": false
    },
    {
      "name": "auth",
      "optional": true
    }
  ],
  "permissions": ["read:user", "write:preferences"]
}
```

### Rich Metadata

```json
"metadata": {
  "displayName": "Service Explorer MFE",
  "description": "Comprehensive MFE demonstrating all platform services",
  "icon": "🔧",
  "tags": ["demo", "services", "react"],
  "category": "examples",
  "author": {
    "name": "MFE Team",
    "email": "team@example.com"
  }
}
```

### Capabilities Declaration

```json
"capabilities": {
  "provides": {
    "services": ["data-fetcher"],
    "components": ["UserProfile", "Dashboard"]
  },
  "emits": ["user:login", "data:update"],
  "listens": ["app:theme-change", "user:logout"],
  "routes": [
    { "path": "/dashboard", "exact": true },
    { "path": "/profile/*", "public": false }
  ]
}
```

### Loading Configuration

```json
"config": {
  "loading": {
    "timeout": 30000,
    "retries": 3,
    "retryDelay": 1000,
    "priority": 10,
    "preload": true
  },
  "runtime": {
    "isolation": "none",
    "keepAlive": true,
    "singleton": true
  }
}
```

## Migration from V1 to V2

### V1 Format (Legacy)

```json
{
  "name": "example",
  "version": "1.0.0",
  "url": "/mfe.js",
  "dependencies": ["react", "react-dom"]
}
```

### V2 Format (Current)

```json
{
  "name": "example",
  "version": "1.0.0",
  "url": "/mfe.js",
  "dependencies": {
    "runtime": {},
    "peer": {
      "react": "^18.0.0",
      "react-dom": "^18.0.0"
    }
  },
  "compatibility": {
    "container": ">=1.0.0"
  },
  "requirements": {
    "services": []
  },
  "metadata": {
    "displayName": "Example MFE",
    "description": "Example microfrontend"
  }
}
```

## Type Guards

```typescript
import { isMFEManifestV2, isMFEManifestV1 } from '@mfe-toolkit/core';

// Check manifest version
if (isMFEManifestV2(manifest)) {
  // Access V2-specific properties
  console.log(manifest.metadata.displayName);
  console.log(manifest.requirements.services);
} else {
  // Handle V1 manifest
  console.log('Legacy V1 manifest detected');
}
```

## Benefits of V2

1. **Better Dependency Management**: Distinguishes between runtime, peer, and optional dependencies
2. **Version Compatibility**: Semantic versioning for all dependencies and requirements
3. **Service Discovery**: Declares what services an MFE provides and consumes
4. **Enhanced Metadata**: Rich information for UI display and documentation
5. **Security Configuration**: CSP directives, allowed origins, integrity checks
6. **Lifecycle Management**: Hooks for pre/post load, mount, unmount operations
7. **Performance Optimization**: Loading priorities, preloading, lazy loading
8. **Deprecation Support**: Graceful migration paths for outdated MFEs

## Usage in Container

The container application automatically detects and handles both V1 and V2 manifests:

```typescript
// In CompatibilityChecker
if (!isMFEManifestV2(manifest)) {
  warnings.push('MFE uses legacy V1 manifest format. Consider upgrading to V2.');
  return { compatible: true, errors, warnings };
}

// V2-specific validation
if (manifest.compatibility?.container) {
  if (!semver.satisfies(containerVersion, manifest.compatibility.container)) {
    errors.push(`Container version incompatible`);
  }
}
```

## Future Enhancements

- [ ] JSON Schema validation for manifests
- [ ] Automated V1 to V2 migration tool
- [ ] Manifest signing and verification
- [ ] Runtime capability negotiation
- [ ] Dynamic service version resolution
- [ ] Federated module support
- [ ] A/B testing configuration
- [ ] Feature flags integration

## Related Documentation

- [Architecture Decisions](./architecture-decisions.md)
- [MFE Loading Guide](./mfe-loading-guide.md)
- [State Management Architecture](./state-management-architecture.md)
