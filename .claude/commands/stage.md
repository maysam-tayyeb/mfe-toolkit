# stage

Stages all changes (tracked and untracked) for commit.

## Usage

```
/stage
```

## Description

This command stages all changes in the repository, including:

- Modified files
- New untracked files
- Deleted files

## Steps

1. Show current git status
2. Stage all changes using `git add -A`
3. Show updated status with staged changes

## Example

```
/stage
```

## Implementation

```bash
# Show current status
echo "Current git status:"
git status --short

# Stage all changes
echo "Staging all changes..."
git add -A

# Show what was staged
echo "Staged changes:"
git diff --cached --stat

# Show updated status
echo "Updated git status:"
git status --short
```

## Notes

- Uses `git add -A` to stage all changes including deletions
- Shows before and after status for clarity
- Useful before running `/commit` or as part of `/ship`
