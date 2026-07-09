import type {
  OpenCodePlusContextAggressiveness,
  OpenCodePlusFeatureSettings,
  OpenCodePlusPromptMode,
} from "./opencode-plus-settings"

export type CustomSystemPromptSettings = {
  enabled: boolean
  mode: OpenCodePlusPromptMode
  prompt: string
}

const CUSTOM_PROMPT_MARKER = "[OpenCode+ instructions]"

/** Merge custom system instructions into user-visible prompt text without mutating server system baseline. */
export function applyCustomSystemPrompt(userText: string, settings: CustomSystemPromptSettings) {
  if (!settings.enabled) return userText
  if (settings.mode === "default") return userText
  const extra = settings.prompt.trim()
  if (!extra) return userText
  // Avoid double-injection on retries / re-sends of already-marked text.
  if (userText.includes(CUSTOM_PROMPT_MARKER) || userText.includes(extra)) return userText
  if (settings.mode === "replace") {
    return [extra, userText].filter(Boolean).join("\n\n")
  }
  if (!userText.trim()) return extra
  return `${userText}\n\n${CUSTOM_PROMPT_MARKER}\n${extra}`
}

export function adaptiveTokenSoftLimit(aggressiveness: OpenCodePlusContextAggressiveness) {
  if (aggressiveness === "low") return 120_000
  if (aggressiveness === "maximum") return 48_000
  return 80_000
}

export function shouldSuggestContextOptimization(input: {
  tokens: number
  settings: OpenCodePlusFeatureSettings["contextOptimizer"]
  dismissed?: boolean
}) {
  if (!input.settings.enabled) return false
  if (!input.settings.automaticSuggestions) return false
  if (input.dismissed && input.settings.neverAskAgain) return false
  return input.tokens >= input.settings.minimumTokenThreshold
}

export function shouldAutoCompact(input: {
  tokens: number
  settings: OpenCodePlusFeatureSettings["contextOptimizer"]
}) {
  if (!input.settings.enabled) return false
  if (!input.settings.automaticOptimization) return false
  return input.tokens >= input.settings.minimumTokenThreshold
}

export function formatImprovedProviderError(error: unknown, improved: boolean) {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error"
  if (!improved) return raw

  const lower = raw.toLowerCase()
  if (lower.includes("unauthorized") || lower.includes("401") || lower.includes("invalid api key")) {
    return `${raw}\n\nTip: Reconnect the provider in Settings → Providers and verify the API key.`
  }
  if (lower.includes("rate limit") || lower.includes("429") || lower.includes("quota")) {
    return `${raw}\n\nTip: Wait a moment, switch model, or check provider plan limits.`
  }
  if (lower.includes("model") && (lower.includes("not found") || lower.includes("unsupported"))) {
    return `${raw}\n\nTip: Pick another model in the model picker or refresh provider models.`
  }
  if (lower.includes("network") || lower.includes("fetch failed") || lower.includes("econn")) {
    return `${raw}\n\nTip: Check network connectivity and the provider base URL.`
  }
  return raw
}

export type MemoryNote = {
  id: string
  title: string
  body: string
  tags: string[]
  source: "snapshot" | "project" | "manual"
  at: number
  sessionID?: string
  directory?: string
}

/** Lightweight keyword ranking — honest local "semantic" search without embeddings. */
export function searchMemoryNotes(notes: readonly MemoryNote[], query: string, limit = 12) {
  const terms = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length > 1)
  if (terms.length === 0) return notes.slice(0, limit)

  return notes
    .map((note) => {
      const hay = `${note.title}\n${note.body}\n${note.tags.join(" ")}`.toLowerCase()
      let score = 0
      for (const term of terms) {
        if (hay.includes(term)) score += 1
        if (note.title.toLowerCase().includes(term)) score += 2
        if (note.tags.some((tag) => tag.toLowerCase() === term)) score += 2
      }
      return { note, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.note.at - a.note.at)
    .slice(0, limit)
    .map((item) => item.note)
}

export type AppSettingsExport = {
  version: 1
  exportedAt: number
  opencodePlus: unknown
  general?: unknown
  appearance?: unknown
  notifications?: unknown
  sounds?: unknown
}

export function exportAppSettingsBundle(input: {
  opencodePlus: unknown
  general?: unknown
  appearance?: unknown
  notifications?: unknown
  sounds?: unknown
}) {
  const payload: AppSettingsExport = {
    version: 1,
    exportedAt: Date.now(),
    opencodePlus: input.opencodePlus,
    general: input.general,
    appearance: input.appearance,
    notifications: input.notifications,
    sounds: input.sounds,
  }
  return JSON.stringify(payload, null, 2)
}

export function importAppSettingsBundle(raw: string):
  | { ok: true; value: AppSettingsExport }
  | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(raw) as AppSettingsExport
    if (!parsed || typeof parsed !== "object") return { ok: false, error: "Invalid JSON object" }
    if (parsed.version !== 1) return { ok: false, error: "Unsupported settings export version" }
    if (!("opencodePlus" in parsed)) return { ok: false, error: "Missing opencodePlus settings" }
    return { ok: true, value: parsed }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export const CURATED_PLUGIN_BUNDLE = [
  {
    id: "oh-my-opencode",
    name: "Oh My OpenCode",
    description: "Quality-of-life commands and workflow helpers",
    npm: "oh-my-opencode",
  },
  {
    id: "opencode-scheduler",
    name: "Scheduler",
    description: "Schedule recurring agent tasks",
    npm: "@opencode-ai/plugin-scheduler",
  },
  {
    id: "websearch",
    name: "Web Search",
    description: "Search the web from agent tools",
    npm: "opencode-websearch",
  },
] as const
