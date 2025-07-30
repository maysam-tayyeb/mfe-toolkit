# commit

Commits staged changes with formatting and linting checks.

## Usage

```
/commit "Your commit message"
```

## Steps

1. Check for staged changes
2. Run tests for changed files
3. Format staged files with Prettier
4. Run ESLint on staged TypeScript/JavaScript files
5. Create commit with message and Claude signature

## Example

```
/commit "feat: Add user authentication"
```

## Implementation

```bash
# Check for staged changes
git diff --cached --quiet || echo "No staged changes"

# Get staged files
STAGED_FILES=$(git diff --cached --name-only)

# Run tests for changed files
TEST_FILES=""
for file in $STAGED_FILES; do
    # Find corresponding test files
    if [[ "$file" =~ \.(ts|tsx|js|jsx)$ ]] && [[ ! "$file" =~ \.(test|spec)\. ]]; then
        # Look for test files in same directory or __tests__ folder
        base_name=$(basename "$file" | sed 's/\.[^.]*$//')
        dir_name=$(dirname "$file")

        # Check for test files
        if [ -f "${dir_name}/${base_name}.test.tsx" ]; then
            TEST_FILES="$TEST_FILES ${dir_name}/${base_name}.test.tsx"
        elif [ -f "${dir_name}/${base_name}.test.ts" ]; then
            TEST_FILES="$TEST_FILES ${dir_name}/${base_name}.test.ts"
        elif [ -f "${dir_name}/__tests__/${base_name}.test.tsx" ]; then
            TEST_FILES="$TEST_FILES ${dir_name}/__tests__/${base_name}.test.tsx"
        elif [ -f "${dir_name}/__tests__/${base_name}.test.ts" ]; then
            TEST_FILES="$TEST_FILES ${dir_name}/__tests__/${base_name}.test.ts"
        fi
    fi
done

# Run tests if any test files found
if [ -n "$TEST_FILES" ]; then
    echo "Running tests for changed files..."
    pnpm vitest run $TEST_FILES
fi

# Format only staged files
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
