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

Desktop installers: **[v1.0.0 release](https://github.com/evdark/OpenCodeX/releases/tag/v1.0.0)**

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

Download the installer for your OS from **[v1.0.0](https://github.com/evdark/OpenCodeX/releases/tag/v1.0.0)**.

### macOS

| Chip | Installer |
| --- | --- |
| Apple Silicon | [opencodex-desktop-mac-arm64.dmg](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-mac-arm64.dmg) |
| Intel | [opencodex-desktop-mac-x64.dmg](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-mac-x64.dmg) |

Unsigned builds: right-click → Open. Gatekeeper is dramatic. `(￣ヘ￣)`

### Windows

| Arch | Installer |
| --- | --- |
| x64 | [opencodex-desktop-win-x64.exe](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-win-x64.exe) |
| arm64 | [opencodex-desktop-win-arm64.exe](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-win-arm64.exe) |

### Linux

| Format | Arch | File |
| --- | --- | --- |
| AppImage | x64 | [opencodex-desktop-linux-x86_64.AppImage](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-x86_64.AppImage) |
| AppImage | arm64 | [opencodex-desktop-linux-arm64.AppImage](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-arm64.AppImage) |
| deb | amd64 | [opencodex-desktop-linux-amd64.deb](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-amd64.deb) |

rpm is not published in this release (packager machine needs `rpmbuild`).

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
