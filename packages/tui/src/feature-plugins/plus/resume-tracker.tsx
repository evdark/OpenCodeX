/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { createEffect } from "solid-js"
import path from "path"
import { mkdirSync, writeFileSync } from "node:fs"
import { Global } from "@opencode-ai/core/global"

const id = "internal:plus-resume-tracker"

function lastSessionPath() {
  return path.join(Global.Path.data, "opencode-plus", "last-session.json")
}

function writeLastSession(input: { id: string; title?: string; directory?: string }) {
  const file = lastSessionPath()
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify({ ...input, at: Date.now() }, null, 2) + "\n")
}

function ResumeTracker(props: { api: TuiPluginApi }) {
  createEffect(() => {
    const current = props.api.route.current
    if (current.name !== "session" || !current.params) return
    const sessionID = current.params.sessionID
    if (typeof sessionID !== "string" || !sessionID) return
    const session = props.api.state.session.get(sessionID)
    writeLastSession({
      id: sessionID,
      title: session?.title,
      directory: session?.directory ?? props.api.state.path.directory,
    })
  })
  return null
}

const tui: TuiPlugin = async (api) => {
  api.slots.register({
    order: 1,
    slots: {
      app() {
        return <ResumeTracker api={api} />
      },
    },
  })
}

const plugin: BuiltinTuiPlugin = {
  id,
  tui,
}

export default plugin
