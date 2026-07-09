# Memory

Memory gives the agent durable project knowledge without repeating the same instructions in every prompt.

## What To Store

Good memory:

- project conventions;
- recurring commands;
- review preferences;
- domain vocabulary;
- known environment constraints.

Avoid storing:

- API keys;
- personal data;
- temporary task details;
- instructions that conflict with repository policy.

## Instruction Files

`AGENTS.md` is the primary repository instruction file. Keep it direct and operational.

Example:

```md
# Project Instructions

- Run typechecks from package directories.
- Prefer small pull requests.
- Keep generated files produced by official generators.
```

## Maintenance

Review memory when:

- build commands change;
- new packages are added;
- release policy changes;
- upstream sync introduces new architecture rules.
