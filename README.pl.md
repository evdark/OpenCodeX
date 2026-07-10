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

### CLI (terminal)

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash
```

Binarki lądują w `~/.opencode/bin/`:

| binary | role |
| --- | --- |
| `ocx` | OpenCodeX CLI (to, co naprawdę wpisujesz) |
| `opencode` | ten sam silnik, tryb plain do skryptów |

```bash
ocx --version
ocx dashboard
ocx setup
ocx .                 # tui w bieżącym projekcie
```

Przypiąć wersję:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash -s -- --version 1.0.0
```

### Aplikacja desktopowa (IDE)

Pobierz instalator OpenCodeX z [release v1.0.0](https://github.com/evdark/OpenCodeX/releases/tag/v1.0.0). Dwuklik i lecisz dalej.

| platform | file |
| --- | --- |
| macOS (Apple Silicon) | [opencodex-desktop-mac-arm64.dmg](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-mac-arm64.dmg) |
| macOS (Intel) | [opencodex-desktop-mac-x64.dmg](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-mac-x64.dmg) |
| Windows x64 | [opencodex-desktop-win-x64.exe](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-win-x64.exe) |
| Windows arm64 | [opencodex-desktop-win-arm64.exe](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-win-arm64.exe) |
| Linux x64 AppImage | [opencodex-desktop-linux-x86_64.AppImage](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-x86_64.AppImage) |
| Linux arm64 AppImage | [opencodex-desktop-linux-arm64.AppImage](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-arm64.AppImage) |
| Linux deb (amd64) | [opencodex-desktop-linux-amd64.deb](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-amd64.deb) |

macOS (unsigned): prawy przycisk → Otwórz. Gatekeeper ma osobowość. `(￣ヘ￣)`  
brak rpm w tym cut (potrzeba `rpmbuild` na packagerze).

**releases:** https://github.com/evdark/OpenCodeX/releases/tag/v1.0.0


### Agenci

OpenCodeX (jak upstream OpenCode) ma wbudowanych agentów — przełączanie `Tab`:

- **build** — domyślnie, pełny dostęp do developmentu
- **plan** — analiza / eksploracja read-only
  - domyślnie nie edytuje plików
  - pyta przed bash
  - dobry do nieznanych repo i planowania

Subagent **general** do złożonych wyszukiwań i multi-step (`@general`).

### Co jeszcze jest

| | |
| --- | --- |
| IDE | tabs · tray · preview · queue · providers · settings |
| CLI (`ocx`) | setup · resume · dashboard · memory / git / search |
| docs | [installation](docs/installation.md) · [FEATURES](FEATURES.md) · [cli](docs/cli-premium.md) · [desktop](docs/desktop-updates.md) · [config](docs/configuration.md) |

### Dokumentacja

| | |
| --- | --- |
| [installation](docs/installation.md) | CLI + IDE |
| [features](FEATURES.md) | co naprawdę działa |
| [cli](docs/cli-premium.md) | terminal extras |
| [desktop](docs/desktop-updates.md) | updater / packaging |
| [configuration](docs/configuration.md) | layout configów |
| [security](SECURITY.md) | jak się nie spalić |
| [contributing](CONTRIBUTING.md) | PRs |
| [NOTICE](NOTICE) | fork / non-affiliation |

### Wkład

Chcesz kontrybuować do **OpenCodeX**: przeczytaj [CONTRIBUTING.md](CONTRIBUTING.md) i otwórz PR/issue w [evdark/OpenCodeX](https://github.com/evdark/OpenCodeX).

### Licencja i atrybucja

- **License:** [MIT](LICENSE) (jak upstream OpenCode)
- **Upstream:** [anomalyco/opencode](https://github.com/anomalyco/opencode)
- **Fork notice:** [NOTICE](NOTICE)

OpenCodeX to **nieoficjalny fork**. Nie jesteśmy OpenCode Inc / Anomalyco ani „oficjalną” apką.

Jak się sypie → [issue](https://github.com/evdark/OpenCodeX/issues). Jak nie — też spoko. `ヽ(・∀・)ﾉ`
