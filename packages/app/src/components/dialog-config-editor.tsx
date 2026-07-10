import { createEffect, createSignal, Show, type Component } from "solid-js"
import { Dialog as DialogV2, DialogBody, DialogHeader, DialogTitleGroup } from "@opencode-ai/ui/v2/dialog-v2"
import { ButtonV2 } from "@opencode-ai/ui/v2/button-v2"
import { useLanguage } from "@/context/language"
import { useServerSync } from "@/context/server-sync"
import { showToast } from "@/utils/toast"
import type { Config } from "@opencode-ai/sdk/v2/client"

function pretty(config: Config) {
  return JSON.stringify(config, null, 2)
}

/** In-app JSON config editor so users do not need an external .jsonc app. */
export const DialogConfigEditor: Component<{
  title?: string
  description?: string
  /** When set, only this top-level key is edited (e.g. plugin, mcp). */
  focusKey?: keyof Config
}> = (props) => {
  const language = useLanguage()
  const serverSync = useServerSync()
  const [text, setText] = createSignal("")
  const [error, setError] = createSignal("")
  const [saving, setSaving] = createSignal(false)

  createEffect(() => {
    const config = serverSync().data.config
    if (props.focusKey) {
      const slice = { [props.focusKey]: config[props.focusKey] }
      setText(pretty(slice as Config))
      return
    }
    setText(pretty(config))
  })

  const save = async () => {
    setError("")
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(text()) as Record<string, unknown>
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      return
    }

    setSaving(true)
    try {
      const next = props.focusKey
        ? ({ [props.focusKey]: parsed[props.focusKey as string] } as Config)
        : (parsed as Config)
      await serverSync().updateConfig(next)
      showToast({
        variant: "success",
        icon: "circle-check",
        title: language.t("configEditor.saved"),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      showToast({
        variant: "error",
        title: language.t("configEditor.failed"),
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setSaving(false)
    }
  }

  const path = () => serverSync().data.path.config

  return (
    <DialogV2 size="large" variant="settings">
      <DialogHeader closeLabel={language.t("common.close")}>
        <DialogTitleGroup
          title={props.title ?? language.t("configEditor.title")}
          description={props.description ?? language.t("configEditor.description")}
        />
        <ButtonV2 variant="neutral" disabled={saving()} onClick={() => void save()}>
          {language.t("common.save")}
        </ButtonV2>
      </DialogHeader>
      <DialogBody class="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <Show when={path()}>
          {(dir) => <div class="text-11-regular text-text-weaker font-mono truncate">{dir()}</div>}
        </Show>
        <textarea
          class="min-h-[360px] w-full flex-1 resize-y rounded-lg border border-border-weak-base bg-surface-base p-3 font-mono text-12-regular text-text-strong outline-none focus:border-border-strong-base"
          value={text()}
          spellcheck={false}
          onInput={(event) => setText(event.currentTarget.value)}
          aria-label={language.t("configEditor.title")}
        />
        <Show when={error()}>
          {(msg) => <div class="text-12-regular text-text-critical-base">{msg()}</div>}
        </Show>
      </DialogBody>
    </DialogV2>
  )
}
