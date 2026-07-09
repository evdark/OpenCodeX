# Browser Preview

OpenCode+ includes an embedded **Browser Preview** panel for local web apps and http(s) URLs while you work in a session.

## Product feature (desktop / app UI)

Open the panel from:

- Session header button (window/cursor icon)
- Command palette: **Toggle browser preview** (`Mod+Shift+B`)
- Command palette: **Open URL in browser preview** (`/preview`)
- Alt/Option-click on a previewable link in chat

### Capabilities

| Capability | Notes |
| --- | --- |
| Address bar | Normalizes `localhost:5173`, IPs, and bare hosts |
| History | Back / forward per tab |
| Tabs | Multiple preview tabs with recent URL memory |
| Device modes | Responsive, iPhone, iPad, laptop, desktop frames |
| Console dock | Navigation and load events (cross-origin page logs are limited by sandbox) |
| Port chips | Common dev ports plus ports detected from pasted tool output |
| Screenshot | Downloads a PNG snapshot of the preview chrome (same-origin body when available) |
| Open external | Hands the current URL to the system browser |

### Architecture

- State: `packages/app/src/context/browser-preview.tsx` (+ pure helpers in `browser-preview-model.ts`)
- UI: `packages/app/src/pages/session/browser-preview-panel.tsx`
- Layout open/height: `layout.view(...).browser` and `layout.browser.height`
- Link bridge: `opencode:browser-preview` custom event + `BrowserPreviewBridge`

Preview rendering uses a sandboxed `iframe` so the feature works in both web and desktop shells without Electron-only WebView APIs.

## Local development surfaces

Start the local server:

```bash
bun dev serve --port 4096
```

Start the app development server:

```bash
bun dev:web -- --port 4444
```

Open the URL printed by the app server.

## Desktop shell

```bash
bun dev:desktop
```

The desktop app wraps the local app and sidecar server. Browser Preview runs inside the app UI.

## Review tips

- Capture screenshots for UI pull requests.
- Test narrow and wide layouts.
- Verify error, loading, and empty states.
- Check provider and model selection with realistic config.

## Troubleshooting

| Problem | Try |
| --- | --- |
| App cannot connect | Confirm the server is running and ports match. |
| Blank desktop window | Check sidecar startup logs and desktop recovery screen. |
| Stale UI | Restart the app dev server and clear cached build output if needed. |
| Preview blocked | Some sites send `X-Frame-Options` / CSP frame-ancestors; use **Open external**. |
| Console empty for remote site | Expected for cross-origin pages; local same-origin apps may expose more. |
