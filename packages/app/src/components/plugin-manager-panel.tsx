import { For, Show, createMemo } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { useLanguage } from "@/context/language"
import { useServerSync } from "@/context/server-sync"
import { configPluginIds } from "@/utils/config-plugin"
import { DialogConfigEditor } from "./dialog-config-editor"

/** Compact panel kept for legacy surfaces; primary UX is Settings → Plugins. */
export function PluginManagerPanel() {
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
    <div class="flex flex-col gap-3 rounded-lg border border-border-weak-base bg-surface-base p-4">
      <div>
        <div class="text-14-medium text-text-strong">{language.t("pluginManager.title")}</div>
        <div class="text-12-regular text-text-weak">{language.t("pluginManager.description")}</div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Button size="small" variant="secondary" onClick={openConfig}>
          {language.t("configEditor.open")}
        </Button>
        <Show when={configDir()}>
          {(dir) => <div class="text-11-regular text-text-weaker font-mono truncate max-w-full">{dir()}</div>}
        </Show>
      </div>

      <div class="text-12-regular text-text-weak">{language.t("pluginManager.hint")}</div>

      <div>
        <div class="mb-2 text-12-medium text-text-strong">{language.t("pluginManager.installedList")}</div>
        <Show
          when={installed().length > 0}
          fallback={<div class="text-12-regular text-text-weak">{language.t("pluginManager.noneInstalled")}</div>}
        >
          <ul class="flex flex-col gap-1">
            <For each={installed()}>
              {(plugin) => (
                <li class="rounded-md border border-border-weak-base px-2 py-1.5 text-12-regular text-text-strong font-mono truncate">
                  {plugin}
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </div>
  )
}
