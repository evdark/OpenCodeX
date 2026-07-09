# Desktop Updates

OpenCodeX desktop builds use the existing Electron updater from `packages/desktop`.

OpenCodeX is an unofficial fork of OpenCode. Desktop builds should use OpenCodeX release channels and should not impersonate official OpenCode releases.

The fork does not replace the updater implementation. It configures the release feed so packaged OpenCodeX builds can check the fork's GitHub Releases instead of the original OpenCode release repository.

## Release Feed

Set these environment variables when building desktop release artifacts:

```bash
OPENCODE_CHANNEL=prod
OPENCODE_RELEASE_OWNER=evdark
OPENCODE_RELEASE_REPO=OpenCodeX
```

Example:

```bash
OPENCODE_CHANNEL=prod \
OPENCODE_RELEASE_OWNER=evdark \
OPENCODE_RELEASE_REPO=OpenCodeX \
bun --cwd packages/desktop package
```

The generated Electron update metadata points at `<owner>/<repo>` GitHub Releases. The main process also sets the runtime updater feed to the same repository before checking for updates.

## Defaults

If no fork release repository is configured, the updater keeps upstream-compatible defaults:

- `prod`: `anomalyco/opencode`
- `beta`: `anomalyco/opencode-beta`

This keeps upstream merges small and avoids breaking the original OpenCode packaging defaults.

## User Flow

The desktop app already exposes update checks through the app settings and desktop menu. OpenCodeX uses that same UX:

1. The app starts and initializes the updater.
2. The updater checks the configured GitHub release feed.
3. If a newer version exists, it downloads the update.
4. The UI offers install and restart when the update is ready.

## Safety Rules

- Publish OpenCodeX desktop artifacts only from the fork release channel.
- Do not point OpenCodeX builds at upstream OpenCode releases, or users may lose fork-specific features after update.
- Keep update metadata generation and runtime feed configuration in sync.
- Prefer adding checks around the existing updater instead of introducing a second update system.
