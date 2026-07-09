# Contributing

Thank you for helping make OpenCode+ sharper. This fork is intentionally polished and upstream-aware, so the best contributions are small, well-explained, and easy to merge forward.

## What We Welcome

- Bug fixes with a clear reproduction.
- Provider, desktop, update, and workflow improvements.
- Documentation that makes the project easier to evaluate or use.
- Tests around behavior that could regress.
- Refactors that reduce merge risk or remove duplicated logic.

Large product changes should start as an issue or discussion before code.

## Working Principles

- Keep changes focused. One PR should solve one problem.
- Preserve upstream compatibility. Prefer extension over replacing core OpenCode files.
- Avoid speculative abstractions. Inline simple logic until reuse is real.
- Keep user-facing language concise and professional.
- Do not paste long AI-generated issue or PR descriptions.

## Local Setup

Requirements:

- Bun 1.3+
- Git
- A supported LLM provider account or local OpenAI-compatible endpoint

Install dependencies:

```bash
bun install
```

Run the CLI from source:

```bash
bun dev .
```

Run the desktop app:

```bash
bun dev:desktop
```

Run the web app against a local server:

```bash
bun dev serve --port 4096
bun dev:web -- --port 4444
```

## Branches and Commits

Use short branch names with words separated by hyphens, for example:

```text
provider-errors
desktop-recovery
docs-refresh
```

Commit and PR titles should use conventional commit style:

```text
fix(desktop): surface startup failures
docs: refresh provider guide
feat(app): add prompt queue controls
```

## Checks

Run checks from package directories. Do not run tests from the repository root.

Examples:

```bash
bun --cwd packages/app typecheck
bun --cwd packages/desktop typecheck
bun --cwd packages/opencode typecheck
```

Targeted tests should live next to the package they verify:

```bash
bun --cwd packages/app test ./src/components/example.test.ts
```

If you change the public Protocol or Server `HttpApi`, regenerate client code from `packages/client`:

```bash
bun --cwd packages/client run generate
```

Do not edit generated client files directly.

To regenerate the legacy JavaScript SDK:

```bash
./packages/sdk/js/script/build.ts
```

## Pull Request Standard

Every PR should include:

- a concise summary of what changed;
- a linked issue or explanation for small fixes;
- screenshots or recordings for UI changes;
- the checks you ran;
- notes on upstream merge risk when core files are touched.

Before requesting review, look at your diff as if you were maintaining the project six months from now. Remove unrelated changes, duplicated logic, fragile naming, and unnecessary abstractions.

## Upstream Compatibility

OpenCode+ tracks upstream OpenCode. Fork-specific behavior should be isolated when practical:

- keep integration points narrow;
- prefer new fork-owned modules over large rewrites of upstream files;
- document intentional deviations;
- avoid changing generated files by hand;
- resolve upstream sync conflicts through reviewable PRs.

See [docs/upstream-sync.md](docs/upstream-sync.md) for the sync workflow.

## Community

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md). Security issues should be reported privately through [SECURITY.md](SECURITY.md).
