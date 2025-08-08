# MFE Manifest Examples

This page provides real-world examples of MFE manifests for different scenarios and frameworks.

## Basic Examples

### Minimal React MFE

The absolute minimum required for a React MFE:

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "minimal-react",
  "version": "1.0.0",
  "url": "http://localhost:3001/minimal.js",
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
    "services": [{ "name": "logger" }]
  },
  "metadata": {
    "displayName": "Minimal React MFE",
    "description": "Bare minimum React microfrontend"
  }
}
```

### Minimal Vanilla JS MFE

For framework-agnostic MFEs:

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "vanilla-widget",
  "version": "1.0.0",
  "url": "http://localhost:3003/widget.js",
  "compatibility": {
    "container": ">=1.0.0"
  },
  "requirements": {
    "services": []
  },
  "metadata": {
    "displayName": "Vanilla Widget",
    "description": "Pure JavaScript widget with no dependencies"
  }
}
```

## Framework-Specific Examples

### React 19 with TypeScript

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "react19-dashboard",
  "version": "2.3.0",
  "url": "https://cdn.example.com/mfes/dashboard/2.3.0/bundle.js",
  "alternativeUrls": ["https://backup-cdn.example.com/mfes/dashboard/2.3.0/bundle.js"],
  "dependencies": {
    "peer": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    },
    "runtime": {
      "@tanstack/react-query": "^5.12.0",
      "recharts": "^2.10.0",
      "date-fns": "^3.0.0"
    },
    "optional": {
      "react-hook-form": "^7.48.0"
    }
  },
  "compatibility": {
    "container": ">=2.0.0",
    "frameworks": {
      "react": ">=19.0.0"
    },
    "browsers": {
      "chrome": ">=95",
      "firefox": ">=90",
      "safari": ">=15",
      "edge": ">=95"
    }
  },
  "capabilities": {
    "provides": {
      "components": ["DashboardWidget", "ChartComponent"],
      "hooks": ["useDashboardData", "useMetrics"]
    },
    "emits": ["dashboard:data-loaded", "dashboard:refresh-requested", "dashboard:export-completed"],
    "listens": ["user:preferences-changed", "app:theme-changed"],
    "routes": [
      { "path": "/dashboard", "exact": true },
      { "path": "/dashboard/analytics", "exact": true },
      { "path": "/dashboard/reports", "exact": false }
    ]
  },
  "requirements": {
    "services": [
      { "name": "logger", "version": ">=1.0.0" },
      { "name": "eventBus", "version": ">=2.0.0" },
      { "name": "auth", "version": ">=1.0.0" },
      { "name": "api", "version": ">=1.0.0" }
    ],
    "permissions": ["analytics:read", "reports:read", "exports:create"]
  },
  "metadata": {
    "displayName": "Analytics Dashboard",
    "description": "Real-time analytics dashboard with interactive charts",
    "icon": "📊",
    "author": {
      "name": "Analytics Team",
      "email": "analytics@example.com"
    },
    "license": "MIT",
    "repository": "https://github.com/example/dashboard-mfe",
    "documentation": "https://docs.example.com/dashboard",
    "tags": ["analytics", "dashboard", "charts", "typescript"],
    "category": "analytics"
  },
  "config": {
    "loading": {
      "timeout": 45000,
      "retries": 3,
      "retryDelay": 2000,
      "priority": 10,
      "preload": true
    },
    "runtime": {
      "singleton": true,
      "keepAlive": true
    }
  }
}
```

### Vue 3 with Composition API

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "vue-shopping-cart",
  "version": "1.5.0",
  "url": "https://cdn.example.com/mfes/shopping-cart/1.5.0/bundle.js",
  "dependencies": {
    "peer": {
      "vue": "^3.3.0"
    },
    "runtime": {
      "pinia": "^2.1.0",
      "@vueuse/core": "^10.7.0",
      "vee-validate": "^4.12.0"
    }
  },
  "compatibility": {
    "container": ">=1.5.0",
    "frameworks": {
      "vue": ">=3.3.0"
    }
  },
  "capabilities": {
    "provides": {
      "services": ["cartAPI"],
      "components": ["ShoppingCart", "CartSummary"]
    },
    "emits": ["cart:item-added", "cart:item-removed", "cart:updated", "cart:checkout-started"],
    "listens": ["product:selected", "user:login", "user:logout"],
    "routes": [
      { "path": "/cart", "exact": true },
      { "path": "/checkout", "exact": false }
    ]
  },
  "requirements": {
    "services": [
      { "name": "logger" },
      { "name": "eventBus" },
      { "name": "auth" },
      { "name": "notification" },
      { "name": "api" }
    ],
    "permissions": ["cart:read", "cart:write", "order:create"]
  },
  "metadata": {
    "displayName": "Shopping Cart",
    "description": "E-commerce shopping cart with checkout flow",
    "icon": "🛒",
    "author": "E-commerce Team",
    "tags": ["ecommerce", "shopping", "cart", "vue3"],
    "category": "ecommerce"
  }
}
```

### Angular 17 Standalone

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "angular-admin",
  "version": "3.0.0",
  "url": "https://cdn.example.com/mfes/admin/3.0.0/bundle.js",
  "dependencies": {
    "peer": {
      "@angular/core": "^17.0.0",
      "@angular/common": "^17.0.0",
      "@angular/router": "^17.0.0",
      "rxjs": "^7.8.0"
    },
    "runtime": {
      "@angular/material": "^17.0.0",
      "@ngrx/store": "^17.0.0"
    }
  },
  "compatibility": {
    "container": ">=2.0.0",
    "frameworks": {
      "angular": ">=17.0.0"
    }
  },
  "capabilities": {
    "routes": [{ "path": "/admin", "exact": false }],
    "emits": ["admin:settings-changed"],
    "listens": ["user:permissions-changed"]
  },
  "requirements": {
    "services": [{ "name": "logger" }, { "name": "auth" }, { "name": "api" }],
    "permissions": ["admin:access"]
  },
  "metadata": {
    "displayName": "Admin Panel",
    "description": "Administrative dashboard and settings",
    "icon": "⚙️",
    "category": "admin"
  }
}
```

## Use Case Examples

### E-commerce Product Catalog

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "product-catalog",
  "version": "2.1.0",
  "url": "https://cdn.shop.com/mfes/catalog/2.1.0/bundle.js",
  "dependencies": {
    "peer": {
      "react": "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0"
    },
    "runtime": {
      "swr": "^2.2.0",
      "@algolia/react-instantsearch": "^7.0.0",
      "react-intersection-observer": "^9.5.0"
    }
  },
  "capabilities": {
    "provides": {
      "services": ["productSearch", "productAPI"],
      "components": ["ProductCard", "ProductGrid", "SearchBar"]
    },
    "emits": [
      "product:viewed",
      "product:added-to-cart",
      "product:added-to-wishlist",
      "search:performed"
    ],
    "listens": ["cart:updated", "user:preferences-changed", "filters:changed"],
    "routes": [
      { "path": "/products", "exact": false },
      { "path": "/search", "exact": true }
    ],
    "features": ["search", "filters", "sorting", "pagination", "quick-view"]
  },
  "requirements": {
    "services": [
      { "name": "logger" },
      { "name": "eventBus" },
      { "name": "api" },
      { "name": "analytics", "optional": true }
    ],
    "resources": {
      "memory": "512MB",
      "storage": "100MB"
    }
  },
  "config": {
    "loading": {
      "priority": 20,
      "preload": true
    },
    "runtime": {
      "keepAlive": true
    },
    "communication": {
      "eventNamespace": "catalog",
      "allowedEvents": ["product:*", "search:*", "cart:*"]
    }
  },
  "security": {
    "csp": {
      "img-src": ["'self'", "https://cdn.shop.com", "https://images.shop.com"],
      "connect-src": ["'self'", "https://api.shop.com", "https://search.algolia.com"]
    }
  },
  "metadata": {
    "displayName": "Product Catalog",
    "description": "Browse and search products with advanced filtering",
    "icon": "🛍️",
    "preview": "https://cdn.shop.com/previews/catalog.png",
    "tags": ["ecommerce", "catalog", "search", "products"],
    "category": "ecommerce"
  }
}
```

### Real-time Chat Widget

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "chat-widget",
  "version": "1.2.0",
  "url": "https://cdn.example.com/mfes/chat/1.2.0/bundle.js",
  "dependencies": {
    "runtime": {
      "socket.io-client": "^4.6.0",
      "emoji-mart": "^5.5.0"
    }
  },
  "compatibility": {
    "container": ">=1.0.0"
  },
  "capabilities": {
    "emits": ["chat:message-sent", "chat:typing", "chat:opened", "chat:closed"],
    "listens": [
      "chat:message-received",
      "chat:user-joined",
      "chat:user-left",
      "user:status-changed"
    ],
    "features": ["real-time-messaging", "emoji", "file-upload", "typing-indicators"]
  },
  "requirements": {
    "services": [
      { "name": "logger" },
      { "name": "eventBus" },
      { "name": "auth" },
      { "name": "notification" }
    ],
    "permissions": ["chat:read", "chat:write"]
  },
  "config": {
    "loading": {
      "lazy": true,
      "timeout": 20000
    },
    "runtime": {
      "singleton": true,
      "keepAlive": true
    },
    "communication": {
      "messageTimeout": 30000
    }
  },
  "lifecycle": {
    "hooks": {
      "afterMount": "connectToChat",
      "beforeUnmount": "disconnectFromChat"
    }
  },
  "metadata": {
    "displayName": "Chat Widget",
    "description": "Real-time chat support widget",
    "icon": "💬",
    "tags": ["chat", "support", "real-time"],
    "category": "communication"
  }
}
```

### Multi-tenant SaaS Dashboard

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "tenant-dashboard",
  "version": "4.0.0",
  "url": "https://saas.example.com/mfes/dashboard/{tenantId}/bundle.js",
  "dependencies": {
    "peer": {
      "react": "^18.0.0 || ^19.0.0",
      "react-dom": "^18.0.0 || ^19.0.0"
    },
    "runtime": {
      "d3": "^7.8.0",
      "ag-grid-react": "^31.0.0"
    }
  },
  "capabilities": {
    "routes": [{ "path": "/dashboard", "exact": false }],
    "features": ["multi-tenant", "customizable", "white-label"]
  },
  "requirements": {
    "services": [
      { "name": "logger" },
      { "name": "auth" },
      { "name": "api" },
      { "name": "tenant", "version": ">=2.0.0" }
    ],
    "permissions": ["tenant:read", "data:read"],
    "resources": {
      "memory": "1GB"
    }
  },
  "config": {
    "loading": {
      "priority": 1,
      "critical": true
    },
    "runtime": {
      "isolation": "sandbox"
    }
  },
  "security": {
    "allowedOrigins": ["https://*.example.com"],
    "permissions": {
      "required": ["tenant:access"],
      "optional": ["admin:access"]
    }
  },
  "metadata": {
    "displayName": "Tenant Dashboard",
    "description": "Multi-tenant SaaS dashboard with customization",
    "icon": "🏢",
    "category": "saas"
  }
}
```

## Advanced Configuration Examples

### High-Security Banking MFE

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "banking-transactions",
  "version": "1.0.0",
  "url": "https://secure.bank.com/mfes/transactions/1.0.0/bundle.js",
  "security": {
    "integrity": "sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC",
    "csp": {
      "default-src": ["'none'"],
      "script-src": ["'self'"],
      "style-src": ["'self'"],
      "connect-src": ["'self'", "https://api.bank.com"],
      "img-src": ["'self'"],
      "font-src": ["'self'"],
      "frame-ancestors": ["'none'"]
    },
    "allowedOrigins": ["https://app.bank.com"],
    "permissions": {
      "required": ["banking:access", "transactions:read"]
    }
  },
  "requirements": {
    "services": [
      { "name": "logger", "version": ">=2.0.0" },
      { "name": "auth", "version": ">=3.0.0" },
      { "name": "encryption", "version": ">=1.0.0" }
    ],
    "permissions": ["banking:transactions:read", "banking:accounts:read"]
  },
  "config": {
    "runtime": {
      "isolation": "iframe",
      "singleton": true
    },
    "communication": {
      "allowedEvents": ["banking:*"],
      "messageTimeout": 10000
    }
  },
  "metadata": {
    "displayName": "Transaction History",
    "description": "Secure banking transaction viewer",
    "icon": "🏦",
    "category": "finance"
  }
}
```

### Progressive Web App MFE

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "pwa-news-reader",
  "version": "2.0.0",
  "url": "https://cdn.news.com/mfes/reader/2.0.0/bundle.js",
  "alternativeUrls": ["/offline/news-reader.js"],
  "capabilities": {
    "features": ["offline", "push-notifications", "background-sync", "install-prompt"]
  },
  "config": {
    "loading": {
      "timeout": 60000,
      "retries": 5,
      "retryDelay": 3000
    },
    "runtime": {
      "keepAlive": true
    }
  },
  "lifecycle": {
    "hooks": {
      "afterMount": "registerServiceWorker",
      "beforeUnmount": "saveOfflineData"
    },
    "updates": {
      "strategy": "auto",
      "checkInterval": 3600000
    }
  },
  "metadata": {
    "displayName": "News Reader",
    "description": "Offline-capable news reading experience",
    "icon": "📰",
    "category": "media"
  }
}
```

## Testing and Development Examples

### Development Environment Manifest

```json
{
  "$schema": "https://mfe-made-easy.com/schemas/mfe-manifest-v2.schema.json",
  "name": "dev-tools",
  "version": "0.1.0-dev",
  "url": "http://localhost:3001/dev-tools.js",
  "dependencies": {
    "peer": {
      "react": "*",
      "react-dom": "*"
    }
  },
  "compatibility": {
    "container": "*"
  },
  "capabilities": {
    "features": ["debug-panel", "performance-monitor", "event-logger"]
  },
  "requirements": {
    "services": [{ "name": "logger" }, { "name": "eventBus" }]
  },
  "config": {
    "loading": {
      "timeout": 5000,
      "retries": 0
    }
  },
  "metadata": {
    "displayName": "Developer Tools",
    "description": "Development and debugging utilities",
    "icon": "🛠️",
    "tags": ["development", "debug", "tools"],
    "category": "development"
  },
  "build": {
    "environment": "development"
  }
}
```

## Best Practices Demonstrated

1. **Use semantic versioning** for all version fields
2. **Specify exact dependency versions** in production
3. **Include fallback URLs** for critical MFEs
4. **Set appropriate timeouts** based on MFE complexity
5. **Use security policies** for sensitive applications
6. **Document all events** for better integration
7. **Configure resource limits** for performance
8. **Add comprehensive metadata** for discovery

## Next Steps

- Use these examples as templates for your MFEs
- Customize based on your specific requirements
- Validate your manifests before deployment
- Keep manifests updated with your code changes

For more information, see:

- [Quick Start Guide](./quick-start.md)
- [Specification](./specification.md)
- [Migration Guide](./migration-guide.md)
