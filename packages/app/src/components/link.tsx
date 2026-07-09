import { ComponentProps, splitProps } from "solid-js"
import { usePlatform } from "@/context/platform"
import { isPreviewableUrl, normalizeBrowserUrl } from "@/context/browser-preview-model"

export interface LinkProps extends Omit<ComponentProps<"a">, "href"> {
  href: string
}

export function Link(props: LinkProps) {
  const platform = usePlatform()
  const [local, rest] = splitProps(props, ["href", "children", "class"])

  return (
    <a
      href={local.href}
      class={`text-text-strong underline ${local.class ?? ""}`}
      title={isPreviewableUrl(normalizeBrowserUrl(local.href)) ? "Alt/Option-click to open in Browser Preview" : undefined}
      onClick={(event) => {
        if (!local.href) return
        event.preventDefault()
        const url = normalizeBrowserUrl(local.href)
        if ((event.altKey || event.metaKey) && isPreviewableUrl(url)) {
          window.dispatchEvent(new CustomEvent("opencode:browser-preview", { detail: { url } }))
          return
        }
        platform.openLink(local.href)
      }}
      {...rest}
    >
      {local.children}
    </a>
  )
}
