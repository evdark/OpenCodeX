/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { DialogSelect } from "../../ui/dialog-select"

const id = "internal:plus-workspace"
const KV_PROFILES = "plus_workspace_profiles"

type Profile = {
  id: string
  name: string
  at: number
  theme?: string
  secondaryPane?: "none" | "diff" | "git" | "context"
  sessionID?: string
  browserUrl?: string
}

function loadProfiles(api: TuiPluginApi): Profile[] {
  const raw = api.kv.get<Profile[]>(KV_PROFILES, [])
  return Array.isArray(raw) ? raw : []
}

function saveProfiles(api: TuiPluginApi, profiles: Profile[]) {
  api.kv.set(KV_PROFILES, profiles.slice(0, 50))
}

function applyProfile(api: TuiPluginApi, profile: Profile) {
  if (profile.theme) api.theme.set(profile.theme)
  if (profile.secondaryPane) api.kv.set("plus_secondary_pane", profile.secondaryPane)
  if (profile.browserUrl) api.kv.set("plus_browser_url", profile.browserUrl)
  if (profile.sessionID) {
    api.route.navigate("session", { sessionID: profile.sessionID })
  }
  if (profile.secondaryPane === "diff") api.keymap.dispatchCommand("diff.open")
  if (profile.secondaryPane === "git") api.keymap.dispatchCommand("plus.git.status")
  api.ui.toast({ variant: "success", message: `Applied workspace “${profile.name}”` })
}

function ListDialog(props: { api: TuiPluginApi }) {
  const profiles = loadProfiles(props.api)
  if (profiles.length === 0) {
    return (
      <DialogSelect
        title="Workspace profiles"
        options={[
          {
            title: "No profiles yet — save one",
            description: "Captures theme, pane, session, browser URL",
            value: "__save__",
          },
        ]}
        onSelect={() => {
          props.api.ui.dialog.clear()
          props.api.keymap.dispatchCommand("plus.workspace.save")
        }}
      />
    )
  }

  return (
    <DialogSelect
      title="Workspace profiles"
      options={profiles.map((profile) => ({
        title: profile.name,
        description: [profile.theme, profile.secondaryPane, profile.sessionID].filter(Boolean).join(" · "),
        category: "Profiles",
        value: profile.id,
      }))}
      actions={[
        {
          title: "apply",
          command: "plus.workspace.apply",
          onTrigger: (item) => {
            const profile = profiles.find((row) => row.id === item.value)
            if (!profile) return
            props.api.ui.dialog.clear()
            applyProfile(props.api, profile)
          },
        },
        {
          title: "delete",
          command: "plus.workspace.delete",
          onTrigger: (item) => {
            const next = profiles.filter((row) => row.id !== item.value)
            saveProfiles(props.api, next)
            props.api.ui.toast({ variant: "info", message: "Profile deleted" })
            props.api.ui.dialog.clear()
            props.api.keymap.dispatchCommand("plus.workspace.list")
          },
        },
      ]}
      onSelect={(item) => {
        const profile = profiles.find((row) => row.id === item.value)
        if (!profile) return
        props.api.ui.dialog.clear()
        applyProfile(props.api, profile)
      }}
    />
  )
}

const tui: TuiPlugin = async (api) => {
  api.keymap.registerLayer({
    commands: [
      {
        name: "plus.workspace.list",
        title: "Workspace profiles",
        category: "OpenCode+",
        namespace: "palette",
        suggested: true,
        slashName: "workspace",
        run() {
          api.ui.dialog.replace(() => <ListDialog api={api} />)
        },
      },
      {
        name: "plus.workspace.save",
        title: "Save workspace profile",
        category: "OpenCode+",
        namespace: "palette",
        run() {
          api.ui.dialog.replace(() => (
            <api.ui.DialogPrompt
              title="Profile name"
              placeholder="Focus mode, Review, Demo…"
              onConfirm={(name) => {
                const trimmed = name.trim()
                if (!trimmed) return
                const current = api.route.current
                const sessionID =
                  current.name === "session" && current.params && typeof current.params.sessionID === "string"
                    ? current.params.sessionID
                    : undefined
                const profiles = loadProfiles(api)
                const profile: Profile = {
                  id: crypto.randomUUID(),
                  name: trimmed,
                  at: Date.now(),
                  theme: api.theme.selected,
                  secondaryPane: (api.kv.get("plus_secondary_pane", "none") as Profile["secondaryPane"]) || "none",
                  sessionID,
                  browserUrl: api.kv.get<string>("plus_browser_url", "") || undefined,
                }
                const existing = profiles.findIndex((row) => row.name.toLowerCase() === trimmed.toLowerCase())
                if (existing >= 0) profiles[existing] = { ...profile, id: profiles[existing]!.id }
                else profiles.unshift(profile)
                saveProfiles(api, profiles)
                api.ui.toast({ variant: "success", message: `Saved workspace “${trimmed}”` })
              }}
            />
          ))
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
