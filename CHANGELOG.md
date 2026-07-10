# Changelog

OpenCodeX uses semantic versioning once release tags are cut.

## 1.17.18

### Fixed

- **MCP settings crash**: no longer requires session SDK context; uses server workspace MCP status.
- **Language switch**: settings dialog remounts so labels update immediately without reopen.
- **Queue UI**: compact dock, drag-to-reorder (no up/down buttons), history title not forced caps.
- **Plan vs queue stacking**: todos/plan render under the prompt, not on top of the queue.

### Added

- **Detachable queue panel**: Photoshop-style float (drag / resize / dock) for the prompt queue.
- **File edit affordance**: clear Edit/Save toolbar on project file tabs; file tree opens on All by default.
- **CLI OpenCodeX vibe**: branded wordmark + kaomoji tagline when launched as `ocx`.

### Changed

- **New layout & design** moved to Appearance settings.
- Removed Project Memory Engine and Prompt Library panels from OpenCodeX settings.

## 1.17.17

### Added

- **In-app config editor**: open and edit JSON config inside the IDE (plugins / MCP / full config).
- **Settings → Plugins** and **Settings → MCP** as dedicated server sections.
- **File edit in IDE**: pencil control on project file tabs; save with Cmd/Ctrl+S.
- **First-run data setup**: import providers/plugins/settings from OpenCode into `opencodex` folders, or start clean.
- **Layout sides**: move queue panel and files/review panel left or right; reset layout restores stock defaults.

### Fixed

- **Models list**: even spacing for provider group titles between model lists.
- **Desktop/CLI paths**: OpenCodeX mode uses `opencodex` XDG dirs instead of silently sharing OpenCode's `opencode` folder.

### Removed

- Provider Studio wizard, provider profiles panel, and embedded plugin block from Providers settings.

### Changed

- Plugin manager opens the built-in config editor instead of relying on an external `.jsonc` app.

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
