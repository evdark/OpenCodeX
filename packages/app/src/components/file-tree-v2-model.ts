import type { FileNode } from "@opencode-ai/sdk/v2"

export type FileTreeV2Model = {
  children: ReadonlyMap<string, readonly FileTreeV2Node[]>
  total: number
}

export type FileTreeV2Node = FileNode & { originalPath: string }

export type FileTreeV2Row = {
  node: FileTreeV2Node
  level: number
}

export function normalizeFileTreeV2Path(value: string) {
  return value
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\/{2,}/g, "/")
}

export function buildFileTreeV2Model(paths: readonly string[]): FileTreeV2Model {
  const nodes = new Map<string, FileTreeV2Node>()

  paths.forEach((value) => {
    const file = normalizeFileTreeV2Path(value)
    if (!file) return

    const parts = file.split("/")
    let path = ""
    parts.forEach((name, index) => {
      path = path ? `${path}/${name}` : name
      if (nodes.has(path)) return
      nodes.set(path, {
        name,
        path,
        absolute: path,
        type: index === parts.length - 1 ? "file" : "directory",
        ignored: false,
        originalPath: index === parts.length - 1 ? value : path,
      })
    })
  })

  const children = new Map<string, FileTreeV2Node[]>()
  nodes.forEach((node) => {
    const index = node.path.lastIndexOf("/")
    const parent = index === -1 ? "" : node.path.slice(0, index)
    const list = children.get(parent)
    if (list) list.push(node)
    else children.set(parent, [node])
  })
  children.forEach((nodes) =>
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    }),
  )

  return { children, total: nodes.size }
}

export function flattenFileTreeV2(model: FileTreeV2Model, expanded: (path: string) => boolean) {
  const rows: FileTreeV2Row[] = []
  const roots = model.children.get("") ?? []
  const stack: FileTreeV2Row[] = []
  for (let index = roots.length - 1; index >= 0; index--) {
    stack.push({ node: roots[index]!, level: 0 })
  }

  while (stack.length > 0) {
    const row = stack.pop()!
    rows.push(row)
    if (row.node.type !== "directory" || !expanded(row.node.path)) continue
    const children = model.children.get(row.node.path) ?? []
    for (let index = children.length - 1; index >= 0; index--) {
      stack.push({ node: children[index]!, level: row.level + 1 })
    }
  }

  return rows
}
