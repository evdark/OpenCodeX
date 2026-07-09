# Desktop Stability

OpenCode+ desktop stability work focuses on making startup and recovery predictable without replacing upstream architecture.

## Startup Health Gate

The desktop shell starts an embedded local OpenCode server, then passes credentials to the renderer through `awaitInitialization`.

OpenCode+ waits for the embedded server health check before resolving renderer initialization. If the server fails to become healthy, initialization fails and the existing error page is shown with recovery actions instead of leaving the user in a loading state.

## Architecture

- `packages/desktop/src/main/index.ts` starts the embedded sidecar.
- `packages/desktop/src/main/initialization.ts` owns small reusable startup helpers.
- `packages/desktop/src/renderer/index.tsx` waits for initialized sidecar credentials before mounting server-scoped UI.
- `packages/app/src/pages/error.tsx` provides restart, log export, update checks, and technical details.

## Recovery Behavior

When startup fails:

- the renderer initialization promise rejects;
- the desktop error page receives the real startup error;
- the user can restart the app;
- desktop users can export debug logs;
- update checks remain available from the error page.

## Future Extension Points

- Add structured startup error categories for port binding failures, sidecar crashes, and health timeouts.
- Surface a direct `Copy error` action in the error page.
- Add bounded retry for transient sidecar startup failures before showing the recovery page.
- Include recent sidecar log lines in technical details when available.
