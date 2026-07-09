import type { UserMessage } from "@opencode-ai/sdk/v2"
import { useMutation } from "@tanstack/solid-query"
import { createEffect, createMemo, createSignal, type Accessor } from "solid-js"
import { createStore } from "solid-js/store"
import { type FollowupDraft, sendFollowupDraft } from "@/components/prompt-input/submit"
import { useCommand } from "@/context/command"
import { useLanguage } from "@/context/language"
import { useLayout } from "@/context/layout"
import { useLocal } from "@/context/local"
import { usePlatform } from "@/context/platform"
import { useSDK } from "@/context/sdk"
import { useServerSDK } from "@/context/server-sdk"
import { useServerSync } from "@/context/server-sync"
import { useSettings } from "@/context/settings"
import { useSync } from "@/context/sync"
import { Identifier } from "@/utils/id"
import { Persist, persisted, removePersisted } from "@/utils/persist"
import { formatImprovedProviderError } from "@/context/opencode-plus-runtime"
import { formatServerError } from "@/utils/server-errors"
import { showToast } from "@/utils/toast"
import type { SessionComposerFollowupDock } from "./composer/session-composer-region-controller"
import {
  createPromptQueueItem,
  defaultPromptQueueStore,
  deletePromptQueueItem,
  deletePromptQueueTemplate,
  duplicatePromptQueueItem,
  emptyPromptQueueHistory,
  emptyPromptQueueItems,
  enqueuePromptQueueItem,
  movePromptQueueItem,
  movePromptQueueItemByDelta,
  normalizePromptQueueStore,
  promptQueueCreatedTime,
  promptQueueEstimatedPosition,
  promptQueueItemFromTemplate,
  promptQueueHistoryItem,
  promptQueuePreview,
  promptQueueTemplateFromItem,
  restorePromptQueueHistoryItem,
  runPromptQueueItemNow,
  upsertPromptQueueTemplate,
  type PromptQueueItem,
  type PromptQueueStore,
} from "./prompt-queue"

type SessionPromptQueueInput = {
  sessionID: Accessor<string | undefined>
  busy: (sessionID: string) => boolean
  blocked: Accessor<boolean>
  isChildSession: Accessor<boolean>
  lastUserMessage: Accessor<UserMessage | undefined>
  line: (messageID: string) => string
  fail: (error: unknown) => void
  resumeScroll: () => void
  captureOwner: () => { run<T>(action: () => T): T | undefined }
}

export function createSessionPromptQueue(input: SessionPromptQueueInput) {
  const command = useCommand()
  const language = useLanguage()
  const layout = useLayout()
  const local = useLocal()
  const platform = usePlatform()
  const sdk = useSDK()
  const serverSDK = useServerSDK()
  const serverSync = useServerSync()
  const settings = useSettings()
  const sync = useSync()

  const followupPersistTarget = Persist.serverWorkspace(serverSDK().scope, sdk().directory, "followup", ["followup.v1"])
  const [followup, setFollowup, , followupReady] = persisted(
    {
      ...followupPersistTarget,
      migrate: normalizePromptQueueStore,
    },
    createStore<PromptQueueStore>(defaultPromptQueueStore),
  )
  const shouldPersistPromptQueue = () =>
    settings.opencodePlus.promptQueue.persistQueue() && settings.opencodePlus.promptQueue.restoreAfterRestart()
  let promptQueueRestoreApplied = false

  createEffect(() => {
    if (promptQueueRestoreApplied) return
    if (!settings.ready() || !followupReady()) return
    promptQueueRestoreApplied = true
    if (shouldPersistPromptQueue()) return
    clearPromptQueueStore()
    removePersisted(followupPersistTarget, platform)
  })

  createEffect(() => {
    if (shouldPersistPromptQueue()) return
    JSON.stringify(followup)
    removePersisted(followupPersistTarget, platform)
  })

  const queuedFollowups = createMemo(() => {
    const id = input.sessionID()
    if (!id) return emptyPromptQueueItems
    return followup.items[id] ?? emptyPromptQueueItems
  })

  const followupHistory = createMemo(() => {
    const id = input.sessionID()
    if (!id) return emptyPromptQueueHistory
    return followup.history[id] ?? emptyPromptQueueHistory
  })

  const editingFollowup = createMemo(() => {
    const id = input.sessionID()
    if (!id) return undefined
    return followup.edit[id]
  })

  const pushFollowupHistory = (
    sessionID: string,
    item: PromptQueueItem,
    status: Parameters<typeof promptQueueHistoryItem>[1],
    error?: string,
  ) => {
    setFollowup("history", sessionID, (history) =>
      [promptQueueHistoryItem(item, status, { error }), ...(history ?? [])].slice(0, 50),
    )
  }

  const notifyPromptQueue = (title: string, description?: string) => {
    showToast({ title, description })
    if (!settings.opencodePlus.promptQueue.desktopNotifications()) return
    void platform.notify(title, description)
  }

  const followupMutation = useMutation(() => ({
    mutationFn: async (request: { sessionID: string; id: string; manual?: boolean }) => {
      const owner = input.captureOwner()
      const item = (followup.items[request.sessionID] ?? []).find((entry) => entry.id === request.id)
      if (!item) return

      // Manual "send now" should not clear a user pause — only auto/error pauses.
      const paused = followup.paused[request.sessionID]
      if (request.manual && paused && !paused.manual) setFollowup("paused", request.sessionID, undefined)
      setFollowup("failed", request.sessionID, undefined)

      const ok = await sendFollowupDraft({
        client: sdk().client,
        sync: sync(),
        serverSync: serverSync(),
        draft: item,
        messageID: item.id,
        delivery: request.manual && input.busy(request.sessionID) ? "queue" : undefined,
        optimisticBusy: item.sessionDirectory === sdk().directory,
        customSystemPrompt: {
          enabled: settings.opencodePlus.customSystemPrompt.enabled(),
          mode: settings.opencodePlus.customSystemPrompt.mode(),
          prompt: settings.opencodePlus.customSystemPrompt.prompt(),
        },
      }).catch((err) => {
        const description = formatImprovedProviderError(
          formatServerError(err, language.t),
          settings.opencodePlus.improvedErrorMessages.enabled(),
        )
        setFollowup("failed", request.sessionID, request.id)
        setFollowup("paused", request.sessionID, { itemID: request.id, reason: description })
        pushFollowupHistory(request.sessionID, item, "failed", description)
        input.fail(err)
        if (settings.opencodePlus.promptQueue.desktopNotifications()) {
          void platform.notify(language.t("session.followupDock.failed"), description)
        }
        return false
      })
      if (!ok) return

      const completed = (followup.items[request.sessionID] ?? []).length <= 1
      setFollowup("items", request.sessionID, (items) => (items ?? []).filter((entry) => entry.id !== request.id))
      pushFollowupHistory(request.sessionID, item, "completed")
      if (completed) notifyPromptQueue(language.t("session.followupDock.completed"))
      if (request.manual) owner.run(input.resumeScroll)
    },
  }))

  const followupBusy = (sessionID: string) =>
    followupMutation.isPending && followupMutation.variables?.sessionID === sessionID
  const [openSignal, setOpenSignal] = createSignal(0)

  const sendingFollowup = createMemo(() => {
    const id = input.sessionID()
    if (!id) return undefined
    if (!followupBusy(id)) return undefined
    return followupMutation.variables?.id
  })

  const queueEnabled = createMemo(() => {
    const id = input.sessionID()
    if (!id) return false
    return settings.opencodePlus.promptQueue.enabled() && input.busy(id) && !input.blocked() && !input.isChildSession()
  })

  const queueFollowup = (draft: FollowupDraft, source: PromptQueueItem["source"] = "user") => {
    const item = createPromptQueueItem(draft, { id: Identifier.ascending("message"), source })
    const result = enqueuePromptQueueItem(
      followup.items[draft.sessionID] ?? emptyPromptQueueItems,
      item,
      settings.opencodePlus.promptQueue.maximumSize(),
    )
    if (!result.ok) {
      showToast({
        title: language.t("session.followupDock.maximumSizeReached"),
        description: language.t("session.followupDock.maximumSizeReached.description"),
      })
      return
    }

    setFollowup("items", draft.sessionID, result.items)
    setFollowup("failed", draft.sessionID, undefined)
    // Keep intentional manual pauses; only clear automatic/error pauses when the user queues.
    if (source === "user") {
      const paused = followup.paused[draft.sessionID]
      if (paused && !paused.manual) setFollowup("paused", draft.sessionID, undefined)
    }
  }

  const followupDock = createMemo(() =>
    queuedFollowups().map((item, index) => {
      const sessionID = input.sessionID()
      return {
        id: item.id,
        text: promptQueuePreview(item.prompt, language.t("common.attachment")),
        createdAt: promptQueueCreatedTime(item.createdAt),
        position: promptQueueEstimatedPosition(index),
        source: item.source,
        failed: sessionID ? followup.failed[sessionID] === item.id : false,
      }
    }),
  )

  const followupHistoryDock = createMemo(() =>
    followupHistory().map((item) => ({
      id: item.id,
      text: promptQueuePreview(item.prompt, language.t("common.attachment")),
      status: item.status,
      createdAt: promptQueueCreatedTime(item.finishedAt),
    })),
  )

  const followupTemplateDock = createMemo(() =>
    followup.templates.map((item) => ({
      id: item.id,
      text: item.name,
    })),
  )

  const runningFollowup = createMemo(() => {
    const id = input.sessionID()
    const message = input.lastUserMessage()
    if (!id || !message || !input.busy(id)) return undefined
    return input.line(message.id)
  })

  // Suggested follow-up chips were removed from the queue UI — keep an empty
  // list so dock/history APIs stay stable without reintroducing prompts.
  const suggestedFollowups = createMemo((): Array<{ id: string; text: string; prompt: string }> => [])

  const sendFollowup = (sessionID: string, id: string, opts?: { manual?: boolean }) => {
    if (!settings.opencodePlus.promptQueue.enabled()) return Promise.resolve()
    if (sync().session.get(sessionID)?.parentID) return Promise.resolve()
    const item = (followup.items[sessionID] ?? []).find((entry) => entry.id === id)
    if (!item) return Promise.resolve()
    if (followupBusy(sessionID)) return Promise.resolve()

    setFollowup("items", sessionID, (items) => runPromptQueueItemNow(items ?? emptyPromptQueueItems, id))

    return followupMutation.mutateAsync({ sessionID, id, manual: opts?.manual })
  }

  const deleteFollowup = (id: string) => {
    const sessionID = input.sessionID()
    if (!sessionID || followupBusy(sessionID)) return
    const item = queuedFollowups().find((entry) => entry.id === id)
    if (!item) return
    setFollowup("items", sessionID, (items) => deletePromptQueueItem(items ?? emptyPromptQueueItems, id))
    setFollowup("failed", sessionID, (value) => (value === id ? undefined : value))
    pushFollowupHistory(sessionID, item, "canceled")
  }

  const duplicateFollowup = (id: string) => {
    const sessionID = input.sessionID()
    if (!sessionID || followupBusy(sessionID)) return
    if (queuedFollowups().length >= settings.opencodePlus.promptQueue.maximumSize()) {
      showToast({
        title: language.t("session.followupDock.maximumSizeReached"),
        description: language.t("session.followupDock.maximumSizeReached.description"),
      })
      return
    }
    setFollowup("items", sessionID, (items) =>
      duplicatePromptQueueItem(items ?? emptyPromptQueueItems, id, { id: Identifier.ascending("message") }),
    )
  }

  const moveFollowup = (id: string, delta: number) => {
    const sessionID = input.sessionID()
    if (!sessionID || followupBusy(sessionID)) return
    setFollowup("items", sessionID, (items) => movePromptQueueItemByDelta(items ?? emptyPromptQueueItems, id, delta))
  }

  const reorderFollowup = (sourceID: string, targetID: string) => {
    const sessionID = input.sessionID()
    if (!sessionID || followupBusy(sessionID)) return
    const target = queuedFollowups().findIndex((item) => item.id === targetID)
    if (target < 0) return
    setFollowup("items", sessionID, (items) => movePromptQueueItem(items ?? emptyPromptQueueItems, sourceID, target))
  }

  const pauseFollowup = (notify = true, opts?: { manual?: boolean }) => {
    const sessionID = input.sessionID()
    if (!sessionID) return
    const manual = opts?.manual !== false
    const reason = language.t("session.followupDock.paused")
    setFollowup("paused", sessionID, { reason, manual })
    if (notify) notifyPromptQueue(reason)
  }

  const resumeFollowup = (notify = true) => {
    const sessionID = input.sessionID()
    if (!sessionID) return
    if (!followup.paused[sessionID]) return
    setFollowup("paused", sessionID, undefined)
    setFollowup("failed", sessionID, undefined)
    if (notify) notifyPromptQueue(language.t("session.followupDock.resumed"))
  }

  const togglePauseFollowup = () => {
    const sessionID = input.sessionID()
    if (!sessionID) return
    if (followup.paused[sessionID]) {
      resumeFollowup()
      return
    }
    pauseFollowup()
  }

  const clearFollowupQueue = () => {
    const sessionID = input.sessionID()
    if (!sessionID || followupBusy(sessionID)) return
    queuedFollowups().forEach((item) => pushFollowupHistory(sessionID, item, "canceled"))
    setFollowup("items", sessionID, [])
    setFollowup("failed", sessionID, undefined)
    setFollowup("paused", sessionID, undefined)
  }

  const skipFollowup = (id: string) => {
    const sessionID = input.sessionID()
    if (!sessionID || followupBusy(sessionID)) return
    const item = queuedFollowups().find((entry) => entry.id === id)
    if (!item) return
    setFollowup("items", sessionID, (items) => deletePromptQueueItem(items ?? emptyPromptQueueItems, id))
    setFollowup("failed", sessionID, (value) => (value === id ? undefined : value))
    // Skip recovers from an item failure; keep a manual pause if the user set one.
    const paused = followup.paused[sessionID]
    if (paused && !paused.manual) setFollowup("paused", sessionID, undefined)
    pushFollowupHistory(sessionID, item, "skipped")
  }

  const restoreFollowup = (id: string) => {
    const sessionID = input.sessionID()
    if (!sessionID || followupBusy(sessionID)) return
    const item = followupHistory().find((entry) => entry.id === id)
    if (!item) return
    const restored = restorePromptQueueHistoryItem(item, { id: Identifier.ascending("message") })
    const result = enqueuePromptQueueItem(queuedFollowups(), restored, settings.opencodePlus.promptQueue.maximumSize())
    if (!result.ok) {
      showToast({
        title: language.t("session.followupDock.maximumSizeReached"),
        description: language.t("session.followupDock.maximumSizeReached.description"),
      })
      return
    }
    setFollowup("items", sessionID, result.items)
  }

  const addSuggestionFollowup = (id: string) => {
    const sessionID = input.sessionID()
    const suggestion = suggestedFollowups().find((item) => item.id === id)
    const currentModel = local.model.current()
    const currentAgent = local.agent.current()
    if (!sessionID || !suggestion || !currentModel || !currentAgent) return
    queueFollowup(
      {
        sessionID,
        sessionDirectory: sdk().directory,
        prompt: [{ type: "text", content: suggestion.prompt, start: 0, end: suggestion.prompt.length }],
        context: [],
        agent: currentAgent.name,
        model: { providerID: currentModel.provider.id, modelID: currentModel.id },
        variant: local.model.variant.current(),
      },
      "suggestion",
    )
  }

  const addTemplateFollowup = (id: string) => {
    const sessionID = input.sessionID()
    const template = followup.templates.find((item) => item.id === id)
    if (!sessionID || !template) return
    const result = enqueuePromptQueueItem(
      queuedFollowups(),
      promptQueueItemFromTemplate(template, {
        id: Identifier.ascending("message"),
        sessionID,
        sessionDirectory: sdk().directory,
      }),
      settings.opencodePlus.promptQueue.maximumSize(),
    )
    if (!result.ok) {
      showToast({
        title: language.t("session.followupDock.maximumSizeReached"),
        description: language.t("session.followupDock.maximumSizeReached.description"),
      })
      return
    }
    setFollowup("items", sessionID, result.items)
  }

  const saveFollowupTemplate = (id: string) => {
    const item = queuedFollowups().find((entry) => entry.id === id) ?? followupHistory().find((entry) => entry.id === id)
    if (!item) return
    setFollowup(
      "templates",
      upsertPromptQueueTemplate(
        followup.templates,
        promptQueueTemplateFromItem(item, {
          id: Identifier.ascending("message"),
          name: promptQueuePreview(item.prompt, language.t("common.attachment")),
        }),
      ),
    )
    showToast({ title: language.t("session.followupDock.template.saved") })
  }

  const deleteFollowupTemplate = (id: string) => {
    setFollowup("templates", deletePromptQueueTemplate(followup.templates, id))
  }

  const editFollowup = (id: string) => {
    const sessionID = input.sessionID()
    if (!sessionID) return
    if (followupBusy(sessionID)) return

    const item = queuedFollowups().find((entry) => entry.id === id)
    if (!item) return

    setFollowup("items", sessionID, (items) => (items ?? []).filter((entry) => entry.id !== id))
    setFollowup("failed", sessionID, (value) => (value === id ? undefined : value))
    setFollowup("edit", sessionID, {
      id: item.id,
      prompt: item.prompt,
      context: item.context,
    })
  }

  const clearFollowupEdit = () => {
    const id = input.sessionID()
    if (!id) return
    setFollowup("edit", id, undefined)
  }

  command.register("prompt-queue", () => [
    {
      id: "promptQueue.open",
      title: language.t("command.promptQueue.open"),
      category: language.t("command.category.session"),
      keybind: "mod+shift+q",
      disabled: !settings.opencodePlus.promptQueue.enabled() || !input.sessionID(),
      onSelect: () => {
        layout.queue.open()
        setOpenSignal((value) => value + 1)
      },
    },
    {
      id: "promptQueue.runNext",
      title: language.t("command.promptQueue.runNext"),
      category: language.t("command.category.session"),
      disabled: !settings.opencodePlus.promptQueue.enabled() || !input.sessionID() || queuedFollowups().length === 0,
      onSelect: () => {
        const item = queuedFollowups()[0]
        const sessionID = input.sessionID()
        if (!sessionID || !item) return
        void sendFollowup(sessionID, item.id, { manual: true })
      },
    },
    {
      id: "promptQueue.pause",
      title: language.t("command.promptQueue.pause"),
      category: language.t("command.category.session"),
      disabled:
        !settings.opencodePlus.promptQueue.enabled() ||
        !input.sessionID() ||
        !!followup.paused[input.sessionID() ?? ""],
      onSelect: () => pauseFollowup(),
    },
    {
      id: "promptQueue.resume",
      title: language.t("command.promptQueue.resume"),
      category: language.t("command.category.session"),
      disabled:
        !settings.opencodePlus.promptQueue.enabled() || !input.sessionID() || !followup.paused[input.sessionID() ?? ""],
      onSelect: () => resumeFollowup(),
    },
    {
      id: "promptQueue.togglePause",
      title: language.t("command.promptQueue.togglePause"),
      category: language.t("command.category.session"),
      keybind: "mod+alt+p",
      disabled: !settings.opencodePlus.promptQueue.enabled() || !input.sessionID(),
      onSelect: togglePauseFollowup,
    },
    {
      id: "promptQueue.clear",
      title: language.t("command.promptQueue.clear"),
      category: language.t("command.category.session"),
      disabled: !settings.opencodePlus.promptQueue.enabled() || !input.sessionID() || queuedFollowups().length === 0,
      onSelect: clearFollowupQueue,
    },
  ])

  createEffect(() => {
    const sessionID = input.sessionID()
    if (!sessionID) return

    const item = queuedFollowups()[0]
    if (!item) return
    if (!settings.opencodePlus.promptQueue.enabled()) return
    if (settings.opencodePlus.promptQueue.mode() !== "automatic") return
    if (item.source === "suggestion") return
    if (followupBusy(sessionID)) return
    if (followup.failed[sessionID] === item.id) return
    if (followup.paused[sessionID]) return
    if (input.isChildSession()) return
    if (input.blocked()) return
    if (input.busy(sessionID)) return

    // Conditional queue (experimental): block auto-run after a failed item until user resumes.
    const conditional =
      settings.opencodePlus.promptQueue.conditional() ||
      (settings.opencodePlus.experimental.enabled() && settings.opencodePlus.experimental.conditionalQueue())
    if (conditional) {
      const failed = followup.failed[sessionID]
      if (failed) return
      const last = (followup.history[sessionID] ?? []).at(-1)
      if (last?.status === "failed") return
    }

    void sendFollowup(sessionID, item.id)
  })

  const dock = createMemo<SessionComposerFollowupDock | undefined>(() => {
    const sessionID = input.sessionID()
    if (!sessionID || input.isChildSession()) return undefined
    if (!settings.opencodePlus.promptQueue.enabled()) return undefined

    const items = followupDock()
    const history = followupHistoryDock()
    const suggestions = suggestedFollowups().map((item) => ({ id: item.id, text: item.text }))
    const templates = followupTemplateDock()
    const paused = followup.paused[sessionID]
    const running = runningFollowup()
    // Always surface the dock when paused so the user can resume from the UI.
    if (!items.length && !history.length && !suggestions.length && !templates.length && !paused && !running) return undefined

    return {
      items,
      history,
      suggestions,
      templates,
      running,
      sending: sendingFollowup(),
      paused: !!paused,
      pauseReason: paused?.reason,
      mode: settings.opencodePlus.promptQueue.mode(),
      autoExpand: settings.opencodePlus.promptQueue.autoExpand(),
      openSignal: openSignal(),
      onSend: (id: string) => void sendFollowup(sessionID, id, { manual: true }),
      onEdit: editFollowup,
      onDelete: deleteFollowup,
      onDuplicate: duplicateFollowup,
      onMove: moveFollowup,
      onReorder: reorderFollowup,
      onPause: () => pauseFollowup(),
      onResume: () => resumeFollowup(),
      onClear: clearFollowupQueue,
      onSkip: skipFollowup,
      onCancelQueue: clearFollowupQueue,
      onRestore: restoreFollowup,
      onAddSuggestion: addSuggestionFollowup,
      onAddTemplate: addTemplateFollowup,
      onSaveTemplate: saveFollowupTemplate,
      onDeleteTemplate: deleteFollowupTemplate,
    }
  })

  function clearPromptQueueStore() {
    setFollowup("items", {})
    setFollowup("failed", {})
    setFollowup("paused", {})
    setFollowup("edit", {})
    setFollowup("history", {})
    setFollowup("templates", [])
  }

  return {
    dock,
    edit: editingFollowup,
    enabled: queueEnabled,
    queue: queueFollowup,
    clearEdit: clearFollowupEdit,
    pauseAfterAbort: () => pauseFollowup(false, { manual: true }),
    togglePause: togglePauseFollowup,
  }
}
