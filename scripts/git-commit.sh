#!/bin/bash

# Git commit script with pre-commit checks
# Usage: ./scripts/git-commit.sh "commit message"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if commit message is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Commit message is required${NC}"
    echo "Usage: $0 \"commit message\""
    exit 1
fi

COMMIT_MESSAGE="$1"

echo -e "${YELLOW}Running pre-commit checks...${NC}"

# Check for staged changes
if ! git diff --cached --quiet; then
    echo -e "${GREEN}✓ Found staged changes${NC}"
else
    echo -e "${RED}✗ No staged changes found${NC}"
    echo "Run 'git add' to stage your changes first"
    exit 1
fi

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only)

# Format only staged files (if they exist and are formattable)
echo -e "${YELLOW}Formatting staged files...${NC}"
FORMATTABLE_FILES=""
for file in $STAGED_FILES; do
    if [[ -f "$file" && "$file" =~ \.(ts|tsx|js|jsx|json|css|md)$ ]]; then
        FORMATTABLE_FILES="$FORMATTABLE_FILES $file"
    fi
done

if [ -n "$FORMATTABLE_FILES" ]; then
    npx prettier --write $FORMATTABLE_FILES
    # Re-stage formatted files
    git add $FORMATTABLE_FILES
    echo -e "${GREEN}✓ Formatted staged files${NC}"
else
    echo -e "${YELLOW}⚠ No formattable files in staged changes${NC}"
fi

# Run lint on staged TypeScript/JavaScript files only
echo -e "${YELLOW}Linting staged files...${NC}"
LINTABLE_FILES=""
for file in $STAGED_FILES; do
    if [[ -f "$file" && "$file" =~ \.(ts|tsx|js|jsx)$ ]]; then
        LINTABLE_FILES="$LINTABLE_FILES $file"
    fi
done

if [ -n "$LINTABLE_FILES" ]; then
    if npx eslint $LINTABLE_FILES --max-warnings 0; then
        echo -e "${GREEN}✓ Lint check passed${NC}"
    else
        echo -e "${RED}✗ Lint check failed${NC}"
        echo "Fix the lint errors before committing"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ No lintable files in staged changes${NC}"
fi

# Create commit
echo -e "${YELLOW}Creating commit...${NC}"
git commit -m "$COMMIT_MESSAGE

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Commit created successfully${NC}"
else
    echo -e "${RED}✗ Commit failed${NC}"
    exit 1
fi