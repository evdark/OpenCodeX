<p align="center">
  <a href="https://github.com/evdark/OpenCodeX">
    <img src="docs/assets/brand/opencodex-mark.svg" alt="OpenCodeX" width="96" height="96">
  </a>
</p>
<p align="center"><strong>OpenCodeX</strong> — unofficial OpenCode fork · IDE + CLI · same engine</p>
<p align="center">
  <a href="https://github.com/evdark/OpenCodeX"><img alt="repo" src="https://img.shields.io/badge/github-evdark%2FOpenCodeX-0d0d0d?style=flat-square&labelColor=111111" /></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-1a1a1a?style=flat-square&labelColor=111111" /></a>
</p>


<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![OpenCodeX](packages/web/src/assets/lander/screenshot.png)](https://github.com/evdark/OpenCodeX)

---

### CLI (Terminal)

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash
```

Binaries landen in `~/.opencode/bin/`:

| binary | role |
| --- | --- |
| `ocx` | OpenCodeX CLI (was du wirklich tippst) |
| `opencode` | dieselbe Engine, plain-Modus für Scripts |

```bash
ocx --version
ocx dashboard
ocx setup
ocx .                 # tui im aktuellen Projekt
```

Version pinnen:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash -s -- --version 1.17.18
```

### Desktop-App (IDE)

Hol dir den OpenCodeX-Installer vom [aktuellen Release](https://github.com/evdark/OpenCodeX/releases/latest). Doppelklick. Weiter geht’s.

| platform | file |
| --- | --- |
| macOS (Apple Silicon) | [opencodex-desktop-mac-arm64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-arm64.dmg) |
| macOS (Intel) | [opencodex-desktop-mac-x64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-x64.dmg) |
| Windows x64 | [opencodex-desktop-win-x64.exe](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-win-x64.exe) |
| Windows arm64 | [opencodex-desktop-win-arm64.exe](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-win-arm64.exe) |
| Linux x64 AppImage | [opencodex-desktop-linux-x86_64.AppImage](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-x86_64.AppImage) |
| Linux arm64 AppImage | [opencodex-desktop-linux-arm64.AppImage](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-arm64.AppImage) |
| Linux deb (amd64) | [opencodex-desktop-linux-amd64.deb](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-amd64.deb) |

macOS (unsigned): Rechtsklick → Öffnen. Gatekeeper hat Persönlichkeit. `(￣ヘ￣)`  
rpm fehlt in diesem Cut (braucht `rpmbuild` auf dem Packager).

**Releases:** https://github.com/evdark/OpenCodeX/releases/latest


### Agents

OpenCodeX (wie upstream OpenCode) hat eingebaute Agents — Wechsel mit `Tab`:

- **build** — Standard, voller Entwicklungszugriff
- **plan** — read-only Analyse und Exploration
  - editiert Dateien standardmäßig nicht
  - fragt vor bash nach
  - gut für unbekannte Repos und Planung

Subagent **general** für komplexe Suchen und Mehrschritt-Tasks (`@general`).

### Was noch mitkommt

| | |
| --- | --- |
| IDE | tabs · tray · preview · queue · providers · settings |
| CLI (`ocx`) | setup · resume · dashboard · memory / git / search |
| docs | [installation](docs/installation.md) · [FEATURES](FEATURES.md) · [cli](docs/cli-premium.md) · [desktop](docs/desktop-updates.md) · [config](docs/configuration.md) |

### Docs

| | |
| --- | --- |
| [installation](docs/installation.md) | CLI + IDE |
| [features](FEATURES.md) | was wirklich läuft |
| [cli](docs/cli-premium.md) | Terminal-Extras |
| [desktop](docs/desktop-updates.md) | updater / packaging |
| [configuration](docs/configuration.md) | Config-Layout |
| [security](SECURITY.md) | wie man sich nicht selbst abschießt |
| [contributing](CONTRIBUTING.md) | PRs |
| [NOTICE](NOTICE) | fork / non-affiliation |

### Beitragen

Beiträge zu **OpenCodeX**: [CONTRIBUTING.md](CONTRIBUTING.md) lesen, dann PR/Issue in [evdark/OpenCodeX](https://github.com/evdark/OpenCodeX).

### Lizenz & Attribution

- **License:** [MIT](LICENSE) (wie upstream OpenCode)
- **Upstream:** [anomalyco/opencode](https://github.com/anomalyco/opencode)
- **Fork notice:** [NOTICE](NOTICE)

OpenCodeX ist ein **inoffizieller Fork**. Wir sind nicht OpenCode Inc / Anomalyco und nicht die „offizielle“ App.

Wenn’s kaputt ist → [Issue](https://github.com/evdark/OpenCodeX/issues). Wenn nicht, auch gut. `ヽ(・∀・)ﾉ`
