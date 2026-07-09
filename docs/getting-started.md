# Getting Started

OpenCode+ is designed to feel familiar if you have used OpenCode, but it uses fork-specific release channels and documentation.

## Install

Install the latest OpenCode+ CLI release:

```bash
curl -fsSL https://raw.githubusercontent.com/evdark/opencode-plus/dev/install | bash
```

Confirm the installed command is available:

```bash
opencode --help
```

Prefer source? Clone and run locally:

```bash
git clone https://github.com/evdark/opencode-plus.git && cd opencode-plus
bun install
bun dev .
```

## Start A Session

From any project directory:

```bash
opencode .
```

The agent reads local configuration, instructions, and project files according to your permissions and selected model.

## Connect A Provider

Open the provider flow from the UI or configure a provider through your normal OpenCode config path. For local or internal gateways, use an OpenAI-compatible provider with a custom base URL.

See [providers.md](providers.md) for provider families and setup notes.

## Add Project Instructions

Create or update `AGENTS.md` in your repository:

```md
# Project Instructions

- Run tests from package directories.
- Keep changes small and focused.
- Do not edit generated files directly.
```

OpenCode+ will use those instructions when working in the project.

## Useful Commands

```bash
opencode .                # start a TUI session
opencode serve --port 4096 # start a local server
opencode upgrade          # check for a CLI update
```

## Next Steps

- Configure project behavior in [configuration.md](configuration.md).
- Choose providers in [providers.md](providers.md).
- Review troubleshooting tips in [troubleshooting.md](troubleshooting.md).
