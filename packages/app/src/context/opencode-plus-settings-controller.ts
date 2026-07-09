import { createMemo } from "solid-js"
import { reconcile, type SetStoreFunction, type Store } from "solid-js/store"
import {
  builtInOpenCodePlusPresets,
  cloneFeatureSettings,
  createOpenCodePlusCustomPreset,
  defaultOpenCodePlusSettings,
  exportOpenCodePlusPreset,
  findOpenCodePlusPreset,
  importOpenCodePlusPreset,
  openCodePlusFeatureSettingsFrom,
  openCodePlusPresetOptions,
  renameOpenCodePlusCustomPreset,
  type OpenCodePlusContextAggressiveness,
  type OpenCodePlusCustomPreset,
  type OpenCodePlusPresetID,
  type OpenCodePlusPromptMode,
  type OpenCodePlusPromptQueueMode,
  type OpenCodePlusSettings,
} from "./opencode-plus-settings"

type OpenCodePlusHost = {
  opencodePlus: OpenCodePlusSettings
}

function withFallback<T>(read: () => T | undefined, fallback: T) {
  return createMemo(() => read() ?? fallback)
}

export function createOpenCodePlusSettingsController(
  store: Store<OpenCodePlusHost>,
  setStore: SetStoreFunction<OpenCodePlusHost>,
) {
  const customPresets = withFallback(() => store.opencodePlus?.customPresets, defaultOpenCodePlusSettings.customPresets)
  const activePreset = withFallback(() => store.opencodePlus?.activePreset, defaultOpenCodePlusSettings.activePreset)

  const applyPresetSettings = (
    id: OpenCodePlusPresetID,
    settings: OpenCodePlusSettings | OpenCodePlusCustomPreset["settings"],
    presets = customPresets(),
  ) => {
    setStore(
      "opencodePlus",
      reconcile({
        ...cloneFeatureSettings(settings),
        activePreset: id,
        customPresets: presets,
      }),
    )
  }

  return {
    presets: {
      active: activePreset,
      custom: customPresets,
      options: createMemo(() => openCodePlusPresetOptions(customPresets())),
      apply(id: OpenCodePlusPresetID) {
        const preset = findOpenCodePlusPreset(id, customPresets())
        if (!preset) return false
        applyPresetSettings(preset.id, preset.settings)
        return true
      },
      create(name: string) {
        const preset = createOpenCodePlusCustomPreset(name, openCodePlusFeatureSettingsFrom(store.opencodePlus))
        setStore("opencodePlus", "customPresets", (current) => [...(current ?? []), preset])
        setStore("opencodePlus", "activePreset", preset.id)
        return preset.id
      },
      duplicate(id: OpenCodePlusPresetID, name: string) {
        const preset = findOpenCodePlusPreset(id, customPresets())
        if (!preset) return undefined
        const copy = createOpenCodePlusCustomPreset(name || `${preset.name} Copy`, preset.settings)
        const next = [...customPresets(), copy]
        setStore("opencodePlus", "customPresets", next)
        applyPresetSettings(copy.id, copy.settings, next)
        return copy.id
      },
      rename(id: OpenCodePlusPresetID, name: string) {
        if (builtInOpenCodePlusPresets.some((preset) => preset.id === id)) return false
        if (!customPresets().some((preset) => preset.id === id)) return false
        setStore("opencodePlus", "customPresets", (current) => renameOpenCodePlusCustomPreset(current ?? [], id, name))
        return true
      },
      delete(id: OpenCodePlusPresetID) {
        if (builtInOpenCodePlusPresets.some((preset) => preset.id === id)) return false
        if (!customPresets().some((preset) => preset.id === id)) return false
        const next = customPresets().filter((preset) => preset.id !== id)
        setStore("opencodePlus", "customPresets", next)
        if (activePreset() !== id) return true
        const balanced = findOpenCodePlusPreset("balanced", next)
        if (balanced) applyPresetSettings(balanced.id, balanced.settings, next)
        return true
      },
      export(id: OpenCodePlusPresetID) {
        const preset = findOpenCodePlusPreset(id, customPresets())
        if (!preset) return undefined
        return exportOpenCodePlusPreset(preset)
      },
      import(value: string) {
        const result = importOpenCodePlusPreset(value)
        if (!result.ok) return result
        const next = [...customPresets(), result.preset]
        setStore("opencodePlus", "customPresets", next)
        applyPresetSettings(result.preset.id, result.preset.settings, next)
        return result
      },
      restoreDefaults() {
        const balanced = findOpenCodePlusPreset("balanced", customPresets())
        if (!balanced) return false
        applyPresetSettings(balanced.id, balanced.settings)
        return true
      },
    },
    adaptiveContext: {
      enabled: withFallback(
        () => store.opencodePlus?.adaptiveContext?.enabled,
        defaultOpenCodePlusSettings.adaptiveContext.enabled,
      ),
      setEnabled(value: boolean) {
        setStore("opencodePlus", "adaptiveContext", "enabled", value)
      },
      aggressiveness: withFallback(
        () => store.opencodePlus?.adaptiveContext?.aggressiveness,
        defaultOpenCodePlusSettings.adaptiveContext.aggressiveness,
      ),
      setAggressiveness(value: OpenCodePlusContextAggressiveness) {
        setStore("opencodePlus", "adaptiveContext", "aggressiveness", value)
      },
      showSummary: withFallback(
        () => store.opencodePlus?.adaptiveContext?.showSummary,
        defaultOpenCodePlusSettings.adaptiveContext.showSummary,
      ),
      setShowSummary(value: boolean) {
        setStore("opencodePlus", "adaptiveContext", "showSummary", value)
      },
    },
    smartToolLoading: {
      enabled: withFallback(
        () => store.opencodePlus?.smartToolLoading?.enabled,
        defaultOpenCodePlusSettings.smartToolLoading.enabled,
      ),
      setEnabled(value: boolean) {
        setStore("opencodePlus", "smartToolLoading", "enabled", value)
      },
      dynamicRegistration: withFallback(
        () => store.opencodePlus?.smartToolLoading?.dynamicRegistration,
        defaultOpenCodePlusSettings.smartToolLoading.dynamicRegistration,
      ),
      setDynamicRegistration(value: boolean) {
        setStore("opencodePlus", "smartToolLoading", "dynamicRegistration", value)
      },
      fallbackClassic: withFallback(
        () => store.opencodePlus?.smartToolLoading?.fallbackClassic,
        defaultOpenCodePlusSettings.smartToolLoading.fallbackClassic,
      ),
      setFallbackClassic(value: boolean) {
        setStore("opencodePlus", "smartToolLoading", "fallbackClassic", value)
      },
    },
    promptTransparency: {
      enabled: withFallback(
        () => store.opencodePlus?.promptTransparency?.enabled,
        defaultOpenCodePlusSettings.promptTransparency.enabled,
      ),
      setEnabled(value: boolean) {
        setStore("opencodePlus", "promptTransparency", "enabled", value)
      },
      showTokenStatistics: withFallback(
        () => store.opencodePlus?.promptTransparency?.showTokenStatistics,
        defaultOpenCodePlusSettings.promptTransparency.showTokenStatistics,
      ),
      setShowTokenStatistics(value: boolean) {
        setStore("opencodePlus", "promptTransparency", "showTokenStatistics", value)
      },
      showContextDistribution: withFallback(
        () => store.opencodePlus?.promptTransparency?.showContextDistribution,
        defaultOpenCodePlusSettings.promptTransparency.showContextDistribution,
      ),
      setShowContextDistribution(value: boolean) {
        setStore("opencodePlus", "promptTransparency", "showContextDistribution", value)
      },
      developerMode: withFallback(
        () => store.opencodePlus?.promptTransparency?.developerMode,
        defaultOpenCodePlusSettings.promptTransparency.developerMode,
      ),
      setDeveloperMode(value: boolean) {
        setStore("opencodePlus", "promptTransparency", "developerMode", value)
      },
    },
    customSystemPrompt: {
      enabled: withFallback(
        () => store.opencodePlus?.customSystemPrompt?.enabled,
        defaultOpenCodePlusSettings.customSystemPrompt.enabled,
      ),
      setEnabled(value: boolean) {
        setStore("opencodePlus", "customSystemPrompt", "enabled", value)
      },
      mode: withFallback(
        () => store.opencodePlus?.customSystemPrompt?.mode,
        defaultOpenCodePlusSettings.customSystemPrompt.mode,
      ),
      setMode(value: OpenCodePlusPromptMode) {
        setStore("opencodePlus", "customSystemPrompt", "mode", value)
      },
      prompt: withFallback(
        () => store.opencodePlus?.customSystemPrompt?.prompt,
        defaultOpenCodePlusSettings.customSystemPrompt.prompt,
      ),
      setPrompt(value: string) {
        setStore("opencodePlus", "customSystemPrompt", "prompt", value)
      },
      profilePrompts: withFallback(
        () => store.opencodePlus?.customSystemPrompt?.profilePrompts,
        defaultOpenCodePlusSettings.customSystemPrompt.profilePrompts,
      ),
      setProfilePrompts(value: boolean) {
        setStore("opencodePlus", "customSystemPrompt", "profilePrompts", value)
      },
    },
    contextOptimizer: {
      enabled: withFallback(
        () => store.opencodePlus?.contextOptimizer?.enabled,
        defaultOpenCodePlusSettings.contextOptimizer.enabled,
      ),
      setEnabled(value: boolean) {
        setStore("opencodePlus", "contextOptimizer", "enabled", value)
      },
      automaticSuggestions: withFallback(
        () => store.opencodePlus?.contextOptimizer?.automaticSuggestions,
        defaultOpenCodePlusSettings.contextOptimizer.automaticSuggestions,
      ),
      setAutomaticSuggestions(value: boolean) {
        setStore("opencodePlus", "contextOptimizer", "automaticSuggestions", value)
      },
      automaticOptimization: withFallback(
        () => store.opencodePlus?.contextOptimizer?.automaticOptimization,
        defaultOpenCodePlusSettings.contextOptimizer.automaticOptimization,
      ),
      setAutomaticOptimization(value: boolean) {
        setStore("opencodePlus", "contextOptimizer", "automaticOptimization", value)
      },
      neverAskAgain: withFallback(
        () => store.opencodePlus?.contextOptimizer?.neverAskAgain,
        defaultOpenCodePlusSettings.contextOptimizer.neverAskAgain,
      ),
      setNeverAskAgain(value: boolean) {
        setStore("opencodePlus", "contextOptimizer", "neverAskAgain", value)
      },
      minimumTokenThreshold: withFallback(
        () => store.opencodePlus?.contextOptimizer?.minimumTokenThreshold,
        defaultOpenCodePlusSettings.contextOptimizer.minimumTokenThreshold,
      ),
      setMinimumTokenThreshold(value: number) {
        setStore("opencodePlus", "contextOptimizer", "minimumTokenThreshold", value)
      },
    },
    contextDashboard: {
      enabled: withFallback(
        () => store.opencodePlus?.contextDashboard?.enabled,
        defaultOpenCodePlusSettings.contextDashboard.enabled,
      ),
      setEnabled(value: boolean) {
        setStore("opencodePlus", "contextDashboard", "enabled", value)
      },
    },
    contextInspector: {
      enabled: withFallback(
        () => store.opencodePlus?.contextInspector?.enabled,
        defaultOpenCodePlusSettings.contextInspector.enabled,
      ),
      setEnabled(value: boolean) {
        setStore("opencodePlus", "contextInspector", "enabled", value)
      },
    },
    providerHealth: {
      enabled: withFallback(
        () => store.opencodePlus?.providerHealth?.enabled,
        defaultOpenCodePlusSettings.providerHealth.enabled,
      ),
      setEnabled(value: boolean) {
        setStore("opencodePlus", "providerHealth", "enabled", value)
      },
    },
    improvedErrorMessages: {
      enabled: withFallback(
        () => store.opencodePlus?.improvedErrorMessages?.enabled,
        defaultOpenCodePlusSettings.improvedErrorMessages.enabled,
      ),
      setEnabled(value: boolean) {
        setStore("opencodePlus", "improvedErrorMessages", "enabled", value)
      },
    },
    lazyContextInjection: {
      enabled: withFallback(
        () => store.opencodePlus?.lazyContextInjection?.enabled,
        defaultOpenCodePlusSettings.lazyContextInjection.enabled,
      ),
      setEnabled(value: boolean) {
        setStore("opencodePlus", "lazyContextInjection", "enabled", value)
      },
    },
    promptQueue: {
      enabled: withFallback(
        () => store.opencodePlus?.promptQueue?.enabled,
        defaultOpenCodePlusSettings.promptQueue.enabled,
      ),
      setEnabled(value: boolean) {
        setStore("opencodePlus", "promptQueue", "enabled", value)
      },
      suggestedFollowups: withFallback(
        () => store.opencodePlus?.promptQueue?.suggestedFollowups,
        defaultOpenCodePlusSettings.promptQueue.suggestedFollowups,
      ),
      setSuggestedFollowups(value: boolean) {
        setStore("opencodePlus", "promptQueue", "suggestedFollowups", value)
      },
      mode: withFallback(() => store.opencodePlus?.promptQueue?.mode, defaultOpenCodePlusSettings.promptQueue.mode),
      setMode(value: OpenCodePlusPromptQueueMode) {
        setStore("opencodePlus", "promptQueue", "mode", value)
      },
      maximumSize: withFallback(
        () => store.opencodePlus?.promptQueue?.maximumSize,
        defaultOpenCodePlusSettings.promptQueue.maximumSize,
      ),
      setMaximumSize(value: number) {
        setStore("opencodePlus", "promptQueue", "maximumSize", value)
      },
      desktopNotifications: withFallback(
        () => store.opencodePlus?.promptQueue?.desktopNotifications,
        defaultOpenCodePlusSettings.promptQueue.desktopNotifications,
      ),
      setDesktopNotifications(value: boolean) {
        setStore("opencodePlus", "promptQueue", "desktopNotifications", value)
      },
      persistQueue: withFallback(
        () => store.opencodePlus?.promptQueue?.persistQueue,
        defaultOpenCodePlusSettings.promptQueue.persistQueue,
      ),
      setPersistQueue(value: boolean) {
        setStore("opencodePlus", "promptQueue", "persistQueue", value)
      },
      showPanel: withFallback(
        () => store.opencodePlus?.promptQueue?.showPanel,
        defaultOpenCodePlusSettings.promptQueue.showPanel,
      ),
      setShowPanel(value: boolean) {
        setStore("opencodePlus", "promptQueue", "showPanel", value)
      },
      autoExpand: withFallback(
        () => store.opencodePlus?.promptQueue?.autoExpand,
        defaultOpenCodePlusSettings.promptQueue.autoExpand,
      ),
      setAutoExpand(value: boolean) {
        setStore("opencodePlus", "promptQueue", "autoExpand", value)
      },
      restoreAfterRestart: withFallback(
        () => store.opencodePlus?.promptQueue?.restoreAfterRestart,
        defaultOpenCodePlusSettings.promptQueue.restoreAfterRestart,
      ),
      setRestoreAfterRestart(value: boolean) {
        setStore("opencodePlus", "promptQueue", "restoreAfterRestart", value)
      },
      conditional: withFallback(
        () => store.opencodePlus?.promptQueue?.conditional,
        defaultOpenCodePlusSettings.promptQueue.conditional,
      ),
      setConditional(value: boolean) {
        setStore("opencodePlus", "promptQueue", "conditional", value)
      },
    },
    experimental: {
      enabled: withFallback(
        () => store.opencodePlus?.experimental?.enabled,
        defaultOpenCodePlusSettings.experimental.enabled,
      ),
      setEnabled(value: boolean) {
        setStore("opencodePlus", "experimental", "enabled", value)
      },
      conditionalQueue: withFallback(
        () => store.opencodePlus?.experimental?.conditionalQueue,
        defaultOpenCodePlusSettings.experimental.conditionalQueue,
      ),
      setConditionalQueue(value: boolean) {
        setStore("opencodePlus", "experimental", "conditionalQueue", value)
      },
      semanticMemory: withFallback(
        () => store.opencodePlus?.experimental?.semanticMemory,
        defaultOpenCodePlusSettings.experimental.semanticMemory,
      ),
      setSemanticMemory(value: boolean) {
        setStore("opencodePlus", "experimental", "semanticMemory", value)
      },
      snapshotMemory: withFallback(
        () => store.opencodePlus?.experimental?.snapshotMemory,
        defaultOpenCodePlusSettings.experimental.snapshotMemory,
      ),
      setSnapshotMemory(value: boolean) {
        setStore("opencodePlus", "experimental", "snapshotMemory", value)
      },
    },
  }
}
