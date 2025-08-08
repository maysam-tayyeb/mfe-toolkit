# MFE Manifest Specification

## Overview

The MFE Manifest is a JSON-based specification that describes a microfrontend's requirements, capabilities, and metadata. This specification enables containers to load, validate, and integrate MFEs regardless of their implementation framework.

## Schema

Schema URL: `https://mfe-made-easy.com/schemas/mfe-manifest.schema.json`

## Complete Manifest Structure

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest.schema.json",
  "name": "example-mfe",
  "version": "1.0.0",
  "url": "https://cdn.example.com/mfes/example/1.0.0/bundle.js",
  "alternativeUrls": ["https://backup-cdn.example.com/mfes/example/1.0.0/bundle.js"],
  "dependencies": {
    "runtime": {
      "axios": "^1.6.0",
      "lodash": "^4.17.21"
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
    "container": ">=1.0.0",
    "browsers": {
      "chrome": ">=90",
      "firefox": ">=88",
      "safari": ">=14",
      "edge": ">=90"
    },
    "frameworks": {
      "react": ">=18.0.0"
    }
  },
  "capabilities": {
    "provides": {
      "services": ["userAPI", "cartAPI"],
      "components": ["UserProfile", "ShoppingCart"],
      "hooks": ["useUser", "useCart"]
    },
    "emits": ["user:login", "user:logout", "cart:updated", "cart:checkout"],
    "listens": ["app:theme-change", "app:locale-change", "auth:token-refresh"],
    "routes": [
      { "path": "/user", "exact": false },
      { "path": "/cart", "exact": true },
      { "path": "/checkout", "exact": true }
    ],
    "features": ["user-management", "shopping-cart", "checkout-flow"]
  },
  "requirements": {
    "services": [
      {
        "name": "logger",
        "version": ">=1.0.0",
        "optional": false
      },
      {
        "name": "eventBus",
        "version": ">=2.0.0",
        "optional": false
      },
      {
        "name": "auth",
        "version": ">=1.0.0",
        "optional": false
      },
      {
        "name": "notification",
        "version": ">=1.0.0",
        "optional": true
      }
    ],
    "permissions": ["user:read", "user:write", "cart:manage", "order:create"],
    "resources": {
      "memory": "256MB",
      "storage": "50MB",
      "cpu": "low"
    }
  },
  "metadata": {
    "displayName": "User & Cart Management",
    "description": "Handles user profiles and shopping cart functionality",
    "icon": "🛒",
    "author": {
      "name": "E-commerce Team",
      "email": "ecommerce@example.com",
      "url": "https://example.com/teams/ecommerce"
    },
    "license": "MIT",
    "repository": "https://github.com/example/user-cart-mfe",
    "documentation": "https://docs.example.com/user-cart-mfe",
    "tags": ["ecommerce", "user", "cart", "checkout"],
    "category": "ecommerce",
    "preview": "https://example.com/previews/user-cart.png"
  },
  "config": {
    "loading": {
      "timeout": 30000,
      "retries": 3,
      "retryDelay": 1000,
      "priority": 10,
      "preload": true,
      "lazy": false,
      "critical": true
    },
    "runtime": {
      "isolation": "none",
      "keepAlive": true,
      "singleton": true,
      "maxInstances": 1
    },
    "communication": {
      "eventNamespace": "user-cart",
      "allowedEvents": ["user:*", "cart:*", "app:*"],
      "messageTimeout": 5000,
      "queueSize": 100
    }
  },
  "security": {
    "csp": {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "connect-src": ["'self'", "https://api.example.com"],
      "img-src": ["'self'", "https:", "data:"],
      "font-src": ["'self'", "https://fonts.gstatic.com"]
    },
    "integrity": "sha384-...",
    "allowedOrigins": ["https://example.com", "https://*.example.com"],
    "permissions": {
      "required": ["core:access", "user:access"],
      "optional": ["admin:access"]
    }
  },
  "lifecycle": {
    "hooks": {
      "beforeMount": "initializeUserCart",
      "afterMount": "startPolling",
      "beforeUnmount": "saveState",
      "afterUnmount": "cleanup"
    },
    "healthCheck": {
      "url": "/health",
      "interval": 60000,
      "timeout": 5000,
      "retries": 2
    },
    "updates": {
      "strategy": "manual",
      "checkInterval": 3600000
    }
  },
  "build": {
    "hash": "abc123def456",
    "timestamp": "2024-01-20T10:00:00Z",
    "environment": "production"
  }
}
```

## Field Reference

### Root Fields

#### `$schema` (recommended)

- **Type**: `string` (URI)
- **Description**: Points to the JSON schema for validation
- **Example**: `"https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json"`

#### `name` (required)

- **Type**: `string`
- **Pattern**: `^[a-zA-Z][a-zA-Z0-9-_]*$`
- **Description**: Unique identifier for the MFE
- **Constraints**: Must start with a letter, can contain alphanumeric, hyphens, and underscores

#### `version` (required)

- **Type**: `string`
- **Format**: Semantic version
- **Description**: Version of the MFE following semver
- **Examples**: `"1.0.0"`, `"2.1.0-beta.1"`, `"3.0.0-rc.2"`

#### `url` (required)

- **Type**: `string` (URI)
- **Description**: Primary URL for loading the MFE bundle
- **Note**: Should be an absolute URL in production

#### `alternativeUrls` (optional)

- **Type**: `string[]` (array of URIs)
- **Description**: Fallback URLs for redundancy and failover
- **Usage**: Container tries these in order if primary URL fails

### Dependencies Object

#### `dependencies.runtime` (optional)

- **Type**: `Record<string, VersionRange>`
- **Description**: Dependencies bundled with the MFE
- **Note**: These are included in the MFE bundle

#### `dependencies.peer` (optional)

- **Type**: `Record<string, VersionRange>`
- **Description**: Dependencies expected from the container
- **Note**: Container must provide these or loading will fail

#### `dependencies.optional` (optional)

- **Type**: `Record<string, VersionRange>`
- **Description**: Dependencies that enhance functionality if available
- **Note**: MFE must gracefully handle their absence

### Compatibility Object

#### `compatibility.container` (required)

- **Type**: `VersionRange`
- **Description**: Container version requirement
- **Examples**: `">=1.0.0"`, `"^2.0.0"`, `">=1.0.0 <3.0.0"`

#### `compatibility.browsers` (optional)

- **Type**: Object with browser version requirements
- **Properties**: `chrome`, `firefox`, `safari`, `edge`
- **Format**: Minimum version numbers

#### `compatibility.frameworks` (optional)

- **Type**: Object with framework version requirements
- **Description**: Framework versions the MFE is compatible with

### Capabilities Object

#### `capabilities.provides` (optional)

- **Type**: Object describing what the MFE exports
- **Properties**:
  - `services`: Array of service names
  - `components`: Array of component names
  - `hooks`: Array of hook names

#### `capabilities.emits` (optional)

- **Type**: `string[]`
- **Description**: Event types this MFE publishes
- **Format**: Recommended format is `namespace:action`

#### `capabilities.listens` (optional)

- **Type**: `string[]`
- **Description**: Event types this MFE subscribes to
- **Format**: Can use wildcards like `user:*`

#### `capabilities.routes` (optional)

- **Type**: Array of route objects
- **Properties**:
  - `path`: Route path pattern
  - `exact`: Boolean for exact matching

#### `capabilities.features` (optional)

- **Type**: `string[]`
- **Description**: High-level features provided by the MFE

### Requirements Object

#### `requirements.services` (required)

- **Type**: Array of service requirement objects
- **Properties**:
  - `name`: Service identifier
  - `version`: Version requirement (optional)
  - `optional`: Boolean (default: false)

#### `requirements.permissions` (optional)

- **Type**: `string[]`
- **Description**: Permission identifiers required for the MFE to function

#### `requirements.resources` (optional)

- **Type**: Object with resource limits
- **Properties**:
  - `memory`: Memory limit (e.g., "256MB")
  - `storage`: Storage limit (e.g., "50MB")
  - `cpu`: CPU priority ("low", "medium", "high")

### Metadata Object

#### `metadata.displayName` (required)

- **Type**: `string`
- **Description**: Human-readable name for UI display

#### `metadata.description` (required)

- **Type**: `string`
- **Description**: Brief description of MFE functionality

#### `metadata.icon` (optional)

- **Type**: `string`
- **Description**: Icon representation (emoji, URL, or icon name)

#### `metadata.author` (optional)

- **Type**: Object or string
- **Properties** (if object):
  - `name`: Author name
  - `email`: Contact email
  - `url`: Author website

#### Additional metadata fields

- `license`: SPDX license identifier
- `repository`: Source code URL
- `documentation`: Documentation URL
- `tags`: Array of categorization tags
- `category`: Primary category
- `preview`: Preview image URL

### Configuration Object

#### `config.loading` (optional)

- **Properties**:
  - `timeout`: Max load time in milliseconds
  - `retries`: Number of retry attempts
  - `retryDelay`: Delay between retries in milliseconds
  - `priority`: Loading priority (higher loads first)
  - `preload`: Load before needed
  - `lazy`: Load only when requested
  - `critical`: Fail container if MFE fails to load

#### `config.runtime` (optional)

- **Properties**:
  - `isolation`: Isolation level ("none", "sandbox", "iframe")
  - `keepAlive`: Keep loaded when not visible
  - `singleton`: Only one instance allowed
  - `maxInstances`: Maximum number of instances

#### `config.communication` (optional)

- **Properties**:
  - `eventNamespace`: Event prefix for scoping
  - `allowedEvents`: Event patterns allowed
  - `messageTimeout`: Message timeout in milliseconds
  - `queueSize`: Maximum event queue size

### Security Object

#### `security.csp` (optional)

- **Type**: CSP directive object
- **Description**: Content Security Policy directives
- **Note**: Values are arrays of sources

#### `security.integrity` (optional)

- **Type**: `string`
- **Description**: Subresource integrity hash

#### `security.allowedOrigins` (optional)

- **Type**: `string[]`
- **Description**: Origins allowed to load this MFE

#### `security.permissions` (optional)

- **Properties**:
  - `required`: Permissions that must be granted
  - `optional`: Permissions that enhance functionality

### Lifecycle Object

#### `lifecycle.hooks` (optional)

- **Properties**:
  - `beforeMount`: Function name to call before mounting
  - `afterMount`: Function name to call after mounting
  - `beforeUnmount`: Function name to call before unmounting
  - `afterUnmount`: Function name to call after unmounting

#### `lifecycle.healthCheck` (optional)

- **Properties**:
  - `url`: Health check endpoint path
  - `interval`: Check interval in milliseconds
  - `timeout`: Request timeout in milliseconds
  - `retries`: Number of retries before marking unhealthy

#### `lifecycle.updates` (optional)

- **Properties**:
  - `strategy`: Update strategy ("auto", "manual")
  - `checkInterval`: Update check interval in milliseconds

### Build Information

#### `build` (optional)

- **Properties**:
  - `hash`: Build hash or commit SHA
  - `timestamp`: ISO 8601 build timestamp
  - `environment`: Build environment

## Version Range Syntax

Version ranges follow npm's semver syntax:

- `"1.2.3"` - Exact version
- `"^1.2.3"` - Compatible with 1.x.x
- `"~1.2.3"` - Approximately 1.2.x
- `">=1.2.3"` - Greater than or equal
- `">=1.0.0 <2.0.0"` - Range
- `"1.2.3 || 2.0.0"` - Multiple options

## Event Naming Convention

Recommended format: `namespace:action`

Examples:

- `user:login`
- `cart:item-added`
- `app:theme-changed`
- `mfe:ready`

## Validation Rules

1. **Required fields must be present**
2. **Version must be valid semver**
3. **URLs must be valid URIs**
4. **Name must match pattern**
5. **Service names must be recognized by container**
6. **Event names should follow convention**
7. **Version ranges must be valid**

## Container Behavior

Containers MUST:

1. Validate manifest before loading MFE
2. Check compatibility requirements
3. Provide required services
4. Respect configuration settings
5. Handle security policies

Containers SHOULD:

1. Cache manifests appropriately
2. Try alternative URLs on failure
3. Implement health checks
4. Support lifecycle hooks
5. Monitor resource usage

## Future Compatibility

The specification is designed for forward compatibility:

- Unknown fields should be preserved but ignored
- New optional fields can be added without breaking changes
- Major version changes indicate breaking changes

---

_This specification is maintained by the MFE Toolkit community. For changes, please submit a proposal via GitHub._
