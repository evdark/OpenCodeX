import { getFilename } from "@opencode-ai/core/util/path"
import type { Session } from "@opencode-ai/sdk/v2/client"
import { Icon as IconV2 } from "@opencode-ai/ui/v2/icon"
import { MenuV2 } from "@opencode-ai/ui/v2/menu-v2"
import { ScrollView } from "@opencode-ai/ui/scroll-view"
import { createEffect, createMemo, createResource, For, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { useGlobal } from "@/context/global"
import { useLanguage } from "@/context/language"
import { ServerConnection, serverName } from "@/context/server"
import { displayName, projectForSession, sortedRootSessions } from "@/pages/layout/helpers"
import { SessionTabAvatar } from "@/pages/layout/session-tab-avatar"
import { sessionHref } from "@/utils/session-route"
import { sessionTitle } from "@/utils/session-title"
import { pathKey } from "@/utils/path-key"

const SESSION_PICKER_LIMIT = 30

export function TitlebarSessionPicker(props: {
  server: ServerConnection.Key
  directory?: string
  session?: Session
  onNewSession: () => void
}) {
  const global = useGlobal()
  const language = useLanguage()
  const navigate = useNavigate()
  const conn = createMemo(() => global.servers.list().find((item) => ServerConnection.key(item) === props.server))
  const ctx = createMemo(() => {
    const current = conn()
    if (current) return global.ensureServerCtx(current)
  })
  const directory = createMemo(() => props.directory ?? props.session?.directory)
  const project = createMemo(() => {
    const current = ctx()
    const dir = directory()
    if (!current || !dir) return
    if (props.session) return projectForSession(props.session, current.projects.list())
    const key = pathKey(dir)
    return current.projects
      .list()
      .find((item) => pathKey(item.worktree) === key || item.sandboxes?.some((sandbox) => pathKey(sandbox) === key))
  })
  const projectName = createMemo(() => {
    const current = project()
    if (current) return displayName(current)
    const dir = directory()
    return dir ? getFilename(dir) || dir : language.t("home.title")
  })
  const currentTitle = createMemo(() => sessionTitle(props.session?.title) || language.t("command.session.new"))

  const [sessionsLoad] = createResource(
    () => {
      const current = ctx()
      const dir = directory()
      if (!current || !dir) return
      return { current, dir }
    },
    ({ current, dir }) => current.sync.project.loadSessions(dir, { limit: SESSION_PICKER_LIMIT }),
  )
  const childStore = createMemo(() => {
    const current = ctx()
    const dir = directory()
    if (!current || !dir) return
    return current.sync.child(dir, { bootstrap: false })[0]
  })
  const sessions = createMemo(() =>
    childStore() ? sortedRootSessions(childStore()!, Date.now()).slice(0, SESSION_PICKER_LIMIT) : [],
  )
  const activeSessionID = createMemo(() => props.session?.parentID ?? props.session?.id)
  const showServer = createMemo(() => global.servers.list().length > 1)

  createEffect(() => {
    sessionsLoad()
  })

  return (
    <MenuV2 modal={false} placement="bottom-start" gutter={6}>
      <MenuV2.Trigger
        as="button"
        type="button"
        class="group flex h-7 min-w-0 max-w-[320px] shrink items-center gap-2 rounded-[7px] px-2 text-left text-v2-text-text-muted transition-colors duration-150 hover:bg-v2-overlay-simple-overlay-hover hover:text-v2-text-text-base focus-visible:bg-v2-overlay-simple-overlay-hover focus-visible:outline-none focus-visible:[box-shadow:var(--v2-focus-ring)] data-[expanded]:bg-v2-background-bg-layer-02 data-[expanded]:text-v2-text-text-base"
        aria-label={language.t("sidebar.project.recentSessions")}
      >
        <Show
          when={props.session}
          fallback={
            <span class="flex size-4 shrink-0 items-center justify-center text-v2-icon-icon-muted">
              <IconV2 name="folder" size="small" />
            </span>
          }
        >
          {(session) => (
            <SessionTabAvatar
              project={project()}
              directory={session().directory}
              sessionId={session().id}
              server={props.server}
              revealProjectOnHover={false}
            />
          )}
        </Show>
        <span class="flex min-w-0 flex-col">
          <span class="min-w-0 truncate text-[11px] leading-3 text-v2-text-text-faint">{projectName()}</span>
          <span class="min-w-0 truncate text-[13px] leading-4 text-v2-text-text-base [font-weight:530]">
            {currentTitle()}
          </span>
        </span>
        <IconV2 name="chevron-down" size="small" class="shrink-0 text-v2-icon-icon-muted" />
      </MenuV2.Trigger>
      <MenuV2.Portal>
        <MenuV2.Content class="w-[320px] overflow-hidden rounded-md border-0 bg-v2-background-bg-layer-01 !p-0 shadow-[var(--v2-elevation-floating)] focus:outline-none">
          <div class="flex min-w-0 flex-col gap-0.5 p-2">
            <div class="flex min-w-0 items-center gap-2 px-1.5 py-1">
              <div class="min-w-0 flex-1">
                <div class="truncate text-[13px] leading-4 text-v2-text-text-base [font-weight:530]">
                  {projectName()}
                </div>
                <Show when={showServer() && conn()}>
                  {(current) => (
                    <div class="truncate text-[12px] leading-4 text-v2-text-text-faint">{serverName(current())}</div>
                  )}
                </Show>
              </div>
            </div>
            <MenuV2.Item class="h-8" onSelect={props.onNewSession}>
              <IconV2 name="edit" size="small" />
              <span class="min-w-0 flex-1 truncate">{language.t("command.session.new")}</span>
            </MenuV2.Item>
          </div>
          <div class="h-px bg-v2-border-border-muted" />
          <ScrollView data-slot="titlebar-session-picker-scroll" class="max-h-[300px] min-h-0">
            <div class="flex min-w-0 flex-col p-0.5">
              <Show
                when={sessions().length > 0}
                fallback={
                  <div class="flex h-12 items-center px-3 text-[13px] leading-5 text-v2-text-text-faint">
                    {sessionsLoad.loading
                      ? `${language.t("common.loading")}${language.t("common.loading.ellipsis")}`
                      : language.t("home.sessions.empty")}
                  </div>
                }
              >
                <MenuV2.Group>
                  <MenuV2.GroupLabel class="px-3">{language.t("sidebar.project.recentSessions")}</MenuV2.GroupLabel>
                  <For each={sessions()}>
                    {(session) => {
                      const title = () => sessionTitle(session.title) || session.id
                      const selected = () => activeSessionID() === session.id
                      return (
                        <MenuV2.Item
                          class="h-9"
                          classList={{ "!bg-v2-overlay-simple-overlay-pressed": selected() }}
                          onSelect={() => navigate(sessionHref(props.server, session.id))}
                        >
                          <SessionTabAvatar
                            project={projectForSession(session, ctx()?.projects.list() ?? [])}
                            directory={session.directory}
                            sessionId={session.id}
                            server={props.server}
                            revealProjectOnHover={false}
                          />
                          <span class="min-w-0 flex-1 truncate">{title()}</span>
                          <Show when={selected()}>
                            <IconV2 name="check-small" size="small" class="shrink-0 text-v2-icon-icon-accent" />
                          </Show>
                        </MenuV2.Item>
                      )
                    }}
                  </For>
                </MenuV2.Group>
              </Show>
            </div>
          </ScrollView>
        </MenuV2.Content>
      </MenuV2.Portal>
    </MenuV2>
  )
}
