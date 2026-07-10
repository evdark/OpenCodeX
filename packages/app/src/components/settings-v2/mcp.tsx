import { For, Show, type Component, createMemo } from "solid-js"
import { ButtonV2 } from "@opencode-ai/ui/v2/button-v2"
import { Switch } from "@opencode-ai/ui/v2/switch-v2"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { useLanguage } from "@/context/language"
import { useServerSync } from "@/context/server-sync"
import { useLayout } from "@/context/layout"
import { useMutation } from "@tanstack/solid-query"
import { showToast } from "@/utils/toast"
import { DialogConfigEditor } from "../dialog-config-editor"
import { SettingsListV2 } from "./parts/list"
import { SettingsRowV2 } from "./parts/row"
import { SettingsServerScope } from "../settings-server-picker"
import "./settings-v2.css"

const statusLabels = {
  connected: "mcp.status.connected",
  failed: "mcp.status.failed",
  needs_auth: "mcp.status.needs_auth",
  needs_client_registration: "mcp.status.needs_client_registration",
  disabled: "mcp.status.disabled",
} as const

/** Settings surface — uses server-sync + workspace MCP, not session SDK context. */
export const SettingsMcpV2: Component = () => {
  return (
    <SettingsServerScope>
      <SettingsMcpContent />
    </SettingsServerScope>
  )
}

const SettingsMcpContent: Component = () => {
  const language = useLanguage()
  const dialog = useDialog()
  const serverSync = useServerSync()
  const layout = useLayout()

  const directory = createMemo(() => {
    const selection = layout.home.selection()
    if (selection.directory) return selection.directory
    const projects = layout.projects.list()
    return projects[0]?.worktree
  })

  const mcpMap = createMemo(() => {
    const dir = directory()
    if (!dir) return {} as Record<string, { status: string; error?: string }>
    const child = serverSync().child(dir, { bootstrap: true, mcp: true })[0]
    return (child.mcp ?? {}) as Record<string, { status: string; error?: string }>
  })

  const items = createMemo(() =>
    Object.entries(mcpMap())
      .map(([name, status]) => ({ name, status: status.status }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  )

  const toggle = useMutation(() => ({
    mutationFn: async (name: string) => {
      const dir = directory()
      if (!dir) throw new Error(language.t("dialog.mcp.empty"))
      await serverSync().mcp.toggle(dir, name)
    },
    onError: (error) =>
      showToast({
        variant: "error",
        title: language.t("common.requestFailed"),
        description: error instanceof Error ? error.message : String(error),
      }),
  }))

  const openConfig = () => {
    void dialog.show(() => (
      <DialogConfigEditor
        title={language.t("settings.mcp.title")}
        description={language.t("settings.mcp.description")}
        focusKey="mcp"
      />
    ))
  }

  return (
    <>
      <div class="settings-v2-tab-header">
        <h2 class="settings-v2-tab-title">{language.t("settings.mcp.title")}</h2>
      </div>

      <div class="settings-v2-tab-body">
        <div class="settings-v2-section">
          <p class="text-12-regular text-text-weak">{language.t("settings.mcp.description")}</p>
          <SettingsListV2>
            <SettingsRowV2 title={language.t("settings.mcp.editConfig")} description={language.t("settings.mcp.editConfig.description")}>
              <ButtonV2 size="normal" variant="neutral" onClick={openConfig}>
                {language.t("configEditor.open")}
              </ButtonV2>
            </SettingsRowV2>
            <Show when={directory()}>
              {(dir) => (
                <SettingsRowV2 title={language.t("settings.mcp.workspace")} description={dir()}>
                  <span class="text-11-regular text-text-weaker font-mono truncate max-w-[220px]">{dir()}</span>
                </SettingsRowV2>
              )}
            </Show>
            <Show when={!directory()}>
              <div class="settings-v2-provider-empty py-3">{language.t("settings.mcp.noWorkspace")}</div>
            </Show>
          </SettingsListV2>
        </div>

        <div class="settings-v2-section">
          <h3 class="settings-v2-section-title">{language.t("settings.mcp.servers")}</h3>
          <SettingsListV2>
            <Show
              when={items().length > 0}
              fallback={<div class="settings-v2-provider-empty py-3">{language.t("dialog.mcp.empty")}</div>}
            >
              <For each={items()}>
                {(item) => {
                  const entry = () => mcpMap()[item.name]
                  const status = () => entry()?.status
                  const statusLabel = () => {
                    const key = status() ? statusLabels[status() as keyof typeof statusLabels] : undefined
                    if (!key) return
                    return language.t(key)
                  }
                  const error = () => {
                    const s = entry()
                    if (s?.status === "failed" || s?.status === "needs_client_registration") return s.error
                  }
                  const enabled = () => status() === "connected"
                  return (
                    <SettingsRowV2
                      title={item.name}
                      description={[statusLabel(), error()].filter(Boolean).join(" — ")}
                    >
                      <Switch
                        checked={enabled()}
                        disabled={!directory() || (toggle.isPending && toggle.variables === item.name)}
                        onChange={() => {
                          if (toggle.isPending) return
                          toggle.mutate(item.name)
                        }}
                        hideLabel
                      >
                        {item.name}
                      </Switch>
                    </SettingsRowV2>
                  )
                }}
              </For>
            </Show>
          </SettingsListV2>
        </div>
      </div>
    </>
  )
}
