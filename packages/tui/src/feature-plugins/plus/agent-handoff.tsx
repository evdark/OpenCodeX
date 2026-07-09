/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { DialogSelect } from "../../ui/dialog-select"

const id = "internal:plus-agent-handoff"

const ROLES = [
  {
    name: "build",
    title: "Coding Agent",
    description: "Implement features and fix bugs",
    prompt: "Continue as the coding agent. Focus on implementation quality and small diffs.",
  },
  {
    name: "plan",
    title: "Plan Agent",
    description: "Design approach before coding",
    prompt: "Continue as the planning agent. Outline steps and risks before implementation.",
  },
  {
    name: "general",
    title: "General Agent",
    description: "Balanced multi-purpose agent",
    prompt: "Continue with a balanced approach across research and implementation.",
  },
  {
    name: "explore",
    title: "Explore Agent",
    description: "Codebase research",
    prompt: "Continue as explore agent. Map the relevant codepaths and report findings.",
  },
] as const

function HandoffDialog(props: { api: TuiPluginApi }) {
  return (
    <DialogSelect
      title="Agent handoff"
      placeholder="coding, review, docs, tests…"
      options={ROLES.map((role) => ({
        title: role.title,
        description: role.description,
        category: "Agents",
        value: role.name,
        details: [role.prompt],
      }))}
      onSelect={async (option) => {
        const role = ROLES.find((item) => item.name === option.value)
        if (!role) return
        props.api.ui.dialog.clear()

        // Prefer switching agent in-place; create a sibling session when possible.
        props.api.keymap.dispatchCommand("agent.list")
        props.api.ui.toast({
          variant: "info",
          title: `Handoff → ${role.title}`,
          message: "Pick the agent if needed, then continue. Context is not auto-merged.",
          duration: 4000,
        })

        // Soft handoff: open a new session with a seed prompt when supported.
        const current = props.api.route.current
        const sessionID =
          current.name === "session" && current.params && typeof current.params.sessionID === "string"
            ? current.params.sessionID
            : undefined
        try {
          const created = await props.api.client.session.create({
            title: `Handoff: ${role.title}`,
            parentID: sessionID,
            agent: role.name,
          })
          const nextID = created.data?.id
          if (nextID) {
            props.api.route.navigate("session", { sessionID: nextID, prompt: role.prompt })
            props.api.ui.toast({
              variant: "success",
              message: `Opened ${role.title} session (independent context)`,
            })
          }
        } catch {
          // Agent list toast still helps when create is unavailable.
        }
      }}
    />
  )
}

const tui: TuiPlugin = async (api) => {
  api.keymap.registerLayer({
    commands: [
      {
        name: "plus.agent.handoff",
        title: "Agent handoff",
        category: "OpenCode+",
        namespace: "palette",
        suggested: true,
        slashName: "handoff",
        run() {
          api.ui.dialog.replace(() => <HandoffDialog api={api} />)
          api.ui.dialog.setSize("large")
        },
      },
      {
        name: "plus.agent.switch_session",
        title: "Switch AI session",
        category: "OpenCode+",
        namespace: "palette",
        run() {
          api.keymap.dispatchCommand("session.list")
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
