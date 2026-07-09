import { createMemo } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { Persist, persisted } from "@/utils/persist"

export type PromptLibraryItem = {
  id: string
  name: string
  body: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

type PromptLibraryState = {
  items: PromptLibraryItem[]
}

const MAX_ITEMS = 100

function empty(): PromptLibraryState {
  return { items: [] }
}

function migrate(value: unknown): PromptLibraryState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return empty()
  const items = Array.isArray((value as PromptLibraryState).items)
    ? (value as PromptLibraryState).items.flatMap((item) => {
        if (!item || typeof item !== "object") return []
        const row = item as PromptLibraryItem
        if (typeof row.id !== "string" || typeof row.name !== "string" || typeof row.body !== "string") return []
        return [
          {
            id: row.id,
            name: row.name,
            body: row.body,
            tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
            createdAt: typeof row.createdAt === "number" ? row.createdAt : Date.now(),
            updatedAt: typeof row.updatedAt === "number" ? row.updatedAt : Date.now(),
          },
        ]
      })
    : []
  return { items }
}

export const { use: usePromptLibrary, provider: PromptLibraryProvider } = createSimpleContext({
  name: "PromptLibrary",
  gate: false,
  init: () => {
    const [store, setStore] = persisted(
      { ...Persist.global("prompt-library", ["prompt-library.v1"]), migrate },
      createStore(empty()),
    )

    return {
      items: createMemo(() => store.items),
      add(name: string, body: string, tags: string[] = []) {
        const now = Date.now()
        const item: PromptLibraryItem = {
          id: crypto.randomUUID(),
          name: name.trim() || "Untitled prompt",
          body: body.trim(),
          tags,
          createdAt: now,
          updatedAt: now,
        }
        if (!item.body) return
        setStore(
          "items",
          produce((list) => {
            list.unshift(item)
            if (list.length > MAX_ITEMS) list.length = MAX_ITEMS
          }),
        )
        return item.id
      },
      update(id: string, patch: Partial<Pick<PromptLibraryItem, "name" | "body" | "tags">>) {
        setStore(
          "items",
          produce((list) => {
            const item = list.find((row) => row.id === id)
            if (!item) return
            if (patch.name !== undefined) item.name = patch.name
            if (patch.body !== undefined) item.body = patch.body
            if (patch.tags !== undefined) item.tags = patch.tags
            item.updatedAt = Date.now()
          }),
        )
      },
      remove(id: string) {
        setStore(
          "items",
          produce((list) => {
            const index = list.findIndex((row) => row.id === id)
            if (index >= 0) list.splice(index, 1)
          }),
        )
      },
    }
  },
})
