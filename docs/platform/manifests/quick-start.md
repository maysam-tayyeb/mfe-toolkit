# MFE Manifest Quick Start Guide

This guide will help you create and use MFE manifests in your microfrontend projects.

## Creating Your First Manifest

### Step 1: Create a Basic Manifest

Create a `manifest.json` file in your MFE's root directory:

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "my-first-mfe",
  "version": "1.0.0",
  "url": "http://localhost:3001/my-first-mfe.js",
  "dependencies": {
    "peer": {
      "react": "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0"
    }
  },
  "compatibility": {
    "container": ">=1.0.0"
  },
  "requirements": {
    "services": [
      { "name": "logger" },
      { "name": "eventBus" }
    ]
  },
  "metadata": {
    "displayName": "My First MFE",
    "description": "A simple microfrontend example",
    "icon": "🚀"
  }
}
```

### Step 2: Understand Required Fields

Every manifest must have:
- `name` - Unique identifier for your MFE
- `version` - Semantic version (e.g., "1.0.0")
- `url` - Where to load your MFE from
- `compatibility.container` - Which container versions work
- `requirements.services` - Container services you need
- `metadata.displayName` - Human-readable name
- `metadata.description` - What your MFE does

## Common Patterns

### React MFE

```json
{
  "name": "react-dashboard",
  "version": "1.0.0",
  "url": "http://localhost:3001/dashboard.js",
  "dependencies": {
    "peer": {
      "react": "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0"
    },
    "runtime": {
      "axios": "^1.6.0",
      "@tanstack/react-query": "^5.0.0"
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
      { "name": "logger" },
      { "name": "eventBus" },
      { "name": "notification", "optional": true }
    ]
  },
  "metadata": {
    "displayName": "Dashboard",
    "description": "Analytics dashboard with real-time data",
    "icon": "📊"
  }
}
```

### Vue MFE

```json
{
  "name": "vue-shop",
  "version": "1.0.0",
  "url": "http://localhost:3002/shop.js",
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
    "services": [
      { "name": "logger" },
      { "name": "eventBus" },
      { "name": "auth" }
    ]
  },
  "metadata": {
    "displayName": "Shop",
    "description": "E-commerce shopping experience",
    "icon": "🛍️"
  }
}
```

### Vanilla JavaScript MFE

```json
{
  "name": "vanilla-widget",
  "version": "1.0.0",
  "url": "http://localhost:3003/widget.js",
  "dependencies": {
    "runtime": {}
  },
  "compatibility": {
    "container": ">=1.0.0"
  },
  "requirements": {
    "services": [
      { "name": "logger" }
    ]
  },
  "metadata": {
    "displayName": "Widget",
    "description": "Lightweight vanilla JS widget",
    "icon": "🔧"
  }
}
```

## Declaring Capabilities

### Events

Specify which events your MFE emits and listens to:

```json
{
  "capabilities": {
    "emits": [
      "user:login",
      "user:logout",
      "user:profile-updated"
    ],
    "listens": [
      "app:theme-changed",
      "app:locale-changed"
    ]
  }
}
```

### Routes

Declare routes your MFE handles:

```json
{
  "capabilities": {
    "routes": [
      { "path": "/dashboard", "exact": true },
      { "path": "/dashboard/analytics", "exact": true },
      { "path": "/dashboard/reports", "exact": false }
    ]
  }
}
```

### Provided Services

If your MFE exports services for others:

```json
{
  "capabilities": {
    "provides": {
      "services": ["analyticsAPI", "reportGenerator"],
      "components": ["AnalyticsChart", "DataTable"],
      "hooks": ["useAnalytics", "useReport"]
    }
  }
}
```

## Configuration Options

### Loading Behavior

Control how your MFE loads:

```json
{
  "config": {
    "loading": {
      "timeout": 30000,      // 30 seconds timeout
      "retries": 3,          // Try 3 times
      "retryDelay": 1000,    // Wait 1 second between retries
      "priority": 10,        // Higher priority loads first
      "preload": true        // Load before needed
    }
  }
}
```

### Runtime Behavior

Configure runtime characteristics:

```json
{
  "config": {
    "runtime": {
      "singleton": true,     // Only one instance
      "keepAlive": true,     // Don't unmount when hidden
      "isolation": "none"    // No sandboxing
    }
  }
}
```

## Using the CLI Tool

### Generate a New Manifest

```bash
# Install the CLI globally
npm install -g @mfe-toolkit/cli

# Generate a basic manifest
mfe-toolkit manifest create --name my-mfe

# Generate with options
mfe-toolkit manifest create \
  --name my-mfe \
  --framework react \
  --version 1.0.0
```

### Validate Your Manifest

```bash
# Validate a manifest file
mfe-toolkit manifest validate manifest.json

# Validate all manifests in the project
mfe-toolkit manifest validate --all
```

### Migrate from V1

```bash
# Migrate a single manifest
mfe-toolkit manifest migrate old-manifest.json -o manifest.json

# Migrate with interactive mode
mfe-toolkit manifest migrate old-manifest.json --interactive
```

## Integration with Build Tools

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import manifest from './manifest.json';

export default defineConfig({
  build: {
    lib: {
      entry: './src/main.js',
      name: manifest.name,
      fileName: manifest.name,
      formats: ['es']
    }
  },
  define: {
    '__MFE_MANIFEST__': JSON.stringify(manifest)
  }
});
```

### Webpack Configuration

```javascript
// webpack.config.js
const manifest = require('./manifest.json');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: `${manifest.name}.js`,
    library: {
      type: 'module'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      '__MFE_MANIFEST__': JSON.stringify(manifest)
    })
  ]
};
```

## Environment-Specific Manifests

### Development Manifest

```json
{
  "name": "my-mfe",
  "version": "1.0.0-dev",
  "url": "http://localhost:3001/my-mfe.js",
  "metadata": {
    "displayName": "My MFE (Dev)",
    "description": "Development version"
  }
}
```

### Production Manifest

```json
{
  "name": "my-mfe",
  "version": "1.0.0",
  "url": "https://cdn.example.com/mfes/my-mfe/1.0.0/bundle.js",
  "alternativeUrls": [
    "https://backup-cdn.example.com/mfes/my-mfe/1.0.0/bundle.js"
  ],
  "security": {
    "integrity": "sha384-...",
    "csp": {
      "script-src": ["'self'"],
      "connect-src": ["'self'", "https://api.example.com"]
    }
  },
  "metadata": {
    "displayName": "My MFE",
    "description": "Production version"
  }
}
```

## Best Practices Summary

1. **Always include schema reference** for validation
2. **Use semantic versioning** for version field
3. **Declare all dependencies** accurately
4. **List all required services** explicitly
5. **Provide meaningful metadata** for UI display
6. **Document emitted events** for other MFEs
7. **Set appropriate timeouts** for loading
8. **Use environment-specific URLs** for different stages

## Next Steps

- Read the full [Specification](./specification.md) for all available options
- Check out [Examples](./examples.md) for real-world use cases
- Learn about [Migration](./migration-guide.md) from V1 manifests
- Set up [Validation](./validation-guide.md) in your CI/CD pipeline

## Getting Help

- **Documentation**: See the full [manifest documentation](./README.md)
- **Examples**: Browse the [examples directory](../../../apps/)
- **Issues**: Report problems on [GitHub](https://github.com/mfe-made-easy/issues)
- **Community**: Join our [Discord server](https://discord.gg/mfe-made-easy)