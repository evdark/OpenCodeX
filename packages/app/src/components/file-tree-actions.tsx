import { Button } from "@opencode-ai/ui/button"
import { Dialog } from "@opencode-ai/ui/dialog"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { ContextMenu } from "@opencode-ai/ui/context-menu"
import { MenuV2 } from "@opencode-ai/ui/v2/menu-v2"
import { DialogFooter, DialogHeader, DialogTitleGroup, DialogV2 } from "@opencode-ai/ui/v2/dialog-v2"
import { ButtonV2 } from "@opencode-ai/ui/v2/button-v2"
import { showToast } from "@/utils/toast"
import { getFilename } from "@opencode-ai/core/util/path"
import { createSignal, type JSX, type ParentProps } from "solid-js"
import { useFile } from "@/context/file"
import { useLanguage } from "@/context/language"
import { useSettings } from "@/context/settings"

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === "string" && error) return error
  return fallback
}

function parentPath(path: string) {
  const idx = path.lastIndexOf("/")
  if (idx === -1) return ""
  return path.slice(0, idx)
}

function joinPath(parent: string, name: string) {
  if (!parent) return name
  return `${parent}/${name}`
}

export function DialogRenameFile(props: { path: string }) {
  const file = useFile()
  const language = useLanguage()
  const dialog = useDialog()
  const settings = useSettings()
  const [value, setValue] = createSignal(getFilename(props.path))
  const [busy, setBusy] = createSignal(false)

  const submit = async () => {
    const name = value().trim()
    if (!name || busy()) return
    if (name.includes("/") || name.includes("\\")) {
      showToast({
        variant: "error",
        title: language.t("toast.file.renameFailed.title"),
        description: language.t("file.tree.invalidName"),
      })
      return
    }

    const next = joinPath(parentPath(props.path), name)
    if (next === props.path) {
      dialog.close()
      return
    }

    setBusy(true)
    try {
      await file.rename(props.path, next)
      dialog.close()
    } catch (error) {
      showToast({
        variant: "error",
        title: language.t("toast.file.renameFailed.title"),
        description: errorMessage(error, language.t("error.chain.unknown")),
      })
      setBusy(false)
    }
  }

  if (settings.general.newLayoutDesigns()) {
    return (
      <DialogV2 fit>
        <DialogHeader hideClose>
          <DialogTitleGroup title={language.t("common.rename")} description={props.path} />
        </DialogHeader>
        <div class="px-4 pb-2">
          <input
            autofocus
            value={value()}
            onInput={(e) => setValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                void submit()
              }
            }}
            class="w-full rounded-md border border-border-weak-base bg-background-base px-3 py-2 text-14-regular text-text-strong outline-none focus:border-border-strong-base"
          />
        </div>
        <DialogFooter>
          <ButtonV2 variant="ghost" onClick={() => dialog.close()} disabled={busy()}>
            {language.t("common.cancel")}
          </ButtonV2>
          <ButtonV2 variant="contrast" onClick={() => void submit()} disabled={busy()}>
            {language.t("common.save")}
          </ButtonV2>
        </DialogFooter>
      </DialogV2>
    )
  }

  return (
    <Dialog title={language.t("common.rename")} fit>
      <div class="flex flex-col gap-4 pl-6 pr-2.5 pb-3">
        <div class="text-12-regular text-text-weak">{props.path}</div>
        <input
          autofocus
          value={value()}
          onInput={(e) => setValue(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void submit()
            }
          }}
          class="w-full rounded-md border border-border-weak-base bg-background-base px-3 py-2 text-14-regular text-text-strong outline-none focus:border-border-strong-base"
        />
        <div class="flex justify-end gap-2">
          <Button variant="ghost" size="large" onClick={() => dialog.close()} disabled={busy()}>
            {language.t("common.cancel")}
          </Button>
          <Button variant="primary" size="large" onClick={() => void submit()} disabled={busy()}>
            {language.t("common.save")}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export function DialogDeleteFile(props: { path: string }) {
  const file = useFile()
  const language = useLanguage()
  const dialog = useDialog()
  const settings = useSettings()
  const [busy, setBusy] = createSignal(false)
  const name = () => getFilename(props.path)

  const submit = async () => {
    if (busy()) return
    setBusy(true)
    try {
      await file.remove(props.path)
      dialog.close()
    } catch (error) {
      showToast({
        variant: "error",
        title: language.t("toast.file.deleteFailed.title"),
        description: errorMessage(error, language.t("error.chain.unknown")),
      })
      setBusy(false)
    }
  }

  if (settings.general.newLayoutDesigns()) {
    return (
      <DialogV2 fit>
        <DialogHeader hideClose>
          <DialogTitleGroup
            title={language.t("file.tree.delete.title")}
            description={language.t("file.tree.delete.confirm", { name: name() })}
          />
        </DialogHeader>
        <DialogFooter>
          <ButtonV2 variant="ghost" onClick={() => dialog.close()} disabled={busy()}>
            {language.t("common.cancel")}
          </ButtonV2>
          <ButtonV2 variant="danger" onClick={() => void submit()} disabled={busy()}>
            {language.t("common.delete")}
          </ButtonV2>
        </DialogFooter>
      </DialogV2>
    )
  }

  return (
    <Dialog title={language.t("file.tree.delete.title")} fit>
      <div class="flex flex-col gap-4 pl-6 pr-2.5 pb-3">
        <div class="text-14-regular text-text-strong">
          {language.t("file.tree.delete.confirm", { name: name() })}
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" size="large" onClick={() => dialog.close()} disabled={busy()}>
            {language.t("common.cancel")}
          </Button>
          <Button variant="primary" size="large" onClick={() => void submit()} disabled={busy()}>
            {language.t("common.delete")}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export function useFileTreeActions() {
  const file = useFile()
  const language = useLanguage()
  const dialog = useDialog()

  const rename = (path: string) => {
    dialog.show(() => <DialogRenameFile path={path} />)
  }

  const remove = (path: string) => {
    dialog.show(() => <DialogDeleteFile path={path} />)
  }

  const copyPath = (path: string) => {
    void navigator.clipboard
      .writeText(path)
      .then(() => {
        showToast({
          variant: "success",
          icon: "circle-check",
          title: language.t("session.share.copy.copied"),
          description: path,
        })
      })
      .catch((error: unknown) => {
        showToast({
          variant: "error",
          title: language.t("common.requestFailed"),
          description: errorMessage(error, language.t("error.chain.unknown")),
        })
      })
  }

  const duplicate = async (path: string) => {
    try {
      const next = await file.copy(path)
      if (!next) return
      showToast({
        variant: "success",
        icon: "circle-check",
        title: language.t("file.tree.copy.success"),
        description: next,
      })
    } catch (error) {
      showToast({
        variant: "error",
        title: language.t("toast.file.copyFailed.title"),
        description: errorMessage(error, language.t("error.chain.unknown")),
      })
    }
  }

  return { rename, remove, copyPath, duplicate }
}

export function FileTreeContextMenu(props: ParentProps<{ path: string; variant?: "default" | "v2" }>): JSX.Element {
  const language = useLanguage()
  const actions = useFileTreeActions()
  const variant = () => props.variant ?? "default"

  if (variant() === "v2") {
    return (
      <MenuV2.Context>
        <MenuV2.Context.Trigger class="contents" as="div">
          {props.children}
        </MenuV2.Context.Trigger>
        <MenuV2.Context.Portal>
          <MenuV2.Context.Content>
            <MenuV2.Item onSelect={() => actions.rename(props.path)}>{language.t("common.rename")}</MenuV2.Item>
            <MenuV2.Item onSelect={() => void actions.duplicate(props.path)}>
              {language.t("file.tree.duplicate")}
            </MenuV2.Item>
            <MenuV2.Item onSelect={() => actions.copyPath(props.path)}>
              {language.t("session.header.open.copyPath")}
            </MenuV2.Item>
            <MenuV2.Separator />
            <MenuV2.Item onSelect={() => actions.remove(props.path)}>{language.t("common.delete")}</MenuV2.Item>
          </MenuV2.Context.Content>
        </MenuV2.Context.Portal>
      </MenuV2.Context>
    )
  }

  return (
    <ContextMenu>
      <ContextMenu.Trigger class="contents">{props.children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content>
          <ContextMenu.Item onSelect={() => actions.rename(props.path)}>
            <ContextMenu.ItemLabel>{language.t("common.rename")}</ContextMenu.ItemLabel>
          </ContextMenu.Item>
          <ContextMenu.Item onSelect={() => void actions.duplicate(props.path)}>
            <ContextMenu.ItemLabel>{language.t("file.tree.duplicate")}</ContextMenu.ItemLabel>
          </ContextMenu.Item>
          <ContextMenu.Item onSelect={() => actions.copyPath(props.path)}>
            <ContextMenu.ItemLabel>{language.t("session.header.open.copyPath")}</ContextMenu.ItemLabel>
          </ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item onSelect={() => actions.remove(props.path)}>
            <ContextMenu.ItemLabel>{language.t("common.delete")}</ContextMenu.ItemLabel>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu>
  )
}
