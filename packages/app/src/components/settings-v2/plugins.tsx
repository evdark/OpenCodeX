import { For, Show, type Component, createMemo } from "solid-js"
import { ButtonV2 } from "@opencode-ai/ui/v2/button-v2"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { useLanguage } from "@/context/language"
import { useServerSync } from "@/context/server-sync"
import { configPluginIds } from "@/utils/config-plugin"
import { DialogConfigEditor } from "../dialog-config-editor"
import { SettingsListV2 } from "./parts/list"
import { SettingsRowV2 } from "./parts/row"
import { SettingsServerScope } from "../settings-server-picker"
import "./settings-v2.css"

export const SettingsPluginsV2: Component = () => {
  return (
    <SettingsServerScope>
      <SettingsPluginsContent />
    </SettingsServerScope>
  )
}

const SettingsPluginsContent: Component = () => {
  const language = useLanguage()
  const dialog = useDialog()
  const serverSync = useServerSync()

  const installed = createMemo(() => configPluginIds(serverSync().data.config.plugin))
  const configDir = createMemo(() => serverSync().data.path.config)

  const openConfig = () => {
    void dialog.show(() => (
      <DialogConfigEditor
        title={language.t("pluginManager.title")}
        description={language.t("pluginManager.description")}
        focusKey="plugin"
      />
    ))
  }

  return (
    <>
      <div class="settings-v2-tab-header">
        <h2 class="settings-v2-tab-title">{language.t("pluginManager.title")}</h2>
      </div>

      <div class="settings-v2-tab-body">
        <div class="settings-v2-section">
          <p class="text-12-regular text-text-weak">{language.t("pluginManager.description")}</p>
          <SettingsListV2>
            <SettingsRowV2 title={language.t("pluginManager.install")} description={language.t("pluginManager.hint")}>
              <ButtonV2 size="normal" variant="neutral" onClick={openConfig}>
                {language.t("configEditor.open")}
              </ButtonV2>
            </SettingsRowV2>
            <Show when={configDir()}>
              {(dir) => (
                <SettingsRowV2 title={language.t("pluginManager.pathReady")} description={dir()}>
                  <span class="text-11-regular text-text-weaker font-mono truncate max-w-[220px]">{dir()}</span>
                </SettingsRowV2>
              )}
            </Show>
          </SettingsListV2>
        </div>

        <div class="settings-v2-section">
          <h3 class="settings-v2-section-title">{language.t("pluginManager.installedList")}</h3>
          <SettingsListV2>
            <Show
              when={installed().length > 0}
              fallback={
                <div class="settings-v2-provider-empty py-3">{language.t("pluginManager.noneInstalled")}</div>
              }
            >
              <For each={installed()}>
                {(plugin) => (
                  <div class="settings-v2-provider-row">
                    <span class="font-mono text-12-regular text-text-strong truncate">{plugin}</span>
                  </div>
                )}
              </For>
            </Show>
          </SettingsListV2>
        </div>
      </div>
    </>
  )
}
