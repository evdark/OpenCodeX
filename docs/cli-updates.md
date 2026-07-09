# CLI Updates

OpenCode+ keeps the `opencode` command name for upstream compatibility, but its release lookup defaults to the OpenCode+ fork.

## Defaults

CLI release checks use:

```text
evdark/opencode-plus
```

This affects:

- `opencode upgrade`
- background auto-update polling
- curl-based upgrades for binaries installed under `~/.opencode/bin`

## Installer

The installer points at OpenCode+ releases:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/opencode-plus/dev/install | bash
```

Install a specific version:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/opencode-plus/dev/install | bash -s -- --version 1.17.15
```

To work from source instead of an installed release:

```bash
git clone https://github.com/evdark/opencode-plus.git && cd opencode-plus
bun install
bun dev .
```

## Custom Fork Channels

Maintainers of downstream forks can override the release source:

```bash
OPENCODE_RELEASE_OWNER=my-org OPENCODE_RELEASE_REPO=my-fork opencode upgrade
```

For package-manager based installs, set `OPENCODE_NPM_PACKAGE` once a fork-specific npm package exists:

```bash
OPENCODE_NPM_PACKAGE=opencode-plus-ai opencode upgrade --method npm
```

## Compatibility Notes

- The binary command remains `opencode` to avoid breaking existing shell scripts and integrations.
- Release archive names remain upstream-compatible for CLI binaries.
- Desktop artifacts use `opencode-plus-desktop-*` names and separate app IDs.
