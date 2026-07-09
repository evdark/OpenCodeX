import { describe, expect, test } from "bun:test"
import {
  normalizeOpenCodePlusAdvancedValue,
  opencodePlusSettingsMatches,
  opencodePlusSettingsSearching,
  parseOpenCodePlusQueueSize,
  parseOpenCodePlusTokenThreshold,
} from "./opencode-plus-settings-model"
import {
  builtInOpenCodePlusPresets,
  defaultOpenCodePlusSettings,
  exportOpenCodePlusPreset,
  importOpenCodePlusPreset,
  migrateOpenCodePlusSettingsState,
  openCodePlusCategories,
  openCodePlusSettingsRegistry,
  type OpenCodePlusSettings,
  vanillaOpenCodePlusFeatureSettings,
} from "../context/settings"

describe("OpenCode Plus settings presentation helpers", () => {
  test("treats blank search as matching every category", () => {
    expect(opencodePlusSettingsMatches("", ["Context optimizer"])).toBe(true)
    expect(opencodePlusSettingsMatches("   ", [])).toBe(true)
    expect(opencodePlusSettingsSearching("   ")).toBe(false)
  })

  test("matches case-insensitive category and setting text", () => {
    expect(opencodePlusSettingsMatches("prompt", ["Custom system prompt", "Context optimizer"])).toBe(true)
    expect(opencodePlusSettingsMatches("TOOLS", ["Tools", "Smart tool loading"])).toBe(true)
    expect(opencodePlusSettingsMatches("billing", ["Adaptive context"])).toBe(false)
    expect(opencodePlusSettingsSearching("tools")).toBe(true)
  })

  test("normalizes token thresholds without accepting invalid input", () => {
    expect(parseOpenCodePlusTokenThreshold(32000)).toBe(32000)
    expect(parseOpenCodePlusTokenThreshold("31999.6")).toBe(32000)
    expect(parseOpenCodePlusTokenThreshold("-12")).toBe(0)
    expect(parseOpenCodePlusTokenThreshold("not a number")).toBeUndefined()
  })

  test("normalizes prompt queue sizes within the UI range", () => {
    expect(parseOpenCodePlusQueueSize(25)).toBe(25)
    expect(parseOpenCodePlusQueueSize("3.6")).toBe(4)
    expect(parseOpenCodePlusQueueSize("-2")).toBe(0)
    expect(parseOpenCodePlusQueueSize("500")).toBe(200)
    expect(parseOpenCodePlusQueueSize("many")).toBeUndefined()
  })

  test("keeps accordion state limited to known categories", () => {
    expect(normalizeOpenCodePlusAdvancedValue("context")).toEqual(["context"])
    expect(normalizeOpenCodePlusAdvancedValue(["tools", "unknown", "prompts"])).toEqual(["tools", "prompts"])
    expect(normalizeOpenCodePlusAdvancedValue(null)).toEqual([])
  })

  test("uses Balanced as the default preset for new settings", () => {
    expect(defaultOpenCodePlusSettings.activePreset).toBe("balanced")
    expect(defaultOpenCodePlusSettings.adaptiveContext.enabled).toBe(true)
    expect(defaultOpenCodePlusSettings.smartToolLoading.enabled).toBe(true)
    expect(defaultOpenCodePlusSettings.promptTransparency.enabled).toBe(true)
    expect(defaultOpenCodePlusSettings.promptQueue.enabled).toBe(true)
    expect(defaultOpenCodePlusSettings.promptQueue.suggestedFollowups).toBe(false)
  })

  test("keeps the Vanilla preset as the upstream compatibility profile", () => {
    const vanilla = builtInOpenCodePlusPresets.find((preset) => preset.id === "vanilla")
    expect(vanilla?.settings.adaptiveContext.enabled).toBe(false)
    expect(vanilla?.settings.smartToolLoading.enabled).toBe(false)
    expect(vanilla?.settings.promptTransparency.enabled).toBe(false)
    expect(vanilla?.settings.customSystemPrompt.enabled).toBe(false)
    expect(vanilla?.settings.contextOptimizer.enabled).toBe(false)
    expect(vanilla?.settings.contextDashboard.enabled).toBe(false)
    expect(vanilla?.settings.contextInspector.enabled).toBe(false)
    expect(vanilla?.settings.providerHealth.enabled).toBe(false)
    expect(vanilla?.settings.improvedErrorMessages.enabled).toBe(false)
    expect(vanilla?.settings.lazyContextInjection.enabled).toBe(false)
    expect(vanilla?.settings.promptQueue.enabled).toBe(false)
  })

  test("keeps the registry searchable and category-backed", () => {
    const categoryIDs = openCodePlusCategories.map((category) => category.id)
    const settingIDs = openCodePlusSettingsRegistry.map((setting) => setting.id)

    expect(categoryIDs).toEqual(["context", "tools", "prompts", "providers", "queue"])
    expect(new Set(settingIDs).size).toBe(settingIDs.length)
    expect(openCodePlusSettingsRegistry.every((setting) => categoryIDs.includes(setting.category))).toBe(true)
    for (const preset of builtInOpenCodePlusPresets) {
      for (const setting of openCodePlusSettingsRegistry) {
        expect(readPath(preset.settings, setting.id)).not.toBeUndefined()
      }
    }
  })

  test("round trips built-in presets through export and import", () => {
    const balanced = builtInOpenCodePlusPresets.find((preset) => preset.id === "balanced")
    if (!balanced) throw new Error("Balanced preset missing")

    const imported = importOpenCodePlusPreset(exportOpenCodePlusPreset(balanced), 123)
    expect(imported.ok).toBe(true)
    if (!imported.ok) return
    expect(imported.preset.id).toBe("custom-3f")
    expect(imported.preset.name).toBe("Balanced")
    expect(imported.preset.settings).toEqual(balanced.settings)
  })

  test("imports partial presets with disabled fallbacks for new features", () => {
    const imported = importOpenCodePlusPreset(
      JSON.stringify({ name: "Partial", settings: { adaptiveContext: { enabled: true } } }),
      456,
    )

    expect(imported.ok).toBe(true)
    if (!imported.ok) return
    expect(imported.preset.settings.adaptiveContext.enabled).toBe(true)
    expect(imported.preset.settings.smartToolLoading.enabled).toBe(false)
    expect(imported.preset.settings.contextDashboard.enabled).toBe(false)
    expect(imported.preset.settings.lazyContextInjection.enabled).toBe(false)
  })

  test("migrates existing user settings without enabling new gates", () => {
    const migrated = migrateOpenCodePlusSettingsState({
      opencodePlus: {
        adaptiveContext: {
          enabled: true,
        },
      },
    })

    expect(hasOpenCodePlusSettings(migrated)).toBe(true)
    if (!hasOpenCodePlusSettings(migrated)) return
    expect(migrated.opencodePlus.adaptiveContext.enabled).toBe(true)
    expect(migrated.opencodePlus.smartToolLoading.enabled).toBe(
      vanillaOpenCodePlusFeatureSettings.smartToolLoading.enabled,
    )
    expect(migrated.opencodePlus.contextDashboard.enabled).toBe(false)
    expect(migrated.opencodePlus.providerHealth.enabled).toBe(false)
    expect(migrated.opencodePlus.activePreset.startsWith("custom-migrated")).toBe(true)
    expect(migrated.opencodePlus.customPresets).toHaveLength(1)
  })

  test("upgrades saved Balanced queue defaults to the current OpenCode Plus behavior", () => {
    const migrated = migrateOpenCodePlusSettingsState({
      opencodePlus: {
        activePreset: "balanced",
        adaptiveContext: {
          enabled: true,
          aggressiveness: "balanced",
          showSummary: false,
        },
        smartToolLoading: {
          enabled: true,
          dynamicRegistration: false,
          fallbackClassic: true,
        },
        promptTransparency: {
          enabled: true,
          showTokenStatistics: true,
          showContextDistribution: true,
          developerMode: false,
        },
        contextDashboard: {
          enabled: true,
        },
        contextInspector: {
          enabled: true,
        },
        providerHealth: {
          enabled: true,
        },
        improvedErrorMessages: {
          enabled: true,
        },
        promptQueue: {
          enabled: false,
          suggestedFollowups: false,
          mode: "automatic",
          maximumSize: 20,
          desktopNotifications: false,
          persistQueue: true,
          showPanel: true,
          autoExpand: true,
          restoreAfterRestart: true,
        },
      },
    })

    expect(hasOpenCodePlusSettings(migrated)).toBe(true)
    if (!hasOpenCodePlusSettings(migrated)) return
    expect(migrated.opencodePlus.activePreset).toBe("balanced")
    expect(migrated.opencodePlus.promptQueue.enabled).toBe(true)
    expect(migrated.opencodePlus.promptQueue.suggestedFollowups).toBe(false)
  })

  test("moves older settings files onto the default OpenCode Plus profile", () => {
    const migrated = migrateOpenCodePlusSettingsState({ general: { theme: "system" } })

    expect(hasOpenCodePlusSettings(migrated)).toBe(true)
    if (!hasOpenCodePlusSettings(migrated)) return
    expect(migrated.opencodePlus.activePreset).toBe("balanced")
    expect(migrated.opencodePlus.adaptiveContext.enabled).toBe(true)
    expect(migrated.opencodePlus.smartToolLoading.enabled).toBe(true)
    expect(migrated.opencodePlus.promptQueue.enabled).toBe(true)
  })

  test("recovers corrupted OpenCode Plus persisted settings from defaults", () => {
    const migrated = migrateOpenCodePlusSettingsState({ opencodePlus: null })

    expect(hasOpenCodePlusSettings(migrated)).toBe(true)
    if (!hasOpenCodePlusSettings(migrated)) return
    expect(migrated.opencodePlus.activePreset).toBe("balanced")
    expect(migrated.opencodePlus.adaptiveContext.enabled).toBe(true)
  })
})

function hasOpenCodePlusSettings(value: unknown): value is { opencodePlus: OpenCodePlusSettings } {
  return record(value) && record(value.opencodePlus)
}

function readPath(value: unknown, path: string) {
  return path.split(".").reduce((current: unknown, key) => {
    if (!record(current)) return undefined
    return current[key]
  }, value)
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
