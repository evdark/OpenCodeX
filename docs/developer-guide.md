# Developer Guide

This guide collects the everyday commands contributors need for OpenCode+.

## Install

```bash
bun install
```

## Run

CLI:

```bash
bun dev .
```

Server:

```bash
bun dev serve --port 4096
```

Web app:

```bash
bun dev:web -- --port 4444
```

Desktop:

```bash
bun dev:desktop
```

## Typecheck

Run typechecks from package directories:

```bash
bun --cwd packages/app typecheck
bun --cwd packages/desktop typecheck
bun --cwd packages/opencode typecheck
```

## Tests

Do not run tests from the repository root. Use package directories:

```bash
bun --cwd packages/app test ./src/components/example.test.ts
```

## Generated Code

After changing public Protocol or Server `HttpApi`:

```bash
bun --cwd packages/client run generate
```

To regenerate the legacy JavaScript SDK:

```bash
./packages/sdk/js/script/build.ts
```

## Review Checklist

Before committing:

- review every modified file as a maintainer;
- remove unrelated changes;
- check naming, duplication, edge cases, and hidden state;
- estimate upstream merge risk;
- document deviations from upstream when needed.

## Style

Follow [../AGENTS.md](../AGENTS.md) for repository-specific coding style and workflow rules.
