# Architecture

OpenCode+ keeps the upstream OpenCode package layout and adds fork behavior through narrow integration points where practical.

## Package Map

| Package             | Role                                                                           |
| ------------------- | ------------------------------------------------------------------------------ |
| `packages/opencode` | CLI, server, session runtime, provider orchestration, and core user workflows. |
| `packages/app`      | Shared Solid UI used by web and desktop surfaces.                              |
| `packages/desktop`  | Electron shell, desktop packaging, updater, and local sidecar integration.     |
| `packages/core`     | Shared core libraries and durable runtime primitives.                          |
| `packages/client`   | Generated API clients.                                                         |
| `packages/sdk/js`   | JavaScript SDK generation path.                                                |
| `packages/plugin`   | Plugin package source.                                                         |

## Dependency Direction

Runtime dependencies should remain directed:

```text
Schema -> Core / Protocol -> Server
Client -> Schema / Protocol
sdk-next -> Client / Core / Server
```

Client runtime code must not depend on Core or Server.

## Fork Strategy

OpenCode+ should:

- keep upstream files as integration points;
- move fork-specific behavior into fork-owned modules when possible;
- document intentional deviations;
- keep settings gates explicit;
- avoid replacing upstream architecture for cosmetic reasons.

## Generated Code

Do not edit generated files directly. Regenerate from the owning package when Protocol or Server APIs change.

## Desktop Runtime

The desktop app starts a local sidecar server, waits for initialization, and then mounts the renderer. Startup and recovery behavior is documented in [desktop-stability.md](desktop-stability.md).
