import { For, createMemo, createSignal } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { showToast } from "@/utils/toast"
import { useLanguage } from "@/context/language"
import { useServerSync } from "@/context/server-sync"
import { CURATED_PLUGIN_BUNDLE } from "@/context/opencode-plus-runtime"
import { configPluginIds, configPluginIncludes } from "@/utils/config-plugin"

export function PluginManagerPanel() {
  const language = useLanguage()
  const serverSync = useServerSync()
  const [busy, setBusy] = createSignal<string>()

  const installed = createMemo(() => configPluginIds(serverSync().data.config.plugin))
  const isInstalled = (npm: string) => configPluginIncludes(serverSync().data.config.plugin, npm)

  const addPlugin = async (npm: string) => {
    // Only curated package ids are installable from this UI (no free-form shell/path injection).
    const allowed = CURATED_PLUGIN_BUNDLE.some((item) => item.npm === npm)
    if (!allowed) {
      showToast({ variant: "error", title: language.t("pluginManager.failed"), description: npm })
      return
    }
    if (isInstalled(npm)) {
      showToast({ title: language.t("pluginManager.alreadyInstalled") })
      return
    }
    setBusy(npm)
    const before = serverSync().data.config.plugin
    const previous = Array.isArray(before) ? before.slice() : []
    const next = [...previous, npm]
    try {
      serverSync().set("config", "plugin", next)
      await serverSync().updateConfig({ plugin: next })
      showToast({
        variant: "success",
        title: language.t("pluginManager.installed"),
        description: npm,
      })
    } catch (error) {
      serverSync().set("config", "plugin", previous)
      showToast({
        variant: "error",
        title: language.t("pluginManager.failed"),
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setBusy(undefined)
    }
  }

  return (
    <div class="flex flex-col gap-3 rounded-lg border border-border-weak-base bg-surface-base p-4">
      <div>
        <div class="text-14-medium text-text-strong">{language.t("pluginManager.title")}</div>
        <div class="text-12-regular text-text-weak">{language.t("pluginManager.description")}</div>
      </div>

      <div>
        <div class="mb-2 text-12-medium text-text-strong">{language.t("pluginManager.curated")}</div>
        <div class="flex flex-col gap-2">
          <For each={[...CURATED_PLUGIN_BUNDLE]}>
            {(plugin) => (
              <div class="flex items-center justify-between gap-2 rounded-md border border-border-weak-base p-2">
                <div class="min-w-0">
                  <div class="text-13-medium text-text-strong">{plugin.name}</div>
                  <div class="text-12-regular text-text-weak">{plugin.description}</div>
                  <div class="text-11-regular text-text-weaker">{plugin.npm}</div>
                </div>
                <Button
                  size="small"
                  variant={isInstalled(plugin.npm) ? "ghost" : "secondary"}
                  disabled={busy() === plugin.npm || isInstalled(plugin.npm)}
                  onClick={() => void addPlugin(plugin.npm)}
                >
                  {isInstalled(plugin.npm)
                    ? language.t("pluginManager.installedLabel")
                    : language.t("pluginManager.install")}
                </Button>
              </div>
            )}
          </For>
        </div>
      </div>

      <div>
        <div class="mb-2 text-12-medium text-text-strong">{language.t("pluginManager.installedList")}</div>
        <div class="text-12-regular text-text-weak">
          {installed().length > 0 ? installed().join(", ") : language.t("pluginManager.noneInstalled")}
        </div>
      </div>
    </div>
  )
}
