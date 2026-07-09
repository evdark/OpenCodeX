# Configuration

OpenCode+ keeps upstream-compatible configuration while documenting fork-specific behavior explicitly.

## Config Files

OpenCode+ reads configuration from global and project scopes. Common project files include:

| File             | Purpose                                      |
| ---------------- | -------------------------------------------- |
| `opencode.json`  | Project configuration.                       |
| `opencode.jsonc` | Project configuration with comments.         |
| `AGENTS.md`      | Project instructions for coding agents.      |
| `.opencode/`     | Project-local commands, plugins, and memory. |

Global configuration is stored under the OpenCode config directory used by the runtime.

## Minimal Project Config

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "edit": "ask",
    "bash": "ask",
  },
}
```

## Providers

Provider setup can happen through UI flows or configuration, depending on provider type. Keep secrets out of committed files.

For custom OpenAI-compatible endpoints, configure:

- provider name;
- base URL;
- model IDs;
- API key or auth source;
- optional headers.

See [providers.md](providers.md).

## Agents And Commands

Use project configuration and `.opencode` files to define repeatable workflows. Keep agent instructions short and concrete.

Good instructions:

```md
- Run package checks from package directories.
- Prefer Bun APIs where possible.
- Do not edit generated files directly.
```

Avoid vague instructions:

```md
- Make everything better.
- Use best practices.
```

## Permissions

Permissions are visibility and confirmation controls. They are not a sandbox. Use a container or VM when running against untrusted repositories.

## Fork-Specific Settings

OpenCode+ features should be guarded by explicit settings or release-channel environment variables. The compatibility profile should remain close to upstream OpenCode behavior.
