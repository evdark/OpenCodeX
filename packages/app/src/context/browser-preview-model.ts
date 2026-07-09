export type BrowserDevicePreset = {
  id: string
  label: string
  width?: number
  height?: number
}

export type BrowserConsoleLevel = "log" | "info" | "warn" | "error" | "nav"

export type BrowserConsoleEntry = {
  id: string
  level: BrowserConsoleLevel
  message: string
  at: number
}

export type BrowserHistoryEntry = {
  url: string
  title?: string
  at: number
}

export type BrowserTab = {
  id: string
  title: string
  url: string
  input: string
  history: string[]
  historyIndex: number
  device: string
  loading: boolean
  error?: string
  console: BrowserConsoleEntry[]
}

export const BROWSER_DEVICE_PRESETS: BrowserDevicePreset[] = [
  { id: "responsive", label: "Responsive" },
  { id: "mobile", label: "iPhone", width: 390, height: 844 },
  { id: "mobile-sm", label: "iPhone SE", width: 375, height: 667 },
  { id: "tablet", label: "iPad", width: 768, height: 1024 },
  { id: "laptop", label: "Laptop", width: 1280, height: 800 },
  { id: "desktop", label: "Desktop", width: 1440, height: 900 },
]

export const COMMON_DEV_PORTS = [3000, 3001, 4000, 4173, 4200, 4321, 5000, 5173, 5174, 8000, 8080, 8888, 9000]

const URL_IN_TEXT =
  /https?:\/\/[^\s<>"'`)\]]+|localhost(?::\d+)?(?:\/[^\s<>"'`)\]]*)?|127\.0\.0\.1(?::\d+)?(?:\/[^\s<>"'`)\]]*)?/gi

const PORT_IN_TEXT =
  /(?:listening on|local:|network:|ready on|started server on|http:\/\/(?:localhost|127\.0\.0\.1)|port[:\s]+)(?::?\s*)(\d{2,5})/gi

export function createBrowserTabId() {
  return crypto.randomUUID()
}

export function createBrowserTab(url = ""): BrowserTab {
  const normalized = url ? normalizeBrowserUrl(url) : ""
  return {
    id: createBrowserTabId(),
    title: titleFromUrl(normalized) || "New Tab",
    url: normalized,
    input: normalized || "http://localhost:3000",
    history: normalized ? [normalized] : [],
    historyIndex: normalized ? 0 : -1,
    device: "responsive",
    loading: false,
    console: [],
  }
}

export function titleFromUrl(url: string) {
  if (!url) return ""
  try {
    const parsed = new URL(url)
    return parsed.hostname + (parsed.port ? `:${parsed.port}` : "") + (parsed.pathname === "/" ? "" : parsed.pathname)
  } catch {
    return url
  }
}

export function normalizeBrowserUrl(raw: string) {
  const value = raw.trim()
  if (!value) return ""

  if (value.startsWith("http://") || value.startsWith("https://")) return value
  if (value.startsWith("about:") || value.startsWith("data:") || value.startsWith("blob:")) return value
  if (value.startsWith("//")) return `http:${value}`
  if (value.startsWith("localhost") || value.startsWith("127.0.0.1") || value.startsWith("0.0.0.0")) {
    return `http://${value}`
  }
  if (/^\d+\.\d+\.\d+\.\d+/.test(value)) return `http://${value}`
  if (/^[\w.-]+(:\d+)?(\/.*)?$/.test(value)) return `http://${value}`
  return `https://${value}`
}

export function isPreviewableUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function isLocalPreviewUrl(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host.endsWith(".local")
  } catch {
    return false
  }
}

export function extractUrlsFromText(text: string) {
  const matches = text.match(URL_IN_TEXT) ?? []
  const seen = new Set<string>()
  return matches.flatMap((match) => {
    const cleaned = match.replace(/[.,;:!?)]+$/, "")
    const url = normalizeBrowserUrl(cleaned)
    if (!isPreviewableUrl(url) || seen.has(url)) return []
    seen.add(url)
    return [url]
  })
}

export function extractPortsFromText(text: string) {
  const ports = new Set<number>()
  for (const match of text.matchAll(PORT_IN_TEXT)) {
    const port = Number(match[1])
    if (Number.isInteger(port) && port > 0 && port < 65536) ports.add(port)
  }
  for (const url of extractUrlsFromText(text)) {
    try {
      const parsed = new URL(url)
      if (parsed.port) ports.add(Number(parsed.port))
    } catch {
      // ignore
    }
  }
  return Array.from(ports).sort((a, b) => a - b)
}

export function portToLocalUrl(port: number) {
  return `http://localhost:${port}`
}

export function suggestedLocalUrls(ports: number[]) {
  const unique = new Set<number>([...ports, ...COMMON_DEV_PORTS])
  return Array.from(unique)
    .sort((a, b) => a - b)
    .map(portToLocalUrl)
}

export function pushBrowserHistory(tab: BrowserTab, url: string): BrowserTab {
  const history = tab.history.slice(0, tab.historyIndex + 1)
  if (history[history.length - 1] === url) {
    return {
      ...tab,
      url,
      input: url,
      title: titleFromUrl(url),
      history,
      historyIndex: history.length - 1,
      loading: true,
      error: undefined,
    }
  }
  history.push(url)
  return {
    ...tab,
    url,
    input: url,
    title: titleFromUrl(url),
    history,
    historyIndex: history.length - 1,
    loading: true,
    error: undefined,
  }
}

export function navigateBrowserHistory(tab: BrowserTab, delta: number): BrowserTab | undefined {
  const next = tab.historyIndex + delta
  if (next < 0 || next >= tab.history.length) return
  const url = tab.history[next]
  if (!url) return
  return {
    ...tab,
    url,
    input: url,
    title: titleFromUrl(url),
    historyIndex: next,
    loading: true,
    error: undefined,
  }
}

export function canGoBack(tab: BrowserTab) {
  return tab.historyIndex > 0
}

export function canGoForward(tab: BrowserTab) {
  return tab.historyIndex >= 0 && tab.historyIndex < tab.history.length - 1
}

export function appendConsoleEntry(
  entries: BrowserConsoleEntry[],
  level: BrowserConsoleLevel,
  message: string,
  limit = 200,
): BrowserConsoleEntry[] {
  const next: BrowserConsoleEntry = {
    id: createBrowserTabId(),
    level,
    message,
    at: Date.now(),
  }
  const list = [...entries, next]
  return list.length > limit ? list.slice(list.length - limit) : list
}

export function deviceFrameStyle(deviceId: string): { width?: string; height?: string; maxWidth?: string } {
  const device = BROWSER_DEVICE_PRESETS.find((item) => item.id === deviceId)
  if (!device || !device.width) return { width: "100%", height: "100%" }
  return {
    width: `${device.width}px`,
    height: device.height ? `${device.height}px` : "100%",
    maxWidth: "100%",
  }
}
