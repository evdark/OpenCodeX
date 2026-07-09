import { Match, Switch, createSignal } from "solid-js"
import { Button } from "@opencode-ai/ui/button"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { useLanguage } from "@/context/language"
import { DialogConnectProvider, useProviderConnectController } from "./dialog-connect-provider"
import { DialogCustomProvider } from "./dialog-custom-provider"

type Step = "intro" | "catalog" | "custom" | "done"

/** Lightweight guided provider setup on top of existing connect/custom dialogs. */
export function ProviderSetupWizard(props: { onBack?: () => void }) {
  const language = useLanguage()
  const dialog = useDialog()
  const [step, setStep] = createSignal<Step>("intro")
  const providerConnect = useProviderConnectController({ onBack: props.onBack })

  const openCatalog = () => {
    setStep("catalog")
    providerConnect.select(undefined)
    void dialog.show(() => <DialogConnectProvider controller={providerConnect} />)
  }

  const openCustom = () => {
    setStep("custom")
    void dialog.show(() => <DialogCustomProvider onBack={dialog.close} />)
  }

  return (
    <div class="flex flex-col gap-3 rounded-lg border border-border-weak-base bg-surface-base p-4">
      <div>
        <div class="text-14-medium text-text-strong">{language.t("providerWizard.title")}</div>
        <div class="text-12-regular text-text-weak">{language.t("providerWizard.description")}</div>
      </div>

      <Switch>
        <Match when={step() === "intro"}>
          <ol class="list-decimal space-y-1 pl-5 text-12-regular text-text-weak">
            <li>{language.t("providerWizard.step1")}</li>
            <li>{language.t("providerWizard.step2")}</li>
            <li>{language.t("providerWizard.step3")}</li>
          </ol>
          <div class="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" onClick={openCatalog}>
              {language.t("providerWizard.chooseCatalog")}
            </Button>
            <Button size="small" variant="ghost" onClick={openCustom}>
              {language.t("providerWizard.chooseCustom")}
            </Button>
          </div>
        </Match>
        <Match when={step() === "catalog" || step() === "custom"}>
          <div class="text-12-regular text-text-weak">{language.t("providerWizard.continueInDialog")}</div>
          <Button size="small" variant="ghost" onClick={() => setStep("done")}>
            {language.t("providerWizard.markDone")}
          </Button>
        </Match>
        <Match when={step() === "done"}>
          <div class="text-12-regular text-text-strong">{language.t("providerWizard.done")}</div>
          <Button size="small" variant="ghost" onClick={() => setStep("intro")}>
            {language.t("providerWizard.restart")}
          </Button>
        </Match>
      </Switch>
    </div>
  )
}
