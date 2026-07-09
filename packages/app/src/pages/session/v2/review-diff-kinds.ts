import type { SnapshotFileDiff, VcsFileDiff } from "@opencode-ai/sdk/v2"
import type { Kind } from "@/components/file-tree-v2"
import { normalizeFileTreeV2Path } from "@/components/file-tree-v2-model"

export type RenderDiff = (SnapshotFileDiff & { file: string }) | VcsFileDiff

export function normalizePath(p: string) {
  return normalizeFileTreeV2Path(p)
}

export type ReviewFileIndex = {
  files: string[]
  lower: string[]
}

export function createReviewFileIndex(files: string[]): ReviewFileIndex {
  return {
    files,
    lower: files.map((file) => file.toLowerCase()),
  }
}

export function filterRenderableDiff(value: SnapshotFileDiff | VcsFileDiff): value is RenderDiff {
  return typeof value.file === "string"
}

export function reviewDiffKinds(diffs: RenderDiff[]) {
  const merge = (a: Kind | undefined, b: Kind) => {
    if (!a) return b
    if (a === b) return a
    return "mix" as const
  }

  const out = new Map<string, Kind>()
  for (const diff of diffs) {
    const file = normalizePath(diff.file)
    if (!file) continue
    const kind = diff.status === "added" ? "add" : diff.status === "deleted" ? "del" : "mix"

    out.set(file, kind)

    const parts = file.split("/")
    let dir = ""
    for (let index = 0; index < parts.length - 1; index++) {
      const part = parts[index]!
      dir = dir ? `${dir}/${part}` : part
      out.set(dir, merge(out.get(dir), kind))
    }
  }
  return out
}

export function filterReviewFiles(input: ReviewFileIndex | string[], query: string) {
  const value = query.trim().toLowerCase()
  if (!value) return "files" in input ? input.files : input
  const index = "files" in input ? input : createReviewFileIndex(input)
  return index.files.filter((_, position) => index.lower[position]?.includes(value))
}
