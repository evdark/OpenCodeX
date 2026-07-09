import { createEffect, createMemo } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { Persist, persisted } from "@/utils/persist"

export type ProviderProfile = {
  id: string
  name: string
  enabledProviders: string[]
}

type ProviderProfilesState = {
  profiles: ProviderProfile[]
  active?: string
}

const LEGACY_STORAGE_KEY = "opencode-provider-profiles"

function empty(): ProviderProfilesState {
  return { profiles: [] }
}

function migrate(value: unknown): ProviderProfilesState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return empty()
  const source = value as ProviderProfilesState & { items?: ProviderProfile[] }
  const raw = Array.isArray(source.profiles) ? source.profiles : Array.isArray(source.items) ? source.items : []
  const profiles = raw.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const row = item as ProviderProfile
    if (typeof row.id !== "string" || typeof row.name !== "string") return []
    return [
      {
        id: row.id,
        name: row.name,
        enabledProviders: Array.isArray(row.enabledProviders)
          ? row.enabledProviders.filter((id): id is string => typeof id === "string")
          : [],
      },
    ]
  })
  const active = typeof source.active === "string" ? source.active : undefined
  return {
    profiles,
    active: active && profiles.some((profile) => profile.id === active) ? active : undefined,
  }
}

function loadLegacyProfiles(): ProviderProfile[] {
  if (typeof localStorage !== "object") return []
  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return []
      const row = item as ProviderProfile
      if (typeof row.id !== "string" || typeof row.name !== "string") return []
      return [
        {
          id: row.id,
          name: row.name,
          enabledProviders: Array.isArray(row.enabledProviders)
            ? row.enabledProviders.filter((id): id is string => typeof id === "string")
            : [],
        },
      ]
    })
  } catch {
    return []
  }
}

export const { use: useProviderProfiles, provider: ProviderProfilesProvider } = createSimpleContext({
  name: "ProviderProfiles",
  gate: false,
  init: () => {
    const [store, setStore, , ready] = persisted(
      { ...Persist.global("provider-profiles", ["provider-profiles.v1"]), migrate },
      createStore(empty()),
    )

    // One-time migration from the first MVP raw localStorage key.
    createEffect(() => {
      if (!ready()) return
      if (store.profiles.length > 0) return
      const legacy = loadLegacyProfiles()
      if (legacy.length === 0) return
      setStore("profiles", legacy)
      try {
        localStorage.removeItem(LEGACY_STORAGE_KEY)
      } catch {
        // ignore quota / private mode
      }
    })

    return {
      profiles: createMemo(() => store.profiles),
      active: createMemo(() => store.active),
      create(name: string, enabledProviders: string[]) {
        if (!name.trim()) return
        const profile: ProviderProfile = {
          id: crypto.randomUUID(),
          name: name.trim(),
          enabledProviders: [...enabledProviders],
        }
        setStore(
          "profiles",
          produce((list) => {
            list.push(profile)
          }),
        )
      },
      remove(id: string) {
        setStore(
          produce((state) => {
            state.profiles = state.profiles.filter((profile) => profile.id !== id)
            if (state.active === id) state.active = undefined
          }),
        )
      },
      activate(id: string) {
        const profile = store.profiles.find((item) => item.id === id)
        if (!profile) return
        setStore("active", id)
        return profile.enabledProviders
      },
    }
  },
})
