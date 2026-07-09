# Changelog

OpenCodeX uses semantic versioning once release tags are cut.

## Unreleased / 1.0.0-clean

### Added

- Clean public tree as **OpenCodeX** (new repository, single history root).
- IDE vs CLI product split with branded installers and `ocx` CLI entry.
- Chat vs Code session in the desktop app.
- Clickable titlebar session tabs.

### Changed

- Product rename from OpenCode+ → **OpenCodeX**.
- CLI preferred binary: `ocx` (`ocplus` kept as alias).
- Desktop artifacts: `opencodex-desktop-*`.
- Release defaults: `evdark/OpenCodeX`.

### Fixed

- Settings panels rendering `[object Object]` toggles.
- Non-clickable titlebar tabs in the new layout.
- Prompt queue no longer injects suggested follow-up chips.

### Notes

MIT fork of OpenCode. Internal npm package names (`@opencode-ai/*`) stay for monorepo stability.
