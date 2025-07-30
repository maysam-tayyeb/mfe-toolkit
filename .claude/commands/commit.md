# commit

Commits staged changes with formatting and linting checks.

## Usage

```
/commit "Your commit message"
```

## Steps

1. Check for staged changes
2. Format staged files with Prettier
3. Run ESLint on staged TypeScript/JavaScript files
4. Create commit with message and Claude signature

## Example

```
/commit "feat: Add user authentication"
```

## Implementation

```bash
# Check for staged changes
git diff --cached --quiet || echo "No staged changes"

# Format only staged files
STAGED_FILES=$(git diff --cached --name-only)
for file in $STAGED_FILES; do
    if [[ "$file" =~ \.(ts|tsx|js|jsx|json|css|md)$ ]]; then
        pnpm prettier --write "$file"
        git add "$file"
    fi
done

# Lint only staged TypeScript/JavaScript files
for file in $STAGED_FILES; do
    if [[ "$file" =~ \.(ts|tsx|js|jsx)$ ]]; then
        pnpm eslint "$file" --max-warnings 0
    fi
done

# Create commit
git commit -m "${1}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```
