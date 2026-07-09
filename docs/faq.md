# FAQ

## Is OpenCode+ official OpenCode?

No. OpenCode+ is an unofficial fork of OpenCode. It preserves upstream attribution and license notices.

## Why does the command still say `opencode`?

Compatibility. Existing scripts, shell habits, MCP integrations, and upstream documentation often expect the `opencode` command.

## Does OpenCode+ sandbox agent actions?

No. Permissions help users see and approve actions, but they are not a sandbox. Use a VM or container for isolation.

## Which provider should I use?

Start with the provider you already trust for coding work. Use OpenAI-compatible endpoints for local models, internal gateways, or experiments.

## Can I sync with upstream OpenCode?

Yes. The fork is designed to keep upstream syncs reviewable. See [upstream-sync.md](upstream-sync.md).

## Where should I report security issues?

Use the private process in [../SECURITY.md](../SECURITY.md).

## Are all roadmap items available today?

No. Roadmap and design docs mark planned behavior. The UI should only expose features that are actually present in the build.
