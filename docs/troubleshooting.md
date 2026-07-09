# Troubleshooting

Use this guide to narrow down common OpenCode+ issues before opening a report.

## Install

| Symptom                             | Check                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `opencode` not found                | Confirm `~/.opencode/bin` is on `PATH`.                                                     |
| Wrong release source                | Check `OPENCODE_RELEASE_OWNER` and `OPENCODE_RELEASE_REPO`.                                 |
| Install script reports no release   | Check the release page and use the source workflow if a requested version has no artifacts. |
| Install script fails after download | Retry with `--no-modify-path` and inspect shell profile permissions.                        |

## Providers

| Symptom              | Check                                                                  |
| -------------------- | ---------------------------------------------------------------------- |
| Authentication fails | Rotate the key, reconnect provider, and confirm environment variables. |
| Model missing        | Confirm model ID spelling and provider catalog availability.           |
| Streaming stops      | Check provider status, proxy timeout, and local network issues.        |
| High cost            | Review model selection, context size, and provider pricing metadata.   |

## Desktop

| Symptom                 | Check                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| Startup hangs           | Inspect desktop logs and sidecar health.                           |
| Update does not appear  | Confirm release artifacts exist for the configured channel.        |
| Recovery screen appears | Export logs and include them in a bug report with secrets removed. |

## Development

| Symptom                              | Check                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| Root tests fail immediately          | This is expected. Run tests from package directories.                        |
| Generated code changed unexpectedly  | Regenerate from the owning package and do not hand edit generated files.     |
| Typecheck fails in unrelated package | Confirm your branch has current upstream changes and dependencies installed. |

## Opening A Report

Include:

- version or commit;
- operating system;
- install method;
- provider and model if relevant;
- exact commands run;
- reproduction steps;
- redacted logs or screenshots.
