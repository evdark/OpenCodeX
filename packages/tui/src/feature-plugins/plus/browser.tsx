/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import open from "open"
import { DialogSelect } from "../../ui/dialog-select"

const id = "internal:plus-browser"
const KV_LAST_URL = "plus_browser_url"

const PRESETS = [
  { title: "localhost:3000", value: "http://127.0.0.1:3000" },
  { title: "localhost:5173", value: "http://127.0.0.1:5173" },
  { title: "localhost:4096", value: "http://127.0.0.1:4096" },
  { title: "localhost:8080", value: "http://127.0.0.1:8080" },
]

async function openUrl(api: TuiPluginApi, url: string) {
  const next = url.trim()
  if (!next) return
  api.kv.set(KV_LAST_URL, next)
  await open(next)
  api.ui.toast({ variant: "success", message: `Opened ${next}` })
}

function BrowserDialog(props: { api: TuiPluginApi }) {
  const last = props.api.kv.get<string>(KV_LAST_URL, "")
  const options = [
    ...(last
      ? [
          {
            title: "Last URL",
            description: last,
            category: "Recent",
            value: last,
          },
        ]
      : []),
    ...PRESETS.map((item) => ({
      title: item.title,
      description: item.value,
      category: "Localhost",
      value: item.value,
    })),
    {
      title: "Custom URL…",
      description: "Type any http(s) address",
      category: "Custom",
      value: "__custom__",
    },
  ]

  return (
    <DialogSelect
      title="Browser preview"
      placeholder="localhost or https…"
      options={options}
      onSelect={(option) => {
        if (option.value === "__custom__") {
          props.api.ui.dialog.replace(() => (
            <props.api.ui.DialogPrompt
              title="Open URL"
              placeholder="https://…"
              value={last || "http://127.0.0.1:3000"}
              onConfirm={(value) => {
                void openUrl(props.api, value)
              }}
            />
          ))
          return
        }
        props.api.ui.dialog.clear()
        void openUrl(props.api, String(option.value))
      }}
    />
  )
}

const tui: TuiPlugin = async (api) => {
  api.keymap.registerLayer({
    commands: [
      {
        name: "plus.browser.open",
        title: "Open browser URL",
        category: "OpenCode+",
        namespace: "palette",
        suggested: true,
        slashName: "browser",
        run() {
          api.ui.dialog.replace(() => <BrowserDialog api={api} />)
        },
      },
      {
        name: "plus.browser.refresh_last",
        title: "Reopen last browser URL",
        category: "OpenCode+",
        namespace: "palette",
        run() {
          const last = api.kv.get<string>(KV_LAST_URL, "")
          if (!last) {
            api.ui.toast({ variant: "warning", message: "No last browser URL" })
            return
          }
          void openUrl(api, last)
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
