import type { BuiltinTuiPlugin } from "../builtins"
import dashboard from "./dashboard"
import commandCenter from "./command-center"
import gitUi from "./git-ui"
import agentHandoff from "./agent-handoff"
import browser from "./browser"
import workspace from "./workspace"
import resumeTracker from "./resume-tracker"

export type PlusPluginFlags = {
  dashboard?: boolean
  gitUi?: boolean
  searchEverywhere?: boolean
  commandCenter?: boolean
  agentHandoff?: boolean
  browserPanel?: boolean
  workspaceProfiles?: boolean
  statusBar?: boolean
}

/** Premium OpenCode+ TUI plugins — host loads only when OPENCODE_PLUS=1. */
export function createPlusPlugins(flags: PlusPluginFlags = {}): BuiltinTuiPlugin[] {
  const enabled = {
    dashboard: flags.dashboard !== false,
    gitUi: flags.gitUi !== false,
    searchEverywhere: flags.searchEverywhere !== false,
    commandCenter: flags.commandCenter !== false,
    agentHandoff: flags.agentHandoff !== false,
    browserPanel: flags.browserPanel !== false,
    workspaceProfiles: flags.workspaceProfiles !== false,
    statusBar: flags.statusBar !== false,
  }

  // Always track last session for `ocplus resume` while Plus is active.
  const plugins: BuiltinTuiPlugin[] = [resumeTracker]

  if (enabled.dashboard || enabled.statusBar) plugins.push(dashboard)
  if (enabled.searchEverywhere || enabled.commandCenter) plugins.push(commandCenter)
  if (enabled.gitUi) plugins.push(gitUi)
  if (enabled.agentHandoff) plugins.push(agentHandoff)
  if (enabled.browserPanel) plugins.push(browser)
  if (enabled.workspaceProfiles) plugins.push(workspace)

  return plugins
}
