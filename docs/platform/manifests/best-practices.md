# MFE Manifest Best Practices

This guide provides recommendations and best practices for creating and maintaining MFE manifests.

## General Principles

### 1. Keep Manifests Accurate

- **Update version** with every release
- **Sync with package.json** version
- **Document all dependencies** including versions
- **List all events** emitted and consumed
- **Update URLs** for each environment

### 2. Be Explicit, Not Implicit

```json
// ❌ Bad - Implicit assumptions
{
  "requirements": {
    "services": [
      { "name": "logger" }  // Assumes latest version
    ]
  }
}

// ✅ Good - Explicit requirements
{
  "requirements": {
    "services": [
      {
        "name": "logger",
        "version": ">=1.0.0",
        "optional": false
      }
    ]
  }
}
```

### 3. Plan for Failure

```json
// ✅ Good - Includes fallbacks and error handling
{
  "url": "https://cdn.example.com/mfe/bundle.js",
  "alternativeUrls": [
    "https://backup-cdn.example.com/mfe/bundle.js",
    "https://origin.example.com/mfe/bundle.js"
  ],
  "config": {
    "loading": {
      "timeout": 30000,
      "retries": 3,
      "retryDelay": 1000
    }
  }
}
```

## Versioning Best Practices

### Semantic Versioning

Always use semantic versioning (semver):

- **MAJOR** (1.0.0 → 2.0.0) - Breaking changes
- **MINOR** (1.0.0 → 1.1.0) - New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1) - Bug fixes

### Version Constraints

```json
{
  "dependencies": {
    "peer": {
      // Exact version (rarely needed)
      "package-a": "1.2.3",

      // Patch updates allowed
      "package-b": "~1.2.3",

      // Minor updates allowed (recommended)
      "package-c": "^1.2.3",

      // Range
      "package-d": ">=1.0.0 <2.0.0",

      // Multiple versions
      "react": "^18.0.0 || ^19.0.0"
    }
  }
}
```

### Container Compatibility

```json
{
  "compatibility": {
    // ✅ Good - Allows future compatible versions
    "container": ">=1.0.0 <2.0.0",

    // ❌ Bad - Too restrictive
    "container": "1.2.3"
  }
}
```

## Dependency Management

### Categorize Dependencies Correctly

```json
{
  "dependencies": {
    // Runtime: Bundled with your MFE
    "runtime": {
      "axios": "^1.6.0",
      "lodash": "^4.17.21",
      "date-fns": "^3.0.0"
    },

    // Peer: Provided by container
    "peer": {
      "react": "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0",
      "@mfe-toolkit/core": "^1.0.0"
    },

    // Optional: Enhanced features if available
    "optional": {
      "react-query": "^5.0.0",
      "@sentry/react": "^7.0.0"
    }
  }
}
```

### Minimize Dependencies

1. **Use peer dependencies** for framework libraries
2. **Bundle only necessary** runtime dependencies
3. **Consider code splitting** for large dependencies
4. **Regularly audit** and update dependencies

## Service Requirements

### Be Specific About Services

```json
{
  "requirements": {
    "services": [
      {
        "name": "logger",
        "version": ">=1.0.0",
        "optional": false,
        "config": {
          "level": "info",
          "console": true
        }
      },
      {
        "name": "analytics",
        "version": ">=2.0.0",
        "optional": true, // Gracefully handle absence
        "fallback": "console" // Document fallback behavior
      }
    ]
  }
}
```

### Document Service Usage

```json
{
  "requirements": {
    "services": [
      {
        "name": "auth",
        "version": ">=1.0.0",
        "optional": false,
        "usage": [
          "auth.getCurrentUser() - Get current user on mount",
          "auth.onAuthChange() - Subscribe to auth changes",
          "auth.hasPermission() - Check user permissions"
        ]
      }
    ]
  }
}
```

## Event Communication

### Use Consistent Naming

```json
{
  "capabilities": {
    // ✅ Good - Consistent namespace:action format
    "emits": [
      "cart:item-added",
      "cart:item-removed",
      "cart:checkout-started",
      "cart:checkout-completed"
    ],

    // ❌ Bad - Inconsistent naming
    "emits": ["addToCart", "cart_removed", "CHECKOUT_START", "checkout.done"]
  }
}
```

### Document Event Payloads

```json
{
  "capabilities": {
    "emits": [
      {
        "event": "cart:item-added",
        "payload": {
          "productId": "string",
          "quantity": "number",
          "price": "number"
        }
      }
    ],
    "listens": [
      {
        "event": "user:preferences-changed",
        "handler": "updateUserPreferences",
        "payload": {
          "theme": "string",
          "locale": "string"
        }
      }
    ]
  }
}
```

## Metadata Guidelines

### Provide Rich Metadata

```json
{
  "metadata": {
    // Required fields
    "displayName": "Shopping Cart",
    "description": "E-commerce shopping cart with checkout flow",

    // Highly recommended
    "icon": "🛒",
    "author": {
      "name": "E-commerce Team",
      "email": "ecommerce@example.com",
      "url": "https://example.com/teams/ecommerce"
    },
    "license": "MIT",
    "repository": "https://github.com/example/cart-mfe",
    "documentation": "https://docs.example.com/cart-mfe",

    // Helpful for discovery
    "tags": ["ecommerce", "cart", "checkout", "payment"],
    "category": "ecommerce",
    "preview": "https://cdn.example.com/previews/cart.png",

    // Additional context
    "changelog": "https://github.com/example/cart-mfe/blob/main/CHANGELOG.md",
    "support": "https://support.example.com/cart"
  }
}
```

## Security Best Practices

### Content Security Policy

```json
{
  "security": {
    "csp": {
      // Start restrictive
      "default-src": ["'self'"],

      // Only allow what's needed
      "script-src": ["'self'", "'unsafe-inline'"], // Avoid unsafe-inline if possible
      "style-src": ["'self'", "'unsafe-inline'"],
      "connect-src": ["'self'", "https://api.example.com"],
      "img-src": ["'self'", "https:", "data:"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],

      // Security headers
      "frame-ancestors": ["'none'"], // Prevent clickjacking
      "form-action": ["'self'"]
    }
  }
}
```

### Subresource Integrity

```json
{
  "security": {
    // For production builds
    "integrity": "sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC",

    // Allowed origins
    "allowedOrigins": ["https://app.example.com", "https://*.example.com"]
  }
}
```

### Permissions

```json
{
  "security": {
    "permissions": {
      // Only required permissions
      "required": ["user:read", "cart:write"],

      // Optional enhancements
      "optional": ["analytics:write", "admin:access"]
    }
  }
}
```

## Performance Optimization

### Loading Configuration

```json
{
  "config": {
    "loading": {
      // Prioritize critical MFEs
      "priority": 10, // Higher = loads first

      // Preload if always needed
      "preload": true,

      // Lazy load if rarely used
      "lazy": false,

      // Mark as critical
      "critical": true, // Fail container if MFE fails

      // Reasonable timeouts
      "timeout": 30000, // 30 seconds
      "retries": 3,
      "retryDelay": 1000
    }
  }
}
```

### Resource Hints

```json
{
  "requirements": {
    "resources": {
      "memory": "256MB", // Expected memory usage
      "storage": "50MB", // LocalStorage/IndexedDB
      "cpu": "medium", // low, medium, high
      "network": "moderate" // minimal, moderate, heavy
    }
  }
}
```

## Environment-Specific Manifests

### Development vs Production

```javascript
// manifest.config.js
const isDev = process.env.NODE_ENV === 'development';

export default {
  name: 'my-mfe',
  version: isDev ? '0.0.0-dev' : process.env.VERSION,
  url: isDev
    ? 'http://localhost:3001/my-mfe.js'
    : `https://cdn.example.com/mfes/my-mfe/${process.env.VERSION}/bundle.js`,

  // Development-specific config
  ...(isDev && {
    config: {
      loading: {
        timeout: 5000,
        retries: 0,
      },
    },
  }),

  // Production-specific config
  ...(!isDev && {
    security: {
      integrity: process.env.SRI_HASH,
      csp: {
        'script-src': ["'self'"],
      },
    },
  }),
};
```

### Multi-Environment Strategy

```bash
# Directory structure
manifests/
├── base.manifest.json       # Shared configuration
├── dev.manifest.json        # Development overrides
├── staging.manifest.json    # Staging overrides
└── prod.manifest.json       # Production overrides
```

## Maintenance Best Practices

### Regular Updates

1. **Sync versions** - Keep manifest version in sync with package.json
2. **Update dependencies** - Regular dependency updates
3. **Review events** - Ensure event documentation is current
4. **Validate URLs** - Test all URLs before deployment
5. **Audit security** - Regular security reviews

### Automation

```json
// package.json
{
  "scripts": {
    "manifest:update": "node scripts/update-manifest-version.js",
    "manifest:validate": "mfe-toolkit manifest validate manifest.json",
    "manifest:build": "node scripts/build-manifest.js",
    "preversion": "npm run manifest:validate",
    "version": "npm run manifest:update && git add manifest.json"
  }
}
```

### Documentation

Always document:

- **Breaking changes** in changelog
- **Event changes** in manifest and docs
- **Service requirements** changes
- **Migration guides** for major versions

## Common Pitfalls to Avoid

### 1. Hardcoding Environments

```json
// ❌ Bad
{
  "url": "https://production.example.com/mfe.js"
}

// ✅ Good
{
  "url": "${MFE_BASE_URL}/mfe.js"  // Use environment variables
}
```

### 2. Over-Specifying Versions

```json
// ❌ Bad - Too restrictive
{
  "compatibility": {
    "container": "1.2.3"
  }
}

// ✅ Good - Allows compatible updates
{
  "compatibility": {
    "container": "^1.2.0"
  }
}
```

### 3. Missing Error Handling

```json
// ❌ Bad - No fallbacks
{
  "url": "https://cdn.example.com/mfe.js"
}

// ✅ Good - Has fallbacks
{
  "url": "https://cdn.example.com/mfe.js",
  "alternativeUrls": [
    "https://backup.example.com/mfe.js"
  ]
}
```

### 4. Incomplete Event Documentation

```json
// ❌ Bad - Just event names
{
  "emits": ["data-loaded"]
}

// ✅ Good - Full documentation
{
  "emits": [
    {
      "event": "data-loaded",
      "description": "Fired when initial data is loaded",
      "payload": {
        "recordCount": "number",
        "timestamp": "ISO 8601 string"
      }
    }
  ]
}
```

## Checklist

Before deploying, ensure your manifest:

- [ ] Has correct version matching package.json
- [ ] Lists all runtime and peer dependencies
- [ ] Specifies all required services
- [ ] Documents all emitted and consumed events
- [ ] Includes comprehensive metadata
- [ ] Has appropriate security policies
- [ ] Defines loading configuration
- [ ] Includes alternative URLs for production
- [ ] Passes validation without errors
- [ ] Has been tested in target environment

## Next Steps

- Review the [Specification](./specification.md) for all available options
- Set up [Validation](./validation-guide.md) in your pipeline
- Check out [Examples](./examples.md) for inspiration
