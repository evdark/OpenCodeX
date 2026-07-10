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

### CLI（终端）

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash
```

二进制安装到 `~/.opencode/bin/`：

| binary | role |
| --- | --- |
| `ocx` | OpenCodeX CLI（你实际输入的命令） |
| `opencode` | 同一引擎，脚本用 plain 模式 |

```bash
ocx --version
ocx dashboard
ocx setup
ocx .                 # 在当前项目打开 tui
```

锁定版本：

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash -s -- --version 1.17.18
```

### 桌面应用 (IDE)

从 [OpenCodeX latest 发布页](https://github.com/evdark/OpenCodeX/releases/latest) 下载安装包。双击即可继续。

| platform | file |
| --- | --- |
| macOS (Apple Silicon) | [opencodex-desktop-mac-arm64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-arm64.dmg) |
| macOS (Intel) | [opencodex-desktop-mac-x64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-x64.dmg) |
| Windows x64 | [opencodex-desktop-win-x64.exe](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-win-x64.exe) |
| Windows arm64 | [opencodex-desktop-win-arm64.exe](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-win-arm64.exe) |
| Linux x64 AppImage | [opencodex-desktop-linux-x86_64.AppImage](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-x86_64.AppImage) |
| Linux arm64 AppImage | [opencodex-desktop-linux-arm64.AppImage](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-arm64.AppImage) |
| Linux deb (amd64) | [opencodex-desktop-linux-amd64.deb](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-amd64.deb) |

macOS（未签名）：右键 → 打开。Gatekeeper 挺有性格。`(￣ヘ￣)`  
本轮无 rpm（打包机需要 `rpmbuild`）。

**releases:** https://github.com/evdark/OpenCodeX/releases/latest


### Agents

OpenCodeX（与上游 OpenCode 类似）内置 Agent，用 `Tab` 切换：

- **build** — 默认，完整开发权限
- **plan** — 只读分析与探索
  - 默认不改文件
  - 执行 bash 前会询问
  - 适合陌生仓库与规划

子 Agent **general** — 复杂搜索与多步任务（`@general`）。

### 还带什么

| | |
| --- | --- |
| IDE | tabs · tray · preview · queue · providers · settings |
| CLI (`ocx`) | setup · resume · dashboard · memory / git / search |
| docs | [installation](docs/installation.md) · [FEATURES](FEATURES.md) · [cli](docs/cli-premium.md) · [desktop](docs/desktop-updates.md) · [config](docs/configuration.md) |

### 文档

| | |
| --- | --- |
| [installation](docs/installation.md) | CLI + IDE |
| [features](FEATURES.md) | 真正能跑的功能 |
| [cli](docs/cli-premium.md) | 终端 extras |
| [desktop](docs/desktop-updates.md) | updater / packaging |
| [configuration](docs/configuration.md) | 配置布局 |
| [security](SECURITY.md) | 别把自己搞炸 |
| [contributing](CONTRIBUTING.md) | PRs |
| [NOTICE](NOTICE) | fork / non-affiliation |

### 贡献

给 **OpenCodeX** 贡献：先读 [CONTRIBUTING.md](CONTRIBUTING.md)，再在 [evdark/OpenCodeX](https://github.com/evdark/OpenCodeX) 开 PR/issue。

### 许可与归属

- **License:** [MIT](LICENSE)（与上游 OpenCode 同系）
- **Upstream:** [anomalyco/opencode](https://github.com/anomalyco/opencode)
- **Fork notice:** [NOTICE](NOTICE)

OpenCodeX 是**非官方 fork**。我们不是 OpenCode Inc / Anomalyco，也不是“官方”应用。

坏了 → [issue](https://github.com/evdark/OpenCodeX/issues)。没坏也行。`ヽ(・∀・)ﾉ`
