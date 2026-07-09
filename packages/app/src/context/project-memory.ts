import { createMemo } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { Persist, persisted } from "@/utils/persist"
import { searchMemoryNotes, type MemoryNote } from "./opencode-plus-runtime"

type ProjectMemoryState = {
  notes: MemoryNote[]
}

const MAX_NOTES = 200

function empty(): ProjectMemoryState {
  return { notes: [] }
}

function migrate(value: unknown): ProjectMemoryState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return empty()
  const notes = Array.isArray((value as ProjectMemoryState).notes)
    ? (value as ProjectMemoryState).notes.flatMap((item) => {
        if (!item || typeof item !== "object") return []
        const row = item as MemoryNote
        if (typeof row.id !== "string" || typeof row.body !== "string") return []
        return [
          {
            id: row.id,
            title: typeof row.title === "string" ? row.title : "Note",
            body: row.body,
            tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
            source:
              row.source === "snapshot" || row.source === "project" || row.source === "manual" ? row.source : "manual",
            at: typeof row.at === "number" ? row.at : Date.now(),
            sessionID: typeof row.sessionID === "string" ? row.sessionID : undefined,
            directory: typeof row.directory === "string" ? row.directory : undefined,
          } satisfies MemoryNote,
        ]
      })
    : []
  return { notes }
}

export const { use: useProjectMemory, provider: ProjectMemoryProvider } = createSimpleContext({
  name: "ProjectMemory",
  gate: false,
  init: () => {
    const [store, setStore] = persisted(
      { ...Persist.global("project-memory", ["project-memory.v1"]), migrate },
      createStore(empty()),
    )

    const notes = createMemo(() => store.notes)

    const add = (input: Omit<MemoryNote, "id" | "at"> & { id?: string; at?: number }) => {
      const note: MemoryNote = {
        id: input.id ?? crypto.randomUUID(),
        title: input.title.trim() || "Memory",
        body: input.body.trim(),
        tags: input.tags,
        source: input.source,
        at: input.at ?? Date.now(),
        sessionID: input.sessionID,
        directory: input.directory,
      }
      if (!note.body) return
      setStore(
        "notes",
        produce((list) => {
          list.unshift(note)
          if (list.length > MAX_NOTES) list.length = MAX_NOTES
        }),
      )
      return note.id
    }

    return {
      notes,
      notesFor(directory?: string) {
        if (!directory) return notes()
        return notes().filter((note) => !note.directory || note.directory === directory)
      },
      add,
      snapshot(input: { title: string; body: string; sessionID?: string; directory?: string; tags?: string[] }) {
        return add({
          title: input.title,
          body: input.body,
          tags: input.tags ?? ["snapshot"],
          source: "snapshot",
          sessionID: input.sessionID,
          directory: input.directory,
        })
      },
      remove(id: string) {
        setStore(
          "notes",
          produce((list) => {
            const index = list.findIndex((row) => row.id === id)
            if (index >= 0) list.splice(index, 1)
          }),
        )
      },
      search(query: string, directory?: string) {
        return searchMemoryNotes(directory ? notes().filter((note) => !note.directory || note.directory === directory) : notes(), query)
      },
    }
  },
})
