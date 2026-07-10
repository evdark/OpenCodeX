# CLI Updates

OpenCodeX CLI upgrades use the same binary channel as the GitHub Releases installer.

## Install / upgrade

Latest release (recommended):

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash
```

Pin a version:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/OpenCodeX/main/install | bash -s -- --version 1.17.18
```

This installs:

- `~/.opencode/bin/opencode` — engine
- `~/.opencode/bin/ocx` — OpenCodeX wrapper (`OPENCODEX=1`)
- `~/.opencode/bin/ocplus` — legacy alias

Desktop IDE installers and auto-update feeds:

- https://github.com/evdark/OpenCodeX/releases/latest
- artifacts: `opencodex-desktop-*`
- updater metadata: `latest.yml`, `latest-mac.yml`, `latest-linux.yml`

## From source

```bash
git clone https://github.com/evdark/OpenCodeX.git && cd OpenCodeX
bun install
OPENCODEX=1 bun dev .
```

## Notes

- The curl installer always reads `releases/latest` unless `--version` is set.
- Desktop auto-update points at `evdark/OpenCodeX` (not upstream OpenCode).
- Prefer `ocx` over `opencode` for OpenCodeX features.
