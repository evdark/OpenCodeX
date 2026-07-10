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

### CLI (เทอร์มินัล)

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash
```

ไบนารีจะอยู่ที่ `~/.opencode/bin/`:

| binary | role |
| --- | --- |
| `ocx` | OpenCodeX CLI (คำสั่งที่คุณพิมพ์จริง) |
| `opencode` | เอนจินเดียวกัน โหมด plain สำหรับสคริปต์ |

```bash
ocx --version
ocx dashboard
ocx setup
ocx .                 # tui ในโปรเจกต์ปัจจุบัน
```

ล็อกเวอร์ชัน:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash -s -- --version 1.17.16
```

### แอปเดสก์ท็อป (IDE)

ดาวน์โหลดตัวติดตั้ง OpenCodeX จาก [release latest](https://github.com/evdark/OpenCodeX/releases/latest) ดับเบิลคลิกแล้วไปต่อได้เลย

| platform | file |
| --- | --- |
| macOS (Apple Silicon) | [opencodex-desktop-mac-arm64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-arm64.dmg) |
| macOS (Intel) | [opencodex-desktop-mac-x64.dmg](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-mac-x64.dmg) |
| Windows x64 | [opencodex-desktop-win-x64.exe](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-win-x64.exe) |
| Windows arm64 | [opencodex-desktop-win-arm64.exe](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-win-arm64.exe) |
| Linux x64 AppImage | [opencodex-desktop-linux-x86_64.AppImage](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-x86_64.AppImage) |
| Linux arm64 AppImage | [opencodex-desktop-linux-arm64.AppImage](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-arm64.AppImage) |
| Linux deb (amd64) | [opencodex-desktop-linux-amd64.deb](https://github.com/evdark/OpenCodeX/releases/latest/download/opencodex-desktop-linux-amd64.deb) |

macOS (unsigned): คลิกขวา → เปิด Gatekeeper มีบุคลิก `(￣ヘ￣)`  
ไม่มี rpm ในคัตนี้ (ต้องมี `rpmbuild` บน packager)

**releases:** https://github.com/evdark/OpenCodeX/releases/latest


### เอเจนต์

OpenCodeX (เหมือน upstream OpenCode) มีเอเจนต์ในตัว — สลับด้วย `Tab`:

- **build** — ค่าเริ่มต้น สิทธิ์พัฒนาเต็ม
- **plan** — วิเคราะห์/สำรวจแบบอ่านอย่างเดียว
  - ค่าเริ่มต้นไม่แก้ไฟล์
  - ถามก่อน bash
  - เหมาะกับ repo ใหม่และวางแผน

ซับเอเจนต์ **general** สำหรับค้นหาซับซ้อนและงานหลายขั้น (`@general`)

### อะไรอีกบ้าง

| | |
| --- | --- |
| IDE | tabs · tray · preview · queue · providers · settings |
| CLI (`ocx`) | setup · resume · dashboard · memory / git / search |
| docs | [installation](docs/installation.md) · [FEATURES](FEATURES.md) · [cli](docs/cli-premium.md) · [desktop](docs/desktop-updates.md) · [config](docs/configuration.md) |

### เอกสาร

| | |
| --- | --- |
| [installation](docs/installation.md) | CLI + IDE |
| [features](FEATURES.md) | สิ่งที่รันได้จริง |
| [cli](docs/cli-premium.md) | terminal extras |
| [desktop](docs/desktop-updates.md) | updater / packaging |
| [configuration](docs/configuration.md) | config layout |
| [security](SECURITY.md) | อย่าจุดไฟตัวเอง |
| [contributing](CONTRIBUTING.md) | PRs |
| [NOTICE](NOTICE) | fork / non-affiliation |

### การมีส่วนร่วม

อยากช่วย **OpenCodeX**: อ่าน [CONTRIBUTING.md](CONTRIBUTING.md) แล้วเปิด PR/issue ที่ [evdark/OpenCodeX](https://github.com/evdark/OpenCodeX)

### ไลเซนส์และการอ้างอิง

- **License:** [MIT](LICENSE) (ตระกูลเดียวกับ upstream OpenCode)
- **Upstream:** [anomalyco/opencode](https://github.com/anomalyco/opencode)
- **Fork notice:** [NOTICE](NOTICE)

OpenCodeX เป็น **fork ไม่เป็นทางการ** เราไม่ใช่ OpenCode Inc / Anomalyco และไม่ใช่แอป «ทางการ»

พัง → [issue](https://github.com/evdark/OpenCodeX/issues) ไม่พังก็ดี `ヽ(・∀・)ﾉ`
