/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { DialogSelect } from "../../ui/dialog-select"
import open from "open"

const id = "internal:plus-command-center"

type CenterItem = {
  title: string
  description?: string
  category: string
  value: string
  run: (api: TuiPluginApi) => void | Promise<void>
}

function catalog(api: TuiPluginApi): CenterItem[] {
  return [
    {
      title: "Command palette",
      description: "ctrl+p — all commands",
      category: "Center",
      value: "palette",
      run: () => api.keymap.dispatchCommand("command.palette.show"),
    },
    {
      title: "Sessions",
      description: "Switch or create sessions",
      category: "Sessions",
      value: "sessions",
      run: () => api.keymap.dispatchCommand("session.list"),
    },
    {
      title: "Models",
      description: "Switch model",
      category: "Providers",
      value: "models",
      run: () => api.keymap.dispatchCommand("model.list"),
    },
    {
      title: "Agents",
      description: "Switch agent",
      category: "Agents",
      value: "agents",
      run: () => api.keymap.dispatchCommand("agent.list"),
    },
    {
      title: "Themes",
      description: "OpenCode+, Nord, Tokyo, Minimal…",
      category: "Appearance",
      value: "themes",
      run: () => api.keymap.dispatchCommand("theme.switch"),
    },
    {
      title: "Diff viewer",
      description: "Side-by-side / unified patches",
      category: "VCS",
      value: "diff",
      run: () => api.keymap.dispatchCommand("diff.open"),
    },
    {
      title: "Git status",
      description: "Stage, commit, sync",
      category: "VCS",
      value: "git",
      run: () => api.keymap.dispatchCommand("plus.git.status"),
    },
    {
      title: "Agent handoff",
      description: "Hand work to another agent",
      category: "Agents",
      value: "handoff",
      run: () => api.keymap.dispatchCommand("plus.agent.handoff"),
    },
    {
      title: "Open browser URL",
      description: "Localhost preview / external",
      category: "Browser",
      value: "browser",
      run: () => api.keymap.dispatchCommand("plus.browser.open"),
    },
    {
      title: "Workspace profiles",
      description: "Save / apply named layouts",
      category: "Workspace",
      value: "workspace",
      run: () => api.keymap.dispatchCommand("plus.workspace.list"),
    },
    {
      title: "Which-key",
      description: "Interactive shortcut reference",
      category: "Keyboard",
      value: "which-key",
      run: () => api.keymap.dispatchCommand("which-key.toggle"),
    },
    {
      title: "Plugins",
      description: "Manage TUI plugins",
      category: "System",
      value: "plugins",
      run: () => api.keymap.dispatchCommand("plugins.list"),
    },
    {
      title: "Status",
      description: "MCP / LSP / providers",
      category: "System",
      value: "status",
      run: () => api.keymap.dispatchCommand("opencode.status"),
    },
    {
      title: "Docs (web)",
      description: "Open project docs on GitHub",
      category: "Docs",
      value: "docs",
      run: async () => {
        await open("https://github.com/evdark/opencode-plus#readme")
      },
    },
    {
      title: "Toggle status bar",
      description: "Workspace dashboard strip",
      category: "OpenCode+",
      value: "statusbar",
      run: () => api.keymap.dispatchCommand("plus.dashboard.toggle_status_bar"),
    },
    {
      title: "Open diff surface",
      description: "Full-screen diff viewer (not a side-by-side split yet)",
      category: "Layout",
      value: "pane-diff",
      run: () => {
        api.kv.set("plus_secondary_pane", "diff")
        api.keymap.dispatchCommand("diff.open")
      },
    },
    {
      title: "Open git surface",
      description: "Git status dialog (stage / commit / sync)",
      category: "Layout",
      value: "pane-git",
      run: () => {
        api.kv.set("plus_secondary_pane", "git")
        api.keymap.dispatchCommand("plus.git.status")
      },
    },
  ]
}

function SearchEverywhere(props: { api: TuiPluginApi }) {
  const options = catalog(props.api).map((item) => ({
    title: item.title,
    description: item.description,
    category: item.category,
    value: item.value,
    onSelect: () => {
      props.api.ui.dialog.clear()
      void item.run(props.api)
    },
  }))

  return (
    <DialogSelect
      title="Search everywhere"
      placeholder="commands, providers, git, agents, docs…"
      options={options}
    />
  )
}

const tui: TuiPlugin = async (api) => {
  api.keymap.registerLayer({
    commands: [
      {
        name: "plus.search.everywhere",
        title: "Search everywhere",
        category: "OpenCode+",
        namespace: "palette",
        suggested: true,
        slashName: "search",
        run() {
          api.ui.dialog.replace(() => <SearchEverywhere api={api} />)
          api.ui.dialog.setSize("large")
        },
      },
      {
        name: "plus.command.center",
        title: "OpenCode+ Command Center",
        category: "OpenCode+",
        namespace: "palette",
        suggested: true,
        run() {
          api.ui.dialog.replace(() => <SearchEverywhere api={api} />)
          api.ui.dialog.setSize("large")
        },
      },
    ],
  })
}

const plugin: BuiltinTuiPlugin = {
  id,
  tui,
}

export default plugin
