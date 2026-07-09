/** @jsxImportSource @opentui/solid */
import type { AssistantMessage } from "@opencode-ai/sdk/v2"
import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { createMemo, Show } from "solid-js"

const id = "internal:plus-dashboard"
const KV_STATUS_BAR = "plus_status_bar"

function sessionStats(api: TuiPluginApi, sessionID: string) {
  const messages = api.state.session.messages(sessionID)
  const session = api.state.session.get(sessionID)
  const last = messages.findLast((item): item is AssistantMessage => item.role === "assistant" && item.tokens.output > 0)
  if (!last) {
    return {
      tokens: 0,
      percent: null as number | null,
      cost: session?.cost ?? 0,
      model: undefined as string | undefined,
      provider: undefined as string | undefined,
      agent: undefined as string | undefined,
    }
  }
  const tokens =
    last.tokens.input + last.tokens.output + last.tokens.reasoning + last.tokens.cache.read + last.tokens.cache.write
  const model = api.state.provider.find((item) => item.id === last.providerID)?.models[last.modelID]
  return {
    tokens,
    percent: model?.limit.context ? Math.round((tokens / model.limit.context) * 100) : null,
    cost: session?.cost ?? 0,
    model: last.modelID,
    provider: last.providerID,
    agent: last.agent,
  }
}

function DashboardSidebar(props: { api: TuiPluginApi; session_id: string }) {
  const theme = () => props.api.theme.current
  const stats = createMemo(() => sessionStats(props.api, props.session_id))
  const branch = createMemo(() => props.api.state.vcs?.branch)
  const status = createMemo(() => props.api.state.session.status(props.session_id))
  const todos = createMemo(() => props.api.state.session.todo(props.session_id) ?? [])
  const running = createMemo(() => {
    const value = status()
    if (!value) return "idle"
    if (typeof value === "string") return value
    if (typeof value === "object" && value && "type" in value) return String((value as { type: string }).type)
    return "busy"
  })

  return (
    <box gap={0}>
      <text fg={theme().text}>
        <b>Workspace</b>
      </text>
      <text fg={theme().textMuted}>
        {stats().provider || "—"}/{stats().model || "—"}
      </text>
      <text fg={theme().textMuted}>agent {stats().agent || "—"}</text>
      <text fg={theme().textMuted}>
        ctx {stats().tokens.toLocaleString()}
        {stats().percent !== null ? ` (${stats().percent}%)` : ""}
      </text>
      <text fg={theme().textMuted}>${(stats().cost ?? 0).toFixed(4)}</text>
      <Show when={branch()}>{(b) => <text fg={theme().textMuted}>git {b()}</text>}</Show>
      <text fg={theme().textMuted}>status {running()}</text>
      <Show when={todos().length > 0}>
        <text fg={theme().textMuted}>todos {todos().length}</text>
      </Show>
    </box>
  )
}

function StatusBar(props: { api: TuiPluginApi }) {
  const theme = () => props.api.theme.current
  const enabled = createMemo(() => props.api.kv.get<boolean>(KV_STATUS_BAR, true) !== false)
  const route = createMemo(() => props.api.route.current)
  const sessionID = createMemo(() => {
    const current = route()
    if (current.name === "session" && current.params && typeof current.params.sessionID === "string") {
      return current.params.sessionID
    }
    return undefined
  })
  const stats = createMemo(() => {
    const id = sessionID()
    if (!id) return undefined
    return sessionStats(props.api, id)
  })
  const branch = createMemo(() => props.api.state.vcs?.branch)
  const label = createMemo(() => {
    const parts = ["OpenCode+"]
    if (branch()) parts.push(branch()!)
    if (stats()?.provider && stats()?.model) parts.push(`${stats()!.provider}/${stats()!.model}`)
    if (stats()?.tokens) parts.push(`${stats()!.tokens.toLocaleString()} tok`)
    if (stats()?.percent !== null && stats()?.percent !== undefined) parts.push(`${stats()!.percent}%`)
    return parts.join(" · ")
  })

  return (
    <Show when={enabled()}>
      <box width="100%" paddingLeft={1} paddingRight={1} flexShrink={0} backgroundColor={theme().backgroundPanel}>
        <text fg={theme().textMuted}>{label()}</text>
      </box>
    </Show>
  )
}

const tui: TuiPlugin = async (api) => {
  // Prefer OpenCode+ theme once when nothing custom is selected yet.
  if (api.theme.has("opencode-plus") && (api.theme.selected === "opencode" || !api.theme.selected)) {
    api.theme.set("opencode-plus")
  }

  api.slots.register({
    order: 50,
    slots: {
      sidebar_content(_ctx, props) {
        return <DashboardSidebar api={api} session_id={props.session_id} />
      },
      app_bottom() {
        return <StatusBar api={api} />
      },
    },
  })

  api.keymap.registerLayer({
    commands: [
      {
        name: "plus.dashboard.toggle_status_bar",
        title: "Toggle workspace status bar",
        category: "OpenCode+",
        namespace: "palette",
        run() {
          const next = api.kv.get<boolean>(KV_STATUS_BAR, true) === false
          api.kv.set(KV_STATUS_BAR, next)
          api.ui.toast({
            variant: "info",
            message: next ? "Status bar enabled" : "Status bar disabled",
          })
        },
      },
      {
        name: "plus.dashboard.focus",
        title: "Workspace dashboard (sidebar)",
        category: "OpenCode+",
        namespace: "palette",
        suggested: true,
        run() {
          api.keymap.dispatchCommand("session.sidebar.toggle")
          api.ui.toast({ variant: "info", message: "Toggle sidebar for workspace dashboard" })
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
