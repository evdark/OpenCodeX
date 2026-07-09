# OpenCode Plus Settings Foundation

This document covers the app-side OpenCode Plus settings and preset foundation. It persists choices, keeps the settings UI compact, and defines extension points for future optimizations. It does not execute prompt, context, provider, or tool optimizations by itself.

## Compatibility Contract

- New installs use the `Balanced` preset by default.
- The `Vanilla` preset is the upstream compatibility profile: every OpenCode Plus optimization gate is disabled.
- Runtime modules must read their own `enabled` gate and return immediately when it is `false`.
- Secondary values can be saved while a parent feature is disabled, but they stay inert until the owning runtime module explicitly uses them.
- Migration and import fill missing future options from the Vanilla-safe disabled baseline, not from the Balanced default.

## Built-In Presets

| Preset        | Purpose                             | Runtime compatibility                                |
| ------------- | ----------------------------------- | ---------------------------------------------------- |
| `Vanilla`     | Closest to upstream OpenCode        | All OpenCode Plus gates disabled                     |
| `Balanced`    | Default for most users              | Safe, predictable UI/diagnostic improvements enabled |
| `Performance` | Smaller prompts and lower token use | Maximum context optimization gates enabled           |
| `Power User`  | Deep diagnostics and transparency   | Nearly every registered enhancement enabled          |

Built-in presets are immutable and cannot be deleted. Custom presets are stored as complete snapshots of every registered OpenCode Plus feature setting.

## Architecture

- `src/context/OpenCodeX-settings.ts` is the source of truth for categories, setting definitions, built-in presets, import/export, clone/normalize logic, and migration.
- `src/context/OpenCodeX-settings-controller.ts` adapts the source-of-truth model to the app settings context and exposes the preset API: apply, create, duplicate, rename, delete, export, import, and restore defaults.
- `src/context/settings.tsx` only owns persisted app state and mounts the OpenCode Plus controller.
- `src/components/OpenCodeX-settings-model.ts` owns pure presentation helpers for search, advanced disclosure state, and numeric normalization.
- `src/components/settings-v2/OpenCodeX.tsx` renders the V2 settings adapter.
- `src/components/settings-OpenCodeX.tsx` renders the legacy settings adapter.
- `src/pages/session/session-prompt-queue.ts` owns queue orchestration so `src/pages/session.tsx` only wires the feature into the composer.

The UI keeps the first view light: preset selection, a custom-preset shortcut, search, and short categories. Duplicate, rename, import, export, restore, delete, and secondary feature controls live behind expandable sections.

## Upstream Merge Notes

Keep fork behavior in additive files whenever possible. The upstream touchpoints are intentionally small:

- `src/context/settings.tsx`: adds persisted `opencodePlus` state, migration, and a one-line controller mount.
- `src/pages/session.tsx`: wires the prompt queue controller into composer props without owning queue logic.
- `src/components/settings-general.tsx` and `src/components/settings-v2/general.tsx`: insert the OpenCode Plus settings sections.
- `src/components/prompt-input/submit.ts`: provides the queue hook point through `shouldQueue` and `onQueue`.
- `src/pages/session/composer/*`: extends the follow-up dock contract for queue display and actions.

When rebasing from upstream, prefer resolving conflicts by keeping upstream structure first, then reattaching these narrow hook points to the isolated OpenCode Plus modules.

## Registry Rules

Every OpenCode Plus feature must be represented in `openCodePlusSettingsRegistry` and in `OpenCodePlusFeatureSettings`. That gives the feature:

1. Search metadata.
2. Category placement.
3. Preset snapshot support.
4. Import/export support.
5. Migration fallback support.
6. Reset-to-preset behavior.

When adding a future feature, add the setting subtree to the registry model, define Vanilla-safe defaults, update built-in preset snapshots, expose a narrow setter in `OpenCodeX-settings-controller.ts`, and add the UI row in the owning category. Runtime implementation stays separate and must depend only on the feature's own settings subtree.

## Migration

Migration normalizes stored `opencodePlus` state without overwriting user choices. Existing custom presets are preserved. Missing settings are filled from `Vanilla`, so newly introduced optimization gates do not turn on silently for existing users or imported presets. If a migrated settings combination no longer matches a built-in preset, it is preserved as a generated custom preset named `Migrated settings`.

## Current Setting Groups

| Group     | Examples                                                                                                 | Notes                                                        |
| --------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Context   | Adaptive Context Engine, Context Dashboard, Context Inspector, Context Optimizer, Lazy Context Injection | Runtime work must stay behind feature gates                  |
| Tools     | Smart Tool Loading, dynamic registration, classic fallback                                               | Classic fallback remains available for compatibility         |
| Prompts   | Prompt Transparency, custom system prompt mode, token/context diagnostics                                | Prompt mutation is disabled unless its owner gate is enabled |
| Providers | Provider Health, Improved Error Messages                                                                 | Diagnostics only until runtime modules are implemented       |
| Queue     | Prompt Queue, suggested follow-ups, queue mode, persistence, notifications                               | Queue runtime stays inert unless `promptQueue.enabled` is on |

## Prompt Queue Runtime

The app-side prompt queue lives in the session composer. When `promptQueue.enabled` is on and the active session is already generating, normal Enter submissions are captured as durable follow-up drafts instead of being sent immediately. Attachments, images, agent mentions, comments, model selection, provider, and variant are snapshotted with the draft.

Queued drafts are stored per workspace and session, ordered in the compact queue dock above the composer, and can be edited, deleted, duplicated, reordered, skipped, restored from history, or run manually. Automatic mode starts the first queued user draft when the session becomes idle. Manual and Ask Every Time modes leave the first draft ready until the user confirms it. Suggested follow-ups are additive only; they never auto-run.

Persistence is controlled by the Prompt Queue settings. Both `persistQueue` and `restoreAfterRestart` must be enabled for queued drafts and history to remain in workspace storage across restarts. If either setting is disabled, the current in-memory queue can still be used, but persisted workspace queue data is removed.
