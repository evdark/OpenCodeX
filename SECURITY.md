# Security Policy

OpenCodeX is a local AI coding agent with access to files, shell commands, network tools, configured providers, and user-approved integrations. Treat it like powerful developer automation, not like a sandbox.

## Supported Versions

OpenCodeX is preparing its independent release process. Until the first stable fork release, security fixes are handled on the active `dev` line and published through GitHub Releases when release artifacts are available.

| Version line           | Status                                  |
| ---------------------- | --------------------------------------- |
| `dev`                  | Active development                      |
| tagged forks           | Supported when released                 |
| upstream-only releases | Use upstream OpenCode security channels |

## Threat Model

OpenCodeX runs on the user's machine and can perform high-impact actions when granted permission.

Important boundaries:

- The permission system is a UX control, not a security sandbox.
- Server mode is opt-in. If enabled, protect it with `OPENCODE_SERVER_PASSWORD` and normal network controls.
- LLM provider data handling is governed by the provider you configure.
- MCP servers and plugins run inside the trust boundary you give them.
- Project config files are user-controlled input; review configs from untrusted repositories before running automation.

If you need isolation, run OpenCodeX inside a container, VM, or disposable development environment.

## In Scope

- Vulnerabilities that allow unintended command execution without user action.
- Exposure of secrets through OpenCodeX logs, update flows, desktop IPC, or provider handling.
- Authentication or authorization bypasses in server mode when protection is configured.
- Update-channel issues that could install artifacts from the wrong repository.

## Out of Scope

| Category                                         | Reason                                                |
| ------------------------------------------------ | ----------------------------------------------------- |
| Agent actions explicitly approved by the user    | Approved automation is expected behavior              |
| Lack of sandbox escape protection                | OpenCodeX does not claim to provide sandbox isolation |
| Provider retention or training policies          | Governed by the selected provider                     |
| Malicious local plugins or MCP servers           | Users choose the extensions they run                  |
| Reports generated without a working reproduction | They are not actionable                               |

## Reporting a Vulnerability

Use GitHub Security Advisories:

<https://github.com/evdark/OpenCodeX/security/advisories/new>

Please include:

- affected version or commit;
- operating system;
- configuration needed to reproduce;
- impact;
- minimal reproduction steps;
- any logs or screenshots that help confirm the issue.

Do not open a public issue for a suspected vulnerability.

## Response Expectations

We aim to acknowledge valid reports within 6 business days. Fix timelines depend on severity, reproduction quality, upstream involvement, and release readiness.
