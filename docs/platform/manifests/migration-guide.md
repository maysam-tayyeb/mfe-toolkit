# MFE Manifest Migration Guide

> **Note**: This document is kept for historical reference. The platform now uses a single manifest specification without version tracking.

This guide documents the migration from legacy manifest formats to the current specification. The current format provides better type safety, more features, and clearer structure.

## Key Changes from V1 to V2

### 1. Structured Dependencies

**V1 Format:**

```json
{
  "dependencies": ["react", "react-dom", "axios"],
  "sharedLibs": ["@reduxjs/toolkit", "react-redux"]
}
```

**V2 Format:**

```json
{
  "dependencies": {
    "runtime": {
      "axios": "^1.6.0"
    },
    "peer": {
      "react": "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0",
      "@reduxjs/toolkit": "^2.0.0",
      "react-redux": "^9.0.0"
    }
  }
}
```

### 2. Service Requirements

**V1 Format:**

```json
{
  "requiredServices": ["logger", "eventBus"]
}
```

**V2 Format:**

```json
{
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
      }
    ]
  }
}
```

### 3. Enhanced Metadata

**V1 Format:**

```json
{
  "metadata": {
    "displayName": "My MFE",
    "description": "Simple MFE",
    "icon": "🚀"
  }
}
```

**V2 Format:**

```json
{
  "metadata": {
    "displayName": "My MFE",
    "description": "Simple MFE",
    "icon": "🚀",
    "author": {
      "name": "Team Name",
      "email": "team@example.com"
    },
    "license": "MIT",
    "repository": "https://github.com/example/my-mfe",
    "documentation": "https://docs.example.com/my-mfe",
    "tags": ["feature", "production"],
    "category": "business"
  }
}
```

### 4. Compatibility Information

**New in V2:**

```json
{
  "compatibility": {
    "container": ">=1.0.0",
    "browsers": {
      "chrome": ">=90",
      "firefox": ">=88",
      "safari": ">=14"
    },
    "frameworks": {
      "react": ">=18.0.0"
    }
  }
}
```

### 5. Capabilities Declaration

**New in V2:**

```json
{
  "capabilities": {
    "provides": {
      "services": ["userAPI"],
      "components": ["UserProfile"],
      "hooks": ["useUser"]
    },
    "emits": ["user:login", "user:logout"],
    "listens": ["app:theme-change"],
    "routes": [{ "path": "/user", "exact": false }],
    "features": ["user-management"]
  }
}
```

## Migration Methods

### Automatic Migration

Use the MFE Toolkit CLI to automatically migrate your manifests:

```bash
# Install the CLI
npm install -g @mfe-toolkit/cli

# Migrate a single manifest
mfe-toolkit manifest migrate old-manifest.json -o manifest.json

# Migrate with verbose output
mfe-toolkit manifest migrate old-manifest.json -o manifest.json --verbose

# Migrate and validate
mfe-toolkit manifest migrate old-manifest.json -o manifest.json --validate
```

### Programmatic Migration

Use the migration API in your build scripts:

```typescript
import { ManifestValidator } from '@mfe-toolkit/core';

const validator = new ManifestValidator();

// Load V1 manifest
const v1Manifest = JSON.parse(fs.readFileSync('old-manifest.json', 'utf8'));

// Migrate to V2
const v2Manifest = validator.migrateToV2(v1Manifest);

// Validate the result
const validation = validator.validate(v2Manifest);
if (!validation.valid) {
  console.error('Migration produced invalid manifest:', validation.errors);
}

// Save V2 manifest
fs.writeFileSync('manifest.json', JSON.stringify(v2Manifest, null, 2));
```

## Step-by-Step Manual Migration

### Step 1: Add Schema Reference

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json"
}
```

### Step 2: Restructure Dependencies

1. Move direct dependencies to `dependencies.runtime`
2. Move shared libraries to `dependencies.peer`
3. Add version ranges for all dependencies

```json
{
  "dependencies": {
    "runtime": {
      // Dependencies bundled with your MFE
      "axios": "^1.6.0",
      "lodash": "^4.17.21"
    },
    "peer": {
      // Dependencies provided by the container
      "react": "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0"
    },
    "optional": {
      // Optional enhancements
      "react-query": "^5.0.0"
    }
  }
}
```

### Step 3: Define Compatibility

Add container and browser requirements:

```json
{
  "compatibility": {
    "container": ">=1.0.0",
    "browsers": {
      "chrome": ">=90",
      "firefox": ">=88",
      "safari": ">=14"
    },
    "frameworks": {
      "react": ">=18.0.0"
    }
  }
}
```

### Step 4: Convert Service Requirements

Transform the flat service list to detailed requirements:

```json
{
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
        "name": "notification",
        "version": ">=1.0.0",
        "optional": true
      }
    ]
  }
}
```

### Step 5: Enhance Metadata

Add additional metadata fields:

```json
{
  "metadata": {
    // Keep existing fields
    "displayName": "My MFE",
    "description": "Description of your MFE",
    "icon": "🚀",

    // Add new fields
    "author": {
      "name": "Your Team",
      "email": "team@example.com"
    },
    "license": "MIT",
    "repository": "https://github.com/yourorg/your-mfe",
    "documentation": "https://docs.example.com/your-mfe",
    "tags": ["production", "customer-facing"],
    "category": "business"
  }
}
```

### Step 6: Add Capabilities

Document what your MFE provides and consumes:

```json
{
  "capabilities": {
    "emits": ["mfe:ready", "user:action"],
    "listens": ["app:config-change", "theme:change"],
    "routes": [{ "path": "/my-feature", "exact": true }]
  }
}
```

### Step 7: Configure Loading Behavior

Add configuration for how your MFE should be loaded:

```json
{
  "config": {
    "loading": {
      "timeout": 30000,
      "retries": 3,
      "retryDelay": 1000,
      "priority": 10
    },
    "runtime": {
      "singleton": true,
      "keepAlive": true
    }
  }
}
```

## Common Migration Patterns

### React MFE Migration

**V1:**

```json
{
  "name": "reactApp",
  "version": "1.0.0",
  "url": "http://localhost:3001/app.js",
  "dependencies": ["react", "react-dom", "axios"],
  "sharedLibs": ["react-redux"],
  "requiredServices": ["logger", "eventBus"],
  "metadata": {
    "displayName": "React App",
    "description": "Sample React app"
  }
}
```

**V2:**

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "reactApp",
  "version": "1.0.0",
  "url": "http://localhost:3001/app.js",
  "dependencies": {
    "runtime": {
      "axios": "^1.6.0"
    },
    "peer": {
      "react": "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0",
      "react-redux": "^9.0.0"
    }
  },
  "compatibility": {
    "container": ">=1.0.0",
    "frameworks": {
      "react": ">=18.0.0"
    }
  },
  "requirements": {
    "services": [{ "name": "logger" }, { "name": "eventBus" }]
  },
  "metadata": {
    "displayName": "React App",
    "description": "Sample React app",
    "icon": "⚛️"
  }
}
```

### Vue MFE Migration

**V1:**

```json
{
  "name": "vueApp",
  "version": "1.0.0",
  "url": "http://localhost:3002/app.js",
  "dependencies": ["vue", "pinia"],
  "requiredServices": ["logger"],
  "metadata": {
    "displayName": "Vue App"
  }
}
```

**V2:**

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "vueApp",
  "version": "1.0.0",
  "url": "http://localhost:3002/app.js",
  "dependencies": {
    "peer": {
      "vue": "^3.3.0"
    },
    "runtime": {
      "pinia": "^2.1.0"
    }
  },
  "compatibility": {
    "container": ">=1.0.0",
    "frameworks": {
      "vue": ">=3.0.0"
    }
  },
  "requirements": {
    "services": [{ "name": "logger" }]
  },
  "metadata": {
    "displayName": "Vue App",
    "description": "Vue-based microfrontend",
    "icon": "💚"
  }
}
```

## Validation After Migration

Always validate your migrated manifest:

```bash
# Using CLI
mfe-toolkit manifest validate manifest.json

# In code
import { manifestValidator } from '@mfe-toolkit/core';

const result = manifestValidator.validate(manifest);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## Troubleshooting

### Common Issues

1. **Missing required fields**
   - Ensure all V2 required fields are present
   - Check spelling and case sensitivity

2. **Invalid version formats**
   - Use proper semver format (e.g., "1.0.0")
   - Don't use "v" prefix

3. **Dependency version ranges**
   - Add version ranges to all dependencies
   - Use npm-compatible version syntax

4. **Service definitions**
   - Convert string array to object array
   - Mark optional services explicitly

### Getting Help

- Run validation to see specific errors
- Check the [specification](./specification.md) for field details
- Use the CLI's `--verbose` flag for detailed output
- Ask in the community forums for complex cases

## Next Steps

After migrating your manifests:

1. **Update build configuration** to use the new manifest
2. **Test MFE loading** with the new format
3. **Update documentation** to reflect V2 features
4. **Set up CI validation** using the new schema

See the [Validation Guide](./validation-guide.md) for setting up automated checks.
