import { onCleanup, onMount } from "solid-js"
import { useBrowserPreview } from "@/context/browser-preview"
import { isPreviewableUrl, normalizeBrowserUrl } from "@/context/browser-preview-model"
import { useSessionLayout } from "@/pages/session/session-layout"

/** Always-mounted bridge so links can open Browser Preview before the panel is rendered. */
export function BrowserPreviewBridge() {
  const browser = useBrowserPreview()
  const { view } = useSessionLayout()

  onMount(() => {
    if (typeof window === "undefined") return

    const onPreview = (event: Event) => {
      const detail = (event as CustomEvent<{ url?: string; newTab?: boolean; text?: string }>).detail
      if (detail?.text) browser.ingestText(detail.text)
      const raw = detail?.url
      if (!raw) return
      const url = normalizeBrowserUrl(raw)
      if (!isPreviewableUrl(url)) return
      view().browser.open()
      browser.openUrl(url, { newTab: detail?.newTab })
    }

    window.addEventListener("opencode:browser-preview", onPreview as EventListener)
    onCleanup(() => window.removeEventListener("opencode:browser-preview", onPreview as EventListener))
  })

  return null
}
