# MFE Manifest System

## Overview

Each MFE in this platform declares its capabilities, dependencies, and requirements through a `manifest.json` file. This enables:

- **Build-time validation** - Catch configuration errors early
- **Runtime compatibility checking** - Ensure MFEs are compatible with the container
- **Service discovery** - Know what services each MFE requires
- **Dependency management** - Track framework and library dependencies
- **Event documentation** - Document what events MFEs emit and listen to

## Manifest Structure

Each MFE should have a `manifest.json` file in its root directory:

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "myMfe",
  "version": "1.0.0",
  "url": "http://localhost:8080/my-mfe/main.js",
  "dependencies": {
    "runtime": {},
    "peer": {
      "react": "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0"
    }
  },
  "compatibility": {
    "container": ">=1.0.0",
    "frameworks": {
      "react": ">=18.0.0"
    }
  },
  "requirements": {
    "services": [
      {
        "name": "logger",
        "optional": false
      },
      {
        "name": "eventBus",
        "optional": false
      }
    ]
  },
  "metadata": {
    "displayName": "My MFE",
    "description": "Description of what this MFE does",
    "icon": "🚀"
  },
  "capabilities": {
    "emits": ["my-mfe:action-completed"],
    "listens": ["app:theme-change", "user:login"]
  },
  "config": {
    "loading": {
      "timeout": 30000,
      "retries": 3,
      "retryDelay": 1000
    }
  }
}
```

## Field Descriptions

### Core Fields (Required)

- **name**: Unique identifier for the MFE
- **version**: Semantic version of the MFE
- **url**: URL where the MFE bundle is served

### Dependencies

- **runtime**: Dependencies loaded at runtime
- **peer**: Dependencies expected to be provided by the container

### Compatibility

- **container**: Required container version (semver range)
- **frameworks**: Framework version requirements

### Requirements

- **services**: List of container services the MFE needs
  - Each service can be marked as `optional: true/false`

### Metadata

- **displayName**: Human-readable name
- **description**: Brief description of the MFE
- **icon**: Emoji or icon to represent the MFE

### Capabilities

- **emits**: Events this MFE publishes
- **listens**: Events this MFE subscribes to

### Config

- **loading**: Loading behavior configuration
  - **timeout**: Max time to wait for MFE to load (ms)
  - **retries**: Number of retry attempts
  - **retryDelay**: Delay between retries (ms)

## Available Scripts

```bash
# Validate all MFE manifests
pnpm validate:manifests

# Build registry from individual manifests
pnpm build:registry
```

## Validation

The manifest validator checks:

- Required fields are present
- Version formats are valid (semver)
- Service names are recognized
- Dependencies are properly formatted
- Event names follow naming conventions

## Migration from V1

If you have a V1 manifest, use the migration tool:

```typescript
import { ManifestValidator } from '@mfe/dev-kit';

const validator = new ManifestValidator();
const v2Manifest = validator.migrateToV2(v1Manifest);
```

## Best Practices

1. **Keep manifests in sync** - Update version when releasing
2. **Document all events** - List all events in capabilities
3. **Specify exact services** - Only require services you actually use
4. **Use semantic versioning** - Follow semver for versions
5. **Test compatibility** - Run validation before deploying

## Container Integration

The container uses manifests for:

- **Compatibility checking** - Before loading an MFE
- **Service injection** - Providing required services
- **Error handling** - Better error messages
- **Dashboard display** - Showing MFE status

## Example MFEs

See these MFEs for examples:

- `/apps/mfe-example/manifest.json` - React 19 MFE
- `/apps/mfe-react17/manifest.json` - Legacy React 17 MFE
- `/apps/mfe-state-demo-vue/manifest.json` - Vue MFE
- `/apps/mfe-state-demo-vanilla/manifest.json` - Vanilla JS MFE
