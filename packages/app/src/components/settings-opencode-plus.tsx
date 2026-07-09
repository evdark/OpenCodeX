import { Button } from "@opencode-ai/ui/button"
import { Collapsible } from "@opencode-ai/ui/collapsible"
import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Select } from "@opencode-ai/ui/select"
import { Switch } from "@opencode-ai/ui/switch"
import { TextField } from "@opencode-ai/ui/text-field"
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
} from "./opencode-plus-settings-model"
import { SettingsList } from "./settings-list"

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

export const SettingsOpenCodePlus: Component = () => {
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

  const categoryAdvancedOpen = (id: OpenCodePlusCategoryID) => searching() || state.advancedOpen.includes(id)
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
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.adaptiveContext.title")}
            description={language.t("settings.opencodePlus.adaptiveContext.description")}
          >
            <div data-action="settings-opencode-plus-adaptive-context">
              <Switch
                checked={settings.opencodePlus.adaptiveContext.enabled()}
                onChange={(checked) => settings.opencodePlus.adaptiveContext.setEnabled(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.contextDashboard.title")}
            description={language.t("settings.opencodePlus.contextDashboard.description")}
          >
            <div data-action="settings-opencode-plus-context-dashboard">
              <Switch
                checked={settings.opencodePlus.contextDashboard.enabled()}
                onChange={(checked) => settings.opencodePlus.contextDashboard.setEnabled(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.contextOptimizer.title")}
            description={language.t("settings.opencodePlus.contextOptimizer.description")}
          >
            <div data-action="settings-opencode-plus-context-optimizer">
              <Switch
                checked={settings.opencodePlus.contextOptimizer.enabled()}
                onChange={(checked) => settings.opencodePlus.contextOptimizer.setEnabled(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
        </>
      ),
      advanced: (
        <>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.contextInspector.title")}
            description={language.t("settings.opencodePlus.contextInspector.description")}
          >
            <div data-action="settings-opencode-plus-context-inspector">
              <Switch
                checked={settings.opencodePlus.contextInspector.enabled()}
                onChange={(checked) => settings.opencodePlus.contextInspector.setEnabled(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.adaptiveContext.aggressiveness.title")}
            description={language.t("settings.opencodePlus.adaptiveContext.aggressiveness.description")}
          >
            <Select
              data-action="settings-opencode-plus-context-aggressiveness"
              options={contextAggressivenessOptions()}
              current={contextAggressivenessOptions().find(
                (option) => option.value === settings.opencodePlus.adaptiveContext.aggressiveness(),
              )}
              value={(option) => option.value}
              label={(option) => option.label}
              onSelect={(option) => option && settings.opencodePlus.adaptiveContext.setAggressiveness(option.value)}
              variant="secondary"
              size="small"
              triggerVariant="settings"
              triggerStyle={{ "min-width": "180px" }}
            />
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.adaptiveContext.showSummary.title")}
            description={language.t("settings.opencodePlus.adaptiveContext.showSummary.description")}
          >
            <div data-action="settings-opencode-plus-context-summary">
              <Switch
                checked={settings.opencodePlus.adaptiveContext.showSummary()}
                onChange={(checked) => settings.opencodePlus.adaptiveContext.setShowSummary(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.lazyContextInjection.title")}
            description={language.t("settings.opencodePlus.lazyContextInjection.description")}
          >
            <div data-action="settings-opencode-plus-lazy-context-injection">
              <Switch
                checked={settings.opencodePlus.lazyContextInjection.enabled()}
                onChange={(checked) => settings.opencodePlus.lazyContextInjection.setEnabled(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.contextOptimizer.automaticSuggestions.title")}
            description={language.t("settings.opencodePlus.contextOptimizer.automaticSuggestions.description")}
          >
            <div data-action="settings-opencode-plus-optimizer-suggestions">
              <Switch
                checked={settings.opencodePlus.contextOptimizer.automaticSuggestions()}
                onChange={(checked) => settings.opencodePlus.contextOptimizer.setAutomaticSuggestions(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.contextOptimizer.automaticOptimization.title")}
            description={language.t("settings.opencodePlus.contextOptimizer.automaticOptimization.description")}
          >
            <div data-action="settings-opencode-plus-optimizer-automatic">
              <Switch
                checked={settings.opencodePlus.contextOptimizer.automaticOptimization()}
                onChange={(checked) => settings.opencodePlus.contextOptimizer.setAutomaticOptimization(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.contextOptimizer.neverAskAgain.title")}
            description={language.t("settings.opencodePlus.contextOptimizer.neverAskAgain.description")}
          >
            <div data-action="settings-opencode-plus-optimizer-never-ask">
              <Switch
                checked={settings.opencodePlus.contextOptimizer.neverAskAgain()}
                onChange={(checked) => settings.opencodePlus.contextOptimizer.setNeverAskAgain(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.contextOptimizer.minimumTokenThreshold.title")}
            description={language.t("settings.opencodePlus.contextOptimizer.minimumTokenThreshold.description")}
          >
            <div class="w-full sm:w-[180px]">
              <TextField
                data-action="settings-opencode-plus-optimizer-token-threshold"
                label={language.t("settings.opencodePlus.contextOptimizer.minimumTokenThreshold.title")}
                hideLabel
                type="number"
                value={String(settings.opencodePlus.contextOptimizer.minimumTokenThreshold())}
                onChange={(value) => {
                  const next = parseOpenCodePlusTokenThreshold(value)
                  if (next === undefined) return
                  settings.opencodePlus.contextOptimizer.setMinimumTokenThreshold(next)
                }}
                min={0}
                step={1000}
                class="text-12-regular"
              />
            </div>
          </SettingsOpenCodePlusRow>
        </>
      ),
    },
    {
      id: "tools",
      title: language.t("settings.opencodePlus.category.tools.title"),
      description: language.t("settings.opencodePlus.category.tools.description"),
      search: categorySearch("tools"),
      primary: (
        <SettingsOpenCodePlusRow
          title={language.t("settings.opencodePlus.smartToolLoading.title")}
          description={language.t("settings.opencodePlus.smartToolLoading.description")}
        >
          <div data-action="settings-opencode-plus-smart-tool-loading">
            <Switch
              checked={settings.opencodePlus.smartToolLoading.enabled()}
              onChange={(checked) => settings.opencodePlus.smartToolLoading.setEnabled(checked)}
            />
          </div>
        </SettingsOpenCodePlusRow>
      ),
      advanced: (
        <>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.smartToolLoading.dynamicRegistration.title")}
            description={language.t("settings.opencodePlus.smartToolLoading.dynamicRegistration.description")}
          >
            <div data-action="settings-opencode-plus-dynamic-tool-registration">
              <Switch
                checked={settings.opencodePlus.smartToolLoading.dynamicRegistration()}
                onChange={(checked) => settings.opencodePlus.smartToolLoading.setDynamicRegistration(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.smartToolLoading.fallbackClassic.title")}
            description={language.t("settings.opencodePlus.smartToolLoading.fallbackClassic.description")}
          >
            <div data-action="settings-opencode-plus-tool-fallback-classic">
              <Switch
                checked={settings.opencodePlus.smartToolLoading.fallbackClassic()}
                onChange={(checked) => settings.opencodePlus.smartToolLoading.setFallbackClassic(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
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
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptTransparency.title")}
            description={language.t("settings.opencodePlus.promptTransparency.description")}
          >
            <div data-action="settings-opencode-plus-prompt-transparency">
              <Switch
                checked={settings.opencodePlus.promptTransparency.enabled()}
                onChange={(checked) => settings.opencodePlus.promptTransparency.setEnabled(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.customSystemPrompt.title")}
            description={language.t("settings.opencodePlus.customSystemPrompt.description")}
          >
            <div data-action="settings-opencode-plus-custom-system-prompt">
              <Switch
                checked={settings.opencodePlus.customSystemPrompt.enabled()}
                onChange={(checked) => settings.opencodePlus.customSystemPrompt.setEnabled(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
        </>
      ),
      advanced: (
        <>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptTransparency.tokenStatistics.title")}
            description={language.t("settings.opencodePlus.promptTransparency.tokenStatistics.description")}
          >
            <div data-action="settings-opencode-plus-token-statistics">
              <Switch
                checked={settings.opencodePlus.promptTransparency.showTokenStatistics()}
                onChange={(checked) => settings.opencodePlus.promptTransparency.setShowTokenStatistics(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptTransparency.contextDistribution.title")}
            description={language.t("settings.opencodePlus.promptTransparency.contextDistribution.description")}
          >
            <div data-action="settings-opencode-plus-context-distribution">
              <Switch
                checked={settings.opencodePlus.promptTransparency.showContextDistribution()}
                onChange={(checked) => settings.opencodePlus.promptTransparency.setShowContextDistribution(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptTransparency.developerMode.title")}
            description={language.t("settings.opencodePlus.promptTransparency.developerMode.description")}
          >
            <div data-action="settings-opencode-plus-prompt-developer-mode">
              <Switch
                checked={settings.opencodePlus.promptTransparency.developerMode()}
                onChange={(checked) => settings.opencodePlus.promptTransparency.setDeveloperMode(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.customSystemPrompt.mode.title")}
            description={language.t("settings.opencodePlus.customSystemPrompt.mode.description")}
          >
            <Select
              data-action="settings-opencode-plus-custom-prompt-mode"
              options={promptModeOptions()}
              current={promptModeOptions().find(
                (option) => option.value === settings.opencodePlus.customSystemPrompt.mode(),
              )}
              value={(option) => option.value}
              label={(option) => option.label}
              onSelect={(option) => option && settings.opencodePlus.customSystemPrompt.setMode(option.value)}
              variant="secondary"
              size="small"
              triggerVariant="settings"
              triggerStyle={{ "min-width": "180px" }}
            />
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.customSystemPrompt.profilePrompts.title")}
            description={language.t("settings.opencodePlus.customSystemPrompt.profilePrompts.description")}
          >
            <div data-action="settings-opencode-plus-profile-prompts">
              <Switch
                checked={settings.opencodePlus.customSystemPrompt.profilePrompts()}
                onChange={(checked) => settings.opencodePlus.customSystemPrompt.setProfilePrompts(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.customSystemPrompt.prompt.title")}
            description={language.t("settings.opencodePlus.customSystemPrompt.prompt.description")}
          >
            <div class="w-full sm:w-[360px]">
              <TextField
                data-action="settings-opencode-plus-custom-prompt"
                label={language.t("settings.opencodePlus.customSystemPrompt.prompt.title")}
                hideLabel
                multiline
                value={settings.opencodePlus.customSystemPrompt.prompt()}
                onChange={(value) => settings.opencodePlus.customSystemPrompt.setPrompt(value)}
                placeholder={language.t("settings.opencodePlus.customSystemPrompt.prompt.placeholder")}
                spellcheck={true}
                class="text-12-regular"
              />
            </div>
          </SettingsOpenCodePlusRow>
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
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptQueue.enabled.title")}
            description={language.t("settings.opencodePlus.promptQueue.enabled.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-enabled">
              <Switch
                checked={settings.opencodePlus.promptQueue.enabled()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setEnabled(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptQueue.mode.title")}
            description={language.t("settings.opencodePlus.promptQueue.mode.description")}
          >
            <Select
              data-action="settings-opencode-plus-prompt-queue-mode"
              options={promptQueueModeOptions()}
              current={promptQueueModeOptions().find(
                (option) => option.value === settings.opencodePlus.promptQueue.mode(),
              )}
              value={(option) => option.value}
              label={(option) => option.label}
              onSelect={(option) => option && settings.opencodePlus.promptQueue.setMode(option.value)}
              variant="secondary"
              size="small"
              triggerVariant="settings"
              triggerStyle={{ "min-width": "180px" }}
            />
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptQueue.showPanel.title")}
            description={language.t("settings.opencodePlus.promptQueue.showPanel.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-panel">
              <Switch
                checked={settings.opencodePlus.promptQueue.showPanel()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setShowPanel(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
        </>
      ),
      advanced: (
        <>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptQueue.suggestedFollowups.title")}
            description={language.t("settings.opencodePlus.promptQueue.suggestedFollowups.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-suggestions">
              <Switch
                checked={settings.opencodePlus.promptQueue.suggestedFollowups()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setSuggestedFollowups(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptQueue.maximumSize.title")}
            description={language.t("settings.opencodePlus.promptQueue.maximumSize.description")}
          >
            <div class="w-full sm:w-[180px]">
              <TextField
                data-action="settings-opencode-plus-prompt-queue-maximum-size"
                label={language.t("settings.opencodePlus.promptQueue.maximumSize.title")}
                hideLabel
                type="number"
                value={String(settings.opencodePlus.promptQueue.maximumSize())}
                onChange={(value) => {
                  const next = parseOpenCodePlusQueueSize(value)
                  if (next === undefined) return
                  settings.opencodePlus.promptQueue.setMaximumSize(next)
                }}
                min={0}
                max={200}
                step={1}
                class="text-12-regular"
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptQueue.desktopNotifications.title")}
            description={language.t("settings.opencodePlus.promptQueue.desktopNotifications.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-notifications">
              <Switch
                checked={settings.opencodePlus.promptQueue.desktopNotifications()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setDesktopNotifications(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptQueue.persistQueue.title")}
            description={language.t("settings.opencodePlus.promptQueue.persistQueue.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-persist">
              <Switch
                checked={settings.opencodePlus.promptQueue.persistQueue()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setPersistQueue(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptQueue.autoExpand.title")}
            description={language.t("settings.opencodePlus.promptQueue.autoExpand.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-auto-expand">
              <Switch
                checked={settings.opencodePlus.promptQueue.autoExpand()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setAutoExpand(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.promptQueue.restoreAfterRestart.title")}
            description={language.t("settings.opencodePlus.promptQueue.restoreAfterRestart.description")}
          >
            <div data-action="settings-opencode-plus-prompt-queue-restore">
              <Switch
                checked={settings.opencodePlus.promptQueue.restoreAfterRestart()}
                onChange={(checked) => settings.opencodePlus.promptQueue.setRestoreAfterRestart(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
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
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.providerHealth.title")}
            description={language.t("settings.opencodePlus.providerHealth.description")}
          >
            <div data-action="settings-opencode-plus-provider-health">
              <Switch
                checked={settings.opencodePlus.providerHealth.enabled()}
                onChange={(checked) => settings.opencodePlus.providerHealth.setEnabled(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.improvedErrorMessages.title")}
            description={language.t("settings.opencodePlus.improvedErrorMessages.description")}
          >
            <div data-action="settings-opencode-plus-improved-error-messages">
              <Switch
                checked={settings.opencodePlus.improvedErrorMessages.enabled()}
                onChange={(checked) => settings.opencodePlus.improvedErrorMessages.setEnabled(checked)}
              />
            </div>
          </SettingsOpenCodePlusRow>
        </>
      ),
    },
  ])

  const visibleCategories = createMemo(() =>
    categories().filter((category) => opencodePlusSettingsMatches(state.query, category.search)),
  )

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-3">
        <h3 class="text-14-medium text-text-strong">{language.t("settings.opencodePlus.section")}</h3>
        <div class="flex h-9 items-center gap-2 rounded-lg bg-surface-base px-3">
          <Icon name="magnifying-glass" class="text-icon-weak-base flex-shrink-0" />
          <TextField
            label={language.t("settings.opencodePlus.search.placeholder")}
            hideLabel
            variant="ghost"
            type="search"
            value={state.query}
            onChange={(value) => setState("query", value)}
            placeholder={language.t("settings.opencodePlus.search.placeholder")}
            spellcheck={false}
            autocorrect="off"
            autocomplete="off"
            autocapitalize="off"
            class="flex-1"
          />
          <Show when={state.query}>
            <IconButton
              type="button"
              icon="circle-x"
              variant="ghost"
              size="small"
              aria-label={language.t("settings.opencodePlus.search.clear")}
              onClick={() => setState("query", "")}
            />
          </Show>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <SettingsList>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.presets.active.title")}
            description={selectedPresetDescription()}
          >
            <div class="flex w-full flex-col justify-end gap-2 sm:w-auto sm:flex-row">
              <Select
                data-action="settings-opencode-plus-preset-select"
                options={presetOptions()}
                current={selectedPreset()}
                value={(option) => option.id}
                label={(option) => option.name}
                onSelect={(option) => option && setState("selectedPreset", option.id)}
                variant="secondary"
                size="small"
                triggerVariant="settings"
                triggerStyle={{ "min-width": "180px" }}
              />
              <Button type="button" size="small" variant="secondary" onClick={applySelectedPreset}>
                {language.t("settings.opencodePlus.presets.apply")}
              </Button>
            </div>
          </SettingsOpenCodePlusRow>
          <SettingsOpenCodePlusRow
            title={language.t("settings.opencodePlus.presets.create.title")}
            description={language.t("settings.opencodePlus.presets.create.description")}
          >
            <div class="flex w-full flex-col justify-end gap-2 sm:w-auto sm:flex-row">
              <TextField
                label={language.t("settings.opencodePlus.presets.create.title")}
                hideLabel
                value={state.createName}
                onChange={(value) => setState("createName", value)}
                placeholder={language.t("settings.opencodePlus.presets.name.placeholder")}
                class="text-12-regular"
              />
              <Button type="button" size="small" variant="secondary" onClick={createCustomPreset}>
                {language.t("settings.opencodePlus.presets.create.action")}
              </Button>
            </div>
          </SettingsOpenCodePlusRow>
        </SettingsList>

        <Show when={state.presetStatus}>
          <div class="rounded-md px-2 text-12-regular text-text-weak" role="status">
            {state.presetStatus}
          </div>
        </Show>

        <Collapsible variant="ghost">
          <Collapsible.Trigger class="flex h-8 items-center justify-between rounded-md px-2 text-12-medium text-text-base hover:bg-surface-raised-base-hover focus-visible:bg-surface-raised-base-hover">
            <span>{language.t("settings.opencodePlus.presets.management.title")}</span>
            <Collapsible.Arrow />
          </Collapsible.Trigger>
          <Collapsible.Content>
            <div class="pt-1">
              <SettingsList>
                <SettingsOpenCodePlusRow
                  title={language.t("settings.opencodePlus.presets.duplicate.title")}
                  description={language.t("settings.opencodePlus.presets.duplicate.description")}
                >
                  <div class="flex w-full flex-col justify-end gap-2 sm:w-auto sm:flex-row">
                    <TextField
                      label={language.t("settings.opencodePlus.presets.duplicate.title")}
                      hideLabel
                      value={state.duplicateName}
                      onChange={(value) => setState("duplicateName", value)}
                      placeholder={language.t("settings.opencodePlus.presets.name.placeholder")}
                      class="text-12-regular"
                    />
                    <Button type="button" size="small" variant="secondary" onClick={duplicateSelectedPreset}>
                      {language.t("settings.opencodePlus.presets.duplicate.action")}
                    </Button>
                  </div>
                </SettingsOpenCodePlusRow>
                <SettingsOpenCodePlusRow
                  title={language.t("settings.opencodePlus.presets.rename.title")}
                  description={language.t("settings.opencodePlus.presets.rename.description")}
                >
                  <div class="flex w-full flex-col justify-end gap-2 sm:w-auto sm:flex-row">
                    <TextField
                      label={language.t("settings.opencodePlus.presets.rename.title")}
                      hideLabel
                      disabled={selectedPresetBuiltIn()}
                      value={state.renameName}
                      onChange={(value) => setState("renameName", value)}
                      placeholder={
                        selectedPreset()?.name ?? language.t("settings.opencodePlus.presets.name.placeholder")
                      }
                      class="text-12-regular"
                    />
                    <Button
                      type="button"
                      size="small"
                      variant="secondary"
                      disabled={selectedPresetBuiltIn()}
                      onClick={renameSelectedPreset}
                    >
                      {language.t("settings.opencodePlus.presets.rename.action")}
                    </Button>
                  </div>
                </SettingsOpenCodePlusRow>
                <SettingsOpenCodePlusRow
                  title={language.t("settings.opencodePlus.presets.export.title")}
                  description={language.t("settings.opencodePlus.presets.export.description")}
                >
                  <div class="flex w-full flex-col items-stretch gap-2 sm:w-[360px]">
                    <Button type="button" size="small" variant="secondary" onClick={exportSelectedPreset}>
                      {language.t("settings.opencodePlus.presets.export.action")}
                    </Button>
                    <Show when={state.exportValue}>
                      <TextField
                        label={language.t("settings.opencodePlus.presets.export.title")}
                        hideLabel
                        multiline
                        readOnly
                        value={state.exportValue}
                        class="text-12-regular"
                      />
                    </Show>
                  </div>
                </SettingsOpenCodePlusRow>
                <SettingsOpenCodePlusRow
                  title={language.t("settings.opencodePlus.presets.import.title")}
                  description={language.t("settings.opencodePlus.presets.import.description")}
                >
                  <div class="flex w-full flex-col items-stretch gap-2 sm:w-[360px]">
                    <TextField
                      label={language.t("settings.opencodePlus.presets.import.title")}
                      hideLabel
                      multiline
                      value={state.importValue}
                      onChange={(value) => setState("importValue", value)}
                      placeholder={language.t("settings.opencodePlus.presets.import.placeholder")}
                      class="text-12-regular"
                    />
                    <Button type="button" size="small" variant="secondary" onClick={importPreset}>
                      {language.t("settings.opencodePlus.presets.import.action")}
                    </Button>
                  </div>
                </SettingsOpenCodePlusRow>
                <SettingsOpenCodePlusRow
                  title={language.t("settings.opencodePlus.presets.restore.title")}
                  description={language.t("settings.opencodePlus.presets.restore.description")}
                >
                  <Button type="button" size="small" variant="secondary" onClick={restoreDefaultPresets}>
                    {language.t("settings.opencodePlus.presets.restore.action")}
                  </Button>
                </SettingsOpenCodePlusRow>
                <SettingsOpenCodePlusRow
                  title={language.t("settings.opencodePlus.presets.delete.title")}
                  description={language.t("settings.opencodePlus.presets.delete.description")}
                >
                  <Button
                    type="button"
                    size="small"
                    variant="secondary"
                    disabled={selectedPresetBuiltIn()}
                    class="text-text-danger-base"
                    onClick={deleteSelectedPreset}
                  >
                    {language.t("settings.opencodePlus.presets.delete.action")}
                  </Button>
                </SettingsOpenCodePlusRow>
              </SettingsList>
            </div>
          </Collapsible.Content>
        </Collapsible>
      </div>

      <Show
        when={visibleCategories().length > 0}
        fallback={
          <div class="rounded-lg bg-surface-base px-4 py-6 text-center text-13-regular text-text-weak">
            {language.t("settings.opencodePlus.search.empty")}
          </div>
        }
      >
        <div class="flex flex-col gap-6">
          <For each={visibleCategories()}>
            {(category) => (
              <section class="flex flex-col gap-2">
                <div class="flex flex-col gap-0.5">
                  <h4 class="text-14-medium text-text-strong">{category.title}</h4>
                  <p class="text-12-regular text-text-weak">{category.description}</p>
                </div>

                <SettingsList>{category.primary}</SettingsList>

                <Show when={category.advanced}>
                  <Collapsible
                    variant="ghost"
                    open={categoryAdvancedOpen(category.id)}
                    onOpenChange={(open) => setCategoryAdvanced(category.id, open ? category.id : undefined)}
                  >
                    <Collapsible.Trigger class="flex h-8 items-center justify-between rounded-md px-2 text-12-medium text-text-base hover:bg-surface-raised-base-hover focus-visible:bg-surface-raised-base-hover">
                      <span>{language.t("settings.opencodePlus.advanced.title")}</span>
                      <Collapsible.Arrow />
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <div class="pt-1">
                        <SettingsList>{category.advanced}</SettingsList>
                      </div>
                    </Collapsible.Content>
                  </Collapsible>
                </Show>
              </section>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

type SettingsOpenCodePlusRowProps = {
  title: string | JSX.Element
  description: string | JSX.Element
  children: JSX.Element
}

const SettingsOpenCodePlusRow: Component<SettingsOpenCodePlusRowProps> = (props) => {
  return (
    <div class="flex flex-wrap items-center gap-4 border-b border-border-weak-base py-3 last:border-none sm:flex-nowrap">
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="text-14-medium text-text-strong">{props.title}</span>
        <span class="text-12-regular text-text-weak">{props.description}</span>
      </div>
      <div class="flex w-full justify-end sm:w-auto sm:shrink-0">{props.children}</div>
    </div>
  )
}
