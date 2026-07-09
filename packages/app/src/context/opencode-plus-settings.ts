import { Option, Schema } from "effect"

export type OpenCodePlusContextAggressiveness = "low" | "balanced" | "maximum"
export type OpenCodePlusPromptMode = "default" | "append" | "replace"
export type OpenCodePlusPromptQueueMode = "automatic" | "manual" | "ask"
export type OpenCodePlusBuiltInPresetID = "vanilla" | "balanced" | "performance" | "power-user"
export type OpenCodePlusPresetID = OpenCodePlusBuiltInPresetID | (string & {})
export type OpenCodePlusCategoryID = "context" | "tools" | "prompts" | "providers" | "queue"

export interface OpenCodePlusFeatureSettings {
  adaptiveContext: {
    enabled: boolean
    aggressiveness: OpenCodePlusContextAggressiveness
    showSummary: boolean
  }
  smartToolLoading: {
    enabled: boolean
    dynamicRegistration: boolean
    fallbackClassic: boolean
  }
  promptTransparency: {
    enabled: boolean
    showTokenStatistics: boolean
    showContextDistribution: boolean
    developerMode: boolean
  }
  customSystemPrompt: {
    enabled: boolean
    mode: OpenCodePlusPromptMode
    prompt: string
    profilePrompts: boolean
  }
  contextOptimizer: {
    enabled: boolean
    automaticSuggestions: boolean
    automaticOptimization: boolean
    neverAskAgain: boolean
    minimumTokenThreshold: number
  }
  contextDashboard: {
    enabled: boolean
  }
  contextInspector: {
    enabled: boolean
  }
  providerHealth: {
    enabled: boolean
  }
  improvedErrorMessages: {
    enabled: boolean
  }
  lazyContextInjection: {
    enabled: boolean
  }
  promptQueue: {
    enabled: boolean
    suggestedFollowups: boolean
    mode: OpenCodePlusPromptQueueMode
    maximumSize: number
    desktopNotifications: boolean
    persistQueue: boolean
    showPanel: boolean
    autoExpand: boolean
    restoreAfterRestart: boolean
    /** Experimental: only auto-run next item after previous completed successfully. */
    conditional: boolean
  }
  experimental: {
    enabled: boolean
    conditionalQueue: boolean
    semanticMemory: boolean
    snapshotMemory: boolean
  }
}

export interface OpenCodePlusCustomPreset {
  id: string
  name: string
  settings: OpenCodePlusFeatureSettings
  createdAt: number
  updatedAt: number
}

export interface OpenCodePlusPreset {
  id: OpenCodePlusPresetID
  name: string
  descriptionKey: string
  builtIn: boolean
  settings: OpenCodePlusFeatureSettings
}

export interface OpenCodePlusSettings extends OpenCodePlusFeatureSettings {
  activePreset: OpenCodePlusPresetID
  customPresets: OpenCodePlusCustomPreset[]
}

export interface OpenCodePlusSettingDefinition {
  id: string
  category: OpenCodePlusCategoryID
  titleKey: string
  descriptionKey: string
  kind: "boolean" | "select" | "number" | "text"
}

export const openCodePlusCategories: readonly {
  id: OpenCodePlusCategoryID
  titleKey: string
  descriptionKey: string
}[] = [
  {
    id: "context",
    titleKey: "settings.opencodePlus.category.context.title",
    descriptionKey: "settings.opencodePlus.category.context.description",
  },
  {
    id: "tools",
    titleKey: "settings.opencodePlus.category.tools.title",
    descriptionKey: "settings.opencodePlus.category.tools.description",
  },
  {
    id: "prompts",
    titleKey: "settings.opencodePlus.category.prompts.title",
    descriptionKey: "settings.opencodePlus.category.prompts.description",
  },
  {
    id: "providers",
    titleKey: "settings.opencodePlus.category.providers.title",
    descriptionKey: "settings.opencodePlus.category.providers.description",
  },
  {
    id: "queue",
    titleKey: "settings.opencodePlus.category.queue.title",
    descriptionKey: "settings.opencodePlus.category.queue.description",
  },
] as const

export const openCodePlusSettingsRegistry: readonly OpenCodePlusSettingDefinition[] = [
  {
    id: "adaptiveContext.enabled",
    category: "context",
    titleKey: "settings.opencodePlus.adaptiveContext.title",
    descriptionKey: "settings.opencodePlus.adaptiveContext.description",
    kind: "boolean",
  },
  {
    id: "adaptiveContext.aggressiveness",
    category: "context",
    titleKey: "settings.opencodePlus.adaptiveContext.aggressiveness.title",
    descriptionKey: "settings.opencodePlus.adaptiveContext.aggressiveness.description",
    kind: "select",
  },
  {
    id: "adaptiveContext.showSummary",
    category: "context",
    titleKey: "settings.opencodePlus.adaptiveContext.showSummary.title",
    descriptionKey: "settings.opencodePlus.adaptiveContext.showSummary.description",
    kind: "boolean",
  },
  {
    id: "contextDashboard.enabled",
    category: "context",
    titleKey: "settings.opencodePlus.contextDashboard.title",
    descriptionKey: "settings.opencodePlus.contextDashboard.description",
    kind: "boolean",
  },
  {
    id: "contextInspector.enabled",
    category: "context",
    titleKey: "settings.opencodePlus.contextInspector.title",
    descriptionKey: "settings.opencodePlus.contextInspector.description",
    kind: "boolean",
  },
  {
    id: "contextOptimizer.enabled",
    category: "context",
    titleKey: "settings.opencodePlus.contextOptimizer.title",
    descriptionKey: "settings.opencodePlus.contextOptimizer.description",
    kind: "boolean",
  },
  {
    id: "contextOptimizer.automaticSuggestions",
    category: "context",
    titleKey: "settings.opencodePlus.contextOptimizer.automaticSuggestions.title",
    descriptionKey: "settings.opencodePlus.contextOptimizer.automaticSuggestions.description",
    kind: "boolean",
  },
  {
    id: "contextOptimizer.automaticOptimization",
    category: "context",
    titleKey: "settings.opencodePlus.contextOptimizer.automaticOptimization.title",
    descriptionKey: "settings.opencodePlus.contextOptimizer.automaticOptimization.description",
    kind: "boolean",
  },
  {
    id: "contextOptimizer.neverAskAgain",
    category: "context",
    titleKey: "settings.opencodePlus.contextOptimizer.neverAskAgain.title",
    descriptionKey: "settings.opencodePlus.contextOptimizer.neverAskAgain.description",
    kind: "boolean",
  },
  {
    id: "contextOptimizer.minimumTokenThreshold",
    category: "context",
    titleKey: "settings.opencodePlus.contextOptimizer.minimumTokenThreshold.title",
    descriptionKey: "settings.opencodePlus.contextOptimizer.minimumTokenThreshold.description",
    kind: "number",
  },
  {
    id: "lazyContextInjection.enabled",
    category: "context",
    titleKey: "settings.opencodePlus.lazyContextInjection.title",
    descriptionKey: "settings.opencodePlus.lazyContextInjection.description",
    kind: "boolean",
  },
  {
    id: "smartToolLoading.enabled",
    category: "tools",
    titleKey: "settings.opencodePlus.smartToolLoading.title",
    descriptionKey: "settings.opencodePlus.smartToolLoading.description",
    kind: "boolean",
  },
  {
    id: "smartToolLoading.dynamicRegistration",
    category: "tools",
    titleKey: "settings.opencodePlus.smartToolLoading.dynamicRegistration.title",
    descriptionKey: "settings.opencodePlus.smartToolLoading.dynamicRegistration.description",
    kind: "boolean",
  },
  {
    id: "smartToolLoading.fallbackClassic",
    category: "tools",
    titleKey: "settings.opencodePlus.smartToolLoading.fallbackClassic.title",
    descriptionKey: "settings.opencodePlus.smartToolLoading.fallbackClassic.description",
    kind: "boolean",
  },
  {
    id: "promptTransparency.enabled",
    category: "prompts",
    titleKey: "settings.opencodePlus.promptTransparency.title",
    descriptionKey: "settings.opencodePlus.promptTransparency.description",
    kind: "boolean",
  },
  {
    id: "promptTransparency.showTokenStatistics",
    category: "prompts",
    titleKey: "settings.opencodePlus.promptTransparency.tokenStatistics.title",
    descriptionKey: "settings.opencodePlus.promptTransparency.tokenStatistics.description",
    kind: "boolean",
  },
  {
    id: "promptTransparency.showContextDistribution",
    category: "prompts",
    titleKey: "settings.opencodePlus.promptTransparency.contextDistribution.title",
    descriptionKey: "settings.opencodePlus.promptTransparency.contextDistribution.description",
    kind: "boolean",
  },
  {
    id: "promptTransparency.developerMode",
    category: "prompts",
    titleKey: "settings.opencodePlus.promptTransparency.developerMode.title",
    descriptionKey: "settings.opencodePlus.promptTransparency.developerMode.description",
    kind: "boolean",
  },
  {
    id: "customSystemPrompt.enabled",
    category: "prompts",
    titleKey: "settings.opencodePlus.customSystemPrompt.title",
    descriptionKey: "settings.opencodePlus.customSystemPrompt.description",
    kind: "boolean",
  },
  {
    id: "customSystemPrompt.mode",
    category: "prompts",
    titleKey: "settings.opencodePlus.customSystemPrompt.mode.title",
    descriptionKey: "settings.opencodePlus.customSystemPrompt.mode.description",
    kind: "select",
  },
  {
    id: "customSystemPrompt.profilePrompts",
    category: "prompts",
    titleKey: "settings.opencodePlus.customSystemPrompt.profilePrompts.title",
    descriptionKey: "settings.opencodePlus.customSystemPrompt.profilePrompts.description",
    kind: "boolean",
  },
  {
    id: "customSystemPrompt.prompt",
    category: "prompts",
    titleKey: "settings.opencodePlus.customSystemPrompt.prompt.title",
    descriptionKey: "settings.opencodePlus.customSystemPrompt.prompt.description",
    kind: "text",
  },
  {
    id: "promptQueue.enabled",
    category: "queue",
    titleKey: "settings.opencodePlus.promptQueue.enabled.title",
    descriptionKey: "settings.opencodePlus.promptQueue.enabled.description",
    kind: "boolean",
  },
  {
    id: "promptQueue.suggestedFollowups",
    category: "queue",
    titleKey: "settings.opencodePlus.promptQueue.suggestedFollowups.title",
    descriptionKey: "settings.opencodePlus.promptQueue.suggestedFollowups.description",
    kind: "boolean",
  },
  {
    id: "promptQueue.mode",
    category: "queue",
    titleKey: "settings.opencodePlus.promptQueue.mode.title",
    descriptionKey: "settings.opencodePlus.promptQueue.mode.description",
    kind: "select",
  },
  {
    id: "promptQueue.maximumSize",
    category: "queue",
    titleKey: "settings.opencodePlus.promptQueue.maximumSize.title",
    descriptionKey: "settings.opencodePlus.promptQueue.maximumSize.description",
    kind: "number",
  },
  {
    id: "promptQueue.desktopNotifications",
    category: "queue",
    titleKey: "settings.opencodePlus.promptQueue.desktopNotifications.title",
    descriptionKey: "settings.opencodePlus.promptQueue.desktopNotifications.description",
    kind: "boolean",
  },
  {
    id: "promptQueue.persistQueue",
    category: "queue",
    titleKey: "settings.opencodePlus.promptQueue.persistQueue.title",
    descriptionKey: "settings.opencodePlus.promptQueue.persistQueue.description",
    kind: "boolean",
  },
  {
    id: "promptQueue.showPanel",
    category: "queue",
    titleKey: "settings.opencodePlus.promptQueue.showPanel.title",
    descriptionKey: "settings.opencodePlus.promptQueue.showPanel.description",
    kind: "boolean",
  },
  {
    id: "promptQueue.autoExpand",
    category: "queue",
    titleKey: "settings.opencodePlus.promptQueue.autoExpand.title",
    descriptionKey: "settings.opencodePlus.promptQueue.autoExpand.description",
    kind: "boolean",
  },
  {
    id: "promptQueue.restoreAfterRestart",
    category: "queue",
    titleKey: "settings.opencodePlus.promptQueue.restoreAfterRestart.title",
    descriptionKey: "settings.opencodePlus.promptQueue.restoreAfterRestart.description",
    kind: "boolean",
  },
  {
    id: "promptQueue.conditional",
    category: "queue",
    titleKey: "settings.opencodePlus.promptQueue.conditional.title",
    descriptionKey: "settings.opencodePlus.promptQueue.conditional.description",
    kind: "boolean",
  },
  {
    id: "providerHealth.enabled",
    category: "providers",
    titleKey: "settings.opencodePlus.providerHealth.title",
    descriptionKey: "settings.opencodePlus.providerHealth.description",
    kind: "boolean",
  },
  {
    id: "improvedErrorMessages.enabled",
    category: "providers",
    titleKey: "settings.opencodePlus.improvedErrorMessages.title",
    descriptionKey: "settings.opencodePlus.improvedErrorMessages.description",
    kind: "boolean",
  },
  {
    id: "experimental.enabled",
    category: "queue",
    titleKey: "settings.opencodePlus.experimental.enabled.title",
    descriptionKey: "settings.opencodePlus.experimental.enabled.description",
    kind: "boolean",
  },
  {
    id: "experimental.conditionalQueue",
    category: "queue",
    titleKey: "settings.opencodePlus.experimental.conditionalQueue.title",
    descriptionKey: "settings.opencodePlus.experimental.conditionalQueue.description",
    kind: "boolean",
  },
  {
    id: "experimental.semanticMemory",
    category: "context",
    titleKey: "settings.opencodePlus.experimental.semanticMemory.title",
    descriptionKey: "settings.opencodePlus.experimental.semanticMemory.description",
    kind: "boolean",
  },
  {
    id: "experimental.snapshotMemory",
    category: "context",
    titleKey: "settings.opencodePlus.experimental.snapshotMemory.title",
    descriptionKey: "settings.opencodePlus.experimental.snapshotMemory.description",
    kind: "boolean",
  },
] as const

export const vanillaOpenCodePlusFeatureSettings: OpenCodePlusFeatureSettings = {
  adaptiveContext: {
    enabled: false,
    aggressiveness: "balanced",
    showSummary: false,
  },
  smartToolLoading: {
    enabled: false,
    dynamicRegistration: false,
    fallbackClassic: true,
  },
  promptTransparency: {
    enabled: false,
    showTokenStatistics: true,
    showContextDistribution: true,
    developerMode: false,
  },
  customSystemPrompt: {
    enabled: false,
    mode: "default",
    prompt: "",
    profilePrompts: false,
  },
  contextOptimizer: {
    enabled: false,
    automaticSuggestions: true,
    automaticOptimization: false,
    neverAskAgain: false,
    minimumTokenThreshold: 32000,
  },
  contextDashboard: {
    enabled: false,
  },
  contextInspector: {
    enabled: false,
  },
  providerHealth: {
    enabled: false,
  },
  improvedErrorMessages: {
    enabled: false,
  },
  lazyContextInjection: {
    enabled: false,
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
    conditional: false,
  },
  experimental: {
    enabled: false,
    conditionalQueue: false,
    semanticMemory: false,
    snapshotMemory: false,
  },
}

export const balancedOpenCodePlusFeatureSettings: OpenCodePlusFeatureSettings = {
  ...vanillaOpenCodePlusFeatureSettings,
  adaptiveContext: {
    ...vanillaOpenCodePlusFeatureSettings.adaptiveContext,
    enabled: true,
    aggressiveness: "balanced",
  },
  smartToolLoading: {
    ...vanillaOpenCodePlusFeatureSettings.smartToolLoading,
    enabled: true,
  },
  promptTransparency: {
    ...vanillaOpenCodePlusFeatureSettings.promptTransparency,
    enabled: true,
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
    ...vanillaOpenCodePlusFeatureSettings.promptQueue,
    enabled: true,
    suggestedFollowups: false,
  },
}

export const performanceOpenCodePlusFeatureSettings: OpenCodePlusFeatureSettings = {
  ...balancedOpenCodePlusFeatureSettings,
  adaptiveContext: {
    ...balancedOpenCodePlusFeatureSettings.adaptiveContext,
    enabled: true,
    aggressiveness: "maximum",
  },
  contextOptimizer: {
    ...balancedOpenCodePlusFeatureSettings.contextOptimizer,
    enabled: true,
    automaticSuggestions: true,
    automaticOptimization: true,
  },
  lazyContextInjection: {
    enabled: true,
  },
}

export const powerUserOpenCodePlusFeatureSettings: OpenCodePlusFeatureSettings = {
  ...performanceOpenCodePlusFeatureSettings,
  smartToolLoading: {
    ...performanceOpenCodePlusFeatureSettings.smartToolLoading,
    dynamicRegistration: true,
  },
  promptTransparency: {
    ...performanceOpenCodePlusFeatureSettings.promptTransparency,
    enabled: true,
    showTokenStatistics: true,
    showContextDistribution: true,
    developerMode: true,
  },
  customSystemPrompt: {
    ...performanceOpenCodePlusFeatureSettings.customSystemPrompt,
    profilePrompts: true,
  },
  contextOptimizer: {
    ...performanceOpenCodePlusFeatureSettings.contextOptimizer,
    neverAskAgain: false,
  },
  promptQueue: {
    ...performanceOpenCodePlusFeatureSettings.promptQueue,
    enabled: true,
    suggestedFollowups: false,
    desktopNotifications: true,
  },
  experimental: {
    enabled: true,
    conditionalQueue: true,
    semanticMemory: true,
    snapshotMemory: true,
  },
}

export const defaultOpenCodePlusFeatureSettings = balancedOpenCodePlusFeatureSettings

export const builtInOpenCodePlusPresets: readonly OpenCodePlusPreset[] = [
  {
    id: "vanilla",
    name: "Vanilla",
    descriptionKey: "settings.opencodePlus.presets.vanilla.description",
    builtIn: true,
    settings: vanillaOpenCodePlusFeatureSettings,
  },
  {
    id: "balanced",
    name: "Balanced",
    descriptionKey: "settings.opencodePlus.presets.balanced.description",
    builtIn: true,
    settings: balancedOpenCodePlusFeatureSettings,
  },
  {
    id: "performance",
    name: "Performance",
    descriptionKey: "settings.opencodePlus.presets.performance.description",
    builtIn: true,
    settings: performanceOpenCodePlusFeatureSettings,
  },
  {
    id: "power-user",
    name: "Power User",
    descriptionKey: "settings.opencodePlus.presets.powerUser.description",
    builtIn: true,
    settings: powerUserOpenCodePlusFeatureSettings,
  },
] as const

export const defaultOpenCodePlusSettings: OpenCodePlusSettings = {
  ...defaultOpenCodePlusFeatureSettings,
  activePreset: "balanced",
  customPresets: [],
}

export function findOpenCodePlusPreset(id: OpenCodePlusPresetID, customPresets: readonly OpenCodePlusCustomPreset[]) {
  const builtIn = builtInOpenCodePlusPresets.find((preset) => preset.id === id)
  if (builtIn) return builtIn
  const custom = customPresets.find((preset) => preset.id === id)
  if (!custom) return undefined
  return {
    id: custom.id,
    name: custom.name,
    descriptionKey: "settings.opencodePlus.presets.custom.description",
    builtIn: false,
    settings: custom.settings,
  }
}

export function openCodePlusPresetOptions(customPresets: readonly OpenCodePlusCustomPreset[]) {
  return [
    ...builtInOpenCodePlusPresets,
    ...customPresets.map(
      (preset): OpenCodePlusPreset => ({
        id: preset.id,
        name: preset.name,
        descriptionKey: "settings.opencodePlus.presets.custom.description",
        builtIn: false,
        settings: preset.settings,
      }),
    ),
  ]
}

export function openCodePlusFeatureSettingsFrom(settings: OpenCodePlusSettings): OpenCodePlusFeatureSettings {
  return cloneFeatureSettings(settings)
}

export function cloneFeatureSettings(settings: OpenCodePlusFeatureSettings): OpenCodePlusFeatureSettings {
  return {
    adaptiveContext: { ...settings.adaptiveContext },
    smartToolLoading: { ...settings.smartToolLoading },
    promptTransparency: { ...settings.promptTransparency },
    customSystemPrompt: { ...settings.customSystemPrompt },
    contextOptimizer: { ...settings.contextOptimizer },
    contextDashboard: { ...settings.contextDashboard },
    contextInspector: { ...settings.contextInspector },
    providerHealth: { ...settings.providerHealth },
    improvedErrorMessages: { ...settings.improvedErrorMessages },
    lazyContextInjection: { ...settings.lazyContextInjection },
    promptQueue: { ...settings.promptQueue },
    experimental: { ...settings.experimental },
  }
}

export function createOpenCodePlusCustomPreset(
  name: string,
  settings: OpenCodePlusFeatureSettings,
  now = Date.now(),
): OpenCodePlusCustomPreset {
  return {
    id: `custom-${now.toString(36)}`,
    name: normalizePresetName(name, "Custom preset"),
    settings: cloneFeatureSettings(settings),
    createdAt: now,
    updatedAt: now,
  }
}

export function renameOpenCodePlusCustomPreset(
  presets: readonly OpenCodePlusCustomPreset[],
  id: string,
  name: string,
  now = Date.now(),
) {
  return presets.map((preset) => {
    if (preset.id !== id) return preset
    return { ...preset, name: normalizePresetName(name, preset.name), updatedAt: now }
  })
}

export function exportOpenCodePlusPreset(preset: OpenCodePlusPreset) {
  return JSON.stringify(
    {
      kind: "opencode-plus-preset",
      version: 1,
      name: preset.name,
      settings: preset.settings,
    },
    null,
    2,
  )
}

export function importOpenCodePlusPreset(value: string, now = Date.now()) {
  const decoded = Option.getOrUndefined(Schema.decodeUnknownOption(Schema.UnknownFromJsonString)(value))
  if (!decoded) return { ok: false as const, reason: "invalid-json" as const }

  const source = object(decoded)
    ? object(decoded.settings)
      ? { name: string(decoded.name, "Imported preset"), settings: decoded.settings }
      : object(decoded.preset)
        ? {
            name: string(decoded.preset.name, "Imported preset"),
            settings: object(decoded.preset.settings) ? decoded.preset.settings : {},
          }
        : { name: string(decoded.name, "Imported preset"), settings: decoded }
    : undefined

  if (!source) return { ok: false as const, reason: "invalid-preset" as const }
  return {
    ok: true as const,
    preset: createOpenCodePlusCustomPreset(source.name, normalizeOpenCodePlusFeatureSettings(source.settings), now),
  }
}

export function migrateOpenCodePlusSettingsState(value: unknown) {
  if (!object(value)) return value
  if (!Object.prototype.hasOwnProperty.call(value, "opencodePlus")) {
    return {
      ...value,
      opencodePlus: {
        ...cloneFeatureSettings(defaultOpenCodePlusSettings),
        activePreset: defaultOpenCodePlusSettings.activePreset,
        customPresets: [],
      },
    }
  }

  return {
    ...value,
    opencodePlus: normalizeOpenCodePlusSettings(value.opencodePlus),
  }
}

export function normalizeOpenCodePlusSettings(value: unknown): OpenCodePlusSettings {
  if (!object(value)) return defaultOpenCodePlusSettings

  const customPresets = Array.isArray(value.customPresets)
    ? value.customPresets.flatMap((preset) => {
        if (!object(preset)) return []
        const id = string(preset.id, "")
        if (!id) return []
        return [
          {
            id,
            name: normalizePresetName(string(preset.name, "Custom preset"), "Custom preset"),
            settings: normalizeOpenCodePlusFeatureSettings(preset.settings),
            createdAt: number(preset.createdAt, Date.now()),
            updatedAt: number(preset.updatedAt, Date.now()),
          },
        ]
      })
    : []

  const settings = normalizeOpenCodePlusFeatureSettings(value)
  const requestedActivePreset = typeof value.activePreset === "string" ? value.activePreset : undefined
  const upgradedSettings = upgradeSavedPresetDefaults(settings, requestedActivePreset, value)
  const activePreset =
    requestedActivePreset && presetExists(requestedActivePreset, customPresets)
      ? requestedActivePreset
      : requestedActivePreset?.startsWith("custom-migrated")
        ? requestedActivePreset
        : inferPresetID(upgradedSettings)
  return {
    ...upgradedSettings,
    activePreset,
    customPresets: customPresets.some((preset) => preset.id === activePreset)
      ? customPresets
      : activePreset.startsWith("custom-migrated")
        ? [
            ...customPresets,
            {
              id: activePreset,
              name: "Migrated settings",
              settings: upgradedSettings,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ]
        : customPresets,
  }
}

function upgradeSavedPresetDefaults(
  settings: OpenCodePlusFeatureSettings,
  requestedActivePreset: string | undefined,
  source: Record<string, unknown>,
): OpenCodePlusFeatureSettings {
  if (requestedActivePreset !== "balanced" && requestedActivePreset !== "performance") return settings
  if (!savedPromptQueueUsesPreviousDefaults(source.promptQueue)) return settings
  const preset =
    requestedActivePreset === "performance"
      ? performanceOpenCodePlusFeatureSettings
      : balancedOpenCodePlusFeatureSettings
  return {
    ...settings,
    promptQueue: { ...preset.promptQueue },
  }
}

function savedPromptQueueUsesPreviousDefaults(value: unknown) {
  if (!object(value)) return true
  return featureSettingsEqual(
    {
      ...vanillaOpenCodePlusFeatureSettings,
      promptQueue: normalizeOpenCodePlusFeatureSettings({ promptQueue: value }).promptQueue,
    },
    vanillaOpenCodePlusFeatureSettings,
  )
}

export function normalizeOpenCodePlusFeatureSettings(value: unknown): OpenCodePlusFeatureSettings {
  const source = object(value) ? value : {}
  const adaptiveContext = object(source.adaptiveContext) ? source.adaptiveContext : {}
  const smartToolLoading = object(source.smartToolLoading) ? source.smartToolLoading : {}
  const promptTransparency = object(source.promptTransparency) ? source.promptTransparency : {}
  const customSystemPrompt = object(source.customSystemPrompt) ? source.customSystemPrompt : {}
  const contextOptimizer = object(source.contextOptimizer) ? source.contextOptimizer : {}
  const contextDashboard = object(source.contextDashboard) ? source.contextDashboard : {}
  const contextInspector = object(source.contextInspector) ? source.contextInspector : {}
  const providerHealth = object(source.providerHealth) ? source.providerHealth : {}
  const improvedErrorMessages = object(source.improvedErrorMessages) ? source.improvedErrorMessages : {}
  const lazyContextInjection = object(source.lazyContextInjection) ? source.lazyContextInjection : {}
  const promptQueue = object(source.promptQueue) ? source.promptQueue : {}
  const experimental = object(source.experimental) ? source.experimental : {}

  return {
    adaptiveContext: {
      enabled: boolean(adaptiveContext.enabled, vanillaOpenCodePlusFeatureSettings.adaptiveContext.enabled),
      aggressiveness: aggressiveness(adaptiveContext.aggressiveness),
      showSummary: boolean(adaptiveContext.showSummary, vanillaOpenCodePlusFeatureSettings.adaptiveContext.showSummary),
    },
    smartToolLoading: {
      enabled: boolean(smartToolLoading.enabled, vanillaOpenCodePlusFeatureSettings.smartToolLoading.enabled),
      dynamicRegistration: boolean(
        smartToolLoading.dynamicRegistration,
        vanillaOpenCodePlusFeatureSettings.smartToolLoading.dynamicRegistration,
      ),
      fallbackClassic: boolean(
        smartToolLoading.fallbackClassic,
        vanillaOpenCodePlusFeatureSettings.smartToolLoading.fallbackClassic,
      ),
    },
    promptTransparency: {
      enabled: boolean(promptTransparency.enabled, vanillaOpenCodePlusFeatureSettings.promptTransparency.enabled),
      showTokenStatistics: boolean(
        promptTransparency.showTokenStatistics,
        vanillaOpenCodePlusFeatureSettings.promptTransparency.showTokenStatistics,
      ),
      showContextDistribution: boolean(
        promptTransparency.showContextDistribution,
        vanillaOpenCodePlusFeatureSettings.promptTransparency.showContextDistribution,
      ),
      developerMode: boolean(
        promptTransparency.developerMode,
        vanillaOpenCodePlusFeatureSettings.promptTransparency.developerMode,
      ),
    },
    customSystemPrompt: {
      enabled: boolean(customSystemPrompt.enabled, vanillaOpenCodePlusFeatureSettings.customSystemPrompt.enabled),
      mode: promptMode(customSystemPrompt.mode),
      prompt: string(customSystemPrompt.prompt, vanillaOpenCodePlusFeatureSettings.customSystemPrompt.prompt),
      profilePrompts: boolean(
        customSystemPrompt.profilePrompts,
        vanillaOpenCodePlusFeatureSettings.customSystemPrompt.profilePrompts,
      ),
    },
    contextOptimizer: {
      enabled: boolean(contextOptimizer.enabled, vanillaOpenCodePlusFeatureSettings.contextOptimizer.enabled),
      automaticSuggestions: boolean(
        contextOptimizer.automaticSuggestions,
        vanillaOpenCodePlusFeatureSettings.contextOptimizer.automaticSuggestions,
      ),
      automaticOptimization: boolean(
        contextOptimizer.automaticOptimization,
        vanillaOpenCodePlusFeatureSettings.contextOptimizer.automaticOptimization,
      ),
      neverAskAgain: boolean(
        contextOptimizer.neverAskAgain,
        vanillaOpenCodePlusFeatureSettings.contextOptimizer.neverAskAgain,
      ),
      minimumTokenThreshold: Math.max(
        0,
        Math.round(
          number(
            contextOptimizer.minimumTokenThreshold,
            vanillaOpenCodePlusFeatureSettings.contextOptimizer.minimumTokenThreshold,
          ),
        ),
      ),
    },
    contextDashboard: {
      enabled: boolean(contextDashboard.enabled, vanillaOpenCodePlusFeatureSettings.contextDashboard.enabled),
    },
    contextInspector: {
      enabled: boolean(contextInspector.enabled, vanillaOpenCodePlusFeatureSettings.contextInspector.enabled),
    },
    providerHealth: {
      enabled: boolean(providerHealth.enabled, vanillaOpenCodePlusFeatureSettings.providerHealth.enabled),
    },
    improvedErrorMessages: {
      enabled: boolean(improvedErrorMessages.enabled, vanillaOpenCodePlusFeatureSettings.improvedErrorMessages.enabled),
    },
    lazyContextInjection: {
      enabled: boolean(lazyContextInjection.enabled, vanillaOpenCodePlusFeatureSettings.lazyContextInjection.enabled),
    },
    promptQueue: {
      enabled: boolean(promptQueue.enabled, vanillaOpenCodePlusFeatureSettings.promptQueue.enabled),
      suggestedFollowups: boolean(
        promptQueue.suggestedFollowups,
        vanillaOpenCodePlusFeatureSettings.promptQueue.suggestedFollowups,
      ),
      mode: promptQueueMode(promptQueue.mode),
      maximumSize: Math.max(
        0,
        Math.round(number(promptQueue.maximumSize, vanillaOpenCodePlusFeatureSettings.promptQueue.maximumSize)),
      ),
      desktopNotifications: boolean(
        promptQueue.desktopNotifications,
        vanillaOpenCodePlusFeatureSettings.promptQueue.desktopNotifications,
      ),
      persistQueue: boolean(promptQueue.persistQueue, vanillaOpenCodePlusFeatureSettings.promptQueue.persistQueue),
      showPanel: boolean(promptQueue.showPanel, vanillaOpenCodePlusFeatureSettings.promptQueue.showPanel),
      autoExpand: boolean(promptQueue.autoExpand, vanillaOpenCodePlusFeatureSettings.promptQueue.autoExpand),
      restoreAfterRestart: boolean(
        promptQueue.restoreAfterRestart,
        vanillaOpenCodePlusFeatureSettings.promptQueue.restoreAfterRestart,
      ),
      conditional: boolean(promptQueue.conditional, vanillaOpenCodePlusFeatureSettings.promptQueue.conditional),
    },
    experimental: {
      enabled: boolean(experimental.enabled, vanillaOpenCodePlusFeatureSettings.experimental.enabled),
      conditionalQueue: boolean(
        experimental.conditionalQueue,
        vanillaOpenCodePlusFeatureSettings.experimental.conditionalQueue,
      ),
      semanticMemory: boolean(
        experimental.semanticMemory,
        vanillaOpenCodePlusFeatureSettings.experimental.semanticMemory,
      ),
      snapshotMemory: boolean(
        experimental.snapshotMemory,
        vanillaOpenCodePlusFeatureSettings.experimental.snapshotMemory,
      ),
    },
  }
}

function inferPresetID(settings: OpenCodePlusFeatureSettings): OpenCodePlusPresetID {
  const preset = builtInOpenCodePlusPresets.find((item) => featureSettingsEqual(item.settings, settings))
  if (preset) return preset.id
  return `custom-migrated-${Date.now().toString(36)}`
}

function presetExists(id: OpenCodePlusPresetID, customPresets: readonly OpenCodePlusCustomPreset[]) {
  return (
    builtInOpenCodePlusPresets.some((preset) => preset.id === id) || customPresets.some((preset) => preset.id === id)
  )
}

function featureSettingsEqual(a: OpenCodePlusFeatureSettings, b: OpenCodePlusFeatureSettings) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function normalizePresetName(value: string, fallback: string) {
  const next = value.trim()
  if (!next) return fallback
  return next.slice(0, 80)
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function boolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback
}

function number(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function string(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback
}

function aggressiveness(value: unknown): OpenCodePlusContextAggressiveness {
  if (value === "low" || value === "balanced" || value === "maximum") return value
  return vanillaOpenCodePlusFeatureSettings.adaptiveContext.aggressiveness
}

function promptMode(value: unknown): OpenCodePlusPromptMode {
  if (value === "default" || value === "append" || value === "replace") return value
  return vanillaOpenCodePlusFeatureSettings.customSystemPrompt.mode
}

function promptQueueMode(value: unknown): OpenCodePlusPromptQueueMode {
  if (value === "automatic" || value === "manual" || value === "ask") return value
  return vanillaOpenCodePlusFeatureSettings.promptQueue.mode
}
