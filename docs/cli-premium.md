# Premium CLI guide (OpenCodeX)

OpenCodeX CLI premium surfaces build on the MVP (`ocx` entry, setup, resume, memory) without forking the agent core.

Launch with:

```bash
ocx .
# or
OPENCODEX=1 bun dev .
```

`OPENCODEX=1` enables Plus TUI plugins (dashboard, git UI, search, handoff, browser, workspace profiles). Plain `opencode` stays upstream-compatible.

---

## TUI guide

| Action | How |
| --- | --- |
| Command palette | `ctrl+p` |
| Search everywhere / Command Center | `/search` or palette → **Search everywhere** |
| Workspace status bar | Bottom strip (toggle via palette) |
| Workspace dashboard | Session sidebar (provider, model, tokens, git, status) |
| Themes | `/themes` — includes **OpenCodeX**, **minimal**, **classic**, **nord**, **tokyo** (tokyonight), **solarized** |
| Which-key | Interactive shortcut browser (palette) |
| Diff viewer | `/diff` — split/unified, hunk nav, file tree |

### Keyboard

- Full keybind customization lives in config (`keybinds` / TUI config).
- Help: `/help`, which-key panel, palette footers.
- Leader key defaults to `ctrl+x` (see OpenCode keybind docs).

---

## Git UI guide

### CLI

```bash
ocx git status
ocx git stage [paths…]
ocx git unstage [paths…]
ocx git commit "message"
ocx git diff [--staged]
ocx git branch
ocx git branch -c main
ocx git fetch | pull | push
```

### TUI

- Palette / `/git` → status list with stage, unstage, discard, commit, fetch/pull/push.
- Diff viewer remains the side-by-side patch surface (`/diff`).

Git is not replaced — these are UIs over `git` + existing `/vcs` APIs.

---

## Browser Mode guide

Desktop has an in-app Browser Preview panel. CLI premium mode opens URLs externally (system browser):

```bash
ocx browser
ocx browser http://127.0.0.1:5173
```

In TUI: `/browser` — localhost presets, last URL, custom URL.

---

## Workspace profiles

Named snapshots of layout preferences:

```bash
ocx workspace save "Review" --theme OpenCodeX --pane diff
ocx workspace list
ocx workspace show Review
ocx workspace delete Review
```

In TUI: `/workspace` save/apply (theme, secondary pane, session, last browser URL). Stored in TUI KV; CLI profiles live under the shared Plus data dir.

Secondary pane preferences:

| Value | Behavior |
| --- | --- |
| `none` | Chat focus |
| `diff` | Open diff viewer surface |
| `git` | Open git status UI |
| `context` | Prefer sidebar context dashboard |

True multi-pane tiling (Chat+Terminal side-by-side) is staged; current model uses focused secondary routes + sidebar, matching the existing OpenTUI layout.

---

## Multi-agent & handoff

- Multiple concurrent sessions already exist (session list, quick switch 1–9).
- **Agent handoff** (`/handoff`): pick Coding / Plan / Explore / General → creates a **sibling session** with independent context (no auto-merge).
- User remains in control; switch sessions anytime.

---

## Settings (optional features)

```bash
ocx settings
ocx settings --enable gitUi
ocx settings --disable browserPanel
```

Feature keys: `dashboard`, `gitUi`, `searchEverywhere`, `commandCenter`, `agentHandoff`, `browserPanel`, `workspaceProfiles`, `statusBar`, `whichKeyHints`.

---

## Architecture

- **Shared core**: providers, sessions, VCS, memory engine (Desktop + CLI).
- **Premium TUI**: plugins under `packages/tui/src/feature-plugins/plus/`, loaded only when `OPENCODEX=1`.
- **CLI helpers**: `packages/opencode/src/cli/plus/*` + `ocx` commands.

See also: [installation](installation.md), [FEATURES.md](../FEATURES.md), [browser preview](browser-preview.md).
