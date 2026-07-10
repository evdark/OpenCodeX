# features (shipped)

```
  (⌐■_■)  code that runs. not a wishlist.
```

what OpenCodeX actually ships today. if it's not here, it's not shipped.

## Session & desktop

| Feature | Notes |
| --- | --- |
| Local agent sessions | Tools, files, models, history |
| Chat vs Code session | Chat = model Q&A without project tools; Code = full vibecoding |
| Session compaction | `/compact` / summarize |
| Shareable sessions | When sharing is enabled |
| Prompt queue | Queue while generating; auto / manual / ask |
| Queue templates | Save / restore drafts |
| Conditional queue | Pause auto-run after failure |
| Cost dashboard | Context tab totals |
| Context dashboard | Token stats + breakdown |
| Context inspector | System prompt + raw messages (gated) |
| Browser Preview | Dock panel for http(s) / localhost |
| System tray | Show / hide, open, new session, quit |
| Session archive | Home archive list |
| Session tabs | Clickable titlebar tab strip (reorder, close, switch) |

## Providers & plugins

| Feature | Notes |
| --- | --- |
| Provider catalog | Upstream catalog |
| Custom OpenAI-compatible providers | Create + connect from Providers |
| Provider health tags | Settings badges when enabled |
| Plugin manager | Settings → Plugins; in-app config editor |
| MCP settings | Settings → MCP; toggle servers + edit config |
| File edit in IDE | Edit project text files from session file tabs |
| First-run data setup | Import from OpenCode or clean OpenCodeX home |
| Panel layout sides | Queue + files/review left/right; reset to stock |
| Improved provider errors | Tips when gate is on |

## OpenCodeX settings

| Feature | Notes |
| --- | --- |
| Presets | Vanilla, Balanced, Performance, Power User |
| Custom presets | CRUD + import/export |
| Full settings export | JSON bundle |
| Custom system prompt | Append / replace on submit |
| Experimental flags | Conditional queue, snapshot memory, keyword search |
| Project memory | Local notes + `/snapshot` |

## CLI (`ocx`)

| Feature | Notes |
| --- | --- |
| `ocx` entry | Same engine as `opencode`; sets `OPENCODEX=1` |
| First-run setup | Desktop detect → import / skip / never |
| Desktop import | Non-destructive; settings pointer, auth if missing |
| `ocx resume` | Last session marker or most recent root session |
| `ocx dashboard` | Status + quick commands |
| `ocx memory` | list / add / search project memory |
| `ocx profiles` | List shared provider profiles file |
| `ocx git` | status / stage / commit / branch / fetch / pull / push |
| `ocx search` | Search commands, memory, settings, profiles, docs |
| `ocx workspace` | Named workspace profiles |
| `ocx settings` | Toggle premium feature flags |
| `ocx browser` | Open localhost / URL externally |
| Shared data | under data dir (`opencodex/` preferred; legacy `opencode-plus/` still read) |

### Premium TUI (when `OPENCODEX=1`)

| Feature | Notes |
| --- | --- |
| Workspace dashboard | Sidebar metrics + optional status bar |
| Command Center / search | `/search` |
| Git UI | `/git` |
| Agent handoff | `/handoff` |
| Browser open | `/browser` |
| Workspace profiles | `/workspace` |
| Themes | nord, tokyo, minimal, classic, … |

`opencode` remains available for scripts. Premium plugins do not load without OpenCodeX mode.

## Docs

See [docs/README.md](docs/README.md), [docs/installation.md](docs/installation.md).
