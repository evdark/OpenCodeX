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

### CLI (الطرفية)

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash
```

تُثبَّت الثنائيات في `~/.opencode/bin/`:

| binary | role |
| --- | --- |
| `ocx` | OpenCodeX CLI (ما تكتبه فعليًا) |
| `opencode` | نفس المحرك، وضع plain للسكربتات |

```bash
ocx --version
ocx dashboard
ocx setup
ocx .                 # tui في المشروع الحالي
```

تثبيت إصدار محدد:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash -s -- --version 1.0.0
```

### تطبيق سطح المكتب (IDE)

حمّل مثبت OpenCodeX من [الإصدار v1.0.0](https://github.com/evdark/OpenCodeX/releases/tag/v1.0.0). نقرة مزدوجة وتابع.

| platform | file |
| --- | --- |
| macOS (Apple Silicon) | [opencodex-desktop-mac-arm64.dmg](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-mac-arm64.dmg) |
| macOS (Intel) | [opencodex-desktop-mac-x64.dmg](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-mac-x64.dmg) |
| Windows x64 | [opencodex-desktop-win-x64.exe](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-win-x64.exe) |
| Windows arm64 | [opencodex-desktop-win-arm64.exe](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-win-arm64.exe) |
| Linux x64 AppImage | [opencodex-desktop-linux-x86_64.AppImage](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-x86_64.AppImage) |
| Linux arm64 AppImage | [opencodex-desktop-linux-arm64.AppImage](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-arm64.AppImage) |
| Linux deb (amd64) | [opencodex-desktop-linux-amd64.deb](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-amd64.deb) |

macOS (غير موقّع): كليك يمين → فتح. Gatekeeper له شخصية. `(￣ヘ￣)`  
لا rpm في هذا الإصدار (يحتاج `rpmbuild` على packager).

**الإصدارات:** https://github.com/evdark/OpenCodeX/releases/tag/v1.0.0


### الوكلاء

OpenCodeX (مثل upstream OpenCode) يتضمن وكلاء مدمجين — التبديل بـ `Tab`:

- **build** — الافتراضي، صلاحيات تطوير كاملة
- **plan** — تحليل/استكشاف للقراءة فقط
  - لا يعدّل الملفات افتراضيًا
  - يسأل قبل bash
  - مناسب للمستودعات الجديدة والتخطيط

الوكيل الفرعي **general** للبحث المعقّد والمهام متعددة الخطوات (`@general`).

### ماذا أيضًا

| | |
| --- | --- |
| IDE | tabs · tray · preview · queue · providers · settings |
| CLI (`ocx`) | setup · resume · dashboard · memory / git / search |
| docs | [installation](docs/installation.md) · [FEATURES](FEATURES.md) · [cli](docs/cli-premium.md) · [desktop](docs/desktop-updates.md) · [config](docs/configuration.md) |

### التوثيق

| | |
| --- | --- |
| [installation](docs/installation.md) | CLI + IDE |
| [features](FEATURES.md) | ما يعمل فعليًا |
| [cli](docs/cli-premium.md) | extras الطرفية |
| [desktop](docs/desktop-updates.md) | updater / packaging |
| [configuration](docs/configuration.md) | تخطيط الإعدادات |
| [security](SECURITY.md) | كيف لا تحرق نفسك |
| [contributing](CONTRIBUTING.md) | PRs |
| [NOTICE](NOTICE) | fork / non-affiliation |

### المساهمة

للمساهمة في **OpenCodeX**: اقرأ [CONTRIBUTING.md](CONTRIBUTING.md) وافتح PR/issue على [evdark/OpenCodeX](https://github.com/evdark/OpenCodeX).

### الترخيص والإسناد

- **License:** [MIT](LICENSE) (نفس عائلة upstream OpenCode)
- **Upstream:** [anomalyco/opencode](https://github.com/anomalyco/opencode)
- **Fork notice:** [NOTICE](NOTICE)

OpenCodeX **فرع غير رسمي**. لسنا OpenCode Inc / Anomalyco ولا التطبيق «الرسمي».

إن تعطل → [issue](https://github.com/evdark/OpenCodeX/issues). وإن لم يتعطل فحسن أيضًا. `ヽ(・∀・)ﾉ`
