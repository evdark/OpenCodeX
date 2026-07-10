import { useFile } from "@/context/file"
import { FileIcon } from "@opencode-ai/ui/file-icon"
import "@opencode-ai/ui/v2/file-tree-v2.css"
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
  splitProps,
  type ComponentProps,
  type ParentProps,
} from "solid-js"
import { Dynamic } from "solid-js/web"
import type { FileNode } from "@opencode-ai/sdk/v2"
import { Icon } from "@opencode-ai/ui/v2/icon"
import { pathToFileUrl, withFileDragImage, type Kind } from "@/components/file-tree"
import { FileTreeContextMenu, useFileTreeActions } from "@/components/file-tree-actions"
import { createVirtualizer, defaultRangeExtractor } from "@tanstack/solid-virtual"
import { buildFileTreeV2Model, flattenFileTreeV2, normalizeFileTreeV2Path } from "@/components/file-tree-v2-model"
import { virtualScrollElement } from "@/components/virtual-scroll-element"

export type { Kind } from "@/components/file-tree"

const INDENT_STEP = 16

function rowPaddingLeft(level: number, type: FileNode["type"]) {
  if (type === "directory") return 8 + level * INDENT_STEP
  if (level === 0) return 8
  return 8 + level * INDENT_STEP - INDENT_STEP
}

function guideLineLeft(level: number) {
  return rowPaddingLeft(level, "directory") + 8
}

export const kindLabel = (kind: Kind) => {
  if (kind === "add") return "A"
  if (kind === "del") return "D"
  return ""
}

export const kindChange = (kind: Kind) => {
  if (kind === "add") return "added"
  if (kind === "del") return "deleted"
  return "modified"
}

const FileTreeNodeV2 = (
  p: ParentProps &
    ComponentProps<"div"> &
    ComponentProps<"button"> & {
      node: FileNode
      level: number
      active?: string
      draggable: boolean
      kinds?: ReadonlyMap<string, Kind>
      as?: "div" | "button"
    },
) => {
  const [local, rest] = splitProps(p, [
    "node",
    "level",
    "active",
    "draggable",
    "kinds",
    "as",
    "children",
    "class",
    "classList",
  ])
  const kind = () => local.kinds?.get(local.node.path)

  return (
    <Dynamic
      component={local.as ?? "div"}
      data-slot="file-tree-v2-row"
      data-path={local.node.path}
      data-selected={local.node.path === local.active ? "" : undefined}
      data-ignored={local.node.ignored ? "" : undefined}
      classList={{
        ...local.classList,
        [local.class ?? ""]: !!local.class,
      }}
      style={`padding-left: ${rowPaddingLeft(local.level, local.node.type)}px`}
      draggable={local.draggable}
      onDragStart={(event: DragEvent) => {
        if (!local.draggable) return
        event.dataTransfer?.setData("text/plain", `file:${local.node.path}`)
        event.dataTransfer?.setData("application/x-opencode-file", local.node.path)
        event.dataTransfer?.setData("text/uri-list", pathToFileUrl(local.node.path))
        if (event.dataTransfer) event.dataTransfer.effectAllowed = "copyMove"
        withFileDragImage(event)
      }}
      {...rest}
    >
      {local.children}
      <span class="flex-1 min-w-0 text-12-medium whitespace-nowrap truncate">{local.node.name}</span>
      {(() => {
        const value = kind()
        if (!value || local.node.type !== "file") return null
        return (
          <span data-slot="file-tree-v2-change" data-change={kindChange(value)}>
            {kindLabel(value)}
          </span>
        )
      })()}
    </Dynamic>
  )
}

function GuideLines(props: { level: number }) {
  return (
    <For each={Array.from({ length: props.level })}>
      {(_, index) => (
        <div
          class="absolute top-0 bottom-0 w-px pointer-events-none bg-border-weak-base opacity-0 group-hover/file-tree-v2:opacity-50"
          style={`left: ${guideLineLeft(index())}px`}
        />
      )}
    </For>
  )
}

function dragSourcePath(event: DragEvent) {
  const custom = event.dataTransfer?.getData("application/x-opencode-file")
  if (custom) return custom
  const plain = event.dataTransfer?.getData("text/plain") ?? ""
  if (plain.startsWith("file:")) return plain.slice("file:".length)
  return ""
}

export default function FileTreeV2(props: {
  active?: string
  allowed?: readonly string[]
  kinds?: ReadonlyMap<string, Kind>
  draggable?: boolean
  onFileClick?: (file: FileNode) => void
}) {
  const file = useFile()
  const actions = useFileTreeActions()
  const draggable = () => props.draggable ?? true
  const active = () => normalizeFileTreeV2Path(props.active ?? "")
  const acceptDrop = (event: DragEvent, directory: string) => {
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move"
    void directory
  }
  const handleDrop = (event: DragEvent, directory: string) => {
    event.preventDefault()
    event.stopPropagation()
    const from = dragSourcePath(event)
    if (!from || from === directory) return
    void actions.moveInto(from, directory)
  }
  const model = createMemo(() => {
    if (props.allowed) return buildFileTreeV2Model(props.allowed)
    return buildFileTreeV2Model(file.tree.allNodes().map((n) => n.path))
  })
  const rows = createMemo(() => flattenFileTreeV2(model(), (path) => file.tree.state(path)?.expanded ?? true))
  const rowIndexByPath = createMemo(() => new Map(rows().map((row, index) => [row.node.path, index] as const)))
  const [root, setRoot] = createSignal<HTMLDivElement>()
  const [focused, setFocused] = createSignal<string>()
  const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    get count() {
      return rows().length
    },
    getScrollElement: () => virtualScrollElement(root()),
    initialRect: { width: 0, height: 600 },
    estimateSize: () => 28,
    gap: 2,
    overscan: 10,
    get getItemKey() {
      const current = rows()
      return (index: number) => current[index]?.node.path ?? index
    },
    rangeExtractor: (range) => {
      const indexes = defaultRangeExtractor(range)
      const path = focused()
      const index = path ? (rowIndexByPath().get(path) ?? -1) : -1
      if (index < 0 || indexes.includes(index)) return indexes
      return [...indexes, index].sort((a, b) => a - b)
    },
  })
  createEffect(() => {
    const path = active()
    if (!path) return
    const index = rowIndexByPath().get(path) ?? -1
    if (index < 0) return
    queueMicrotask(() => {
      if (virtualizer.range && index >= virtualizer.range.startIndex && index <= virtualizer.range.endIndex) return
      virtualizer.scrollToIndex(index, { align: "auto" })
    })
  })
  const rowByKey = createMemo(() => new Map(rows().map((row) => [row.node.path, row] as const)))
  const virtualItems = createMemo(() => virtualizer.getVirtualItems())
  const virtualItemByKey = createMemo(() => new Map(virtualItems().map((item) => [item.key, item] as const)))
  const virtualRowKeys = createMemo(() => virtualItems().map((item) => item.key))

  return (
    <div
      ref={setRoot}
      data-component="file-tree-v2"
      data-total-rows={model().total}
      class="group/file-tree-v2"
      style={{ position: "relative", height: `${virtualizer.getTotalSize()}px` }}
    >
      <For each={virtualRowKeys()}>
        {(key) => (
          <Show when={virtualItemByKey().get(key)}>
            {(item) => (
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: `${item().size}px`,
                  transform: `translateY(${item().start}px)`,
                }}
              >
                <Show when={rowByKey().get(key as string)}>
                  {(row) => (
                    <Show
                      when={row().node.type === "directory"}
                      fallback={
                        <FileTreeContextMenu path={row().node.originalPath} variant="v2">
                          <FileTreeNodeV2
                            node={row().node}
                            level={row().level}
                            active={active()}
                            draggable={draggable()}
                            kinds={props.kinds}
                            as="button"
                            type="button"
                            class="relative"
                            onFocus={() => setFocused(row().node.path)}
                            onBlur={() => setFocused(undefined)}
                            onClick={() =>
                              props.onFileClick?.({
                                ...row().node,
                                path: row().node.originalPath,
                                absolute: row().node.originalPath,
                              })
                            }
                          >
                            <GuideLines level={row().level} />
                            <Show when={row().level > 0}>
                              <div class="w-4 shrink-0" />
                            </Show>
                            <span class="filetree-iconpair size-4">
                              <FileIcon node={row().node} class="size-4 filetree-icon filetree-icon--color" />
                              <FileIcon node={row().node} class="size-4 filetree-icon filetree-icon--mono" mono />
                            </span>
                          </FileTreeNodeV2>
                        </FileTreeContextMenu>
                      }
                    >
                      <FileTreeContextMenu path={row().node.originalPath} variant="v2">
                        <FileTreeNodeV2
                          node={row().node}
                          level={row().level}
                          active={active()}
                          draggable={draggable()}
                          kinds={props.kinds}
                          as="button"
                          type="button"
                          class="relative"
                          onFocus={() => setFocused(row().node.path)}
                          onBlur={() => setFocused(undefined)}
                          aria-expanded={file.tree.state(row().node.path)?.expanded ?? true}
                          onDragOver={(event: DragEvent) => acceptDrop(event, row().node.originalPath)}
                          onDrop={(event: DragEvent) => handleDrop(event, row().node.originalPath)}
                          onClick={() =>
                            file.tree.state(row().node.path)?.expanded === false
                              ? file.tree.expand(row().node.path, { list: false })
                              : file.tree.collapse(row().node.path)
                          }
                        >
                          <GuideLines level={row().level} />
                          <div
                            data-slot="file-tree-v2-chevron"
                            data-expanded={file.tree.state(row().node.path)?.expanded === false ? undefined : ""}
                            class="size-4 flex items-center justify-center"
                          >
                            <Icon name="chevron-down" />
                          </div>
                        </FileTreeNodeV2>
                      </FileTreeContextMenu>
                    </Show>
                  )}
                </Show>
              </div>
            )}
          </Show>
        )}
      </For>
    </div>
  )
}
