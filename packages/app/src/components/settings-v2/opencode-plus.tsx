import { AccordionV2 } from "@opencode-ai/ui/v2/accordion-v2"
import { ButtonV2 } from "@opencode-ai/ui/v2/button-v2"
import { Icon } from "@opencode-ai/ui/v2/icon"
import { SelectV2 } from "@opencode-ai/ui/v2/select-v2"
import { SegmentedControlItemV2, SegmentedControlV2 } from "@opencode-ai/ui/v2/segmented-control-v2"
import { Switch } from "@opencode-ai/ui/v2/switch-v2"
import { TextInputV2 } from "@opencode-ai/ui/v2/text-input-v2"
import { TextareaV2 } from "@opencode-ai/ui/v2/textarea-v2"
import { createEffect, createMemo, For, Show, type Component, type JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { useLanguage } from "@/context/language"
import {
  openCodePlusCategories,
  openCodePlusSettingsRegistry,
  type OpenCodePlusCategoryID,
  type OpenCodePlusContextAggressiveness,
  type OpenCodePlusPresetID,
  type OpenCodePlusPromptMode,
  type OpenCodePlusPromptQueueMode,
  useSettings,
} from "@/context/settings"
import {
  normalizeOpenCodePlusAdvancedValue,
  opencodePlusSettingsMatches,
  opencodePlusSettingsSearching,
  parseOpenCodePlusQueueSize,
  parseOpenCodePlusTokenThreshold,
} from "../opencode-plus-settings-model"
import { exportAppSettingsBundle, importAppSettingsBundle } from "@/context/opencode-plus-runtime"
import { SettingsListV2 } from "./parts/list"
import { SettingsRowV2 } from "./parts/row"
import "./settings-v2.css"

type OpenCodePlusAggressivenessOption = {
  value: OpenCodePlusContextAggressiveness
  label: string
}

type OpenCodePlusPromptModeOption = {
  value: OpenCodePlusPromptMode
  label: string
}

type OpenCodePlusPromptQueueModeOption = {
  value: OpenCodePlusPromptQueueMode
  label: string
}

type OpenCodePlusCategory = {
  id: OpenCodePlusCategoryID
  title: string
  description: string
  search: readonly string[]
  primary: JSX.Element
  advanced?: JSX.Element
}

export const SettingsOpenCodePlusV2: Component = () => {
  const language = useLanguage()
  const settings = useSettings()
  const [state, setState] = createStore({
    query: "",
    advancedOpen: [] as OpenCodePlusCategoryID[],
    selectedPreset: "balanced" as OpenCodePlusPresetID,
    createName: "",
    duplicateName: "",
    renameName: "",
    importValue: "",
    exportValue: "",
    presetStatus: "",
  })

  const searching = createMemo(() => opencodePlusSettingsSearching(state.query))
  const tr = (key: string) => language.t(key as Parameters<typeof language.t>[0])

  createEffect(() => {
    setState("selectedPreset", settings.opencodePlus.presets.active())
  })

  const contextAggressivenessOptions = createMemo((): OpenCodePlusAggressivenessOption[] => [
    { value: "low", label: language.t("settings.opencodePlus.adaptiveContext.aggressiveness.low") },
    { value: "balanced", label: language.t("settings.opencodePlus.adaptiveContext.aggressiveness.balanced") },
    { value: "maximum", label: language.t("settings.opencodePlus.adaptiveContext.aggressiveness.maximum") },
  ])

  const promptModeOptions = createMemo((): OpenCodePlusPromptModeOption[] => [
    { value: "default", label: language.t("settings.opencodePlus.customSystemPrompt.mode.default") },
    { value: "append", label: language.t("settings.opencodePlus.customSystemPrompt.mode.append") },
    { value: "replace", label: language.t("settings.opencodePlus.customSystemPrompt.mode.replace") },
  ])

  const promptQueueModeOptions = createMemo((): OpenCodePlusPromptQueueModeOption[] => [
    { value: "automatic", label: language.t("settings.opencodePlus.promptQueue.mode.automatic") },
    { value: "manual", label: language.t("settings.opencodePlus.promptQueue.mode.manual") },
    { value: "ask", label: language.t("settings.opencodePlus.promptQueue.mode.ask") },
  ])

  const setCategoryAdvanced = (id: OpenCodePlusCategoryID, value: unknown) => {
    if (searching()) return
    const open = normalizeOpenCodePlusAdvancedValue(value).includes(id)
    setState("advancedOpen", (current) => {
      const next = current.filter((item) => item !== id)
      if (!open) return next
      return [...next, id]
    })
  }

  const categoryAdvancedValue = (id: OpenCodePlusCategoryID) =>
    searching() || state.advancedOpen.includes(id) ? [id] : []

  const presetOptions = createMemo(() => settings.opencodePlus.presets.options())
  const selectedPreset = createMemo(
    () => presetOptions().find((preset) => preset.id === state.selectedPreset) ?? presetOptions()[0],
  )
  const selectedPresetBuiltIn = createMemo(() => selectedPreset()?.builtIn ?? true)
  const selectedPresetDescription = createMemo(() => {
    const preset = selectedPreset()
    if (!preset) return ""
    return tr(preset.descriptionKey)
  })
  const categorySearch = (id: OpenCodePlusCategoryID) => {
    const category = openCodePlusCategories.find((item) => item.id === id) ?? openCodePlusCategories[0]
    return [
      tr(category.titleKey),
      tr(category.descriptionKey),
      ...openCodePlusSettingsRegistry
        .filter((setting) => setting.category === id)
        .flatMap((setting) => [tr(setting.titleKey), tr(setting.descriptionKey)]),
    ]
  }

  const applySelectedPreset = () => {
    const preset = selectedPreset()
    if (!preset) return
    if (!settings.opencodePlus.presets.apply(preset.id)) return
    setState("presetStatus", language.t("settings.opencodePlus.presets.status.applied", { name: preset.name }))
  }

  const createCustomPreset = () => {
    const id = settings.opencodePlus.presets.create(state.createName)
    setState("selectedPreset", id)
    setState("createName", "")
    setState("presetStatus", language.t("settings.opencodePlus.presets.status.created"))
  }

  const duplicateSelectedPreset = () => {
    const preset = selectedPreset()
    if (!preset) return
    const id = settings.opencodePlus.presets.duplicate(preset.id, state.duplicateName)
    if (!id) return
    setState("selectedPreset", id)
    setState("duplicateName", "")
    setState("presetStatus", language.t("settings.opencodePlus.presets.status.duplicated"))
  }

  const renameSelectedPreset = () => {
    const preset = selectedPreset()
    if (!preset) return
    if (!settings.opencodePlus.presets.rename(preset.id, state.renameName)) return
    setState("renameName", "")
    setState("presetStatus", language.t("settings.opencodePlus.presets.status.renamed"))
  }

  const deleteSelectedPreset = () => {
    const preset = selectedPreset()
    if (!preset) return
    if (!settings.opencodePlus.presets.delete(preset.id)) return
    setState("selectedPreset", settings.opencodePlus.presets.active())
    setState("presetStatus", language.t("settings.opencodePlus.presets.status.deleted"))
  }

  const exportSelectedPreset = () => {
    const value = settings.opencodePlus.presets.export(state.selectedPreset)
    if (!value) return
    setState("exportValue", value)
    const clipboard = typeof navigator === "undefined" ? undefined : navigator.clipboard
    if (!clipboard?.writeText) {
      setState("presetStatus", language.t("settings.opencodePlus.presets.status.exportReady"))
      return
    }
    void clipboard.writeText(value).then(
      () => setState("presetStatus", language.t("settings.opencodePlus.presets.status.exported")),
      () => setState("presetStatus", language.t("settings.opencodePlus.presets.status.exportReady")),
    )
  }

  const importPreset = () => {
    const result = settings.opencodePlus.presets.import(state.importValue)
    if (!result.ok) {
      setState("presetStatus", language.t("settings.opencodePlus.presets.status.importFailed"))
      return
    }
    setState("selectedPreset", result.preset.id)
    setState("importValue", "")
    setState("presetStatus", language.t("settings.opencodePlus.presets.status.imported"))
  }

  const exportAllSettings = () => {
    const value = exportAppSettingsBundle({
      opencodePlus: {
        activePreset: settings.opencodePlus.presets.active(),
        customPresets: settings.opencodePlus.presets.custom(),
        adaptiveContext: {
          enabled: settings.opencodePlus.adaptiveContext.enabled(),
          aggressiveness: settings.opencodePlus.adaptiveContext.aggressiveness(),
          showSummary: settings.opencodePlus.adaptiveContext.showSummary(),
        },
        smartToolLoading: {
          enabled: settings.opencodePlus.smartToolLoading.enabled(),
          dynamicRegistration: settings.opencodePlus.smartToolLoading.dynamicRegistration(),
          fallbackClassic: settings.opencodePlus.smartToolLoading.fallbackClassic(),
        },
        promptTransparency: {
          enabled: settings.opencodePlus.promptTransparency.enabled(),
          showTokenStatistics: settings.opencodePlus.promptTransparency.showTokenStatistics(),
          showContextDistribution: settings.opencodePlus.promptTransparency.showContextDistribution(),
          developerMode: settings.opencodePlus.promptTransparency.developerMode(),
        },
        customSystemPrompt: {
          enabled: settings.opencodePlus.customSystemPrompt.enabled(),
          mode: settings.opencodePlus.customSystemPrompt.mode(),
          prompt: settings.opencodePlus.customSystemPrompt.prompt(),
          profilePrompts: settings.opencodePlus.customSystemPrompt.profilePrompts(),
        },
        contextOptimizer: {
          enabled: settings.opencodePlus.contextOptimizer.enabled(),
          automaticSuggestions: settings.opencodePlus.contextOptimizer.automaticSuggestions(),
          automaticOptimization: settings.opencodePlus.contextOptimizer.automaticOptimization(),
          neverAskAgain: settings.opencodePlus.contextOptimizer.neverAskAgain(),
          minimumTokenThreshold: settings.opencodePlus.contextOptimizer.minimumTokenThreshold(),
        },
        contextDashboard: { enabled: settings.opencodePlus.contextDashboard.enabled() },
        contextInspector: { enabled: settings.opencodePlus.contextInspector.enabled() },
        providerHealth: { enabled: settings.opencodePlus.providerHealth.enabled() },
        improvedErrorMessages: { enabled: settings.opencodePlus.improvedErrorMessages.enabled() },
        lazyContextInjection: { enabled: settings.opencodePlus.lazyContextInjection.enabled() },
        promptQueue: {
          enabled: settings.opencodePlus.promptQueue.enabled(),
          suggestedFollowups: settings.opencodePlus.promptQueue.suggestedFollowups(),
          mode: settings.opencodePlus.promptQueue.mode(),
          maximumSize: settings.opencodePlus.promptQueue.maximumSize(),
          desktopNotifications: settings.opencodePlus.promptQueue.desktopNotifications(),
          persistQueue: settings.opencodePlus.promptQueue.persistQueue(),
          showPanel: settings.opencodePlus.promptQueue.showPanel(),
          autoExpand: settings.opencodePlus.promptQueue.autoExpand(),
          restoreAfterRestart: settings.opencodePlus.promptQueue.restoreAfterRestart(),
          conditional: settings.opencodePlus.promptQueue.conditional(),
        },
        experimental: {
          enabled: settings.opencodePlus.experimental.enabled(),
          conditionalQueue: settings.opencodePlus.experimental.conditionalQueue(),
          semanticMemory: settings.opencodePlus.experimental.semanticMemory(),
          snapshotMemory: settings.opencodePlus.experimental.snapshotMemory(),
        },
      },
      general: {
        followup: settings.general.followup(),
        showFileTree: settings.general.showFileTree(),
        showSystemTray: settings.general.showSystemTray(),
        newLayoutDesigns: settings.general.newLayoutDesigns(),
      },
    })
    setState("exportValue", value)
    const clipboard = typeof navigator === "undefined" ? undefined : navigator.clipboard
    if (!clipboard?.writeText) {
      setState("presetStatus", language.t("settings.opencodePlus.settingsExport.ready"))
      return
    }
    void clipboard.writeText(value).then(
      () => setState("presetStatus", language.t("settings.opencodePlus.settingsExport.copied")),
      () => setState("presetStatus", language.t("settings.opencodePlus.settingsExport.ready")),
    )
  }

  const importAllSettings = () => {
    const result = importAppSettingsBundle(state.importValue)
    if (!result.ok) {
      setState("presetStatus", language.t("settings.opencodePlus.settingsImport.failed"))
      return
    }
    const plus = result.value.opencodePlus
    if (!plus || typeof plus !== "object") {
      setState("presetStatus", language.t("settings.opencodePlus.settingsImport.failed"))
      return
    }
    const encoded = JSON.stringify({
      kind: "opencode-plus-preset",
      version: 1,
      name: "Imported settings",
      settings: plus,
    })
    const imported = settings.opencodePlus.presets.import(encoded)
    if (!imported.ok) {
      setState("presetStatus", language.t("settings.opencodePlus.settingsImport.failed"))
      return
    }
    setState("selectedPreset", imported.preset.id)
    setState("importValue", "")
    setState("presetStatus", language.t("settings.opencodePlus.settingsImport.ok"))
  }

  const restoreDefaultPresets = () => {
    if (!settings.opencodePlus.presets.restoreDefaults()) return
    setState("selectedPreset", settings.opencodePlus.presets.active())
    setState("presetStatus", language.t("settings.opencodePlus.presets.status.restored"))
  }

  const categories = createMemo((): OpenCodePlusCategory[] => [
    {
      id: "context",
      title: language.t("settings.opencodePlus.category.context.title"),
      description: language.t("settings.opencodePlus.category.context.description"),
      search: categorySearch("context"),
      primary: (
        <>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.adaptiveContext.title")}
            description={language.t("settings.opencodePlus.adaptiveContext.description")}
          >
            <div data-action="settings-opencode-plus-adaptive-context">
              <Switch
                checked={settings.opencodePlus.adaptiveContext.enabled()}
                onChange={(checked) => settings.opencodePlus.adaptiveContext.setEnabled(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.contextDashboard.title")}
            description={language.t("settings.opencodePlus.contextDashboard.description")}
          >
            <div data-action="settings-opencode-plus-context-dashboard">
              <Switch
                checked={settings.opencodePlus.contextDashboard.enabled()}
                onChange={(checked) => settings.opencodePlus.contextDashboard.setEnabled(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.contextOptimizer.title")}
            description={language.t("settings.opencodePlus.contextOptimizer.description")}
          >
            <div data-action="settings-opencode-plus-context-optimizer">
              <Switch
                checked={settings.opencodePlus.contextOptimizer.enabled()}
                onChange={(checked) => settings.opencodePlus.contextOptimizer.setEnabled(checked)}
              />
            </div>
          </SettingsRowV2>
        </>
      ),
      advanced: (
        <>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.contextInspector.title")}
            description={language.t("settings.opencodePlus.contextInspector.description")}
          >
            <div data-action="settings-opencode-plus-context-inspector">
              <Switch
                checked={settings.opencodePlus.contextInspector.enabled()}
                onChange={(checked) => settings.opencodePlus.contextInspector.setEnabled(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.adaptiveContext.aggressiveness.title")}
            description={language.t("settings.opencodePlus.adaptiveContext.aggressiveness.description")}
          >
            <SelectV2
              appearance="inline"
              data-action="settings-opencode-plus-context-aggressiveness"
              options={contextAggressivenessOptions()}
              current={contextAggressivenessOptions().find(
                (option) => option.value === settings.opencodePlus.adaptiveContext.aggressiveness(),
              )}
              placement="bottom-end"
              gutter={6}
              value={(option) => option.value}
              label={(option) => option.label}
              onSelect={(option) => option && settings.opencodePlus.adaptiveContext.setAggressiveness(option.value)}
            />
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.adaptiveContext.showSummary.title")}
            description={language.t("settings.opencodePlus.adaptiveContext.showSummary.description")}
          >
            <div data-action="settings-opencode-plus-context-summary">
              <Switch
                checked={settings.opencodePlus.adaptiveContext.showSummary()}
                onChange={(checked) => settings.opencodePlus.adaptiveContext.setShowSummary(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.lazyContextInjection.title")}
            description={language.t("settings.opencodePlus.lazyContextInjection.description")}
          >
            <div data-action="settings-opencode-plus-lazy-context-injection">
              <Switch
                checked={settings.opencodePlus.lazyContextInjection.enabled()}
                onChange={(checked) => settings.opencodePlus.lazyContextInjection.setEnabled(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.contextOptimizer.automaticSuggestions.title")}
            description={language.t("settings.opencodePlus.contextOptimizer.automaticSuggestions.description")}
          >
            <div data-action="settings-opencode-plus-optimizer-suggestions">
              <Switch
                checked={settings.opencodePlus.contextOptimizer.automaticSuggestions()}
                onChange={(checked) => settings.opencodePlus.contextOptimizer.setAutomaticSuggestions(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.contextOptimizer.automaticOptimization.title")}
            description={language.t("settings.opencodePlus.contextOptimizer.automaticOptimization.description")}
          >
            <div data-action="settings-opencode-plus-optimizer-automatic">
              <Switch
                checked={settings.opencodePlus.contextOptimizer.automaticOptimization()}
                onChange={(checked) => settings.opencodePlus.contextOptimizer.setAutomaticOptimization(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.contextOptimizer.neverAskAgain.title")}
            description={language.t("settings.opencodePlus.contextOptimizer.neverAskAgain.description")}
          >
            <div data-action="settings-opencode-plus-optimizer-never-ask">
              <Switch
                checked={settings.opencodePlus.contextOptimizer.neverAskAgain()}
                onChange={(checked) => settings.opencodePlus.contextOptimizer.setNeverAskAgain(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.contextOptimizer.minimumTokenThreshold.title")}
            description={language.t("settings.opencodePlus.contextOptimizer.minimumTokenThreshold.description")}
          >
            <div class="w-full sm:w-[180px]">
              <TextInputV2
                data-action="settings-opencode-plus-optimizer-token-threshold"
                type="number"
                appearance="base"
                value={settings.opencodePlus.contextOptimizer.minimumTokenThreshold()}
                min={0}
                step={1000}
                numeric
                onInput={(event) => {
                  const next = parseOpenCodePlusTokenThreshold(event.currentTarget.valueAsNumber)
                  if (next === undefined) return
                  settings.opencodePlus.contextOptimizer.setMinimumTokenThreshold(next)
                }}
                aria-label={language.t("settings.opencodePlus.contextOptimizer.minimumTokenThreshold.title")}
              />
            </div>
          </SettingsRowV2>
        </>
      ),
    },
    {
      id: "tools",
      title: language.t("settings.opencodePlus.category.tools.title"),
      description: language.t("settings.opencodePlus.category.tools.description"),
      search: categorySearch("tools"),
      primary: (
        <SettingsRowV2
          title={language.t("settings.opencodePlus.smartToolLoading.title")}
          description={language.t("settings.opencodePlus.smartToolLoading.description")}
        >
          <div data-action="settings-opencode-plus-smart-tool-loading">
            <Switch
              checked={settings.opencodePlus.smartToolLoading.enabled()}
              onChange={(checked) => settings.opencodePlus.smartToolLoading.setEnabled(checked)}
            />
          </div>
        </SettingsRowV2>
      ),
      advanced: (
        <>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.smartToolLoading.dynamicRegistration.title")}
            description={language.t("settings.opencodePlus.smartToolLoading.dynamicRegistration.description")}
          >
            <div data-action="settings-opencode-plus-dynamic-tool-registration">
              <Switch
                checked={settings.opencodePlus.smartToolLoading.dynamicRegistration()}
                onChange={(checked) => settings.opencodePlus.smartToolLoading.setDynamicRegistration(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.smartToolLoading.fallbackClassic.title")}
            description={language.t("settings.opencodePlus.smartToolLoading.fallbackClassic.description")}
          >
            <div data-action="settings-opencode-plus-tool-fallback-classic">
              <Switch
                checked={settings.opencodePlus.smartToolLoading.fallbackClassic()}
                onChange={(checked) => settings.opencodePlus.smartToolLoading.setFallbackClassic(checked)}
              />
            </div>
          </SettingsRowV2>
        </>
      ),
    },
    {
      id: "prompts",
      title: language.t("settings.opencodePlus.category.prompts.title"),
      description: language.t("settings.opencodePlus.category.prompts.description"),
      search: categorySearch("prompts"),
      primary: (
        <>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptTransparency.title")}
            description={language.t("settings.opencodePlus.promptTransparency.description")}
          >
            <div data-action="settings-opencode-plus-prompt-transparency">
              <Switch
                checked={settings.opencodePlus.promptTransparency.enabled()}
                onChange={(checked) => settings.opencodePlus.promptTransparency.setEnabled(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.customSystemPrompt.title")}
            description={language.t("settings.opencodePlus.customSystemPrompt.description")}
          >
            <div data-action="settings-opencode-plus-custom-system-prompt">
              <Switch
                checked={settings.opencodePlus.customSystemPrompt.enabled()}
                onChange={(checked) => settings.opencodePlus.customSystemPrompt.setEnabled(checked)}
              />
            </div>
          </SettingsRowV2>
        </>
      ),
      advanced: (
        <>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptTransparency.tokenStatistics.title")}
            description={language.t("settings.opencodePlus.promptTransparency.tokenStatistics.description")}
          >
            <div data-action="settings-opencode-plus-token-statistics">
              <Switch
                checked={settings.opencodePlus.promptTransparency.showTokenStatistics()}
                onChange={(checked) => settings.opencodePlus.promptTransparency.setShowTokenStatistics(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptTransparency.contextDistribution.title")}
            description={language.t("settings.opencodePlus.promptTransparency.contextDistribution.description")}
          >
            <div data-action="settings-opencode-plus-context-distribution">
              <Switch
                checked={settings.opencodePlus.promptTransparency.showContextDistribution()}
                onChange={(checked) => settings.opencodePlus.promptTransparency.setShowContextDistribution(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptTransparency.developerMode.title")}
            description={language.t("settings.opencodePlus.promptTransparency.developerMode.description")}
          >
            <div data-action="settings-opencode-plus-prompt-developer-mode">
              <Switch
                checked={settings.opencodePlus.promptTransparency.developerMode()}
                onChange={(checked) => settings.opencodePlus.promptTransparency.setDeveloperMode(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.customSystemPrompt.mode.title")}
            description={language.t("settings.opencodePlus.customSystemPrompt.mode.description")}
          >
            <SegmentedControlV2
              data-action="settings-opencode-plus-custom-prompt-mode"
              value={settings.opencodePlus.customSystemPrompt.mode()}
              onChange={(value) => {
                const option = promptModeOptions().find((item) => item.value === value)
                if (option) settings.opencodePlus.customSystemPrompt.setMode(option.value)
              }}
            >
              {promptModeOptions().map((option) => (
                <SegmentedControlItemV2 value={option.value}>{option.label}</SegmentedControlItemV2>
              ))}
            </SegmentedControlV2>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.customSystemPrompt.profilePrompts.title")}
            description={language.t("settings.opencodePlus.customSystemPrompt.profilePrompts.description")}
          >
            <div data-action="settings-opencode-plus-profile-prompts">
              <Switch
                checked={settings.opencodePlus.customSystemPrompt.profilePrompts()}
                onChange={(checked) => settings.opencodePlus.customSystemPrompt.setProfilePrompts(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.customSystemPrompt.prompt.title")}
            description={language.t("settings.opencodePlus.customSystemPrompt.prompt.description")}
          >
            <div class="w-full sm:w-[360px]">
              <TextareaV2
                data-action="settings-opencode-plus-custom-prompt"
                value={settings.opencodePlus.customSystemPrompt.prompt()}
                onInput={(event) => settings.opencodePlus.customSystemPrompt.setPrompt(event.currentTarget.value)}
                placeholder={language.t("settings.opencodePlus.customSystemPrompt.prompt.placeholder")}
                aria-label={language.t("settings.opencodePlus.customSystemPrompt.prompt.title")}
                spellcheck={true}
                rows={5}
              />
            </div>
          </SettingsRowV2>
        </>
      ),
    },
    {
      id: "queue",
      title: language.t("settings.opencodePlus.category.queue.title"),
      description: language.t("settings.opencodePlus.category.queue.description"),
      search: categorySearch("queue"),
      primary: (
        <>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptQueue.enabled.title")}
            description={language.t("settings.opencodePlus.promptQueue.enabled.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-enabled">
              <Switch
                checked={settings.opencodePlus.promptQueue.enabled()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setEnabled(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptQueue.mode.title")}
            description={language.t("settings.opencodePlus.promptQueue.mode.description")}
          >
            <SegmentedControlV2
              data-action="settings-opencode-plus-prompt-queue-mode"
              value={settings.opencodePlus.promptQueue.mode()}
              onChange={(value) => {
                const option = promptQueueModeOptions().find((item) => item.value === value)
                if (option) settings.opencodePlus.promptQueue.setMode(option.value)
              }}
            >
              {promptQueueModeOptions().map((option) => (
                <SegmentedControlItemV2 value={option.value}>{option.label}</SegmentedControlItemV2>
              ))}
            </SegmentedControlV2>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptQueue.showPanel.title")}
            description={language.t("settings.opencodePlus.promptQueue.showPanel.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-panel">
              <Switch
                checked={settings.opencodePlus.promptQueue.showPanel()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setShowPanel(checked)}
              />
            </div>
          </SettingsRowV2>
        </>
      ),
      advanced: (
        <>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptQueue.maximumSize.title")}
            description={language.t("settings.opencodePlus.promptQueue.maximumSize.description")}
          >
            <div class="w-full sm:w-[180px]">
              <TextInputV2
                data-action="settings-opencode-plus-prompt-queue-maximum-size"
                type="number"
                appearance="base"
                value={settings.opencodePlus.promptQueue.maximumSize()}
                min={0}
                max={200}
                step={1}
                numeric
                onInput={(event) => {
                  const next = parseOpenCodePlusQueueSize(event.currentTarget.valueAsNumber)
                  if (next === undefined) return
                  settings.opencodePlus.promptQueue.setMaximumSize(next)
                }}
                aria-label={language.t("settings.opencodePlus.promptQueue.maximumSize.title")}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptQueue.desktopNotifications.title")}
            description={language.t("settings.opencodePlus.promptQueue.desktopNotifications.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-notifications">
              <Switch
                checked={settings.opencodePlus.promptQueue.desktopNotifications()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setDesktopNotifications(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptQueue.persistQueue.title")}
            description={language.t("settings.opencodePlus.promptQueue.persistQueue.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-persist">
              <Switch
                checked={settings.opencodePlus.promptQueue.persistQueue()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setPersistQueue(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptQueue.conditional.title")}
            description={language.t("settings.opencodePlus.promptQueue.conditional.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-conditional">
              <Switch
                checked={settings.opencodePlus.promptQueue.conditional()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setConditional(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.experimental.enabled.title")}
            description={language.t("settings.opencodePlus.experimental.enabled.description")}
          >
            <div data-action="settings-opencode-plus-experimental">
              <Switch
                checked={settings.opencodePlus.experimental.enabled()}
                onChange={(checked) => settings.opencodePlus.experimental.setEnabled(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.experimental.conditionalQueue.title")}
            description={language.t("settings.opencodePlus.experimental.conditionalQueue.description")}
          >
            <div data-action="settings-opencode-plus-experimental-conditional-queue">
              <Switch
                checked={settings.opencodePlus.experimental.conditionalQueue()}
                onChange={(checked) => settings.opencodePlus.experimental.setConditionalQueue(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.experimental.semanticMemory.title")}
            description={language.t("settings.opencodePlus.experimental.semanticMemory.description")}
          >
            <div data-action="settings-opencode-plus-experimental-semantic-memory">
              <Switch
                checked={settings.opencodePlus.experimental.semanticMemory()}
                onChange={(checked) => settings.opencodePlus.experimental.setSemanticMemory(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.experimental.snapshotMemory.title")}
            description={language.t("settings.opencodePlus.experimental.snapshotMemory.description")}
          >
            <div data-action="settings-opencode-plus-experimental-snapshot-memory">
              <Switch
                checked={settings.opencodePlus.experimental.snapshotMemory()}
                onChange={(checked) => settings.opencodePlus.experimental.setSnapshotMemory(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptQueue.autoExpand.title")}
            description={language.t("settings.opencodePlus.promptQueue.autoExpand.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-auto-expand">
              <Switch
                checked={settings.opencodePlus.promptQueue.autoExpand()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setAutoExpand(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.promptQueue.restoreAfterRestart.title")}
            description={language.t("settings.opencodePlus.promptQueue.restoreAfterRestart.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-restore">
              <Switch
                checked={settings.opencodePlus.promptQueue.restoreAfterRestart()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setRestoreAfterRestart(checked)}
              />
            </div>
          </SettingsRowV2>
        </>
      ),
    },
    {
      id: "providers",
      title: language.t("settings.opencodePlus.category.providers.title"),
      description: language.t("settings.opencodePlus.category.providers.description"),
      search: categorySearch("providers"),
      primary: (
        <>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.providerHealth.title")}
            description={language.t("settings.opencodePlus.providerHealth.description")}
          >
            <div data-action="settings-opencode-plus-provider-health">
              <Switch
                checked={settings.opencodePlus.providerHealth.enabled()}
                onChange={(checked) => settings.opencodePlus.providerHealth.setEnabled(checked)}
              />
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.improvedErrorMessages.title")}
            description={language.t("settings.opencodePlus.improvedErrorMessages.description")}
          >
            <div data-action="settings-opencode-plus-improved-error-messages">
              <Switch
                checked={settings.opencodePlus.improvedErrorMessages.enabled()}
                onChange={(checked) => settings.opencodePlus.improvedErrorMessages.setEnabled(checked)}
              />
            </div>
          </SettingsRowV2>
        </>
      ),
    },
  ])

  const visibleCategories = createMemo(() =>
    categories().filter((category) => opencodePlusSettingsMatches(state.query, category.search)),
  )

  return (
    <div class="settings-v2-section settings-v2-opencode-plus">
      <div class="settings-v2-opencode-plus-header">
        <h3 class="settings-v2-section-title">{language.t("settings.opencodePlus.section")}</h3>
        <TextInputV2
          type="search"
          appearance="base"
          value={state.query}
          onInput={(event) => setState("query", event.currentTarget.value)}
          placeholder={language.t("settings.opencodePlus.search.placeholder")}
          leadingIcon={<Icon name="magnifying-glass" />}
          showClearButton={state.query.length > 0}
          clearLabel={language.t("settings.opencodePlus.search.clear")}
          onClearClick={() => setState("query", "")}
          spellcheck={false}
          autocorrect="off"
          autocomplete="off"
          autocapitalize="off"
          aria-label={language.t("settings.opencodePlus.search.placeholder")}
        />
      </div>

      <div class="settings-v2-opencode-plus-presets">
        <SettingsListV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.presets.active.title")}
            description={selectedPresetDescription()}
          >
            <div class="settings-v2-opencode-plus-preset-controls">
              <SelectV2
                appearance="inline"
                data-action="settings-opencode-plus-preset-select"
                options={presetOptions()}
                current={selectedPreset()}
                placement="bottom-end"
                gutter={6}
                value={(option) => option.id}
                label={(option) => option.name}
                onSelect={(option) => option && setState("selectedPreset", option.id)}
              />
              <ButtonV2
                type="button"
                size="small"
                variant="neutral"
                data-action="settings-opencode-plus-preset-apply"
                onClick={applySelectedPreset}
              >
                {language.t("settings.opencodePlus.presets.apply")}
              </ButtonV2>
            </div>
          </SettingsRowV2>
          <SettingsRowV2
            title={language.t("settings.opencodePlus.presets.create.title")}
            description={language.t("settings.opencodePlus.presets.create.description")}
          >
            <div class="settings-v2-opencode-plus-preset-controls">
              <TextInputV2
                appearance="base"
                value={state.createName}
                onInput={(event) => setState("createName", event.currentTarget.value)}
                placeholder={language.t("settings.opencodePlus.presets.name.placeholder")}
                aria-label={language.t("settings.opencodePlus.presets.create.title")}
              />
              <ButtonV2 type="button" size="small" variant="outline" onClick={createCustomPreset}>
                {language.t("settings.opencodePlus.presets.create.action")}
              </ButtonV2>
            </div>
          </SettingsRowV2>
        </SettingsListV2>

        <Show when={state.presetStatus}>
          <div class="settings-v2-opencode-plus-preset-status" role="status">
            {state.presetStatus}
          </div>
        </Show>

        <AccordionV2 collapsible class="settings-v2-opencode-plus-advanced">
          <AccordionV2.Item value="preset-management">
            <AccordionV2.Header>
              <AccordionV2.Trigger>{language.t("settings.opencodePlus.presets.management.title")}</AccordionV2.Trigger>
            </AccordionV2.Header>
            <AccordionV2.Content>
              <div class="settings-v2-opencode-plus-advanced-list">
                <SettingsRowV2
                  title={language.t("settings.opencodePlus.presets.duplicate.title")}
                  description={language.t("settings.opencodePlus.presets.duplicate.description")}
                >
                  <div class="settings-v2-opencode-plus-preset-controls">
                    <TextInputV2
                      appearance="base"
                      value={state.duplicateName}
                      onInput={(event) => setState("duplicateName", event.currentTarget.value)}
                      placeholder={language.t("settings.opencodePlus.presets.name.placeholder")}
                      aria-label={language.t("settings.opencodePlus.presets.duplicate.title")}
                    />
                    <ButtonV2 type="button" size="small" variant="outline" onClick={duplicateSelectedPreset}>
                      {language.t("settings.opencodePlus.presets.duplicate.action")}
                    </ButtonV2>
                  </div>
                </SettingsRowV2>
                <SettingsRowV2
                  title={language.t("settings.opencodePlus.presets.rename.title")}
                  description={language.t("settings.opencodePlus.presets.rename.description")}
                >
                  <div class="settings-v2-opencode-plus-preset-controls">
                    <TextInputV2
                      appearance="base"
                      value={state.renameName}
                      disabled={selectedPresetBuiltIn()}
                      onInput={(event) => setState("renameName", event.currentTarget.value)}
                      placeholder={
                        selectedPreset()?.name ?? language.t("settings.opencodePlus.presets.name.placeholder")
                      }
                      aria-label={language.t("settings.opencodePlus.presets.rename.title")}
                    />
                    <ButtonV2
                      type="button"
                      size="small"
                      variant="outline"
                      disabled={selectedPresetBuiltIn()}
                      onClick={renameSelectedPreset}
                    >
                      {language.t("settings.opencodePlus.presets.rename.action")}
                    </ButtonV2>
                  </div>
                </SettingsRowV2>
                <SettingsRowV2
                  title={language.t("settings.opencodePlus.presets.export.title")}
                  description={language.t("settings.opencodePlus.presets.export.description")}
                >
                  <div class="settings-v2-opencode-plus-preset-stack">
                    <ButtonV2 type="button" size="small" variant="outline" onClick={exportSelectedPreset}>
                      {language.t("settings.opencodePlus.presets.export.action")}
                    </ButtonV2>
                    <Show when={state.exportValue}>
                      <TextareaV2
                        value={state.exportValue}
                        readOnly
                        rows={4}
                        aria-label={language.t("settings.opencodePlus.presets.export.title")}
                      />
                    </Show>
                  </div>
                </SettingsRowV2>
                <SettingsRowV2
                  title={language.t("settings.opencodePlus.presets.import.title")}
                  description={language.t("settings.opencodePlus.presets.import.description")}
                >
                  <div class="settings-v2-opencode-plus-preset-stack">
                    <TextareaV2
                      value={state.importValue}
                      onInput={(event) => setState("importValue", event.currentTarget.value)}
                      placeholder={language.t("settings.opencodePlus.presets.import.placeholder")}
                      rows={4}
                      aria-label={language.t("settings.opencodePlus.presets.import.title")}
                    />
                    <div class="flex flex-wrap gap-2">
                      <ButtonV2 type="button" size="small" variant="outline" onClick={importPreset}>
                        {language.t("settings.opencodePlus.presets.import.action")}
                      </ButtonV2>
                      <ButtonV2 type="button" size="small" variant="outline" onClick={exportAllSettings}>
                        {language.t("settings.opencodePlus.settingsExport.action")}
                      </ButtonV2>
                      <ButtonV2 type="button" size="small" variant="outline" onClick={importAllSettings}>
                        {language.t("settings.opencodePlus.settingsImport.action")}
                      </ButtonV2>
                    </div>
                  </div>
                </SettingsRowV2>
                <SettingsRowV2
                  title={language.t("settings.opencodePlus.presets.restore.title")}
                  description={language.t("settings.opencodePlus.presets.restore.description")}
                >
                  <ButtonV2 type="button" size="small" variant="outline" onClick={restoreDefaultPresets}>
                    {language.t("settings.opencodePlus.presets.restore.action")}
                  </ButtonV2>
                </SettingsRowV2>
                <SettingsRowV2
                  title={language.t("settings.opencodePlus.presets.delete.title")}
                  description={language.t("settings.opencodePlus.presets.delete.description")}
                >
                  <ButtonV2
                    type="button"
                    size="small"
                    variant="danger"
                    disabled={selectedPresetBuiltIn()}
                    onClick={deleteSelectedPreset}
                  >
                    {language.t("settings.opencodePlus.presets.delete.action")}
                  </ButtonV2>
                </SettingsRowV2>
              </div>
            </AccordionV2.Content>
          </AccordionV2.Item>
        </AccordionV2>
      </div>

      <Show
        when={visibleCategories().length > 0}
        fallback={<div class="settings-v2-opencode-plus-empty">{language.t("settings.opencodePlus.search.empty")}</div>}
      >
        <div class="settings-v2-opencode-plus-categories flex flex-col gap-4">
          <For each={visibleCategories()}>
            {(category) => (
              <section class="settings-v2-opencode-plus-category">
                <div class="settings-v2-opencode-plus-category-heading">
                  <h4>{category.title}</h4>
                  <p>{category.description}</p>
                </div>

                <SettingsListV2>{category.primary}</SettingsListV2>

                <Show when={category.advanced}>
                  <AccordionV2
                    multiple
                    collapsible
                    class="settings-v2-opencode-plus-advanced"
                    value={categoryAdvancedValue(category.id)}
                    onChange={(value) => setCategoryAdvanced(category.id, value)}
                  >
                    <AccordionV2.Item value={category.id}>
                      <AccordionV2.Header>
                        <AccordionV2.Trigger>{language.t("settings.opencodePlus.advanced.title")}</AccordionV2.Trigger>
                      </AccordionV2.Header>
                      <AccordionV2.Content>
                        <div class="settings-v2-opencode-plus-advanced-list">{category.advanced}</div>
                      </AccordionV2.Content>
                    </AccordionV2.Item>
                  </AccordionV2>
                </Show>
              </section>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
