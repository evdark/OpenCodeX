# Plugins

Plugins and MCP servers extend OpenCode+ without forcing every workflow into core.

## Plugin Goals

- Keep core workflows small.
- Let teams add project-specific behavior.
- Preserve upstream-compatible extension points.
- Make powerful tools explicit and reviewable.

## Project Plugins

Project-local plugins should live under `.opencode` paths or the configured plugin locations. Keep plugin code small, documented, and scoped to the project need.

## MCP Servers

MCP servers can expose external tools and data sources. Treat them as trusted code:

- review server source or vendor reputation;
- understand what data it can access;
- keep credentials scoped;
- disable servers you do not use.

## Plugin Quality Bar

Good plugins:

- solve one clear workflow;
- expose predictable commands;
- document required credentials;
- fail with actionable errors;
- avoid surprising network or filesystem access.

## Security

Plugins and MCP servers run inside the trust boundary you grant them. They are out of scope for OpenCode+ sandbox guarantees because OpenCode+ does not claim to provide sandbox isolation.
