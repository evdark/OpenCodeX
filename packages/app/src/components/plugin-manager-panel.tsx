import { For, Show, createMemo } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { showToast } from "@/utils/toast"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { useServerSync } from "@/context/server-sync"
import { configPluginIds } from "@/utils/config-plugin"

function configFileCandidates(configDir: string) {
  const sep = configDir.includes("\\") ? "\\" : "/"
  const base = configDir.endsWith(sep) ? configDir.slice(0, -1) : configDir
  return [`${base}${sep}opencode.jsonc`, `${base}${sep}opencode.json`]
}

export function PluginManagerPanel() {
  const language = useLanguage()
  const platform = usePlatform()
  const serverSync = useServerSync()

  const installed = createMemo(() => configPluginIds(serverSync().data.config.plugin))
  const configDir = createMemo(() => serverSync().data.path.config)

  const openConfig = async () => {
    const dir = configDir()
    if (!dir) {
      showToast({
        variant: "error",
        title: language.t("pluginManager.failed"),
        description: language.t("pluginManager.noConfigPath"),
      })
      return
    }

    const candidates = configFileCandidates(dir)
    // Prefer jsonc when present; fall back to json (created if neither exists via first path).
    const primary = candidates[0]

    if (platform.openPath) {
      try {
        // Try jsonc first, then json — openPath fails only if path is invalid on some hosts.
        for (const path of candidates) {
          try {
            await platform.openPath(path)
            showToast({
              variant: "success",
              title: language.t("pluginManager.opened"),
              description: path,
            })
            return
          } catch {
            // try next candidate
          }
        }
        await platform.openPath(primary)
        showToast({
          variant: "success",
          title: language.t("pluginManager.opened"),
          description: primary,
        })
        return
      } catch (error) {
        showToast({
          variant: "error",
          title: language.t("pluginManager.failed"),
          description: error instanceof Error ? error.message : String(error),
        })
        return
      }
    }

    // Web / no native open: open a small helper tab with the path to copy.
    showToast({
      title: language.t("pluginManager.pathReady"),
      description: primary,
    })
    try {
      await navigator.clipboard.writeText(primary)
    } catch {
      // clipboard may be unavailable
    }
  }

  return (
    <div class="flex flex-col gap-3 rounded-lg border border-border-weak-base bg-surface-base p-4">
      <div>
        <div class="text-14-medium text-text-strong">{language.t("pluginManager.title")}</div>
        <div class="text-12-regular text-text-weak">{language.t("pluginManager.description")}</div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Button size="small" variant="secondary" onClick={() => void openConfig()}>
          {language.t("pluginManager.install")}
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
