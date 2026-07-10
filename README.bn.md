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

### CLI (টার্মিনাল)

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash
```

বাইনারি যায় `~/.opencode/bin/`-এ:

| binary | role |
| --- | --- |
| `ocx` | OpenCodeX CLI (যা তুমি আসলে টাইপ করো) |
| `opencode` | একই ইঞ্জিন, স্ক্রিপ্টের জন্য plain মোড |

```bash
ocx --version
ocx dashboard
ocx setup
ocx .                 # বর্তমান প্রজেক্টে tui
```

ভার্সন পিন করো:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash -s -- --version 1.17.18
```

### ডেস্কটপ অ্যাপ (IDE)

[OpenCodeX latest রিলিজ](https://github.com/evdark/OpenCodeX/releases/latest) থেকে ইনস্টলার নিন। ডাবল-ক্লিক করে এগিয়ে যান।

| platform | file |
| --- | --- |
| macOS (Apple Silicon) | [opencodex-desktop-mac-arm64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-arm64.dmg) |
| macOS (Intel) | [opencodex-desktop-mac-x64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-x64.dmg) |
| Windows x64 | [opencodex-desktop-win-x64.exe](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-win-x64.exe) |
| Windows arm64 | [opencodex-desktop-win-arm64.exe](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-win-arm64.exe) |
| Linux x64 AppImage | [opencodex-desktop-linux-x86_64.AppImage](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-x86_64.AppImage) |
| Linux arm64 AppImage | [opencodex-desktop-linux-arm64.AppImage](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-arm64.AppImage) |
| Linux deb (amd64) | [opencodex-desktop-linux-amd64.deb](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-amd64.deb) |

macOS (unsigned): রাইট-ক্লিক → Open. Gatekeeper-এর নিজস্ব ব্যক্তিত্ব আছে। `(￣ヘ￣)`  
এই কাটে rpm নেই (packager-এ `rpmbuild` লাগে)।

**releases:** https://github.com/evdark/OpenCodeX/releases/latest


### এজেন্ট

OpenCodeX-এ (upstream OpenCode-এর মতো) বিল্ট-ইন এজেন্ট আছে — `Tab` দিয়ে সুইচ:

- **build** — ডিফল্ট, পূর্ণ ডেভ অ্যাক্সেস
- **plan** — শুধু-পঠন বিশ্লেষণ/অন্বেষণ
  - ডিফল্টে ফাইল এডিট করে না
  - bash-এর আগে জিজ্ঞাসা করে
  - অজানা রিপো ও প্ল্যানিংয়ের জন্য ভালো

সাব-এজেন্ট **general** — জটিল সার্চ ও মাল্টি-স্টেপ (`@general`)।

### আর কী আছে

| | |
| --- | --- |
| IDE | tabs · tray · preview · queue · providers · settings |
| CLI (`ocx`) | setup · resume · dashboard · memory / git / search |
| docs | [installation](docs/installation.md) · [FEATURES](FEATURES.md) · [cli](docs/cli-premium.md) · [desktop](docs/desktop-updates.md) · [config](docs/configuration.md) |

### ডকুমেন্টেশন

| | |
| --- | --- |
| [installation](docs/installation.md) | CLI + IDE |
| [features](FEATURES.md) | যা আসলে চলে |
| [cli](docs/cli-premium.md) | টার্মিনাল extras |
| [desktop](docs/desktop-updates.md) | updater / packaging |
| [configuration](docs/configuration.md) | কনফিগ লেআউট |
| [security](SECURITY.md) | নিজেকে না পোড়ানোর উপায় |
| [contributing](CONTRIBUTING.md) | PRs |
| [NOTICE](NOTICE) | fork / non-affiliation |

### অবদান

**OpenCodeX**-এ অবদান: [CONTRIBUTING.md](CONTRIBUTING.md) পড়ো, তারপর [evdark/OpenCodeX](https://github.com/evdark/OpenCodeX)-এ PR/issue খোলো।

### লাইসেন্স ও স্বীকৃতি

- **License:** [MIT](LICENSE) (upstream OpenCode-এর মতো)
- **Upstream:** [anomalyco/opencode](https://github.com/anomalyco/opencode)
- **Fork notice:** [NOTICE](NOTICE)

OpenCodeX একটি **অনানুষ্ঠানিক ফর্ক**। আমরা OpenCode Inc / Anomalyco নই, «অফিসিয়াল» অ্যাপও নই।

ভাঙলে → [issue](https://github.com/evdark/OpenCodeX/issues)। না ভাঙলেও ঠিক আছে। `ヽ(・∀・)ﾉ`
