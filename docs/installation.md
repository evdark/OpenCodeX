# Installation

OpenCodeX ships **two products** on one agent core:

| Product | What it is | How you get it |
| --- | --- | --- |
| **CLI** | Terminal agent (`ocx` / `opencode`) | one-line install script |
| **Desktop IDE** | Electron app | platform installer from Releases |

```
  CLI  ·  curl install  ·  ocx
  IDE  ·  dmg / exe / AppImage  ·  OpenCodeX
```

Latest installers: **[GitHub Releases](https://github.com/evdark/OpenCodeX/releases/latest)**

---

## 1 · CLI (terminal)

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash
```

Installs into `~/.opencode/bin/`:

- `opencode` — engine binary  
- `ocx` — same binary with OpenCodeX flags (`OPENCODEX=1`)  
- `ocplus` — legacy alias → `ocx` (if you still type it by muscle memory)

### Pin a version

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash -s -- --version 1.0.0
```

### Confirm

```bash
ocx --version
ocx dashboard
ocx setup
```

`opencode` remains for scripts and plain automation.

---

## 2 · Desktop IDE

Download the installer for your OS from the latest release.

### macOS

| Chip | Installer |
| --- | --- |
| Apple Silicon | [opencodex-desktop-mac-arm64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-arm64.dmg) |
| Intel | [opencodex-desktop-mac-x64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-x64.dmg) |

Unsigned builds: right-click → Open. Gatekeeper is dramatic. `(￣ヘ￣)`

### Windows / Linux

See the [release page](https://github.com/evdark/OpenCodeX/releases/latest) for exe / AppImage / deb / rpm.

---

## From source

```bash
git clone https://github.com/evdark/OpenCodeX.git
cd OpenCodeX
bun install
OPENCODEX=1 bun dev .
bun run dev:desktop
```

---

## Troubleshooting

| Symptom | What to try |
| --- | --- |
| `ocx: command not found` | Open a new shell, or `export PATH="$HOME/.opencode/bin:$PATH"` |
| Installer 404 | No release assets yet for that version. Use source or wait for a tag. |
| Mac "app is damaged" | Unsigned build. Right-click → Open, or `xattr -cr /Applications/OpenCodeX.app` |
