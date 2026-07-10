<div align="center">

<a href="https://github.com/evdark/OpenCodeX">
  <img src="https://i.pinimg.com/1200x/fc/90/da/fc90da0880991d0d7c2abbcd97c3b90e.jpg" alt="OpenCodeX" width="100%" />
</a>

<img src="docs/assets/brand/opencodex-mark.svg" alt="OpenCodeX mark" width="96" height="96" />

```
   ide + cli · one messy core
         (´･_･`)
```

# OpenCodeX

local ai coding agent. two faces. same engine.  
you run it. it edits files. sometimes it works. `¯\_(ツ)_/¯`

| product | what you get | how you install |
| --- | --- | --- |
| **IDE** | desktop app (tray, queue, preview, tabs) | [dmg / exe / AppImage](https://github.com/evdark/OpenCodeX/releases/latest) |
| **CLI** | `ocx` in the terminal | curl one-liner below |

[![repo](https://img.shields.io/badge/github-evdark%2FOpenCodeX-0d0d0d?style=flat-square&labelColor=111111)](https://github.com/evdark/OpenCodeX)
[![license](https://img.shields.io/badge/license-MIT-1a1a1a?style=flat-square&labelColor=111111)](LICENSE)
[![runtime](https://img.shields.io/badge/runtime-Bun-000000?style=flat-square&logo=bun&labelColor=111111)](https://bun.sh)

```
  (´；ω；`)  another session. another model. another type error.
  (⌐■_■)     then you ship something at 3am and call it intentional.
```

</div>

---

## what this is

**OpenCodeX is an unofficial fork of [OpenCode](https://github.com/anomalyco/opencode)** (MIT).  
not affiliated with, endorsed by, or “the official” OpenCode product.  
upstream code stays under MIT; our changes are also MIT. full note: [NOTICE](NOTICE).

we kept the agent spine. we put a product shell on top so desktop and cli stop living separate lives.

```
  OpenCodeX IDE  ──┐
                   ├──  shared core  (sessions · providers · tools · mcp)
  ocx CLI        ──┘
```

no fake "embeddings memory". no silent rewrite of upstream.  
if a feature is listed, the code runs. `(¬_¬)`

---

## install

### cli (terminal)

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash
```

puts binaries in `~/.opencode/bin/`:

| binary | role |
| --- | --- |
| `ocx` | OpenCodeX CLI (what you actually type) |
| `opencode` | same engine, plain mode for scripts |

```bash
ocx --version
ocx dashboard
ocx setup
ocx .                 # tui in current project
```

pin a version if you like boring:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash -s -- --version 1.17.18
```

### ide (desktop)

grab an installer from the [latest release](https://github.com/evdark/OpenCodeX/releases/latest). double-click. move on with your life.

| platform | file |
| --- | --- |
| mac apple silicon | [opencodex-desktop-mac-arm64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-arm64.dmg) |
| mac intel | [opencodex-desktop-mac-x64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-x64.dmg) |
| windows x64 | [opencodex-desktop-win-x64.exe](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-win-x64.exe) |
| windows arm64 | [opencodex-desktop-win-arm64.exe](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-win-arm64.exe) |
| linux x64 AppImage | [opencodex-desktop-linux-x86_64.AppImage](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-x86_64.AppImage) |
| linux arm64 AppImage | [opencodex-desktop-linux-arm64.AppImage](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-arm64.AppImage) |
| linux deb (amd64) | [opencodex-desktop-linux-amd64.deb](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-amd64.deb) |

mac: unsigned → right-click → open. gatekeeper is a personality. `(￣ヘ￣)`  
rpm: not in this cut (needs `rpmbuild` on the packager).

**releases:** https://github.com/evdark/OpenCodeX/releases/latest

---

## what ships

### ide

| | |
| --- | --- |
| chat vs code session | plain model chat, or full project session |
| tabs | click, reorder, close (yes, they work) |
| tray | hide · open · new session · quit |
| browser preview | dock · ports · screenshot |
| prompt queue | auto / manual / ask · templates |
| context / cost | dashboard · inspector |
| providers | studio · wizard · profiles · plugins |
| settings | presets · import/export · system prompt |

### cli (`ocx`)

| | |
| --- | --- |
| setup | first-run · optional desktop import |
| resume | last session you actually used |
| dashboard | status · data dir · quick commands |
| memory / git / search | notes · porcelain git · search everywhere |
| workspace / settings | named profiles · feature toggles |
| premium tui | `/search` · `/git` · `/handoff` · `/browser` |

`opencode` still works for scripts. plain mode skips OpenCodeX tui plugins.  
details: [docs/installation.md](docs/installation.md) · [FEATURES.md](FEATURES.md)

---

## from source (if you enjoy pain)

```bash
git clone https://github.com/evdark/OpenCodeX.git
cd OpenCodeX
bun install

OPENCODEX=1 bun dev .          # cli as ocx
bun run dev:desktop            # ide
```

packaging:

```bash
OPENCODE_CHANNEL=prod \
OPENCODE_RELEASE_OWNER=evdark \
OPENCODE_RELEASE_REPO=OpenCodeX \
bun --cwd packages/desktop package
```

---

## first five minutes

```
  01  install cli or ide
  02  ocx setup          # import desktop stuff if you want
  03  ocx resume         # or open the app and hit Chat / Code session
  04  ocx git status     # optional chaos
  05  go outside         # optional. we don't check. (´ー｀)
```

---

## docs

| | |
| --- | --- |
| [installation](docs/installation.md) | cli + ide paths |
| [features](FEATURES.md) | what actually runs |
| [cli](docs/cli-premium.md) | terminal extras |
| [desktop](docs/desktop-updates.md) | updater / packaging |
| [configuration](docs/configuration.md) | config layout |
| [security](SECURITY.md) | how not to brick yourself |

---

## license & attribution

- **License:** [MIT](LICENSE) (same family as upstream OpenCode)
- **Upstream:** [anomalyco/opencode](https://github.com/anomalyco/opencode)
- **Fork notice / non-affiliation:** [NOTICE](NOTICE)

OpenCodeX is a **derivative work** of OpenCode under the MIT license.  
we are **not** claiming to be OpenCode Inc/Anomalyco or the official app.  
trademarks stay with their owners. code reuse is under MIT terms only.

if something breaks, open an issue. if it doesn't, also fine. `ヽ(・∀・)ﾉ`
