import { Button } from "@opencode-ai/ui/button"
import { Icon } from "@opencode-ai/ui/icon"
import { createSignal, For, Show } from "solid-js"
import { useLanguage } from "@/context/language"
import { type ProviderProfile } from "@/context/provider-profiles"

export function ProviderProfilesPanel(props: {
  connectedProviderIDs: string[]
  profiles: ProviderProfile[]
  active?: string
  onCreate: (name: string, enabledProviders: string[]) => void
  onActivate: (id: string) => void
  onDelete: (id: string) => void
}) {
  const language = useLanguage()
  const [isCreating, setIsCreating] = createSignal(false)
  const [newProfileName, setNewProfileName] = createSignal("")

  const handleCreate = () => {
    if (!newProfileName().trim()) return
    props.onCreate(newProfileName(), props.connectedProviderIDs)
    setIsCreating(false)
    setNewProfileName("")
  }

  const isProfileActive = (profile: ProviderProfile) => {
    if (props.connectedProviderIDs.length !== profile.enabledProviders.length) return false
    const currentSet = new Set(props.connectedProviderIDs)
    return profile.enabledProviders.every((id) => currentSet.has(id))
  }

  return (
    <div class="flex flex-col gap-4 border border-border-weak-base rounded-lg p-4 bg-surface-base">
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <h3 class="text-14-medium text-text-strong">{language.t("settings.providers.profiles.title")}</h3>
          <p class="text-12-regular text-text-weak">{language.t("settings.providers.profiles.description")}</p>
        </div>
        <Show when={!isCreating()}>
          <Button variant="secondary" size="small" icon="plus-small" onClick={() => setIsCreating(true)}>
            {language.t("settings.providers.profiles.create")}
          </Button>
        </Show>
      </div>

      <Show when={isCreating()}>
        <div class="flex items-center gap-2 mt-2">
          <input
            autofocus
            placeholder={language.t("settings.providers.profiles.namePlaceholder")}
            value={newProfileName()}
            onInput={(event: Event) => setNewProfileName((event.currentTarget as HTMLInputElement).value)}
            onKeyDown={(event: KeyboardEvent) => {
              if (event.key === "Enter") handleCreate()
              if (event.key === "Escape") setIsCreating(false)
            }}
            class="h-8 text-13-regular flex-1 max-w-[200px] bg-transparent border-b border-border-weak-base focus:outline-none focus:border-border-strong-base px-2"
          />
          <Button size="small" variant="primary" onClick={handleCreate} disabled={!newProfileName().trim()}>
            {language.t("common.save")}
          </Button>
          <Button size="small" variant="ghost" onClick={() => setIsCreating(false)}>
            {language.t("common.cancel")}
          </Button>
        </div>
      </Show>

      <Show when={props.profiles.length > 0}>
        <div class="flex flex-col gap-2 mt-2 max-h-[150px] overflow-y-auto no-scrollbar">
          <For each={props.profiles}>
            {(profile) => {
              const active = isProfileActive(profile)
              return (
                <div class="flex items-center justify-between group rounded-md border border-border-weak-base bg-surface-stronger p-2">
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => props.onActivate(profile.id)}
                      class="text-13-medium hover:underline flex items-center gap-2"
                      title={
                        active
                          ? language.t("settings.providers.profiles.active")
                          : language.t("settings.providers.profiles.apply")
                      }
                    >
                      <Show when={active}>
                        <Icon name="check" class="w-4 h-4 text-green-500" />
                      </Show>
                      <span class={active ? "text-green-500" : "text-text-strong"}>{profile.name}</span>
                    </button>
                    <span class="text-12-regular text-text-weak">
                      ({profile.enabledProviders.length} {language.t("settings.providers.profiles.providersCount")})
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="small"
                    class="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-text-danger hover:text-text-danger hover:bg-surface-danger"
                    onClick={() => props.onDelete(profile.id)}
                  >
                    <Icon name="trash" class="w-4 h-4" />
                    <span class="sr-only">{language.t("common.delete")}</span>
                  </Button>
                </div>
              )
            }}
          </For>
        </div>
      </Show>
    </div>
  )
}
