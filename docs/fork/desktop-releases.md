# Fork Desktop Releases

Use this workflow to publish OpenCode+ desktop installers from the fork. The upstream `publish.yml` is intentionally guarded with `github.repository == 'anomalyco/opencode'`, so fork releases need this separate path.

Run it manually from GitHub Actions with a SemVer `version` input, without the leading `v`. The workflow creates or reuses a draft `v<version>` release, builds macOS, Windows, and Linux desktop installers, uploads `.dmg`, `.zip`, `.exe`, `.blockmap`, `.AppImage`, `.deb`, `.rpm`, and finalizes the Electron `latest*.yml` update metadata.

By default the release stays as a draft. Set `publish` when dispatching the workflow to make it public after all assets upload.

Signing is optional:

- macOS signing and notarization run only when `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_API_KEY_PATH`, `APPLE_API_KEY`, and `APPLE_API_ISSUER` are configured.
- Windows signing runs only when the Azure Trusted Signing secrets used by `script/sign-windows.ps1` are configured.
- Without signing secrets, installers are still built, but operating systems may show unsigned-app warnings.
