import { Component, Show, createSignal, startTransition } from "solid-js"
import { Dialog } from "@opencode-ai/ui/v2/dialog-v2"
import { TabsV2 } from "@opencode-ai/ui/v2/tabs-v2"
import { Icon, type IconProps } from "@opencode-ai/ui/icon"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { SettingsGeneralV2, type SettingsGeneralV2Section } from "./general"
import { SettingsKeybinds } from "../settings-keybinds"
import { SettingsProvidersV2 } from "./providers"
import { SettingsModelsV2 } from "./models"
import { SettingsPluginsV2 } from "./plugins"
import { SettingsMcpV2 } from "./mcp"
import "./settings-v2.css"
import { SettingsServersV2 } from "./servers"
import { useDialog } from "@opencode-ai/ui/context/dialog"

export const DialogSettings: Component<{
  sessionID?: string
  defaultValue?: string
}> = (props) => {
  const language = useLanguage()
  // Remount the whole dialog tree when locale changes so every label refreshes immediately.
  return (
    <Show when={language.locale()} keyed>
      {(_locale) => <DialogSettingsInner sessionID={props.sessionID} defaultValue={props.defaultValue} />}
    </Show>
  )
}

const DialogSettingsInner: Component<{
  sessionID?: string
  defaultValue?: string
}> = (props) => {
  const language = useLanguage()
  const platform = usePlatform()
  const dialog = useDialog()
  const [tab, setTab] = createSignal(props.defaultValue ?? "general")
  const desktop = () => platform.platform === "desktop"
  const generalSections = () =>
    [
      { value: "general" as const, icon: "sliders" as const, label: language.t("settings.tab.general") },
      { value: "opencode-plus" as const, icon: "settings-gear" as const, label: language.t("settings.opencodePlus.section") },
      { value: "appearance" as const, icon: "settings-gear" as const, label: language.t("settings.general.section.appearance") },
      { value: "notifications" as const, icon: "status" as const, label: language.t("settings.general.section.notifications") },
      { value: "sounds" as const, icon: "status" as const, label: language.t("settings.general.section.sounds") },
      {
        value: "updates" as const,
        icon: "download" as const,
        label: language.t("settings.general.section.updates"),
        desktop: true,
      },
      {
        value: "display" as const,
        icon: "layout-bottom" as const,
        label: language.t("settings.general.section.display"),
        desktop: true,
      },
      { value: "advanced" as const, icon: "sliders" as const, label: language.t("settings.general.section.advanced") },
    ] satisfies Array<{ value: SettingsGeneralV2Section; icon: IconProps["name"]; label: string; desktop?: boolean }>

  const showProviders = () => {
    void dialog.show(() => <DialogSettings sessionID={props.sessionID} defaultValue="providers" />)
  }

  return (
    <Dialog size="x-large" variant="settings" class="settings-v2-dialog">
      <TabsV2
        orientation="vertical"
        variant="settings"
        value={tab()}
        onChange={(value) => void startTransition(() => setTab(value))}
        class="settings-v2"
      >
        <TabsV2.List>
          <div class="flex flex-col justify-between h-full w-full">
            <div class="flex flex-col gap-3 w-full">
              <div class="flex flex-col gap-3">
                <div class="flex flex-col gap-1.5">
                  <TabsV2.SectionTitle>{language.t("settings.section.desktop")}</TabsV2.SectionTitle>
                  <div class="flex flex-col gap-1.5 w-full">
                    {generalSections().map((item) => (
                      <Show when={!item.desktop || desktop()}>
                        <TabsV2.Trigger value={item.value}>
                          <Icon name={item.icon} />
                          {item.label}
                        </TabsV2.Trigger>
                      </Show>
                    ))}
                    <TabsV2.Trigger value="shortcuts">
                      <Icon name="keyboard" />
                      {language.t("settings.tab.shortcuts")}
                    </TabsV2.Trigger>
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <TabsV2.SectionTitle>{language.t("settings.section.server")}</TabsV2.SectionTitle>
                  <div class="flex flex-col gap-1.5 w-full">
                    <TabsV2.Trigger value="servers">
                      <Icon name="server" />
                      {language.t("status.popover.tab.servers")}
                    </TabsV2.Trigger>
                    <TabsV2.Trigger value="providers">
                      <Icon name="providers" />
                      {language.t("settings.providers.title")}
                    </TabsV2.Trigger>
                    <TabsV2.Trigger value="models">
                      <Icon name="models" />
                      {language.t("settings.models.title")}
                    </TabsV2.Trigger>
                    <TabsV2.Trigger value="plugins">
                      <Icon name="code" />
                      {language.t("pluginManager.title")}
                    </TabsV2.Trigger>
                    <TabsV2.Trigger value="mcp">
                      <Icon name="mcp" />
                      {language.t("settings.mcp.title")}
                    </TabsV2.Trigger>
                  </div>
                </div>
              </div>
            </div>
            <div class="settings-v2-nav-footer">
              <span>{language.t("app.name.desktop")}</span>
              <span>v{platform.version}</span>
            </div>
          </div>
        </TabsV2.List>
        <TabsV2.Content value="general" class="settings-v2-panel">
          <SettingsGeneralV2 sessionID={props.sessionID} section="general" />
        </TabsV2.Content>
        <TabsV2.Content value="opencode-plus" class="settings-v2-panel">
          <SettingsGeneralV2 sessionID={props.sessionID} section="opencode-plus" />
        </TabsV2.Content>
        <TabsV2.Content value="appearance" class="settings-v2-panel">
          <SettingsGeneralV2 sessionID={props.sessionID} section="appearance" />
        </TabsV2.Content>
        <TabsV2.Content value="notifications" class="settings-v2-panel">
          <SettingsGeneralV2 sessionID={props.sessionID} section="notifications" />
        </TabsV2.Content>
        <TabsV2.Content value="sounds" class="settings-v2-panel">
          <SettingsGeneralV2 sessionID={props.sessionID} section="sounds" />
        </TabsV2.Content>
        <TabsV2.Content value="updates" class="settings-v2-panel">
          <SettingsGeneralV2 sessionID={props.sessionID} section="updates" />
        </TabsV2.Content>
        <TabsV2.Content value="display" class="settings-v2-panel">
          <SettingsGeneralV2 sessionID={props.sessionID} section="display" />
        </TabsV2.Content>
        <TabsV2.Content value="advanced" class="settings-v2-panel">
          <SettingsGeneralV2 sessionID={props.sessionID} section="advanced" />
        </TabsV2.Content>
        <TabsV2.Content value="shortcuts" class="settings-v2-panel">
          <SettingsKeybinds v2 />
        </TabsV2.Content>
        <TabsV2.Content value="servers" class="settings-v2-panel">
          <SettingsServersV2 />
        </TabsV2.Content>
        <TabsV2.Content value="providers" class="settings-v2-panel">
          <SettingsProvidersV2 onBack={showProviders} />
        </TabsV2.Content>
        <TabsV2.Content value="models" class="settings-v2-panel">
          <SettingsModelsV2 />
        </TabsV2.Content>
        <TabsV2.Content value="plugins" class="settings-v2-panel">
          <SettingsPluginsV2 />
        </TabsV2.Content>
        <TabsV2.Content value="mcp" class="settings-v2-panel">
          <SettingsMcpV2 />
        </TabsV2.Content>
      </TabsV2>
    </Dialog>
  )
}
