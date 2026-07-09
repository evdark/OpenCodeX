import { describe, expect, test } from "bun:test"
import {
  applyCustomSystemPrompt,
  exportAppSettingsBundle,
  formatImprovedProviderError,
  importAppSettingsBundle,
  searchMemoryNotes,
  shouldAutoCompact,
  shouldSuggestContextOptimization,
} from "./opencode-plus-runtime"

describe("opencode-plus-runtime", () => {
  test("applies custom system prompt modes", () => {
    expect(applyCustomSystemPrompt("hi", { enabled: false, mode: "append", prompt: "x" })).toBe("hi")
    expect(applyCustomSystemPrompt("hi", { enabled: true, mode: "append", prompt: "Be concise" })).toContain(
      "Be concise",
    )
    expect(applyCustomSystemPrompt("hi", { enabled: true, mode: "replace", prompt: "Only this" })).toContain(
      "Only this",
    )
    const once = applyCustomSystemPrompt("hi", { enabled: true, mode: "append", prompt: "Be concise" })
    expect(applyCustomSystemPrompt(once, { enabled: true, mode: "append", prompt: "Be concise" })).toBe(once)
  })

  test("suggests and auto-compacts by threshold", () => {
    const settings = {
      enabled: true,
      automaticSuggestions: true,
      automaticOptimization: true,
      neverAskAgain: false,
      minimumTokenThreshold: 1000,
    }
    expect(shouldSuggestContextOptimization({ tokens: 999, settings })).toBe(false)
    expect(shouldSuggestContextOptimization({ tokens: 1000, settings })).toBe(true)
    expect(shouldAutoCompact({ tokens: 1000, settings })).toBe(true)
  })

  test("improves common provider errors", () => {
    const improved = formatImprovedProviderError(new Error("401 unauthorized"), true)
    expect(improved).toContain("Tip:")
    expect(formatImprovedProviderError(new Error("boom"), false)).toBe("boom")
  })

  test("searches memory notes by keywords", () => {
    const notes = [
      {
        id: "1",
        title: "Auth flow",
        body: "JWT refresh tokens live in cookie store",
        tags: ["auth"],
        source: "manual" as const,
        at: 1,
      },
      {
        id: "2",
        title: "Styling",
        body: "Use design tokens",
        tags: ["ui"],
        source: "snapshot" as const,
        at: 2,
      },
    ]
    expect(searchMemoryNotes(notes, "jwt auth")[0]?.id).toBe("1")
  })

  test("round-trips settings export", () => {
    const raw = exportAppSettingsBundle({ opencodePlus: { activePreset: "balanced" }, general: { showTerminal: true } })
    const parsed = importAppSettingsBundle(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.value.opencodePlus).toEqual({ activePreset: "balanced" })
  })
})
