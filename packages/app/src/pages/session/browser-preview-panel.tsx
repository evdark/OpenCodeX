import { For, Show, createEffect, createMemo, createSignal, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { makeEventListener } from "@solid-primitives/event-listener"
import { createMediaQuery } from "@solid-primitives/media"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { ResizeHandle } from "@opencode-ai/ui/resize-handle"
import { showToast } from "@/utils/toast"
import { useBrowserPreview } from "@/context/browser-preview"
import { BROWSER_DEVICE_PRESETS, deviceFrameStyle } from "@/context/browser-preview-model"
import { useCommand } from "@/context/command"
import { useLanguage } from "@/context/language"
import { useLayout } from "@/context/layout"
import { usePlatform } from "@/context/platform"
import { createSizing } from "@/pages/session/helpers"
import { useSessionLayout } from "@/pages/session/session-layout"

export function BrowserPreviewPanel(props: { stacked?: boolean } = {}) {
  const layout = useLayout()
  const language = useLanguage()
  const platform = usePlatform()
  const command = useCommand()
  const browser = useBrowserPreview()
  const { view } = useSessionLayout()
  const isDesktop = createMediaQuery("(min-width: 768px)")
  const opened = createMemo(() => view().browser.opened())
  const size = createSizing()
  const height = createMemo(() => layout.browser.height())
  const close = () => view().browser.close()
  let root: HTMLDivElement | undefined
  let frameHost: HTMLDivElement | undefined
  let iframeEl: HTMLIFrameElement | undefined

  const [store, setStore] = createStore({
    view: typeof window === "undefined" ? 1000 : (window.visualViewport?.height ?? window.innerHeight),
    capturing: false,
  })
  const [deviceMenu, setDeviceMenu] = createSignal(false)
  let deviceMenuRoot: HTMLDivElement | undefined

  const max = () => store.view * 0.7
  const pane = () => Math.min(height(), max())
  const stacked = createMemo(() => isDesktop() && props.stacked)
  const panelHeight = createMemo(() => {
    if (!opened()) return "0px"
    if (isDesktop() && !stacked()) return "100%"
    return `${pane()}px`
  })
  const contentHeight = createMemo(() => (isDesktop() && !stacked() ? "100%" : `${pane()}px`))
  const tab = createMemo(() => browser.activeTab())
  const frameStyle = createMemo(() => deviceFrameStyle(tab()?.device ?? "responsive"))
  const consoleEntries = createMemo(() => tab()?.console ?? [])
  const invalidUrl = createMemo(() => tab()?.error === "invalid-url")

  onMount(() => {
    if (typeof window === "undefined") return
    const sync = () => setStore("view", window.visualViewport?.height ?? window.innerHeight)
    const port = window.visualViewport
    sync()
    makeEventListener(window, "resize", sync)
    if (port) makeEventListener(port, "resize", sync)
    makeEventListener(window, "pointerdown", (event: Event) => {
      if (!deviceMenu()) return
      const target = event.target
      if (!(target instanceof Node)) return
      if (deviceMenuRoot?.contains(target)) return
      setDeviceMenu(false)
    })
  })

  createEffect(() => {
    if (opened()) return
    const active = document.activeElement
    if (!(active instanceof HTMLElement)) return
    if (!root?.contains(active)) return
    active.blur()
  })

  const submit = (event?: Event) => {
    event?.preventDefault()
    const value = tab()?.input ?? ""
    browser.navigate(value)
  }

  const openExternal = () => {
    const url = tab()?.url
    if (!url) return
    platform.openLink(url)
  }

  const captureScreenshot = async () => {
    if (store.capturing) return
    const url = tab()?.url
    if (!url) return

    setStore("capturing", true)
    try {
      const canvas = document.createElement("canvas")
      const width = frameHost?.clientWidth || 1280
      const heightValue = frameHost?.clientHeight || 720
      canvas.width = width
      canvas.height = heightValue
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas unavailable")

      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--surface-base") || "#111"
      ctx.fillRect(0, 0, width, heightValue)
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text-strong") || "#fff"
      ctx.font = "14px ui-sans-serif, system-ui, sans-serif"
      ctx.fillText(language.t("browser.screenshot.header"), 24, 36)
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text-weak") || "#aaa"
      ctx.fillText(url, 24, 60)
      ctx.fillText(new Date().toLocaleString(), 24, 84)
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--border-weak-base") || "#333"
      ctx.strokeRect(16, 104, width - 32, heightValue - 120)
      ctx.fillText(language.t("browser.screenshot.note"), 24, 128)

      // Same-origin iframe capture when allowed.
      try {
        const doc = iframeEl?.contentDocument
        if (doc?.body) {
          const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${heightValue}">
              <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml" style="font:14px sans-serif;padding:16px;background:#fff;color:#111;">
                  ${doc.body.innerText.slice(0, 4000).replace(/[<>&]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[ch] ?? ch)}
                </div>
              </foreignObject>
            </svg>`
          const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
          const objectUrl = URL.createObjectURL(blob)
          await new Promise<void>((resolve, reject) => {
            const image = new Image()
            image.onload = () => {
              ctx.drawImage(image, 16, 104, width - 32, heightValue - 120)
              URL.revokeObjectURL(objectUrl)
              resolve()
            }
            image.onerror = () => {
              URL.revokeObjectURL(objectUrl)
              reject(new Error("image load failed"))
            }
            image.src = objectUrl
          })
        }
      } catch {
        // Cross-origin: keep chrome-only screenshot card.
      }

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "png"))
      if (!blob) throw new Error("Failed to encode screenshot")

      const filename = `opencode-preview-${Date.now()}.png`
      if (platform.saveFilePickerDialog && platform.writeFile) {
        const path = await platform.saveFilePickerDialog({
          title: language.t("browser.screenshot.save"),
          defaultPath: filename,
        })
        if (!path) return
        const buffer = await blob.arrayBuffer()
        await platform.writeFile(path, buffer)
        showToast({
          variant: "success",
          title: language.t("browser.screenshot.saved"),
          description: path,
        })
        return
      }

      const href = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = href
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(href)
      showToast({
        variant: "success",
        title: language.t("browser.screenshot.saved"),
        description: filename,
      })
    } catch (error) {
      showToast({
        variant: "error",
        title: language.t("browser.screenshot.failed"),
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setStore("capturing", false)
    }
  }

  return (
    <Show when={opened()}>
      <div
        ref={root}
        data-component="browser-preview"
        class="relative flex flex-col min-h-0 border-t border-border-weak-base bg-background-base"
        style={{ height: panelHeight() }}
        aria-label={language.t("browser.title")}
      >
        <Show when={!stacked()}>
          <div class="relative h-2 shrink-0" onPointerDown={() => size.start()}>
            <ResizeHandle
              class="!relative !inset-auto !h-full !w-full !transform-none"
              direction="vertical"
              size={layout.browser.height()}
              min={160}
              max={typeof window === "undefined" ? 700 : window.innerHeight * 0.7}
              collapseThreshold={50}
              onResize={(next) => {
                size.touch()
                layout.browser.resize(next)
              }}
              onCollapse={close}
            />
          </div>
        </Show>

        <div class="flex items-center gap-1 px-2 py-1.5 border-b border-border-weak-base min-h-10">
          <div class="flex items-center gap-0.5">
            <Tooltip value={language.t("browser.back")}>
              <IconButton
                icon="arrow-left"
                variant="ghost"
                size="small"
                disabled={!browser.canBack()}
                onClick={() => browser.back()}
              />
            </Tooltip>
            <Tooltip value={language.t("browser.forward")}>
              <IconButton
                icon="arrow-right"
                variant="ghost"
                size="small"
                disabled={!browser.canForward()}
                onClick={() => browser.forward()}
              />
            </Tooltip>
            <Tooltip value={language.t("browser.reload")}>
              <IconButton icon="reset" variant="ghost" size="small" onClick={() => browser.reload()} />
            </Tooltip>
          </div>

          <form class="flex-1 min-w-0 flex items-center" onSubmit={submit}>
            <input
              class="w-full h-8 px-3 rounded-md bg-surface-base border border-border-weak-base text-12-regular text-text-strong outline-none focus:border-border-strong-base"
              value={tab()?.input ?? ""}
              placeholder={language.t("browser.url.placeholder")}
              spellcheck={false}
              autocomplete="off"
              onInput={(event) => browser.setInput(event.currentTarget.value)}
              onFocus={(event) => event.currentTarget.select()}
            />
          </form>

          <div class="relative flex items-center gap-0.5" ref={deviceMenuRoot}>
            <Tooltip value={language.t("browser.device")}>
              <IconButton
                icon="layout-left"
                variant="ghost"
                size="small"
                onClick={() => setDeviceMenu((open) => !open)}
              />
            </Tooltip>
            <Show when={deviceMenu()}>
              <div class="absolute right-0 top-full z-20 mt-1 min-w-40 rounded-md border border-border-weak-base bg-background-strong shadow-lg p-1">
                <For each={BROWSER_DEVICE_PRESETS}>
                  {(device) => (
                    <button
                      type="button"
                      class="w-full text-left px-2 py-1.5 rounded text-12-regular hover:bg-surface-base text-text-strong"
                      classList={{ "bg-surface-base": tab()?.device === device.id }}
                      onClick={() => {
                        browser.setDevice(device.id)
                        setDeviceMenu(false)
                      }}
                    >
                      {device.label}
                      <Show when={device.width}>
                        <span class="text-text-weak ml-2">
                          {device.width}×{device.height}
                        </span>
                      </Show>
                    </button>
                  )}
                </For>
              </div>
            </Show>

            <Tooltip value={language.t("browser.console.toggle")}>
              <IconButton
                icon="console"
                variant={browser.consoleOpen() ? "secondary" : "ghost"}
                size="small"
                onClick={() => browser.toggleConsole()}
              />
            </Tooltip>
            <Tooltip value={language.t("browser.screenshot")}>
              <IconButton
                icon="photo"
                variant="ghost"
                size="small"
                disabled={store.capturing || !tab()?.url}
                onClick={() => void captureScreenshot()}
              />
            </Tooltip>
            <Tooltip value={language.t("browser.openExternal")}>
              <IconButton
                icon="square-arrow-top-right"
                variant="ghost"
                size="small"
                disabled={!tab()?.url}
                onClick={openExternal}
              />
            </Tooltip>
            <Tooltip value={language.t("browser.newTab")}>
              <IconButton icon="plus-small" variant="ghost" size="small" onClick={() => browser.newTab()} />
            </Tooltip>
            <Tooltip value={language.t("browser.close") + (command.keybind("browser.toggle") ? ` · ${command.keybind("browser.toggle")}` : "")}>
              <IconButton icon="close-small" variant="ghost" size="small" onClick={close} />
            </Tooltip>
          </div>
        </div>

        <div class="flex items-center gap-1 px-2 py-1 border-b border-border-weak-base overflow-x-auto">
          <For each={browser.tabs()}>
            {(item) => (
              <button
                type="button"
                class="group flex items-center gap-1 max-w-48 shrink-0 h-7 px-2 rounded-md text-11-regular border border-transparent hover:bg-surface-base"
                classList={{
                  "bg-surface-base border-border-weak-base text-text-strong": item.id === browser.active(),
                  "text-text-weak": item.id !== browser.active(),
                }}
                onClick={() => browser.setActive(item.id)}
              >
                <span class="truncate">{item.title || language.t("browser.newTab")}</span>
                <span
                  class="opacity-0 group-hover:opacity-100 text-text-weak hover:text-text-strong"
                  onClick={(event) => {
                    event.stopPropagation()
                    browser.closeTab(item.id)
                  }}
                >
                  ×
                </span>
              </button>
            )}
          </For>
          <div class="flex items-center gap-1 ml-auto shrink-0">
            <For each={browser.suggestedPorts().slice(0, 6)}>
              {(port) => (
                <button
                  type="button"
                  class="h-6 px-1.5 rounded text-11-regular text-text-weak hover:text-text-strong hover:bg-surface-base border border-transparent hover:border-border-weak-base"
                  onClick={() => browser.navigate(browser.portUrl(port))}
                  title={browser.portUrl(port)}
                >
                  :{port}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="flex min-h-0 flex-1" style={{ height: contentHeight() }}>
          <div class="relative min-h-0 min-w-0 flex-1 flex items-center justify-center overflow-auto bg-[var(--surface-inset-base,var(--surface-base))]">
            <Show
              when={tab()?.url}
              fallback={
                <div class="flex flex-col items-center gap-3 p-6 text-center max-w-md">
                  <div class="text-14-medium text-text-strong">{language.t("browser.empty.title")}</div>
                  <div class="text-12-regular text-text-weak">{language.t("browser.empty.description")}</div>
                  <div class="flex flex-wrap gap-2 justify-center">
                    <For each={browser.suggestedPorts().slice(0, 8)}>
                      {(port) => (
                        <button
                          type="button"
                          class="h-8 px-3 rounded-md border border-border-weak-base text-12-regular text-text-strong hover:bg-surface-base"
                          onClick={() => browser.navigate(browser.portUrl(port))}
                        >
                          localhost:{port}
                        </button>
                      )}
                    </For>
                  </div>
                  <Show when={browser.recent().length > 0}>
                    <div class="w-full text-left mt-2">
                      <div class="text-11-regular text-text-weak mb-1">{language.t("browser.recent")}</div>
                      <For each={browser.recent().slice(0, 5)}>
                        {(url) => (
                          <button
                            type="button"
                            class="block w-full text-left truncate text-12-regular text-text-strong hover:underline py-0.5"
                            onClick={() => browser.navigate(url)}
                          >
                            {url}
                          </button>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              }
            >
              <div
                ref={frameHost}
                class="relative bg-background-base shadow-sm border border-border-weak-base overflow-hidden"
                style={{
                  width: frameStyle().width,
                  height: frameStyle().height,
                  "max-width": frameStyle().maxWidth ?? "100%",
                  "max-height": "100%",
                }}
              >
                <Show when={tab()?.loading}>
                  <div class="absolute inset-x-0 top-0 h-0.5 bg-text-interactive-base animate-pulse z-10" />
                </Show>
                <Show when={`${tab()?.id}:${tab()?.url}:${browser.reloadToken()}`} keyed>
                  {(frameKey) => (
                    <iframe
                      ref={iframeEl}
                      data-frame-key={frameKey}
                      src={tab()?.url}
                      title={tab()?.title || language.t("browser.title")}
                      class="size-full border-0 bg-white"
                      sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-downloads"
                      referrerpolicy="no-referrer"
                      loading="lazy"
                      onLoad={() => {
                        const id = tab()?.id
                        if (id) browser.markLoaded(id)
                      }}
                      onError={() => {
                        const id = tab()?.id
                        if (id) browser.markError(id, language.t("browser.loadFailed"))
                      }}
                    />
                  )}
                </Show>
                <Show when={tab()?.error}>
                  <div class="absolute inset-0 flex items-center justify-center bg-background-base/90 p-4">
                    <div class="max-w-sm text-center">
                      <div class="text-13-medium text-text-strong mb-1">
                        {invalidUrl() ? language.t("browser.invalidUrl") : language.t("browser.loadFailed")}
                      </div>
                      <div class="text-12-regular text-text-weak mb-3">
                        {invalidUrl() ? language.t("browser.invalidUrl.description") : tab()?.error}
                      </div>
                      <div class="flex gap-2 justify-center">
                        <button
                          type="button"
                          class="h-8 px-3 rounded-md border border-border-weak-base text-12-regular"
                          onClick={() => browser.reload()}
                        >
                          {language.t("browser.reload")}
                        </button>
                        <button
                          type="button"
                          class="h-8 px-3 rounded-md border border-border-weak-base text-12-regular"
                          onClick={openExternal}
                        >
                          {language.t("browser.openExternal")}
                        </button>
                      </div>
                    </div>
                  </div>
                </Show>
              </div>
            </Show>
          </div>

          <Show when={browser.consoleOpen()}>
            <div class="w-72 shrink-0 border-l border-border-weak-base flex flex-col min-h-0 bg-background-base">
              <div class="flex items-center justify-between px-2 py-1.5 border-b border-border-weak-base">
                <div class="text-11-medium text-text-strong">{language.t("browser.console.title")}</div>
                <button
                  type="button"
                  class="text-11-regular text-text-weak hover:text-text-strong"
                  onClick={() => browser.clearConsole()}
                >
                  {language.t("browser.console.clear")}
                </button>
              </div>
              <div class="flex-1 min-h-0 overflow-auto p-2 font-mono text-[11px] leading-relaxed space-y-1">
                <Show
                  when={consoleEntries().length > 0}
                  fallback={<div class="text-text-weak">{language.t("browser.console.empty")}</div>}
                >
                  <For each={consoleEntries()}>
                    {(entry) => (
                      <div
                        classList={{
                          "text-text-weak": entry.level === "nav" || entry.level === "info" || entry.level === "log",
                          "text-text-warning-base": entry.level === "warn",
                          "text-text-danger-base": entry.level === "error",
                        }}
                      >
                        <span class="opacity-60 mr-1">[{entry.level}]</span>
                        {entry.message}
                      </div>
                    )}
                  </For>
                </Show>
              </div>
              <div class="px-2 py-1.5 border-t border-border-weak-base text-[10px] text-text-weak">
                {language.t("browser.console.note")}
              </div>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  )
}
