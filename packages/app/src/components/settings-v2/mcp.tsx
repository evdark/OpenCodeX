import { For, Show, type Component, createMemo } from "solid-js"
import { ButtonV2 } from "@opencode-ai/ui/v2/button-v2"
import { Switch } from "@opencode-ai/ui/v2/switch-v2"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { useLanguage } from "@/context/language"
import { useSync } from "@/context/sync"
import { useMcpToggle } from "@/context/mcp"
import { DialogConfigEditor } from "../dialog-config-editor"
import { SettingsListV2 } from "./parts/list"
import { SettingsRowV2 } from "./parts/row"
import "./settings-v2.css"

const statusLabels = {
  connected: "mcp.status.connected",
  failed: "mcp.status.failed",
  needs_auth: "mcp.status.needs_auth",
  needs_client_registration: "mcp.status.needs_client_registration",
  disabled: "mcp.status.disabled",
} as const

export const SettingsMcpV2: Component = () => {
  const language = useLanguage()
  const dialog = useDialog()
  const sync = useSync()
  const toggle = useMcpToggle()

  const items = createMemo(() =>
    Object.entries(sync().data.mcp ?? {})
      .map(([name, status]) => ({ name, status: status.status }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  )

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
                  const mcpStatus = () => sync().data.mcp[item.name]
                  const status = () => mcpStatus()?.status
                  const statusLabel = () => {
                    const key = status() ? statusLabels[status() as keyof typeof statusLabels] : undefined
                    if (!key) return
                    return language.t(key)
                  }
                  const error = () => {
                    const s = mcpStatus()
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
                        disabled={toggle.isPending && toggle.variables === item.name}
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
