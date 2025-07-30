# ship

Combines /commit and /push commands to ship changes in one step.

## Usage
```
/ship "Your commit message"
```

## Description
This command runs:
1. `/commit "Your commit message"` - Formats, lints, and commits staged changes
2. `/push` - Pushes commits to the remote repository

## Example
```
/ship "fix: Resolve TypeScript errors in state manager"
```

## Implementation
This command simply executes:
```
/commit "{message}"
/push
```

## Prerequisites
- Changes must be staged with `git add` before running
- The `/commit` command will handle formatting and linting
- The `/push` command will handle pulling and pushing

## Notes
- If commit fails (due to lint errors, etc.), push will not execute
- Uses the same formatting and linting rules as `/commit`
- Pushes to the current branch by default