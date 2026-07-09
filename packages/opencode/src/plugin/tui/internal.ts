import { createBuiltinPlugins, type BuiltinTuiPlugin } from "@opencode-ai/tui/builtins"
import { createPlusPlugins } from "@opencode-ai/tui/plus"
import type { RuntimeFlags } from "@/effect/runtime-flags"

export type InternalTuiPlugin = BuiltinTuiPlugin

export function internalTuiPlugins(flags: Pick<RuntimeFlags.Info, "experimentalEventSystem">): InternalTuiPlugin[] {
  const plugins = createBuiltinPlugins({
    experimentalEventSystem: flags.experimentalEventSystem,
  })
  // Premium OpenCodeX TUI surfaces — only when launched as ocx / OPENCODEX=1.
  if (process.env.OPENCODEX !== "1" && process.env.OPENCODE_PLUS !== "1") return plugins

  // Feature flags from `ocx settings` gate which OpenCodeX plugins load.
  const features = loadPlusSettingsSync()
  return [...plugins, ...createPlusPlugins(features)]
}

function loadPlusSettingsSync() {
  try {
    // Sync path for plugin registration — avoid importing @opencode-ai/core/global
    // (it uses top-level await and breaks bun compile/require).
    const { readFileSync, existsSync } = require("node:fs") as typeof import("node:fs")
    const path = require("node:path") as typeof import("node:path")
    const os = require("node:os") as typeof import("node:os")
    const home = process.env.OPENCODE_TEST_HOME ?? os.homedir()
    const dataHome = process.env.XDG_DATA_HOME ?? path.join(home, ".local", "share")
    const next = path.join(dataHome, "opencode", "opencodex", "cli-settings.json")
    const legacy = path.join(dataHome, "opencode", "opencode-plus", "cli-settings.json")
    const file = existsSync(next) ? next : legacy
    if (!existsSync(file)) return {}
    const parsed = JSON.parse(readFileSync(file, "utf8")) as { features?: Record<string, boolean> }
    return parsed.features ?? {}
  } catch {
    return {}
  }
}
