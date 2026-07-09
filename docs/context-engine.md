# Context Engine

OpenCode+ context work focuses on making context understandable, tunable, and safe for long sessions.

## Goals

- Show what context the agent is likely to use.
- Let users balance quality, latency, cost, and privacy.
- Keep model execution separate from durable prompt admission.
- Preserve upstream session architecture wherever possible.

## Context Sources

Typical context can include:

- repository files;
- project instructions in `AGENTS.md`;
- session history;
- selected attachments;
- tool outputs;
- memory files;
- provider and model metadata.

## Planned Controls

| Control           | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| Context dashboard | Summarize active context sources and approximate token impact. |
| Context inspector | Let users inspect why a source was included.                   |
| Adaptive context  | Tune how aggressively context is selected.                     |
| Lazy injection    | Defer optional context until it is useful.                     |
| Token diagnostics | Make context cost easier to reason about.                      |

## Compatibility

Context features should be opt-in or explicitly preset-based. The compatibility profile should remain close to upstream OpenCode.
