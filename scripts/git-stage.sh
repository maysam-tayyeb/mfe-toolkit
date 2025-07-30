#!/bin/bash

# Git stage script - stages all changes
# Usage: ./scripts/git-stage.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Git Stage Script ===${NC}"

# Show current status
echo -e "\n${YELLOW}Current git status:${NC}"
git status --short

# Check if there are any changes to stage
if [[ -z $(git status --porcelain) ]]; then
    echo -e "${YELLOW}No changes to stage${NC}"
    exit 0
fi

# Stage all changes
echo -e "\n${YELLOW}Staging all changes...${NC}"
git add -A

# Show what was staged
echo -e "\n${GREEN}Staged changes:${NC}"
git diff --cached --stat

# Show updated status
echo -e "\n${GREEN}Updated git status:${NC}"
git status --short

echo -e "\n${GREEN}✓ All changes staged successfully${NC}"