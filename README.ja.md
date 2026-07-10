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

### CLI（ターミナル）

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash
```

バイナリは `~/.opencode/bin/` に入ります:

| binary | role |
| --- | --- |
| `ocx` | OpenCodeX CLI（実際に打つコマンド） |
| `opencode` | 同じエンジン、スクリプト用 plain モード |

```bash
ocx --version
ocx dashboard
ocx setup
ocx .                 # 現在のプロジェクトで tui
```

バージョンを固定:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash -s -- --version 1.17.16
```

### デスクトップアプリ (IDE)

[OpenCodeX latest リリース](https://github.com/evdark/OpenCodeX/releases/latest) からインストーラーを入手。ダブルクリックして先へ。

| platform | file |
| --- | --- |
| macOS (Apple Silicon) | [opencodex-desktop-mac-arm64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-arm64.dmg) |
| macOS (Intel) | [opencodex-desktop-mac-x64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-x64.dmg) |
| Windows x64 | [opencodex-desktop-win-x64.exe](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-win-x64.exe) |
| Windows arm64 | [opencodex-desktop-win-arm64.exe](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-win-arm64.exe) |
| Linux x64 AppImage | [opencodex-desktop-linux-x86_64.AppImage](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-x86_64.AppImage) |
| Linux arm64 AppImage | [opencodex-desktop-linux-arm64.AppImage](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-arm64.AppImage) |
| Linux deb (amd64) | [opencodex-desktop-linux-amd64.deb](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-amd64.deb) |

macOS（未署名）: 右クリック → 開く。Gatekeeper は性格が強い。`(￣ヘ￣)`  
rpm はこのカットには無し（packager に `rpmbuild` が必要）。

**releases:** https://github.com/evdark/OpenCodeX/releases/latest


### エージェント

OpenCodeX（upstream OpenCode と同様）には組み込みエージェントがあります。`Tab` で切替:

- **build** — デフォルト、開発向けフル権限
- **plan** — 読み取り専用の分析・探索
  - デフォルトでファイル編集しない
  - bash 前に確認
  - 未知のリポジトリや計画に向く

サブエージェント **general** — 複雑な検索と多段タスク（`@general`）。

### その他の同梱

| | |
| --- | --- |
| IDE | tabs · tray · preview · queue · providers · settings |
| CLI (`ocx`) | setup · resume · dashboard · memory / git / search |
| docs | [installation](docs/installation.md) · [FEATURES](FEATURES.md) · [cli](docs/cli-premium.md) · [desktop](docs/desktop-updates.md) · [config](docs/configuration.md) |

### ドキュメント

| | |
| --- | --- |
| [installation](docs/installation.md) | CLI + IDE |
| [features](FEATURES.md) | 実際に動くもの |
| [cli](docs/cli-premium.md) | ターミナル extras |
| [desktop](docs/desktop-updates.md) | updater / packaging |
| [configuration](docs/configuration.md) | config レイアウト |
| [security](SECURITY.md) | 自滅しないために |
| [contributing](CONTRIBUTING.md) | PRs |
| [NOTICE](NOTICE) | fork / non-affiliation |

### コントリビュート

**OpenCodeX** への貢献: [CONTRIBUTING.md](CONTRIBUTING.md) を読んで [evdark/OpenCodeX](https://github.com/evdark/OpenCodeX) に PR/issue。

### ライセンスと帰属

- **License:** [MIT](LICENSE)（upstream OpenCode と同じ系統）
- **Upstream:** [anomalyco/opencode](https://github.com/anomalyco/opencode)
- **Fork notice:** [NOTICE](NOTICE)

OpenCodeX は **非公式フォーク**。OpenCode Inc / Anomalyco でも「公式」アプリでもありません。

壊れたら → [issue](https://github.com/evdark/OpenCodeX/issues)。壊れなければそれでも OK。`ヽ(・∀・)ﾉ`
