# Release Process

OpenCodeX release preparation should be predictable, reviewable, and easy to audit.

## Versioning

Use semantic versioning for fork releases:

```text
MAJOR.MINOR.PATCH
```

Recommended meaning:

| Part  | Use for                                                   |
| ----- | --------------------------------------------------------- |
| Major | Breaking changes in CLI, config, storage, or public APIs. |
| Minor | New user-facing features or provider capabilities.        |
| Patch | Fixes, docs, packaging, and compatibility updates.        |

## Release Notes

Use the format in [../CHANGELOG.md](../CHANGELOG.md):

```text
Added
Changed
Fixed
Security
```

Keep notes user-facing and link important PRs.

## Milestones

Recommended milestones:

- `next patch`
- `next minor`
- `desktop release`
- `provider polish`
- `upstream sync`

Close a milestone only after release artifacts, notes, and follow-up issues are complete.

## GitHub Projects

Use a lightweight project with these views:

| View          | Purpose                                               |
| ------------- | ----------------------------------------------------- |
| Now           | Work committed for the next release.                  |
| Next          | Prioritized but not yet committed.                    |
| Later         | Good ideas without release commitment.                |
| Upstream Risk | Changes that may conflict with future OpenCode syncs. |

## First Release Gate

The README intentionally separates source download from binary install. Before advertising the installer as the primary path, publish at least one OpenCodeX GitHub Release with CLI archives matching the installer naming scheme.

Minimum first-release checks:

- `curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/dev/install | bash` installs on a clean supported machine.
- `opencode --version` matches the release tag.
- `opencode upgrade` reads `evdark/OpenCodeX` by default.
- The release page includes checksums or equivalent artifact verification notes.
- Desktop artifacts, if published, use `OpenCodeX-desktop-*` names.

## Release Checklist

- Confirm working tree contains only intended changes.
- Run package checks for touched areas.
- Review generated files.
- Confirm CLI and desktop release owner/repo point at OpenCodeX.
- Update `CHANGELOG.md`.
- Tag the release.
- Publish artifacts.
- Verify install and upgrade paths.
- Close the milestone with release notes.
