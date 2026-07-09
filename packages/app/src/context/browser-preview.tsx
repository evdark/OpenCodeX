import { batch, createEffect, createMemo, createSignal, onCleanup } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { Persist, persisted } from "@/utils/persist"
import {
  appendConsoleEntry,
  canGoBack,
  canGoForward,
  COMMON_DEV_PORTS,
  createBrowserTab,
  extractPortsFromText,
  extractUrlsFromText,
  isPreviewableUrl,
  navigateBrowserHistory,
  normalizeBrowserUrl,
  portToLocalUrl,
  pushBrowserHistory,
  titleFromUrl,
  type BrowserConsoleEntry,
  type BrowserConsoleLevel,
  type BrowserTab,
} from "./browser-preview-model"

/** Durable state only — console/loading/error stay ephemeral to avoid localStorage churn. */
type DurableBrowserTab = Pick<BrowserTab, "id" | "title" | "url" | "input" | "history" | "historyIndex" | "device">

type BrowserPreviewState = {
  tabs: DurableBrowserTab[]
  active: string
  consoleOpen: boolean
  recent: string[]
  detectedPorts: number[]
}

type TabEphemeral = {
  loading: boolean
  error?: string
  console: BrowserConsoleEntry[]
}

const MAX_RECENT = 24
const MAX_TABS = 8
const MAX_DETECTED_PORTS = 24
const SUGGESTED_PORT_LIMIT = 12

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function text(value: unknown) {
  return typeof value === "string" ? value : undefined
}

function bool(value: unknown) {
  return typeof value === "boolean" ? value : undefined
}

function emptyDurableTab(url = ""): DurableBrowserTab {
  const tab = createBrowserTab(url)
  return {
    id: tab.id,
    title: tab.title,
    url: tab.url,
    input: tab.input,
    history: tab.history,
    historyIndex: tab.historyIndex,
    device: tab.device,
  }
}

function emptyState(): BrowserPreviewState {
  const tab = emptyDurableTab()
  return { tabs: [tab], active: tab.id, consoleOpen: false, recent: [], detectedPorts: [] }
}

function emptyEphemeral(): TabEphemeral {
  return { loading: false, console: [] }
}

function migrate(value: unknown): BrowserPreviewState {
  if (!record(value)) return emptyState()

  const tabs = (Array.isArray(value.tabs) ? value.tabs : []).flatMap((item) => {
    if (!record(item)) return []
    const id = text(item.id)
    if (!id) return []
    const url = text(item.url) ?? ""
    const input = text(item.input) ?? url
    const history = Array.isArray(item.history)
      ? item.history.filter((entry): entry is string => typeof entry === "string")
      : url
        ? [url]
        : []
    const historyIndex =
      typeof item.historyIndex === "number" && item.historyIndex >= 0
        ? Math.min(item.historyIndex, Math.max(history.length - 1, 0))
        : history.length
          ? history.length - 1
          : -1
    return [
      {
        id,
        title: text(item.title) ?? (titleFromUrl(url) || "New Tab"),
        url,
        input,
        history,
        historyIndex,
        device: text(item.device) ?? "responsive",
      } satisfies DurableBrowserTab,
    ]
  })

  const fallback = tabs.length > 0 ? tabs : emptyState().tabs
  const active = text(value.active)
  const recent = Array.isArray(value.recent)
    ? value.recent.filter((entry): entry is string => typeof entry === "string").slice(0, MAX_RECENT)
    : []
  const detectedPorts = Array.isArray(value.detectedPorts)
    ? value.detectedPorts.filter((port): port is number => typeof port === "number" && Number.isInteger(port))
    : []

  return {
    tabs: fallback,
    active: active && fallback.some((tab) => tab.id === active) ? active : fallback[0].id,
    consoleOpen: bool(value.consoleOpen) ?? false,
    recent,
    detectedPorts,
  }
}

function shouldIngestPaste(textValue: string) {
  if (textValue.length < 4 || textValue.length > 4000) return false
  return /https?:\/\/|localhost|127\.0\.0\.1|port\s*[:\d]|:\d{2,5}/i.test(textValue)
}

export const { use: useBrowserPreview, provider: BrowserPreviewProvider } = createSimpleContext({
  name: "BrowserPreview",
  gate: false,
  init: () => {
    const [store, setStore, , ready] = persisted(
      { ...Persist.global("browser-preview", ["browser-preview.v1"]), migrate },
      createStore(emptyState()),
    )
    const [ephemeral, setEphemeral] = createStore({
      byTab: {} as Record<string, TabEphemeral>,
    })
    const [reloadToken, setReloadToken] = createSignal(0)

    createEffect(() => {
      if (!ready()) return
      if (store.tabs.length > 0) return
      const next = emptyState()
      setStore("tabs", next.tabs)
      setStore("active", next.active)
    })

    const ensureEphemeral = (id: string) => {
      if (ephemeral.byTab[id]) return
      setEphemeral("byTab", id, emptyEphemeral())
    }

    const activeDurable = createMemo(() => store.tabs.find((tab) => tab.id === store.active) ?? store.tabs[0])

    const activeTab = createMemo((): BrowserTab | undefined => {
      const tab = activeDurable()
      if (!tab) return
      const live = ephemeral.byTab[tab.id] ?? emptyEphemeral()
      return {
        ...tab,
        loading: live.loading,
        error: live.error,
        console: live.console,
      }
    })

    const remember = (url: string) => {
      if (!url || !isPreviewableUrl(url)) return
      setStore(
        "recent",
        produce((list) => {
          const next = [url, ...list.filter((item) => item !== url)].slice(0, MAX_RECENT)
          list.splice(0, list.length, ...next)
        }),
      )
    }

    const updateActiveDurable = (mutator: (tab: DurableBrowserTab) => DurableBrowserTab) => {
      const current = activeDurable()
      if (!current) return
      setStore(
        "tabs",
        produce((tabs) => {
          const index = tabs.findIndex((tab) => tab.id === current.id)
          if (index < 0) return
          tabs[index] = mutator(tabs[index])
        }),
      )
    }

    const updateActiveEphemeral = (mutator: (state: TabEphemeral) => TabEphemeral) => {
      const current = activeDurable()
      if (!current) return
      ensureEphemeral(current.id)
      setEphemeral("byTab", current.id, (prev) => mutator(prev ?? emptyEphemeral()))
    }

    const log = (level: BrowserConsoleLevel, message: string) => {
      updateActiveEphemeral((state) => ({
        ...state,
        console: appendConsoleEntry(state.console, level, message),
      }))
    }

    const setLoading = (loading: boolean, error?: string) => {
      updateActiveEphemeral((state) => ({
        ...state,
        loading,
        error,
      }))
    }

    const navigate = (raw: string) => {
      const url = normalizeBrowserUrl(raw)
      if (!url || !isPreviewableUrl(url)) {
        setLoading(false, "invalid-url")
        return
      }
      updateActiveDurable((tab) => {
        const next = pushBrowserHistory(
          {
            ...tab,
            loading: false,
            console: [],
          },
          url,
        )
        return {
          id: next.id,
          title: next.title,
          url: next.url,
          input: next.input,
          history: next.history,
          historyIndex: next.historyIndex,
          device: next.device,
        }
      })
      setLoading(true)
      remember(url)
      log("nav", `Navigate ${url}`)
      setReloadToken((value) => value + 1)
    }

    const reload = () => {
      const tab = activeDurable()
      if (!tab?.url) return
      setLoading(true)
      log("nav", `Reload ${tab.url}`)
      setReloadToken((value) => value + 1)
    }

    const goHistory = (delta: -1 | 1) => {
      const before = activeDurable()
      if (!before) return
      const full: BrowserTab = { ...before, loading: false, console: [] }
      if (delta < 0 && !canGoBack(full)) return
      if (delta > 0 && !canGoForward(full)) return
      const next = navigateBrowserHistory(full, delta)
      if (!next) return
      updateActiveDurable(() => ({
        id: next.id,
        title: next.title,
        url: next.url,
        input: next.input,
        history: next.history,
        historyIndex: next.historyIndex,
        device: next.device,
      }))
      setLoading(true)
      remember(next.url)
      log("nav", `${delta < 0 ? "Back" : "Forward"} ${next.url}`)
      setReloadToken((value) => value + 1)
    }

    const openUrl = (raw: string, opts?: { newTab?: boolean }) => {
      const url = normalizeBrowserUrl(raw)
      if (!url || !isPreviewableUrl(url)) return false

      if (opts?.newTab) {
        if (store.tabs.length >= MAX_TABS) {
          const removed = store.tabs[0]
          setStore(
            produce((state) => {
              state.tabs.shift()
            }),
          )
          if (removed) {
            setEphemeral(
              "byTab",
              produce((map) => {
                delete map[removed.id]
              }),
            )
          }
        }
        const tab = emptyDurableTab(url)
        setStore(
          produce((state) => {
            state.tabs.push(tab)
            state.active = tab.id
          }),
        )
        ensureEphemeral(tab.id)
        setLoading(true)
        remember(url)
        setReloadToken((value) => value + 1)
        return true
      }

      navigate(url)
      return true
    }

    const ingestText = (textValue: string) => {
      if (!shouldIngestPaste(textValue)) return
      const urls = extractUrlsFromText(textValue)
      const ports = extractPortsFromText(textValue)
      if (ports.length === 0 && urls.length === 0) return

      batch(() => {
        if (ports.length > 0) {
          setStore(
            "detectedPorts",
            produce((list) => {
              const next = Array.from(new Set([...ports, ...list]))
                .sort((a, b) => a - b)
                .slice(0, MAX_DETECTED_PORTS)
              list.splice(0, list.length, ...next)
            }),
          )
        }
        for (const url of urls) remember(url)
      })
    }

    if (typeof window !== "undefined") {
      const onPaste = (event: ClipboardEvent) => {
        const textValue = event.clipboardData?.getData("text") ?? ""
        if (textValue) ingestText(textValue)
      }
      window.addEventListener("paste", onPaste)
      onCleanup(() => window.removeEventListener("paste", onPaste))
    }

    // Drop ephemeral state for closed tabs.
    createEffect(() => {
      const ids = new Set(store.tabs.map((tab) => tab.id))
      for (const id of Object.keys(ephemeral.byTab)) {
        if (ids.has(id)) continue
        setEphemeral(
          "byTab",
          produce((map) => {
            delete map[id]
          }),
        )
      }
    })

    return {
      ready,
      tabs: createMemo(() => store.tabs),
      active: createMemo(() => store.active),
      activeTab,
      consoleOpen: createMemo(() => store.consoleOpen),
      recent: createMemo(() => store.recent),
      detectedPorts: createMemo(() => store.detectedPorts),
      suggestedPorts: createMemo(() => {
        const ports = new Set([...store.detectedPorts, ...COMMON_DEV_PORTS])
        return Array.from(ports)
          .sort((a, b) => a - b)
          .slice(0, SUGGESTED_PORT_LIMIT)
      }),
      canBack: createMemo(() => {
        const tab = activeDurable()
        return tab ? canGoBack({ ...tab, loading: false, console: [] }) : false
      }),
      canForward: createMemo(() => {
        const tab = activeDurable()
        return tab ? canGoForward({ ...tab, loading: false, console: [] }) : false
      }),
      reloadToken,
      setActive(id: string) {
        if (!store.tabs.some((tab) => tab.id === id)) return
        setStore("active", id)
      },
      newTab(url?: string) {
        if (url) {
          openUrl(url, { newTab: true })
          return
        }
        if (store.tabs.length >= MAX_TABS) {
          const removed = store.tabs[0]
          setStore(
            produce((state) => {
              state.tabs.shift()
            }),
          )
          if (removed) {
            setEphemeral(
              "byTab",
              produce((map) => {
                delete map[removed.id]
              }),
            )
          }
        }
        const tab = emptyDurableTab()
        setStore(
          produce((state) => {
            state.tabs.push(tab)
            state.active = tab.id
          }),
        )
        ensureEphemeral(tab.id)
      },
      closeTab(id: string) {
        setStore(
          produce((state) => {
            if (state.tabs.length <= 1) {
              const tab = emptyDurableTab()
              state.tabs = [tab]
              state.active = tab.id
              return
            }
            const index = state.tabs.findIndex((tab) => tab.id === id)
            if (index < 0) return
            state.tabs.splice(index, 1)
            if (state.active === id) {
              const next = state.tabs[Math.max(0, index - 1)] ?? state.tabs[0]
              state.active = next.id
            }
          }),
        )
        setEphemeral(
          "byTab",
          produce((map) => {
            delete map[id]
          }),
        )
      },
      setInput(value: string) {
        updateActiveDurable((tab) => ({ ...tab, input: value }))
      },
      setDevice(device: string) {
        updateActiveDurable((tab) => ({ ...tab, device }))
      },
      toggleConsole() {
        setStore("consoleOpen", !store.consoleOpen)
      },
      setConsoleOpen(open: boolean) {
        setStore("consoleOpen", open)
      },
      clearConsole() {
        updateActiveEphemeral((state) => ({ ...state, console: [] }))
      },
      navigate,
      reload,
      back() {
        goHistory(-1)
      },
      forward() {
        goHistory(1)
      },
      openUrl,
      ingestText,
      markLoaded(id: string) {
        ensureEphemeral(id)
        setEphemeral("byTab", id, (prev) => ({
          ...(prev ?? emptyEphemeral()),
          loading: false,
          error: undefined,
        }))
      },
      markError(id: string, message: string) {
        ensureEphemeral(id)
        setEphemeral("byTab", id, (prev) => ({
          ...(prev ?? emptyEphemeral()),
          loading: false,
          error: message,
          console: appendConsoleEntry((prev ?? emptyEphemeral()).console, "error", message),
        }))
      },
      portUrl: portToLocalUrl,
    }
  },
})
