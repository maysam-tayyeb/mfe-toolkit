# MFE Manifest V2 Guide

## Overview

The MFE Manifest V2 schema provides a comprehensive, type-safe way to describe micro frontends (MFEs) in the MFE Made Easy platform. This guide covers the new manifest format, migration from V1, and best practices.

## Key Features

- **Full TypeScript Support**: Complete type definitions with IntelliSense
- **JSON Schema Validation**: Validate manifests at build time
- **Backward Compatibility**: Support for legacy V1 manifests
- **Enhanced Metadata**: Rich information for documentation and UI
- **Security Configuration**: CSP directives and permissions
- **Lifecycle Management**: Hooks for initialization and health checks

## Manifest Structure

### Basic Example

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "my-mfe",
  "version": "1.0.0",
  "url": "http://localhost:8080/my-mfe/bundle.js",
  "dependencies": {
    "runtime": {},
    "peer": {
      "react": "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0"
    }
  },
  "compatibility": {
    "container": ">=1.0.0"
  },
  "requirements": {
    "services": [{ "name": "logger" }, { "name": "eventBus" }]
  },
  "metadata": {
    "displayName": "My MFE",
    "description": "A simple micro frontend"
  }
}
```

### Full Example

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "dashboard-mfe",
  "version": "2.1.0",
  "url": "http://localhost:8080/dashboard/bundle.js",
  "alternativeUrls": ["https://cdn.example.com/dashboard/2.1.0/bundle.js"],
  "dependencies": {
    "runtime": {
      "axios": "^1.6.0",
      "date-fns": "^3.0.0"
    },
    "peer": {
      "react": "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0"
    },
    "optional": {
      "react-query": "^5.0.0"
    }
  },
  "compatibility": {
    "container": ">=1.2.0",
    "browsers": {
      "chrome": ">=90",
      "firefox": ">=88",
      "safari": ">=14"
    },
    "frameworks": {
      "react": ">=18.0.0"
    }
  },
  "capabilities": {
    "provides": {
      "services": ["dashboardAPI"],
      "components": ["DashboardWidget"]
    },
    "emits": ["dashboard:data-loaded", "dashboard:refresh"],
    "listens": ["user:login", "app:theme-change"],
    "routes": [
      { "path": "/dashboard", "exact": true },
      { "path": "/dashboard/analytics", "exact": true }
    ],
    "features": ["charts", "real-time-updates", "export"]
  },
  "requirements": {
    "services": [
      { "name": "logger", "version": ">=1.0.0" },
      { "name": "eventBus", "version": ">=1.0.0" },
      { "name": "auth", "optional": false },
      { "name": "notification", "optional": true }
    ],
    "permissions": ["read:analytics", "write:reports"],
    "resources": {
      "memory": "256MB",
      "storage": "50MB"
    }
  },
  "metadata": {
    "displayName": "Analytics Dashboard",
    "description": "Real-time analytics and reporting dashboard",
    "icon": "📊",
    "author": {
      "name": "Dashboard Team",
      "email": "dashboard@example.com",
      "url": "https://example.com/team/dashboard"
    },
    "license": "MIT",
    "repository": "https://github.com/example/dashboard-mfe",
    "documentation": "https://docs.example.com/dashboard",
    "tags": ["analytics", "dashboard", "reporting"],
    "category": "business-intelligence",
    "preview": "https://example.com/dashboard-preview.png"
  },
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
    },
    "communication": {
      "eventNamespace": "dashboard",
      "allowedEvents": ["dashboard:*", "app:*"],
      "messageTimeout": 5000
    }
  },
  "security": {
    "csp": {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "connect-src": ["'self'", "https://api.example.com"]
    },
    "allowedOrigins": ["https://example.com"],
    "permissions": {
      "required": ["core:access"],
      "optional": ["admin:access"]
    }
  },
  "lifecycle": {
    "healthCheck": {
      "url": "/dashboard/health",
      "interval": 60000,
      "timeout": 5000
    }
  }
}
```

## Field Reference

### Core Fields

#### `name` (required)

- **Type**: `string`
- **Pattern**: `^[a-zA-Z][a-zA-Z0-9-_]*$`
- **Description**: Unique identifier for the MFE

#### `version` (required)

- **Type**: `string` (semantic version)
- **Example**: `"1.2.3"`, `"2.0.0-beta.1"`
- **Description**: MFE version following semantic versioning

#### `url` (required)

- **Type**: `string` (URI)
- **Description**: Primary URL for loading the MFE bundle

#### `alternativeUrls`

- **Type**: `string[]` (URIs)
- **Description**: Fallback URLs for redundancy

### Dependencies

#### `dependencies.runtime`

- **Type**: `Record<string, VersionRange>`
- **Description**: Dependencies bundled with the MFE

#### `dependencies.peer`

- **Type**: `Record<string, VersionRange>`
- **Description**: Dependencies provided by the container

#### `dependencies.optional`

- **Type**: `Record<string, VersionRange>`
- **Description**: Optional enhancements if available

### Compatibility

#### `compatibility.container` (required)

- **Type**: `VersionRange`
- **Description**: Minimum container version required

#### `compatibility.browsers`

- **Type**: Object with browser versions
- **Description**: Minimum browser versions supported

#### `compatibility.frameworks`

- **Type**: Object with framework versions
- **Description**: Framework version requirements

### Capabilities

#### `capabilities.provides`

- **Type**: Object
- **Description**: What this MFE offers to others
  - `services`: Service names exported
  - `components`: Shared components
  - `hooks`: React hooks or similar

#### `capabilities.emits`

- **Type**: `string[]`
- **Description**: Event types this MFE publishes

#### `capabilities.listens`

- **Type**: `string[]`
- **Description**: Event types this MFE subscribes to

#### `capabilities.routes`

- **Type**: Route objects
- **Description**: Routes managed by this MFE

### Requirements

#### `requirements.services` (required)

- **Type**: Service requirement objects
- **Description**: Container services needed

#### `requirements.permissions`

- **Type**: `string[]`
- **Description**: Required user permissions

#### `requirements.resources`

- **Type**: Resource limits object
- **Description**: Resource constraints

### Metadata

#### `metadata.displayName` (required)

- **Type**: `string`
- **Description**: Human-readable name for UI

#### `metadata.description` (required)

- **Type**: `string`
- **Description**: Brief description of the MFE

#### Additional metadata fields

- `icon`: Emoji, URL, or icon identifier
- `author`: Author information
- `license`: License identifier
- `repository`: Source code URL
- `documentation`: Docs URL
- `tags`: Categorization tags
- `category`: Primary category
- `preview`: Preview image URL

### Configuration

#### `config.loading`

- Loading behavior configuration
- `timeout`: Max load time (ms)
- `retries`: Retry attempts
- `priority`: Load order (higher first)
- `preload`: Load before needed
- `lazy`: Load on demand only

#### `config.runtime`

- Runtime behavior configuration
- `isolation`: Isolation mode
- `keepAlive`: Persist when hidden
- `singleton`: Single instance only

#### `config.communication`

- Communication configuration
- `eventNamespace`: Event prefix
- `allowedEvents`: Event patterns
- `messageTimeout`: Message timeout

### Security

#### `security.csp`

- Content Security Policy directives
- Standard CSP headers as arrays

#### `security.permissions`

- Required and optional permissions
- Used for access control

## CLI Tool Usage

### Generate a New Manifest

```bash
# Basic React MFE
mfe-manifest --name my-app

# Full Vue MFE with all options
mfe-manifest --name dashboard --framework vue --template full

# Custom version and output
mfe-manifest --name api-viewer --version 2.0.0 --output manifests/api.json
```

### Migrate Existing Manifests

```bash
# Migrate single manifest
mfe-manifest --migrate old-manifest.json --output new-manifest.json

# Migrate entire registry
mfe-manifest --migrate mfe-registry.json --output mfe-registry-v2.json
```

### Validate Manifests

```bash
# Validate a manifest file
mfe-manifest --validate my-app.manifest.json

# Output includes errors and warnings
```

### Show Examples

```bash
# Display example manifests
mfe-manifest --examples
```

## Migration from V1

### Automatic Migration

Use the CLI tool to automatically migrate:

```bash
mfe-manifest --migrate v1-manifest.json --output v2-manifest.json
```

### Manual Migration Steps

1. **Restructure dependencies**:

   ```json
   // V1
   "dependencies": ["react", "axios"],
   "sharedLibs": ["react-redux"],

   // V2
   "dependencies": {
     "runtime": { "axios": "^1.0.0" },
     "peer": {
       "react": "^18.0.0",
       "react-redux": "^8.0.0"
     }
   }
   ```

2. **Add compatibility info**:

   ```json
   "compatibility": {
     "container": ">=1.0.0",
     "frameworks": { "react": ">=18.0.0" }
   }
   ```

3. **Define requirements**:

   ```json
   "requirements": {
     "services": [
       { "name": "logger" },
       { "name": "eventBus" }
     ]
   }
   ```

4. **Enhance metadata**:
   ```json
   "metadata": {
     "displayName": "My App",
     "description": "App description",
     "icon": "🚀"
   }
   ```

## Best Practices

### 1. Version Management

- Use semantic versioning strictly
- Update patch version for bug fixes
- Update minor version for new features
- Update major version for breaking changes

### 2. Dependencies

- Minimize runtime dependencies
- Use peer dependencies for framework libraries
- Specify accurate version ranges

### 3. Security

- Always define CSP directives
- Specify required permissions explicitly
- Use integrity hashes for production

### 4. Performance

- Set appropriate timeouts
- Configure retry behavior
- Use preloading for critical MFEs

### 5. Documentation

- Provide comprehensive metadata
- Document emitted events
- Include repository and docs links

## Validation in CI/CD

### GitHub Actions Example

```yaml
- name: Validate MFE Manifest
  run: |
    npm install -g @mfe-toolkit/core
    mfe-manifest --validate src/manifest.json
```

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Validate all manifest files
for manifest in $(find . -name "*.manifest.json"); do
  npx mfe-manifest --validate "$manifest" || exit 1
done
```

## TypeScript Integration

```typescript
import { MFEManifestV2, manifestValidator } from '@mfe-toolkit/core';

// Type-safe manifest creation
const manifest: MFEManifestV2 = {
  name: 'my-mfe',
  version: '1.0.0',
  // ... TypeScript will enforce all required fields
};

// Validate at runtime
const result = manifestValidator.validate(manifest);
if (!result.valid) {
  console.error('Invalid manifest:', result.errors);
}
```

## Troubleshooting

### Common Validation Errors

1. **Missing required fields**
   - Ensure all required fields are present
   - Check for typos in field names

2. **Invalid version format**
   - Use semantic versioning (e.g., "1.2.3")
   - Don't include "v" prefix

3. **Invalid URL format**
   - Use full URLs including protocol
   - Ensure URLs are properly encoded

4. **Pattern violations**
   - Name must start with letter
   - Use only alphanumeric, hyphen, underscore

### Migration Issues

1. **Dependency conflicts**
   - Review peer vs runtime dependencies
   - Update version ranges appropriately

2. **Service requirements**
   - Ensure all used services are declared
   - Mark optional services correctly

## Future Enhancements

The manifest schema is designed to be extensible. Future versions may include:

- Plugin system support
- Advanced security policies
- Performance budgets
- A/B testing configuration
- Feature flags integration

## Resources

- [TypeScript Types](../api/manifest-types.md)
- [JSON Schema](../../packages/mfe-dev-kit/src/schemas/mfe-manifest-v2.schema.json)
- [Migration Guide](./manifest-migration-guide.md)
- [Examples](../../examples/manifests/)
