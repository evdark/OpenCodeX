import { For, Show, createMemo, createSignal } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { showToast } from "@/utils/toast"
import { useLanguage } from "@/context/language"
import { useProjectMemory } from "@/context/project-memory"
import { useServerSync } from "@/context/server-sync"
import { useSettings } from "@/context/settings"

export function ProjectMemoryPanel(props: {
  sessionID?: string
  directory?: string
  snapshotBody?: () => string
}) {
  const language = useLanguage()
  const memory = useProjectMemory()
  const serverSync = useServerSync()
  const settings = useSettings()
  const [title, setTitle] = createSignal("")
  const [body, setBody] = createSignal("")
  const [query, setQuery] = createSignal("")

  // Prefer explicit prop / session directory; fall back to server path.
  // Do not use useSDK() — settings dialog is outside SDKProvider (Power User crash).
  const directory = createMemo(
    () => props.directory ?? serverSync().data.path.directory ?? serverSync().data.path.worktree ?? "",
  )
  const enabledSemantic = createMemo(
    () => settings.opencodePlus.experimental.enabled() && settings.opencodePlus.experimental.semanticMemory(),
  )
  const enabledSnapshot = createMemo(
    () => settings.opencodePlus.experimental.enabled() && settings.opencodePlus.experimental.snapshotMemory(),
  )

  const notes = createMemo(() => {
    const q = query().trim()
    const dir = directory() || undefined
    if (q && enabledSemantic()) return memory.search(q, dir)
    return memory.notes().filter((note) => !note.directory || !dir || note.directory === dir)
  })

  const save = () => {
    memory.add({
      title: title() || language.t("projectMemory.manualTitle"),
      body: body(),
      tags: ["manual"],
      source: "project",
      directory: directory() || undefined,
    })
    setTitle("")
    setBody("")
    showToast({ variant: "success", title: language.t("projectMemory.saved") })
  }

  const snapshot = () => {
    if (!enabledSnapshot()) return
    const content = props.snapshotBody?.() ?? body()
    if (!content.trim()) return
    memory.snapshot({
      title: title() || language.t("projectMemory.snapshotTitle"),
      body: content,
      sessionID: props.sessionID,
      directory: directory() || undefined,
    })
    showToast({ variant: "success", title: language.t("projectMemory.snapshotSaved") })
  }

  return (
    <div class="flex flex-col gap-3 rounded-lg border border-border-weak-base bg-surface-base p-4">
      <div>
        <div class="text-14-medium text-text-strong">{language.t("projectMemory.title")}</div>
        <div class="text-12-regular text-text-weak">{language.t("projectMemory.description")}</div>
      </div>

      <Show when={enabledSemantic()}>
        <input
          class="h-8 rounded-md border border-border-weak-base bg-background-base px-2 text-13-regular"
          placeholder={language.t("projectMemory.searchPlaceholder")}
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
      </Show>

      <input
        class="h-8 rounded-md border border-border-weak-base bg-background-base px-2 text-13-regular"
        placeholder={language.t("projectMemory.titlePlaceholder")}
        value={title()}
        onInput={(event) => setTitle(event.currentTarget.value)}
      />
      <textarea
        class="min-h-20 rounded-md border border-border-weak-base bg-background-base px-2 py-1 text-13-regular"
        placeholder={language.t("projectMemory.bodyPlaceholder")}
        value={body()}
        onInput={(event) => setBody(event.currentTarget.value)}
      />
      <div class="flex flex-wrap gap-2">
        <Button size="small" variant="secondary" onClick={save} disabled={!body().trim()}>
          {language.t("projectMemory.save")}
        </Button>
        <Show when={enabledSnapshot()}>
          <Button size="small" variant="ghost" onClick={snapshot}>
            {language.t("projectMemory.snapshot")}
          </Button>
        </Show>
      </div>

      <Show
        when={notes().length > 0}
        fallback={<div class="text-12-regular text-text-weak">{language.t("projectMemory.empty")}</div>}
      >
        <div class="flex max-h-56 flex-col gap-2 overflow-y-auto">
          <For each={notes()}>
            {(note) => (
              <div class="rounded-md border border-border-weak-base p-2">
                <div class="flex items-center justify-between gap-2">
                  <div class="truncate text-13-medium text-text-strong">{note.title}</div>
                  <Button size="small" variant="ghost" onClick={() => memory.remove(note.id)}>
                    {language.t("common.delete")}
                  </Button>
                </div>
                <div class="text-11-regular text-text-weaker">
                  {note.source} · {new Date(note.at).toLocaleString()}
                </div>
                <div class="mt-1 line-clamp-3 text-12-regular text-text-weak">{note.body}</div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
