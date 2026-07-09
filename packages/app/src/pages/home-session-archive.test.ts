import { expect, test } from "bun:test"
import { SESSION_TABS_REMOVED_EVENT, readSessionTabsRemovedDetail } from "@/components/titlebar-session-events"
import { archiveHomeSession, deleteArchivedHomeSession, restoreArchivedHomeSession } from "./home-session-archive"
import type { ServerConnection } from "@/context/server"

const remote = "remote" as ServerConnection.Key

test("archiving a Home session removes its open titlebar tab", async () => {
  let detail: ReturnType<typeof readSessionTabsRemovedDetail>
  let removed = false
  window.addEventListener(
    SESSION_TABS_REMOVED_EVENT,
    (event) => {
      detail = readSessionTabsRemovedDetail(event)
    },
    { once: true },
  )

  await archiveHomeSession({
    server: remote,
    session: { id: "ses_1", directory: "/workspace" },
    update: async () => undefined,
    remove: () => {
      removed = true
    },
  })

  expect(removed).toBe(true)
  expect(detail).toEqual({ server: remote, directory: "/workspace", sessionIDs: ["ses_1"] })
})

test("reports archive failures without removing the session", async () => {
  const failure = new Error("offline")
  let error: unknown
  let removed = false

  await archiveHomeSession({
    server: remote,
    session: { id: "ses_1", directory: "/workspace" },
    update: async () => Promise.reject(failure),
    remove: () => {
      removed = true
    },
    onError: (value) => {
      error = value
    },
  })

  expect(error).toBe(failure)
  expect(removed).toBe(false)
})

test("deleting an archived Home session removes descendant titlebar tabs", async () => {
  let detail: ReturnType<typeof readSessionTabsRemovedDetail>
  let removed = false
  window.addEventListener(
    SESSION_TABS_REMOVED_EVENT,
    (event) => {
      detail = readSessionTabsRemovedDetail(event)
    },
    { once: true },
  )

  const ok = await deleteArchivedHomeSession({
    server: remote,
    session: { id: "ses_parent", directory: "/workspace" },
    children: async (session) => {
      if (session.id === "ses_parent") return [{ id: "ses_child", directory: "/workspace" }]
      if (session.id === "ses_child") return [{ id: "ses_grandchild", directory: "/workspace" }]
      return []
    },
    remove: async () => {
      removed = true
    },
  })

  expect(ok).toBe(true)
  expect(removed).toBe(true)
  expect(detail).toEqual({
    server: remote,
    directory: "/workspace",
    sessionIDs: ["ses_parent", "ses_child", "ses_grandchild"],
  })
})

test("restoring an archived session clears the archive timestamp", async () => {
  let update: { directory: string; sessionID: string; time: { archived?: number | null } } | undefined
  await restoreArchivedHomeSession({
    server: remote,
    session: { id: "ses_1", directory: "/workspace" },
    update: async (value) => {
      update = value
    },
  })
  expect(update).toEqual({
    directory: "/workspace",
    sessionID: "ses_1",
    time: { archived: null },
  })
})

test("reports archived session delete failures without closing tabs", async () => {
  const failure = new Error("delete failed")
  let error: unknown
  let closed = false
  window.addEventListener(
    SESSION_TABS_REMOVED_EVENT,
    () => {
      closed = true
    },
    { once: true },
  )

  const ok = await deleteArchivedHomeSession({
    server: remote,
    session: { id: "ses_1", directory: "/workspace" },
    children: async () => [],
    remove: async () => Promise.reject(failure),
    onError: (value) => {
      error = value
    },
  })

  expect(ok).toBe(false)
  expect(error).toBe(failure)
  expect(closed).toBe(false)
})
