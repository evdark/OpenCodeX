import { For, Show, createSignal } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { showToast } from "@/utils/toast"
import { useLanguage } from "@/context/language"
import { usePromptLibrary } from "@/context/prompt-library"

export function PromptLibraryPanel(props: { onInsert?: (body: string) => void }) {
  const language = useLanguage()
  const library = usePromptLibrary()
  const [name, setName] = createSignal("")
  const [body, setBody] = createSignal("")

  const save = () => {
    const id = library.add(name(), body())
    if (!id) return
    setName("")
    setBody("")
    showToast({
      variant: "success",
      title: language.t("promptLibrary.saved"),
    })
  }

  return (
    <div class="flex flex-col gap-3 rounded-lg border border-border-weak-base bg-surface-base p-4">
      <div>
        <div class="text-14-medium text-text-strong">{language.t("promptLibrary.title")}</div>
        <div class="text-12-regular text-text-weak">{language.t("promptLibrary.description")}</div>
      </div>

      <div class="flex flex-col gap-2">
        <input
          class="h-8 rounded-md border border-border-weak-base bg-background-base px-2 text-13-regular"
          placeholder={language.t("promptLibrary.namePlaceholder")}
          value={name()}
          onInput={(event) => setName(event.currentTarget.value)}
        />
        <textarea
          class="min-h-20 rounded-md border border-border-weak-base bg-background-base px-2 py-1 text-13-regular"
          placeholder={language.t("promptLibrary.bodyPlaceholder")}
          value={body()}
          onInput={(event) => setBody(event.currentTarget.value)}
        />
        <Button size="small" variant="secondary" onClick={save} disabled={!body().trim()}>
          {language.t("promptLibrary.save")}
        </Button>
      </div>

      <Show
        when={library.items().length > 0}
        fallback={<div class="text-12-regular text-text-weak">{language.t("promptLibrary.empty")}</div>}
      >
        <div class="flex max-h-56 flex-col gap-2 overflow-y-auto">
          <For each={library.items()}>
            {(item) => (
              <div class="flex items-start justify-between gap-2 rounded-md border border-border-weak-base p-2">
                <div class="min-w-0">
                  <div class="truncate text-13-medium text-text-strong">{item.name}</div>
                  <div class="line-clamp-2 text-12-regular text-text-weak">{item.body}</div>
                </div>
                <div class="flex shrink-0 gap-1">
                  <Button
                    size="small"
                    variant="ghost"
                    onClick={() => {
                      if (props.onInsert) {
                        props.onInsert(item.body)
                        showToast({ title: language.t("promptLibrary.inserted") })
                        return
                      }
                      // Settings surface has no composer — copy for paste into prompt.
                      void navigator.clipboard.writeText(item.body).then(
                        () =>
                          showToast({
                            variant: "success",
                            title: language.t("promptLibrary.copied"),
                          }),
                        () =>
                          showToast({
                            variant: "error",
                            title: language.t("promptLibrary.copyFailed"),
                          }),
                      )
                    }}
                  >
                    {props.onInsert ? language.t("promptLibrary.insert") : language.t("promptLibrary.copy")}
                  </Button>
                  <Button size="small" variant="ghost" onClick={() => library.remove(item.id)}>
                    {language.t("common.delete")}
                  </Button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
