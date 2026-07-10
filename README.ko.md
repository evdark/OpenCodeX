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

### CLI (터미널)

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash
```

바이너리는 `~/.opencode/bin/` 에 설치됩니다:

| binary | role |
| --- | --- |
| `ocx` | OpenCodeX CLI (실제로 치는 명령) |
| `opencode` | 같은 엔진, 스크립트용 plain 모드 |

```bash
ocx --version
ocx dashboard
ocx setup
ocx .                 # 현재 프로젝트에서 tui
```

버전 고정:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash -s -- --version 1.0.0
```

### 데스크톱 앱 (IDE)

[OpenCodeX v1.0.0 릴리스](https://github.com/evdark/OpenCodeX/releases/tag/v1.0.0)에서 설치 파일을 받으세요. 더블 클릭하고 계속하세요.

| platform | file |
| --- | --- |
| macOS (Apple Silicon) | [opencodex-desktop-mac-arm64.dmg](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-mac-arm64.dmg) |
| macOS (Intel) | [opencodex-desktop-mac-x64.dmg](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-mac-x64.dmg) |
| Windows x64 | [opencodex-desktop-win-x64.exe](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-win-x64.exe) |
| Windows arm64 | [opencodex-desktop-win-arm64.exe](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-win-arm64.exe) |
| Linux x64 AppImage | [opencodex-desktop-linux-x86_64.AppImage](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-x86_64.AppImage) |
| Linux arm64 AppImage | [opencodex-desktop-linux-arm64.AppImage](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-arm64.AppImage) |
| Linux deb (amd64) | [opencodex-desktop-linux-amd64.deb](https://github.com/evdark/OpenCodeX/releases/download/v1.0.0/opencodex-desktop-linux-amd64.deb) |

macOS(미서명): 우클릭 → 열기. Gatekeeper는 성격이 있습니다. `(￣ヘ￣)`  
이 컷에는 rpm 없음 (packager에 `rpmbuild` 필요).

**releases:** https://github.com/evdark/OpenCodeX/releases/tag/v1.0.0


### 에이전트

OpenCodeX(업스트림 OpenCode와 같이)에는 내장 에이전트가 있습니다. `Tab`으로 전환:

- **build** — 기본, 개발 전체 권한
- **plan** — 읽기 전용 분석/탐색
  - 기본적으로 파일 편집 안 함
  - bash 전에 확인
  - 낯선 레포와 계획에 적합

서브에이전트 **general** — 복잡한 검색과 다단계 작업(`@general`).

### 그 외 포함

| | |
| --- | --- |
| IDE | tabs · tray · preview · queue · providers · settings |
| CLI (`ocx`) | setup · resume · dashboard · memory / git / search |
| docs | [installation](docs/installation.md) · [FEATURES](FEATURES.md) · [cli](docs/cli-premium.md) · [desktop](docs/desktop-updates.md) · [config](docs/configuration.md) |

### 문서

| | |
| --- | --- |
| [installation](docs/installation.md) | CLI + IDE |
| [features](FEATURES.md) | 실제로 돌아가는 것 |
| [cli](docs/cli-premium.md) | 터미널 extras |
| [desktop](docs/desktop-updates.md) | updater / packaging |
| [configuration](docs/configuration.md) | config 레이아웃 |
| [security](SECURITY.md) | 안 타 죽는 법 |
| [contributing](CONTRIBUTING.md) | PRs |
| [NOTICE](NOTICE) | fork / non-affiliation |

### 기여

**OpenCodeX** 기여: [CONTRIBUTING.md](CONTRIBUTING.md) 읽고 [evdark/OpenCodeX](https://github.com/evdark/OpenCodeX)에 PR/issue.

### 라이선스와 출처

- **License:** [MIT](LICENSE) (업스트림 OpenCode와 같은 계열)
- **Upstream:** [anomalyco/opencode](https://github.com/anomalyco/opencode)
- **Fork notice:** [NOTICE](NOTICE)

OpenCodeX는 **비공식 포크**입니다. OpenCode Inc / Anomalyco도, “공식” 앱도 아닙니다.

깨지면 → [issue](https://github.com/evdark/OpenCodeX/issues). 안 깨져도 OK. `ヽ(・∀・)ﾉ`
