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

### CLI (terminale)

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash
```

I binari finiscono in `~/.opencode/bin/`:

| binary | role |
| --- | --- |
| `ocx` | OpenCodeX CLI (quello che digiti davvero) |
| `opencode` | lo stesso engine, modalità plain per gli script |

```bash
ocx --version
ocx dashboard
ocx setup
ocx .                 # tui nel progetto corrente
```

Fissare una versione:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash -s -- --version 1.0.0
```

### App desktop (IDE)

Scarica l’installer OpenCodeX dalla [release v1.0.0](https://github.com/evdark/OpenCodeX/releases/tag/v1.0.0). Doppio clic e via.

| platform | file |
| --- | --- |
| macOS (Apple Silicon) | [opencodex-desktop-mac-arm64.dmg](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-mac-arm64.dmg) |
| macOS (Intel) | [opencodex-desktop-mac-x64.dmg](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-mac-x64.dmg) |
| Windows x64 | [opencodex-desktop-win-x64.exe](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-win-x64.exe) |
| Windows arm64 | [opencodex-desktop-win-arm64.exe](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-win-arm64.exe) |
| Linux x64 AppImage | [opencodex-desktop-linux-x86_64.AppImage](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-x86_64.AppImage) |
| Linux arm64 AppImage | [opencodex-desktop-linux-arm64.AppImage](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-arm64.AppImage) |
| Linux deb (amd64) | [opencodex-desktop-linux-amd64.deb](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-amd64.deb) |

macOS (unsigned): tasto destro → Apri. Gatekeeper ha personalità. `(￣ヘ￣)`  
rpm non in questo cut (serve `rpmbuild` sul packager).

**releases:** https://github.com/evdark/OpenCodeX/releases/tag/v1.0.0


### Agenti

OpenCodeX (come upstream OpenCode) ha agenti integrati — switch con `Tab`:

- **build** — default, accesso completo allo sviluppo
- **plan** — analisi / esplorazione in sola lettura
  - non modifica file di default
  - chiede prima di bash
  - utile per repo sconosciuti e planning

Subagente **general** per ricerche complesse e task multi-step (`@general`).

### Cos’altro c’è

| | |
| --- | --- |
| IDE | tabs · tray · preview · queue · providers · settings |
| CLI (`ocx`) | setup · resume · dashboard · memory / git / search |
| docs | [installation](docs/installation.md) · [FEATURES](FEATURES.md) · [cli](docs/cli-premium.md) · [desktop](docs/desktop-updates.md) · [config](docs/configuration.md) |

### Documentazione

| | |
| --- | --- |
| [installation](docs/installation.md) | CLI + IDE |
| [features](FEATURES.md) | cosa gira davvero |
| [cli](docs/cli-premium.md) | extras terminal |
| [desktop](docs/desktop-updates.md) | updater / packaging |
| [configuration](docs/configuration.md) | layout config |
| [security](SECURITY.md) | come non bruciarti |
| [contributing](CONTRIBUTING.md) | PRs |
| [NOTICE](NOTICE) | fork / non-affiliation |

### Contribuire

Per contribuire a **OpenCodeX**: leggi [CONTRIBUTING.md](CONTRIBUTING.md) e apri PR/issue su [evdark/OpenCodeX](https://github.com/evdark/OpenCodeX).

### Licenza e attribuzione

- **License:** [MIT](LICENSE) (come upstream OpenCode)
- **Upstream:** [anomalyco/opencode](https://github.com/anomalyco/opencode)
- **Fork notice:** [NOTICE](NOTICE)

OpenCodeX è un **fork non ufficiale**. Non siamo OpenCode Inc / Anomalyco né l’app «ufficiale».

Se si rompe → [issue](https://github.com/evdark/OpenCodeX/issues). Se no, va bene lo stesso. `ヽ(・∀・)ﾉ`
