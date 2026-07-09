import type { Path } from "@opencode-ai/sdk/v2/client"

export function chatDirectory(path: Path) {
  return path.state || path.config || path.home || path.directory
}
