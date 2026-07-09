import { Button } from "@opencode-ai/ui/button"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { Dialog } from "@opencode-ai/ui/dialog"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { ProviderIcon } from "@opencode-ai/ui/provider-icon"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { useMutation } from "@tanstack/solid-query"
import { TextField } from "@opencode-ai/ui/text-field"
import { showToast } from "@/utils/toast"
import { batch, For } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { Link } from "@/components/link"
import { useServerSDK } from "@/context/server-sdk"
import { useServerSync } from "@/context/server-sync"
import { useLanguage } from "@/context/language"
import { useModels } from "@/context/models"
import { usePlatform } from "@/context/platform"
import {
  customProviderFormState,
  type CustomProviderInitialValue,
  type FormState,
  headerRow,
  modelRow,
  validateCustomProvider,
} from "./dialog-custom-provider-form"

type Props = {
  onBack: () => void
  provider?: CustomProviderInitialValue
}

export function DialogCustomProvider(props: Props) {
  const language = useLanguage()

  return (
    <Dialog
      class="h-full"
      title={
        <IconButton
          tabIndex={-1}
          icon="arrow-left"
          variant="ghost"
          onClick={props.onBack}
          aria-label={language.t("common.goBack")}
        />
      }
      transition
    >
      <CustomProviderForm provider={props.provider} />
    </Dialog>
  )
}

export function CustomProviderForm(props: { provider?: CustomProviderInitialValue } = {}) {
  const dialog = useDialog()
  const serverSync = useServerSync()
  const serverSDK = useServerSDK()
  const language = useLanguage()
  const models = useModels()
  const platform = usePlatform()
  const editing = () => props.provider !== undefined

  const [form, setForm] = createStore<FormState>(customProviderFormState(props.provider))

  const addModel = () => {
    setForm(
      "models",
      produce((rows) => {
        rows.push(modelRow())
      }),
    )
  }

  const removeModel = (index: number) => {
    if (form.models.length <= 1) return
    setForm(
      "models",
      produce((rows) => {
        rows.splice(index, 1)
      }),
    )
  }

  const addHeader = () => {
    setForm(
      "headers",
      produce((rows) => {
        rows.push(headerRow())
      }),
    )
  }

  const removeHeader = (index: number) => {
    if (form.headers.length <= 1) return
    setForm(
      "headers",
      produce((rows) => {
        rows.splice(index, 1)
      }),
    )
  }

  const setField = (key: "providerID" | "name" | "baseURL" | "apiKey", value: string) => {
    setForm(key, value)
    if (key === "apiKey") return
    setForm("err", key, undefined)
  }

  const setModel = (index: number, key: "id" | "name", value: string) => {
    batch(() => {
      setForm("models", index, key, value)
      setForm("models", index, "err", key, undefined)
    })
  }

  const setHeader = (index: number, key: "key" | "value", value: string) => {
    batch(() => {
      setForm("headers", index, key, value)
      setForm("headers", index, "err", key, undefined)
    })
  }

  const importedModelIDs = () =>
    form.models
      .filter((model) => model.imported)
      .map((model) => model.id.trim())
      .filter(Boolean)

  const fetchModelsMutation = useMutation(() => ({
    mutationFn: async () => {
      const baseURL = form.baseURL.trim()
      if (!baseURL) throw new Error(language.t("provider.custom.models.fetch.error.baseURL"))
      const response = await (platform.fetch ?? fetch)(`${baseURL.replace(/\/+$/, "")}/models`, {
        headers: discoveryHeaders(form.apiKey, form.headers),
      })
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`.trim())
      return parseModelsResponse(await response.json())
    },
    onSuccess: (items) => {
      if (items.length === 0) {
        showToast({
          title: language.t("provider.custom.models.fetch.empty.title"),
          description: language.t("provider.custom.models.fetch.empty.description"),
        })
        return
      }
      setForm(
        "models",
        items.map((item) => ({
          row: modelRow().row,
          id: item.id,
          name: item.name,
          imported: true,
          config: item.config,
          err: {},
        })),
      )
      showToast({
        variant: "success",
        icon: "circle-check",
        title: language.t("provider.custom.models.fetch.success.title", { count: items.length }),
        description: language.t("provider.custom.models.fetch.success.description"),
      })
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : String(err)
      showToast({
        title: language.t("provider.custom.models.fetch.failed.title"),
        description: language.t("provider.custom.models.fetch.failed.description", { error: message }),
      })
    },
  }))

  const validate = () => {
    const output = validateCustomProvider({
      form,
      t: language.t,
      disabledProviders: serverSync().data.config.disabled_providers ?? [],
      existingProviderIDs: new Set(serverSync().data.provider.all.keys()),
      editingProviderID: props.provider?.providerID,
    })
    batch(() => {
      setForm("err", output.err)
      output.models.forEach((err, index) => setForm("models", index, "err", err))
      output.headers.forEach((err, index) => setForm("headers", index, "err", err))
    })
    return output.result
  }

  const saveMutation = useMutation(() => ({
    mutationFn: async (result: NonNullable<ReturnType<typeof validate>>) => {
      const disabledProviders = serverSync().data.config.disabled_providers ?? []
      const nextDisabled = disabledProviders.filter((id) => id !== result.providerID)

      if (result.key) {
        await serverSDK().client.auth.set({
          providerID: result.providerID,
          auth: {
            type: "api",
            key: result.key,
          },
        })
      }

      await serverSync().updateConfig({
        provider: { [result.providerID]: result.config },
        disabled_providers: nextDisabled,
      })
      importedModelIDs().forEach((modelID) => models.setVisibility({ providerID: result.providerID, modelID }, false))
      return result
    },
    onSuccess: (result) => {
      dialog.close()
      showToast({
        variant: "success",
        icon: "circle-check",
        title: language.t("provider.connect.toast.connected.title", { provider: result.name }),
        description: language.t("provider.connect.toast.connected.description", { provider: result.name }),
      })
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : String(err)
      showToast({ title: language.t("common.requestFailed"), description: message })
    },
  }))

  const save = (e: SubmitEvent) => {
    e.preventDefault()
    if (saveMutation.isPending) return

    const result = validate()
    if (!result) return
    saveMutation.mutate(result)
  }

  return (
    <div class="flex flex-col gap-6 px-2.5 pb-3 overflow-y-auto overflow-x-hidden max-h-[60vh]">
      <div class="px-2.5 flex min-w-0 gap-4 items-center">
        <ProviderIcon id="synthetic" class="size-5 shrink-0 icon-strong-base" />
        <div class="min-w-0 truncate text-16-medium text-text-strong">{language.t("provider.custom.title")}</div>
      </div>

      <form onSubmit={save} class="min-w-0 px-2.5 pb-6 flex flex-col gap-6">
        <p class="text-14-regular text-text-base">
          {language.t("provider.custom.description.prefix")}
          <Link href="https://opencode.ai/docs/providers/#custom-provider" tabIndex={-1}>
            {language.t("provider.custom.description.link")}
          </Link>
          {language.t("provider.custom.description.suffix")}
        </p>

        <div class="flex flex-col gap-4">
          <TextField
            autofocus
            label={language.t("provider.custom.field.providerID.label")}
            placeholder={language.t("provider.custom.field.providerID.placeholder")}
            description={language.t("provider.custom.field.providerID.description")}
            value={form.providerID}
            onChange={(v) => setField("providerID", v)}
            disabled={editing()}
            validationState={form.err.providerID ? "invalid" : undefined}
            error={form.err.providerID}
          />
          <TextField
            label={language.t("provider.custom.field.name.label")}
            placeholder={language.t("provider.custom.field.name.placeholder")}
            value={form.name}
            onChange={(v) => setField("name", v)}
            validationState={form.err.name ? "invalid" : undefined}
            error={form.err.name}
          />
          <TextField
            label={language.t("provider.custom.field.baseURL.label")}
            placeholder={language.t("provider.custom.field.baseURL.placeholder")}
            value={form.baseURL}
            onChange={(v) => setField("baseURL", v)}
            validationState={form.err.baseURL ? "invalid" : undefined}
            error={form.err.baseURL}
          />
          <TextField
            label={language.t("provider.custom.field.apiKey.label")}
            placeholder={language.t("provider.custom.field.apiKey.placeholder")}
            description={language.t("provider.custom.field.apiKey.description")}
            value={form.apiKey}
            onChange={(v) => setField("apiKey", v)}
          />
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <div class="flex min-w-0 items-center gap-1.5">
              <label class="text-12-medium text-text-weak">{language.t("provider.custom.models.label")}</label>
              <HelpTip value={language.t("provider.custom.models.fetch.help")} />
            </div>
            <Button
              type="button"
              size="small"
              variant="ghost"
              onClick={() => fetchModelsMutation.mutate()}
              disabled={fetchModelsMutation.isPending}
            >
              {fetchModelsMutation.isPending
                ? language.t("provider.custom.models.fetch.loading")
                : language.t("provider.custom.models.fetch")}
            </Button>
          </div>
          <For each={form.models}>
            {(m, i) => (
              <div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start" data-row={m.row}>
                <div class="min-w-0 flex-1">
                  <TextField
                    label={language.t("provider.custom.models.id.label")}
                    hideLabel
                    placeholder={language.t("provider.custom.models.id.placeholder")}
                    value={m.id}
                    onChange={(v) => setModel(i(), "id", v)}
                    validationState={m.err.id ? "invalid" : undefined}
                    error={m.err.id}
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <TextField
                    label={language.t("provider.custom.models.name.label")}
                    hideLabel
                    placeholder={language.t("provider.custom.models.name.placeholder")}
                    value={m.name}
                    onChange={(v) => setModel(i(), "name", v)}
                    validationState={m.err.name ? "invalid" : undefined}
                    error={m.err.name}
                  />
                </div>
                <IconButton
                  type="button"
                  icon="trash"
                  variant="ghost"
                  class="mt-1.5"
                  onClick={() => removeModel(i())}
                  disabled={form.models.length <= 1}
                  aria-label={language.t("provider.custom.models.remove")}
                />
              </div>
            )}
          </For>
          <Button type="button" size="small" variant="ghost" icon="plus-small" onClick={addModel} class="self-start">
            {language.t("provider.custom.models.add")}
          </Button>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex min-w-0 items-center gap-1.5">
            <label class="text-12-medium text-text-weak">{language.t("provider.custom.headers.label")}</label>
            <HelpTip value={language.t("provider.custom.headers.help")} />
          </div>
          <For each={form.headers}>
            {(h, i) => (
              <div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start" data-row={h.row}>
                <div class="min-w-0 flex-1">
                  <TextField
                    label={language.t("provider.custom.headers.key.label")}
                    hideLabel
                    placeholder={language.t("provider.custom.headers.key.placeholder")}
                    value={h.key}
                    onChange={(v) => setHeader(i(), "key", v)}
                    validationState={h.err.key ? "invalid" : undefined}
                    error={h.err.key}
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <TextField
                    label={language.t("provider.custom.headers.value.label")}
                    hideLabel
                    placeholder={language.t("provider.custom.headers.value.placeholder")}
                    value={h.value}
                    onChange={(v) => setHeader(i(), "value", v)}
                    validationState={h.err.value ? "invalid" : undefined}
                    error={h.err.value}
                  />
                </div>
                <IconButton
                  type="button"
                  icon="trash"
                  variant="ghost"
                  class="mt-1.5"
                  onClick={() => removeHeader(i())}
                  disabled={form.headers.length <= 1}
                  aria-label={language.t("provider.custom.headers.remove")}
                />
              </div>
            )}
          </For>
          <Button type="button" size="small" variant="ghost" icon="plus-small" onClick={addHeader} class="self-start">
            {language.t("provider.custom.headers.add")}
          </Button>
        </div>

        <Button
          class="w-auto self-start"
          type="submit"
          size="large"
          variant="primary"
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending
            ? language.t("common.saving")
            : language.t(editing() ? "common.save" : "common.submit")}
        </Button>
      </form>
    </div>
  )
}

type DiscoveredModel = {
  id: string
  name: string
  config?: {
    reasoning?: boolean
    variants?: Record<string, Record<string, unknown>>
  }
}

function discoveryHeaders(apiKey: string, rows: FormState["headers"]) {
  const headers = new Headers()
  const key = apiKey.trim()
  if (key && !key.startsWith("{env:")) headers.set("Authorization", `Bearer ${key}`)
  rows.forEach((row) => {
    const name = row.key.trim()
    const value = row.value.trim()
    if (name && value) headers.set(name, value)
  })
  return headers
}

function parseModelsResponse(value: unknown): DiscoveredModel[] {
  const data = record(value) && Array.isArray(value.data) ? value.data : Array.isArray(value) ? value : []
  const seen = new Set<string>()
  return data.flatMap((item) => {
    if (!record(item)) return []
    const id = typeof item.id === "string" ? item.id : typeof item.name === "string" ? item.name : undefined
    if (!id || seen.has(id)) return []
    seen.add(id)
    const name = displayName(item, id)
    const variants = reasoningVariants(item)
    const reasoning = hasReasoning(item) || variants !== undefined
    return [
      {
        id,
        name,
        config:
          reasoning || variants
            ? { ...(reasoning ? { reasoning } : {}), ...(variants ? { variants } : {}) }
            : undefined,
      },
    ]
  })
}

function displayName(item: Record<string, unknown>, id: string) {
  const name = item.name ?? item.display_name ?? item.displayName
  if (typeof name === "string" && name.trim()) return name.trim()
  return id
}

function hasReasoning(item: Record<string, unknown>) {
  const value = item.reasoning ?? item.supports_reasoning ?? item.reasoning_supported
  if (typeof value === "boolean") return value
  const parameters = item.supported_parameters
  if (
    Array.isArray(parameters) &&
    parameters.some((entry) => typeof entry === "string" && entry.includes("reasoning"))
  ) {
    return true
  }
  const id = typeof item.id === "string" ? item.id.toLowerCase() : ""
  const name = displayName(item, id).toLowerCase()
  return (
    id.includes("reason") ||
    name.includes("reason") ||
    id.startsWith("o1") ||
    id.startsWith("o3") ||
    id.startsWith("o4")
  )
}

function reasoningVariants(item: Record<string, unknown>) {
  const source = item.reasoning_effort ?? item.reasoningEffort ?? item.reasoning_efforts ?? item.reasoningEfforts
  const values = Array.isArray(source)
    ? source.filter((value): value is string => typeof value === "string")
    : hasReasoning(item)
      ? ["low", "medium", "high"]
      : []
  if (values.length === 0) return
  return Object.fromEntries(values.map((value) => [value, { reasoningEffort: value }]))
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function HelpTip(props: { value: string }) {
  return (
    <Tooltip value={props.value} placement="top" contentClass="max-w-72 text-pretty">
      <span class="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-border-base text-10-medium text-text-weak">
        ?
      </span>
    </Tooltip>
  )
}
