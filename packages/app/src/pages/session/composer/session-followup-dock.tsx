import { createEffect, createMemo, For, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { Button } from "@opencode-ai/ui/button"
import { DockTray } from "@opencode-ai/ui/dock-surface"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { useLanguage } from "@/context/language"
import type { OpenCodePlusPromptQueueMode } from "@/context/settings"

export type SessionFollowupDockItem = {
  id: string
  text: string
  createdAt: string
  position: number
  source?: "user" | "suggestion"
  failed?: boolean
}

export type SessionFollowupDockHistoryItem = {
  id: string
  text: string
  status: "completed" | "failed" | "skipped" | "canceled"
  createdAt: string
}

export type SessionFollowupDockSuggestion = {
  id: string
  text: string
}

export function SessionFollowupDock(props: {
  items: SessionFollowupDockItem[]
  history: SessionFollowupDockHistoryItem[]
  suggestions: SessionFollowupDockSuggestion[]
  templates: SessionFollowupDockSuggestion[]
  running?: string
  sending?: string
  paused?: boolean
  pauseReason?: string
  mode: OpenCodePlusPromptQueueMode
  autoExpand?: boolean
  openSignal?: number
  onSend: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (id: string, delta: number) => void
  onReorder: (sourceID: string, targetID: string) => void
  onPause: () => void
  onResume: () => void
  onClear: () => void
  onSkip: (id: string) => void
  onCancelQueue: () => void
  onRestore: (id: string) => void
  onAddSuggestion: (id: string) => void
  onAddTemplate: (id: string) => void
  onSaveTemplate: (id: string) => void
  onDeleteTemplate: (id: string) => void
  flat?: boolean
}) {
  const language = useLanguage()
  const [store, setStore] = createStore({
    collapsed: false,
    history: false,
    dragging: undefined as string | undefined,
  })

  let lastTotal = props.items.length

  const toggle = () => setStore("collapsed", (value) => !value)
  const total = createMemo(() => props.items.length)
  const first = createMemo(() => props.items[0])
  const label = createMemo(() =>
    total() > 0
      ? language.t(total() === 1 ? "session.followupDock.summary.one" : "session.followupDock.summary.other", {
          count: total(),
        })
      : language.t("session.followupDock.suggestions"),
  )
  const preview = createMemo(() => first()?.text ?? props.running ?? "")
  const pausedLabel = createMemo(() => props.pauseReason || language.t("session.followupDock.paused"))

  createEffect(() => {
    const next = props.items.length
    if (props.autoExpand && next > lastTotal) setStore("collapsed", false)
    lastTotal = next
  })

  createEffect(() => {
    props.openSignal
    setStore("collapsed", false)
  })

  const onHeaderKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    toggle()
  }

  const ready = createMemo(() => {
    const item = first()
    if (!item) return false
    if (props.paused || props.running) return false
    return props.mode !== "automatic" || item.source === "suggestion" || item.failed
  })
  const readyLabel = createMemo(() => {
    const item = first()
    if (item?.failed) return language.t("session.followupDock.ready.failed")
    if (props.mode === "manual") return language.t("session.followupDock.ready.manual")
    return language.t("session.followupDock.ready.ask")
  })

  const status = (status: SessionFollowupDockHistoryItem["status"]) =>
    language.t(`session.followupDock.${status}` as Parameters<typeof language.t>[0])

  return (
    <DockTray
      data-component="session-followup-dock"
      class={props.flat ? "border-0 bg-transparent shadow-none" : undefined}
      style={
        props.flat
          ? undefined
          : {
              "margin-bottom": "-0.875rem",
              "border-bottom-left-radius": 0,
              "border-bottom-right-radius": 0,
            }
      }
    >
      <div
        class="pl-3 pr-2 py-2 flex items-center gap-2"
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={onHeaderKeyDown}
      >
        <div class="flex min-w-0 shrink-0 items-center gap-1.5">
          <span class="truncate text-13-medium text-text-strong cursor-default">{label()}</span>
          <Tooltip value={language.t("session.followupDock.help")} placement="top" contentClass="max-w-72 text-pretty">
            <span class="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-border-base text-10-medium text-text-weak">
              ?
            </span>
          </Tooltip>
        </div>
        <Show when={props.paused}>
          <span class="shrink-0 rounded-sm bg-surface-raised-base px-1.5 py-0.5 text-11-medium text-text-base">
            {language.t("session.followupDock.paused")}
          </span>
        </Show>
        <Show when={store.collapsed && preview()}>
          <span class="min-w-0 flex-1 truncate text-13-regular text-text-base cursor-default">{preview()}</span>
        </Show>
        <div class="ml-auto flex shrink-0 items-center gap-1">
          <Show
            when={props.paused}
            fallback={
              <HeaderButton
                label={language.t("session.followupDock.pause")}
                title={language.t("session.followupDock.pause.help")}
                onClick={props.onPause}
              />
            }
          >
            <HeaderButton
              label={language.t("session.followupDock.resume")}
              title={language.t("session.followupDock.resume.help")}
              emphasized
              onClick={props.onResume}
            />
          </Show>
          <HeaderButton
            label={language.t("session.followupDock.clear")}
            disabled={!props.items.length}
            onClick={props.onClear}
          />
          <IconButton
            data-collapsed={store.collapsed ? "true" : "false"}
            icon="chevron-down"
            size="normal"
            variant="ghost"
            style={{ transform: `rotate(${store.collapsed ? 180 : 0}deg)` }}
            onMouseDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
            }}
            onClick={(event) => {
              event.stopPropagation()
              toggle()
            }}
            aria-label={
              store.collapsed ? language.t("session.followupDock.expand") : language.t("session.followupDock.collapse")
            }
          />
        </div>
      </div>

      <Show when={store.collapsed}>
        <div class="h-5" aria-hidden="true" />
      </Show>

      <Show when={!store.collapsed}>
        <div
          classList={{
            "px-3 flex flex-col gap-2 overflow-y-auto no-scrollbar": true,
            "pb-7 max-h-64": !props.flat,
            "pb-3 max-h-none": props.flat,
          }}
        >
          <Show when={props.running}>
            <section class="flex flex-col gap-1" aria-label={language.t("session.followupDock.running")}>
              <div class="text-11-medium uppercase text-text-weak">{language.t("session.followupDock.running")}</div>
              <div class="flex min-w-0 items-center gap-2 rounded-md bg-surface-base px-2 py-1.5">
                <Icon name="check-small" size="small" class="shrink-0 text-icon-success-base" />
                <span class="min-w-0 flex-1 truncate text-13-regular text-text-strong">{props.running}</span>
              </div>
            </section>
          </Show>

          <Show when={props.paused}>
            <div class="rounded-md bg-surface-raised-base px-2 py-1.5 text-12-regular text-text-base" role="status">
              {pausedLabel()}
            </div>
          </Show>

          <Show when={ready() && first()} keyed>
            {(item) => (
              <div class="flex min-w-0 flex-wrap items-center gap-2 rounded-md bg-surface-base px-2 py-1.5">
                <span class="min-w-0 flex-1 text-13-medium text-text-strong">{readyLabel()}</span>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={!!props.sending}
                  onClick={() => props.onSend(item.id)}
                >
                  {language.t("session.followupDock.sendNow")}
                </Button>
                <Button size="small" variant="ghost" disabled={!!props.sending} onClick={() => props.onSkip(item.id)}>
                  {language.t("session.followupDock.skip")}
                </Button>
                <Button size="small" variant="ghost" disabled={!!props.sending} onClick={props.onCancelQueue}>
                  {language.t("session.followupDock.cancelQueue")}
                </Button>
              </div>
            )}
          </Show>

          <Show when={props.items.length}>
            <section class="flex flex-col gap-1" aria-label={language.t("session.followupDock.queued")}>
              <div class="text-11-medium uppercase text-text-weak">{language.t("session.followupDock.queued")}</div>
              <For each={props.items}>
                {(item, index) => (
                  <div
                    draggable
                    class="flex min-w-0 flex-col gap-2 rounded-md bg-surface-base px-2 py-1.5 sm:flex-row sm:items-center"
                    classList={{ "outline outline-1 outline-border-info-base": item.failed }}
                    onDragStart={(event) => {
                      event.dataTransfer?.setData("text/plain", item.id)
                      setStore("dragging", item.id)
                    }}
                    onDragEnd={() => setStore("dragging", undefined)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      const source = store.dragging ?? event.dataTransfer?.getData("text/plain")
                      setStore("dragging", undefined)
                      if (!source || source === item.id) return
                      props.onReorder(source, item.id)
                    }}
                  >
                    <span class="hidden w-5 shrink-0 text-right text-12-medium text-text-weak sm:block">
                      {index() + 1}.
                    </span>
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-13-regular text-text-strong">{item.text}</div>
                      <div class="truncate text-11-regular text-text-weak">
                        {language.t("session.followupDock.created", { time: item.createdAt })} -{" "}
                        {language.t("session.followupDock.position", { position: item.position })}
                      </div>
                    </div>
                    <div class="flex w-full min-w-0 flex-wrap justify-end gap-1 sm:w-auto sm:shrink-0">
                      <Button
                        size="small"
                        variant="secondary"
                        disabled={!!props.sending}
                        onClick={() => props.onSend(item.id)}
                      >
                        {item.failed
                          ? language.t("session.followupDock.retry")
                          : language.t("session.followupDock.sendNow")}
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        disabled={!!props.sending}
                        onClick={() => props.onEdit(item.id)}
                      >
                        {language.t("session.followupDock.edit")}
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        disabled={!!props.sending}
                        onClick={() => props.onDuplicate(item.id)}
                      >
                        {language.t("session.followupDock.duplicate")}
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        disabled={!!props.sending}
                        onClick={() => props.onSaveTemplate(item.id)}
                      >
                        {language.t("session.followupDock.saveTemplate")}
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        disabled={index() === 0 || !!props.sending}
                        onClick={() => props.onMove(item.id, -1)}
                      >
                        {language.t("session.followupDock.moveUp")}
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        disabled={index() === props.items.length - 1 || !!props.sending}
                        onClick={() => props.onMove(item.id, 1)}
                      >
                        {language.t("session.followupDock.moveDown")}
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        disabled={!!props.sending}
                        onClick={() => props.onDelete(item.id)}
                      >
                        {language.t("session.followupDock.delete")}
                      </Button>
                    </div>
                  </div>
                )}
              </For>
            </section>
          </Show>

          <Show when={props.templates.length}>
            <section class="flex flex-col gap-1" aria-label={language.t("session.followupDock.templates")}>
              <div class="text-11-medium uppercase text-text-weak">{language.t("session.followupDock.templates")}</div>
              <div class="flex flex-wrap gap-1.5">
                <For each={props.templates}>
                  {(item) => (
                    <div class="flex min-w-0 items-center gap-1 rounded-md bg-surface-base px-1 py-1">
                      <Button
                        size="small"
                        variant="ghost"
                        disabled={!!props.sending}
                        onClick={() => props.onAddTemplate(item.id)}
                      >
                        {item.text}
                      </Button>
                      <IconButton
                        icon="close"
                        size="small"
                        variant="ghost"
                        disabled={!!props.sending}
                        onClick={() => props.onDeleteTemplate(item.id)}
                        aria-label={language.t("session.followupDock.template.delete")}
                      />
                    </div>
                  )}
                </For>
              </div>
            </section>
          </Show>

          <Show when={props.suggestions.length}>
            <section class="flex flex-col gap-1" aria-label={language.t("session.followupDock.suggestions")}>
              <div class="text-11-medium uppercase text-text-weak">
                {language.t("session.followupDock.suggestions")}
              </div>
              <div class="flex flex-wrap gap-1.5">
                <For each={props.suggestions}>
                  {(item) => (
                    <Button
                      size="small"
                      variant="ghost"
                      disabled={!!props.sending}
                      onClick={() => props.onAddSuggestion(item.id)}
                    >
                      {item.text}
                    </Button>
                  )}
                </For>
              </div>
            </section>
          </Show>

          <Show when={props.history.length}>
            <section class="flex flex-col gap-1" aria-label={language.t("session.followupDock.history")}>
              <button
                type="button"
                class="flex h-7 items-center justify-between rounded-md px-1 text-11-medium uppercase text-text-weak hover:bg-surface-raised-base-hover"
                onClick={() => setStore("history", (value) => !value)}
              >
                <span>{language.t("session.followupDock.history")}</span>
                <span>{props.history.length}</span>
              </button>
              <Show when={store.history}>
                <For each={props.history.slice(0, 6)}>
                  {(item) => (
                    <div class="flex min-w-0 flex-wrap items-center gap-2 rounded-md bg-surface-base px-2 py-1.5">
                      <span class="shrink-0 text-11-medium text-text-weak">{status(item.status)}</span>
                      <span class="min-w-0 flex-1 truncate text-13-regular text-text-strong">{item.text}</span>
                      <Button
                        size="small"
                        variant="ghost"
                        disabled={!!props.sending}
                        onClick={() => props.onRestore(item.id)}
                      >
                        {language.t("session.followupDock.restore")}
                      </Button>
                      <Button
                        size="small"
                        variant="ghost"
                        disabled={!!props.sending}
                        onClick={() => props.onSaveTemplate(item.id)}
                      >
                        {language.t("session.followupDock.saveTemplate")}
                      </Button>
                    </div>
                  )}
                </For>
              </Show>
            </section>
          </Show>
        </div>
      </Show>
    </DockTray>
  )
}

function HeaderButton(props: {
  label: string
  title?: string
  disabled?: boolean
  emphasized?: boolean
  onClick: () => void
}) {
  return (
    <Button
      size="small"
      variant={props.emphasized ? "secondary" : "ghost"}
      disabled={props.disabled}
      title={props.title}
      onMouseDown={(event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onClick={(event: MouseEvent) => {
        event.stopPropagation()
        props.onClick()
      }}
    >
      {props.label}
    </Button>
  )
}
