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
        class="pl-2.5 pr-1.5 py-1.5 flex items-center gap-1.5"
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={onHeaderKeyDown}
      >
        <div class="flex min-w-0 shrink-0 items-center gap-1">
          <span class="truncate text-12-medium text-text-strong cursor-default">{label()}</span>
          <Tooltip value={language.t("session.followupDock.help")} placement="top" contentClass="max-w-72 text-pretty">
            <span class="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border border-border-base text-[10px] text-text-weak">
              ?
            </span>
          </Tooltip>
        </div>
        <Show when={props.paused}>
          <span class="shrink-0 rounded-sm bg-surface-raised-base px-1 py-0.5 text-11-regular text-text-base">
            {language.t("session.followupDock.paused")}
          </span>
        </Show>
        <Show when={store.collapsed && preview()}>
          <span class="min-w-0 flex-1 truncate text-12-regular text-text-base cursor-default">{preview()}</span>
        </Show>
        <div class="ml-auto flex shrink-0 items-center gap-0.5">
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
            size="small"
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

      <Show when={!store.collapsed}>
        <div
          classList={{
            "px-2 flex flex-col gap-1 overflow-y-auto no-scrollbar": true,
            "pb-5 max-h-48": !props.flat,
            "pb-2 max-h-none": props.flat,
          }}
        >
          <Show when={props.running}>
            <div class="flex min-w-0 items-center gap-1.5 rounded-md bg-surface-base px-2 py-1">
              <Icon name="check-small" size="small" class="shrink-0 text-icon-success-base" />
              <span class="min-w-0 flex-1 truncate text-12-regular text-text-strong">{props.running}</span>
            </div>
          </Show>

          <Show when={props.paused}>
            <div class="rounded-md bg-surface-raised-base px-2 py-1 text-11-regular text-text-base" role="status">
              {pausedLabel()}
            </div>
          </Show>

          <Show when={ready() && first()} keyed>
            {(item) => (
              <div class="flex min-w-0 flex-wrap items-center gap-1.5 rounded-md bg-surface-base px-2 py-1">
                <span class="min-w-0 flex-1 text-12-medium text-text-strong">{readyLabel()}</span>
                <Button size="small" variant="secondary" disabled={!!props.sending} onClick={() => props.onSend(item.id)}>
                  {language.t("session.followupDock.sendNow")}
                </Button>
                <Button size="small" variant="ghost" disabled={!!props.sending} onClick={() => props.onSkip(item.id)}>
                  {language.t("session.followupDock.skip")}
                </Button>
              </div>
            )}
          </Show>

          <Show when={props.items.length}>
            <section class="flex flex-col gap-0.5" aria-label={language.t("session.followupDock.queued")}>
              <For each={props.items}>
                {(item, index) => (
                  <div
                    draggable
                    class="group flex min-w-0 cursor-grab items-center gap-1.5 rounded-md bg-surface-base px-1.5 py-1 active:cursor-grabbing"
                    classList={{
                      "outline outline-1 outline-border-info-base": item.failed,
                      "opacity-60": store.dragging === item.id,
                    }}
                    onDragStart={(event) => {
                      event.dataTransfer?.setData("text/plain", item.id)
                      event.dataTransfer!.effectAllowed = "move"
                      setStore("dragging", item.id)
                    }}
                    onDragEnd={() => setStore("dragging", undefined)}
                    onDragOver={(event) => {
                      event.preventDefault()
                      if (event.dataTransfer) event.dataTransfer.dropEffect = "move"
                    }}
                    onDrop={(event) => {
                      event.preventDefault()
                      const source = store.dragging ?? event.dataTransfer?.getData("text/plain")
                      setStore("dragging", undefined)
                      if (!source || source === item.id) return
                      props.onReorder(source, item.id)
                    }}
                  >
                    <span
                      class="shrink-0 select-none px-0.5 text-11-regular text-text-weaker"
                      title={language.t("session.followupDock.dragHint")}
                      aria-hidden
                    >
                      ⋮⋮
                    </span>
                    <span class="w-4 shrink-0 text-right text-11-regular text-text-weak">{index() + 1}</span>
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-12-regular text-text-strong">{item.text}</div>
                    </div>
                    <div class="flex shrink-0 items-center gap-0.5 opacity-70 group-hover:opacity-100">
                      <IconButton
                        icon="enter"
                        size="small"
                        variant="ghost"
                        disabled={!!props.sending}
                        aria-label={
                          item.failed
                            ? language.t("session.followupDock.retry")
                            : language.t("session.followupDock.sendNow")
                        }
                        onClick={() => props.onSend(item.id)}
                      />
                      <IconButton
                        icon="edit"
                        size="small"
                        variant="ghost"
                        disabled={!!props.sending}
                        aria-label={language.t("session.followupDock.edit")}
                        onClick={() => props.onEdit(item.id)}
                      />
                      <IconButton
                        icon="close"
                        size="small"
                        variant="ghost"
                        disabled={!!props.sending}
                        aria-label={language.t("session.followupDock.delete")}
                        onClick={() => props.onDelete(item.id)}
                      />
                    </div>
                  </div>
                )}
              </For>
            </section>
          </Show>

          <Show when={props.suggestions.length}>
            <div class="flex flex-wrap gap-1 pt-0.5">
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
          </Show>

          <Show when={props.history.length}>
            <section class="flex flex-col gap-0.5 pt-0.5" aria-label={language.t("session.followupDock.history")}>
              <button
                type="button"
                class="flex h-6 items-center justify-between rounded-md px-1 text-11-regular text-text-weak hover:bg-surface-raised-base-hover"
                onClick={() => setStore("history", (value) => !value)}
              >
                <span class="normal-case tracking-normal">{language.t("session.followupDock.history")}</span>
                <span>{props.history.length}</span>
              </button>
              <Show when={store.history}>
                <For each={props.history.slice(0, 6)}>
                  {(item) => (
                    <div class="flex min-w-0 items-center gap-1.5 rounded-md bg-surface-base px-2 py-1">
                      <span class="shrink-0 text-11-regular text-text-weak">{status(item.status)}</span>
                      <span class="min-w-0 flex-1 truncate text-12-regular text-text-strong">{item.text}</span>
                      <Button
                        size="small"
                        variant="ghost"
                        disabled={!!props.sending}
                        onClick={() => props.onRestore(item.id)}
                      >
                        {language.t("session.followupDock.restore")}
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
