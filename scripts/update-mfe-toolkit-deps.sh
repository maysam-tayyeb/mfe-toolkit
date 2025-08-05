#!/bin/bash

# Script to update all @mfe/dev-kit references to @mfe-toolkit/core

echo "🔄 Updating all @mfe/dev-kit dependencies to @mfe-toolkit/core..."

# List of files to update
files=(
  "apps/container/package.json"
  "apps/mfe-event-demo/package.json"
  "apps/mfe-example/package.json"
  "apps/mfe-react17/package.json"
  "apps/mfe-state-demo-vanilla/package.json"
  "apps/mfe-state-demo-vue/package.json"
)

# Update each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Updating $file..."
    sed -i '' 's/"@mfe\/dev-kit"/"@mfe-toolkit\/core"/g' "$file"
  fi
done

# Also update import statements in TypeScript/JavaScript files
echo "📝 Updating import statements..."
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec sed -i '' "s/'@mfe\/dev-kit'/'@mfe-toolkit\/core'/g" {} \;

find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec sed -i '' 's/"@mfe\/dev-kit"/"@mfe-toolkit\/core"/g' {} \;

echo "✅ Update complete!"