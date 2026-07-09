# Upstream Sync

This fork tracks the original OpenCode repository through a guarded GitHub Actions workflow.

## Goals

- Keep the fork close to upstream OpenCode.
- Avoid direct writes to `dev` from automation.
- Preserve fork-specific changes by requiring a reviewable PR.
- Surface conflicts early without attempting unsafe automatic resolution.

## Workflow

The workflow lives at `.github/workflows/upstream-sync.yml`.

It runs daily and can also be started manually from GitHub Actions.

Default inputs:

- Upstream repository: `anomalyco/opencode`
- Upstream branch: `dev`
- Target fork branch: `dev`
- Sync branch: `auto-upstream-sync`

The workflow:

1. Checks out the fork.
2. Fetches `anomalyco/opencode:dev` as `upstream/dev`.
3. Creates or resets `auto-upstream-sync` from the fork target branch.
4. Merges upstream into that sync branch.
5. Pushes the sync branch and opens or updates a PR.

The workflow never merges directly into `dev`.

## Conflict Handling

If the upstream merge conflicts, the workflow aborts the merge and creates or updates an issue titled `Upstream sync conflicts`.

The target branch is not changed.

Resolve conflicts manually by creating a local branch from `dev`, merging upstream, fixing conflicts, and opening a normal PR.

Example:

```bash
git remote add upstream https://github.com/anomalyco/opencode.git
git fetch origin dev
git fetch upstream dev
git checkout -B upstream-sync origin/dev
git merge upstream/dev
```

After resolving conflicts, run the normal package checks for touched areas before merging.

## Fork Remote Setup

In a real fork checkout, `origin` should point to the fork and `upstream` should point to the original OpenCode repository.

```bash
git remote set-url origin git@github.com:<your-org>/<your-fork>.git
git remote add upstream https://github.com/anomalyco/opencode.git
```

Do not force-push the fork target branch as part of upstream sync. Let the workflow create a PR and rely on branch protection plus CI.
