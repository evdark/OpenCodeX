import { createEffect, onCleanup, Show, type JSX } from "solid-js"
import { useLanguage } from "@/context/language"
import { useLayout } from "@/context/layout"
import { useSettings } from "@/context/settings"
import { SessionPermissionDock } from "@/pages/session/composer/session-permission-dock"
import { SessionQuestionDock } from "@/pages/session/composer/session-question-dock"
import { SessionFollowupDock } from "@/pages/session/composer/session-followup-dock"
import { SessionRevertDock } from "@/pages/session/composer/session-revert-dock"
import { SessionTodoDock } from "@/pages/session/composer/session-todo-dock"
import type { SessionComposerRegionController } from "./session-composer-region-controller"

export function SessionComposerRegion(props: {
  controller: SessionComposerRegionController
  promptInput: JSX.Element
}) {
  const language = useLanguage()
  const controller = props.controller
  const layout = useLayout()
  const settings = useSettings()
  const rolled = () => {
    const revert = controller.revert()
    return revert?.items.length ? revert : undefined
  }

  const followupDock = (flat?: boolean) => {
    const followup = controller.followup()
    if (!followup) return undefined
    return (
      <SessionFollowupDock
        items={followup.items}
        history={followup.history}
        suggestions={followup.suggestions}
        templates={followup.templates}
        running={followup.running}
        sending={followup.sending}
        paused={followup.paused}
        pauseReason={followup.pauseReason}
        mode={followup.mode}
        autoExpand={followup.autoExpand}
        openSignal={followup.openSignal}
        onSend={followup.onSend}
        onEdit={followup.onEdit}
        onDelete={followup.onDelete}
        onDuplicate={followup.onDuplicate}
        onMove={followup.onMove}
        onReorder={followup.onReorder}
        onPause={followup.onPause}
        onResume={followup.onResume}
        onClear={followup.onClear}
        onSkip={followup.onSkip}
        onCancelQueue={followup.onCancelQueue}
        onRestore={followup.onRestore}
        onAddSuggestion={followup.onAddSuggestion}
        onAddTemplate={followup.onAddTemplate}
        onSaveTemplate={followup.onSaveTemplate}
        onDeleteTemplate={followup.onDeleteTemplate}
        flat={flat}
      />
    )
  }

  createEffect(() => {
    // Side queue panel mirrors the dock when the panel setting is on.
    layout.queue.setContent(settings.opencodePlus.promptQueue.showPanel() ? followupDock(true) : undefined)
  })

  onCleanup(() => layout.queue.setContent(undefined))

  return (
    <div
      ref={controller.setDockRef}
      data-component="session-prompt-dock"
      classList={{
        "w-full shrink-0 flex flex-col justify-center items-center pb-3 pointer-events-none": true,
        "bg-v2-background-bg-base": settings.general.newLayoutDesigns(),
        "bg-background-stronger": !settings.general.newLayoutDesigns(),
      }}
    >
      <div
        classList={{
          "w-full px-3 pointer-events-auto": true,
          "md:max-w-200 md:mx-auto 2xl:max-w-[1000px]": controller.centered(),
        }}
      >
        <Show when={controller.followup() && !layout.queue.opened()}>
          <div class="pb-1.5">{followupDock(false)}</div>
        </Show>
        <Show when={controller.state.questionRequest()} keyed>
          {(request) => (
            <div>
              <SessionQuestionDock request={request} onSubmit={controller.onResponseSubmit} />
            </div>
          )}
        </Show>

        <Show when={controller.state.permissionRequest()} keyed>
          {(request) => (
            <div>
              <SessionPermissionDock
                request={request}
                responding={controller.state.permissionResponding()}
                onDecide={(response) => {
                  controller.onResponseSubmit()
                  controller.state.decide(response)
                }}
              />
            </div>
          )}
        </Show>

        <Show when={controller.showComposer()}>
          {/* Plan/todos sit below the prompt so they no longer stack on the queue */}
          <Show
            when={controller.promptReady()}
            fallback={
              <>
                <Show when={rolled()} keyed>
                  {(revert) => (
                    <div class="pb-2">
                      <SessionRevertDock
                        items={revert.items}
                        restoring={revert.restoring}
                        disabled={revert.disabled}
                        onRestore={revert.onRestore}
                      />
                    </div>
                  )}
                </Show>
                <div class="w-full min-h-32 md:min-h-40 rounded-md border border-border-weak-base bg-background-base/50 px-4 py-3 text-text-weak whitespace-pre-wrap pointer-events-none">
                  {controller.handoffPrompt() || language.t("prompt.loading")}
                </div>
              </>
            }
          >
            <Show when={rolled()} keyed>
              {(revert) => (
                <div>
                  <SessionRevertDock
                    items={revert.items}
                    restoring={revert.restoring}
                    disabled={revert.disabled}
                    onRestore={revert.onRestore}
                  />
                </div>
              )}
            </Show>
            <div classList={{ "relative z-[70]": true }}>
              <Show
                when={controller.child()}
                fallback={<Show when={!controller.state.blocked()}>{props.promptInput}</Show>}
              >
                <div
                  ref={controller.setPromptRef}
                  class="w-full rounded-[12px] border border-border-weak-base bg-background-base p-3 text-16-regular text-text-weak"
                >
                  <span>{language.t("session.child.promptDisabled")} </span>
                  <Show when={controller.parentID()}>
                    <button
                      type="button"
                      class="text-text-base transition-colors hover:text-text-strong"
                      onClick={controller.openParent}
                    >
                      {language.t("session.child.backToParent")}
                    </button>
                  </Show>
                </div>
              </Show>
            </div>
            <Show when={controller.dock()}>
              <div class="pt-2" ref={controller.setDockBodyRef}>
                <SessionTodoDock
                  todos={controller.state.todos()}
                  collapsed={controller.todo.collapsed()}
                  onToggle={controller.todo.onToggle}
                  collapseLabel={language.t("session.todo.collapse")}
                  expandLabel={language.t("session.todo.expand")}
                  dockProgress={1}
                />
              </div>
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  )
}
