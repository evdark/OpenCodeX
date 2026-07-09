import { notifySessionTabsRemoved } from "@/components/titlebar-session-events"
import type { ServerConnection } from "@/context/server"

type HomeSession = {
  id: string
  directory: string
}

type SessionUpdate = {
  directory: string
  sessionID: string
  time: { archived?: number | null }
}

export async function archiveHomeSession(input: {
  server: ServerConnection.Key
  session: HomeSession
  update: (value: SessionUpdate) => Promise<unknown>
  remove: () => void
  onError?: (error: unknown) => void
}) {
  await input
    .update({
      directory: input.session.directory,
      sessionID: input.session.id,
      time: { archived: Date.now() },
    })
    .then(() => {
      input.remove()
      notifySessionTabsRemoved({
        server: input.server,
        directory: input.session.directory,
        sessionIDs: [input.session.id],
      })
    })
    .catch((error) => input.onError?.(error))
}

/** Clear archive timestamp so the session returns to the active list. */
export async function restoreArchivedHomeSession(input: {
  server: ServerConnection.Key
  session: HomeSession
  update: (value: SessionUpdate) => Promise<unknown>
  onError?: (error: unknown) => void
}) {
  await input
    .update({
      directory: input.session.directory,
      sessionID: input.session.id,
      // null clears time_archived (handler treats undefined as "skip")
      time: { archived: null },
    })
    .catch((error) => input.onError?.(error))
}

export async function deleteArchivedHomeSession(input: {
  server: ServerConnection.Key
  session: HomeSession
  children: (session: HomeSession) => Promise<HomeSession[]>
  remove: () => Promise<unknown>
  onError?: (error: unknown) => void
}) {
  const children = await collectSessionChildren(input.session, input.children).catch(() => [])
  return input
    .remove()
    .then(() => {
      notifySessionTabsRemoved({
        server: input.server,
        directory: input.session.directory,
        sessionIDs: [input.session.id, ...children.map((session) => session.id)],
      })
      return true
    })
    .catch((error) => {
      input.onError?.(error)
      return false
    })
}

function collectSessionChildren(
  session: HomeSession,
  children: (session: HomeSession) => Promise<HomeSession[]>,
): Promise<HomeSession[]> {
  return children(session).then((items) =>
    Promise.all(items.map((item) => collectSessionChildren(item, children))).then((nested) => [
      ...items,
      ...nested.flat(),
    ]),
  )
}
