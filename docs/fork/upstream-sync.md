# Fork Upstream Sync

This fork keeps OpenCode Plus behavior additive where possible so future syncs from upstream OpenCode stay manageable.

## Merge Risk Map

| Area                         | Upstream files touched                                                                          | Isolated fork files                                                                                                                                                | Merge difficulty |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| OpenCode Plus settings       | `packages/app/src/context/settings.tsx`, settings UI entry files, `packages/app/src/i18n/en.ts` | `packages/app/src/context/opencode-plus-settings.ts`, `packages/app/src/context/opencode-plus-settings-controller.ts`, OpenCode Plus settings components and tests | Medium           |
| Prompt Queue                 | `packages/app/src/pages/session.tsx`, composer follow-up dock contract, prompt submit tests     | `packages/app/src/pages/session/session-prompt-queue.ts`, `packages/app/src/pages/session/prompt-queue.ts`, queue tests                                            | Medium           |
| SolidStart manifest fallback | Vite configs in console, enterprise, and stats packages                                         | `packages/solid-start-manifest-fallback.ts`                                                                                                                        | Low              |
| Desktop sidecar startup      | `packages/desktop/src/main/initialization.ts`, initialization tests                             | none                                                                                                                                                               | Low              |
| Fork desktop releases        | none                                                                                            | `.github/workflows/fork-desktop-release.yml`, `docs/fork/desktop-releases.md`                                                                                      | Low              |
| Tooling cleanup              | `.oxlintrc.json`                                                                                | none                                                                                                                                                               | Medium           |

## Rebase Guidance

- Keep upstream edits in large app files first, then reattach the narrow fork hooks.
- Do not move OpenCode Plus feature logic back into `settings.tsx` or `session.tsx`; those files should stay as integration points.
- Keep new runtime behavior behind explicit settings gates. The Vanilla preset must remain the compatibility profile.
- Prefer adding new fork files for future OpenCode Plus behavior instead of editing upstream-owned modules directly.
- Keep the fork desktop release workflow separate from upstream `publish.yml`; upstream's repository guard should stay intact for clean rebases.
