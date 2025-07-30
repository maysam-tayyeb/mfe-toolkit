#!/bin/bash

# Git push script with safety checks
# Usage: ./scripts/git-push.sh [branch]

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current branch if not specified
BRANCH=${1:-$(git rev-parse --abbrev-ref HEAD)}

echo -e "${YELLOW}Preparing to push to branch: $BRANCH${NC}"

# Check if we have commits to push
if git rev-list --count origin/$BRANCH..$BRANCH > /dev/null 2>&1; then
    COMMITS_AHEAD=$(git rev-list --count origin/$BRANCH..$BRANCH 2>/dev/null || echo "0")
    if [ "$COMMITS_AHEAD" -eq "0" ]; then
        echo -e "${YELLOW}⚠ No commits to push${NC}"
        exit 0
    fi
    echo -e "${GREEN}✓ Found $COMMITS_AHEAD commit(s) to push${NC}"
else
    # Branch might not exist on remote yet
    echo -e "${YELLOW}⚠ Branch may not exist on remote yet${NC}"
fi

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo -e "${RED}✗ Uncommitted changes detected${NC}"
    echo "Commit or stash your changes before pushing"
    exit 1
fi

# Pull latest changes (with rebase to keep history clean)
echo -e "${YELLOW}Pulling latest changes...${NC}"
if git pull --rebase origin $BRANCH 2>/dev/null; then
    echo -e "${GREEN}✓ Successfully pulled latest changes${NC}"
else
    echo -e "${YELLOW}⚠ No remote branch to pull from (or pull failed)${NC}"
fi

# Push to remote
echo -e "${YELLOW}Pushing to remote...${NC}"
if git push origin $BRANCH; then
    echo -e "${GREEN}✓ Successfully pushed to $BRANCH${NC}"
    
    # Show push summary
    echo -e "\n${GREEN}Push Summary:${NC}"
    git log --oneline origin/$BRANCH..$BRANCH 2>/dev/null || echo "New branch pushed"
else
    echo -e "${RED}✗ Push failed${NC}"
    exit 1
fi