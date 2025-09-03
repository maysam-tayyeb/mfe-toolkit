#!/bin/bash

# Script to create all service packages

SERVICES=(
  "error-reporter:Error reporting and tracking service"
  "modal:Modal UI management service"
  "notification:Toast notification service"
  "auth:Authentication service"
  "authz:Authorization and permissions service"
  "theme:Theme management service"
  "analytics:Analytics tracking service"
)

for service_info in "${SERVICES[@]}"; do
  IFS=':' read -r name description <<< "$service_info"
  echo "Creating service package: $name"
  
  # Use the CLI to create the service
  node packages/mfe-toolkit-cli/dist/index.js create-service "$name" --description "$description" --path ./packages
done

echo "All service packages created!"