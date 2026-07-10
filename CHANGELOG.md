# Changelog

OpenCodeX uses semantic versioning once release tags are cut.

## 1.17.16

### Fixed

- **Plugin manager**: install button opens `opencode.json` instead of curated catalog.
- **Power User preset**: Project Memory panel no longer crashes (`SDK context` outside provider).
- **Error page**: report link points to Telegram `@drkbemad` (not Discord).
- **Chat button**: always available on home + titlebar (project-less ChatGPT-style chat).
- **Global plugins**: stop auto-loading `~/.config/opencode/plugin/*` (must be listed in config).
- **Empty AI replies**: do not let plugins wipe non-empty streamed text; skip accidental global plugins.
- **File tree**: rename / move / delete work reliably; drag-drop into folders; error feedback.
- **CLI**: restored `packages/opencode/src/cli` (was gitignored by `cli/`); OpenCodeX commands (`setup`, `dashboard`, `resume`, `memory`, `git`, …) work again.

### Changed

- `.gitignore`: only ignore root `/cli/`, not product CLI sources.

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
