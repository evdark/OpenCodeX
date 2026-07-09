import { describe, expect, test } from "bun:test"
import {
  canGoBack,
  canGoForward,
  createBrowserTab,
  extractPortsFromText,
  extractUrlsFromText,
  isLocalPreviewUrl,
  isPreviewableUrl,
  navigateBrowserHistory,
  normalizeBrowserUrl,
  pushBrowserHistory,
  suggestedLocalUrls,
  titleFromUrl,
} from "./browser-preview-model"

describe("browser-preview-model", () => {
  test("normalizes bare hosts and localhost", () => {
    expect(normalizeBrowserUrl("localhost:5173")).toBe("http://localhost:5173")
    expect(normalizeBrowserUrl("127.0.0.1:3000/app")).toBe("http://127.0.0.1:3000/app")
    expect(normalizeBrowserUrl("example.com")).toBe("http://example.com")
    expect(normalizeBrowserUrl("https://example.com")).toBe("https://example.com")
  })

  test("detects previewable and local urls", () => {
    expect(isPreviewableUrl("http://localhost:3000")).toBe(true)
    expect(isPreviewableUrl("file:///tmp/x")).toBe(false)
    expect(isLocalPreviewUrl("http://localhost:5173")).toBe(true)
    expect(isLocalPreviewUrl("https://example.com")).toBe(false)
  })

  test("extracts urls and ports from tool output", () => {
    const text = `
      VITE v6 ready
      ➜  Local:   http://localhost:5173/
      ➜  Network: http://192.168.1.10:5173/
      listening on port 8080
    `
    expect(extractUrlsFromText(text)).toContain("http://localhost:5173/")
    expect(extractPortsFromText(text)).toEqual(expect.arrayContaining([5173, 8080]))
    expect(suggestedLocalUrls([5173])).toContain("http://localhost:5173")
  })

  test("tracks history navigation", () => {
    let tab = createBrowserTab("http://localhost:3000")
    tab = pushBrowserHistory(tab, "http://localhost:3000/about")
    tab = pushBrowserHistory(tab, "http://localhost:3000/contact")
    expect(canGoBack(tab)).toBe(true)
    expect(canGoForward(tab)).toBe(false)

    const back = navigateBrowserHistory(tab, -1)
    expect(back?.url).toBe("http://localhost:3000/about")
    expect(canGoForward(back!)).toBe(true)
    expect(titleFromUrl(back!.url)).toContain("localhost:3000")
  })
})
