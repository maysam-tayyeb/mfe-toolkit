#!/bin/bash

# Script to add tsconfig, tsup config, and vitest config to all service packages

SERVICES=(
  "error-reporter"
  "modal"
  "notification"
  "auth"
  "authz"
  "theme"
  "analytics"
)

for service in "${SERVICES[@]}"; do
  PACKAGE_DIR="packages/mfe-toolkit-service-${service}"
  
  if [ -d "$PACKAGE_DIR" ]; then
    echo "Configuring service package: $service"
    
    # Create tsconfig.json if it doesn't exist
    if [ ! -f "$PACKAGE_DIR/tsconfig.json" ]; then
      cat > "$PACKAGE_DIR/tsconfig.json" << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
EOF
    fi
    
    # Create tsup.config.ts if it doesn't exist
    if [ ! -f "$PACKAGE_DIR/tsup.config.ts" ]; then
      cat > "$PACKAGE_DIR/tsup.config.ts" << 'EOF'
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['@mfe-toolkit/core']
});
EOF
    fi
    
    # Create vitest.config.ts if it doesn't exist
    if [ ! -f "$PACKAGE_DIR/vitest.config.ts" ]; then
      cat > "$PACKAGE_DIR/vitest.config.ts" << 'EOF'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
EOF
    fi
  fi
done

echo "All service packages configured!"