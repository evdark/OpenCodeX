import type { FollowupDraft } from "@/components/prompt-input/submit"
import type { ContentPart, ContextItem, Prompt } from "@/context/prompt"

export type PromptQueueItem = FollowupDraft & {
  id: string
  createdAt: number
  updatedAt: number
  source: "user" | "suggestion"
}

export type PromptQueueHistoryStatus = "completed" | "failed" | "skipped" | "canceled"

export type PromptQueueHistoryItem = PromptQueueItem & {
  status: PromptQueueHistoryStatus
  finishedAt: number
  error?: string
}

export type PromptQueueTemplate = Omit<PromptQueueItem, "sessionID" | "sessionDirectory" | "source"> & {
  name: string
}

export type PromptQueuePause = {
  reason?: string
  itemID?: string
  /** User-requested pause; stays until explicit resume. */
  manual?: boolean
}

export type PromptQueueEdit = Pick<PromptQueueItem, "id" | "prompt" | "context">

export type PromptQueueStore = {
  items: Record<string, PromptQueueItem[] | undefined>
  failed: Record<string, string | undefined>
  paused: Record<string, PromptQueuePause | undefined>
  edit: Record<string, PromptQueueEdit | undefined>
  history: Record<string, PromptQueueHistoryItem[] | undefined>
  templates: PromptQueueTemplate[]
}

export const emptyPromptQueueItems: PromptQueueItem[] = []
export const emptyPromptQueueHistory: PromptQueueHistoryItem[] = []

export const defaultPromptQueueStore: PromptQueueStore = {
  items: {},
  failed: {},
  paused: {},
  edit: {},
  history: {},
  templates: [],
}

export function createPromptQueueItem(
  draft: FollowupDraft,
  input: { id: string; now?: number; source?: PromptQueueItem["source"] },
): PromptQueueItem {
  const now = input.now ?? Date.now()
  return {
    id: input.id,
    ...cloneDraft(draft),
    createdAt: now,
    updatedAt: now,
    source: input.source ?? "user",
  }
}

export function promptQueuePreview(prompt: Prompt, fallback: string) {
  const text = prompt
    .map((part) => {
      if (part.type === "image") return `[image:${part.filename}]`
      if (part.type === "file") return `[file:${part.path}]`
      if (part.type === "agent") return `@${part.name}`
      return part.content
    })
    .join("")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => !!line)

  if (text) return text.replace(/\s+/g, " ")
  return `[${fallback}]`
}

export function promptQueueCreatedTime(value: number) {
  if (!Number.isFinite(value)) return ""
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function promptQueueEstimatedPosition(index: number) {
  return index + 1
}

export function enqueuePromptQueueItem(items: readonly PromptQueueItem[], item: PromptQueueItem, maximumSize: number) {
  if (items.length >= Math.max(0, Math.round(maximumSize))) return { ok: false as const, reason: "maximum-size" }
  return { ok: true as const, items: [...items, item] }
}

export function deletePromptQueueItem(items: readonly PromptQueueItem[], id: string) {
  return items.filter((item) => item.id !== id)
}

export function duplicatePromptQueueItem(
  items: readonly PromptQueueItem[],
  id: string,
  input: { id: string; now?: number },
) {
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) return items.slice()
  const now = input.now ?? Date.now()
  const copy: PromptQueueItem = {
    ...cloneQueueItem(items[index]),
    id: input.id,
    createdAt: now,
    updatedAt: now,
    source: "user",
  }
  return [...items.slice(0, index + 1), copy, ...items.slice(index + 1)]
}

export function movePromptQueueItem(items: readonly PromptQueueItem[], id: string, targetIndex: number) {
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) return items.slice()
  const next = items.slice()
  const [item] = next.splice(index, 1)
  next.splice(Math.max(0, Math.min(targetIndex, next.length)), 0, item)
  return next
}

export function movePromptQueueItemByDelta(items: readonly PromptQueueItem[], id: string, delta: number) {
  const index = items.findIndex((item) => item.id === id)
  if (index < 0) return items.slice()
  return movePromptQueueItem(items, id, index + delta)
}

export function runPromptQueueItemNow(items: readonly PromptQueueItem[], id: string) {
  return movePromptQueueItem(items, id, 0)
}

export function promptQueueHistoryItem(
  item: PromptQueueItem,
  status: PromptQueueHistoryStatus,
  input: { now?: number; error?: string } = {},
): PromptQueueHistoryItem {
  return {
    ...cloneQueueItem(item),
    status,
    finishedAt: input.now ?? Date.now(),
    error: input.error,
  }
}

export function restorePromptQueueHistoryItem(
  item: PromptQueueHistoryItem,
  input: { id: string; now?: number },
): PromptQueueItem {
  const now = input.now ?? Date.now()
  return {
    id: input.id,
    sessionID: item.sessionID,
    sessionDirectory: item.sessionDirectory,
    prompt: clonePrompt(item.prompt),
    context: cloneContext(item.context),
    agent: item.agent,
    model: { ...item.model },
    variant: item.variant,
    createdAt: now,
    updatedAt: now,
    source: "user",
  }
}

export function promptQueueTemplateFromItem(
  item: PromptQueueItem | PromptQueueHistoryItem,
  input: { id: string; name: string; now?: number },
): PromptQueueTemplate {
  const now = input.now ?? Date.now()
  return {
    id: input.id,
    name: input.name.trim(),
    prompt: clonePrompt(item.prompt),
    context: cloneContext(item.context),
    agent: item.agent,
    model: { ...item.model },
    variant: item.variant,
    createdAt: now,
    updatedAt: now,
  }
}

export function promptQueueItemFromTemplate(
  template: PromptQueueTemplate,
  input: { id: string; sessionID: string; sessionDirectory: string; now?: number },
): PromptQueueItem {
  const now = input.now ?? Date.now()
  return {
    id: input.id,
    sessionID: input.sessionID,
    sessionDirectory: input.sessionDirectory,
    prompt: clonePrompt(template.prompt),
    context: cloneContext(template.context),
    agent: template.agent,
    model: { ...template.model },
    variant: template.variant,
    createdAt: now,
    updatedAt: now,
    source: "user",
  }
}

export function upsertPromptQueueTemplate(
  templates: readonly PromptQueueTemplate[],
  template: PromptQueueTemplate,
  maximumSize = 50,
) {
  return [template, ...templates.filter((item) => item.name !== template.name && item.id !== template.id)].slice(0, maximumSize)
}

export function deletePromptQueueTemplate(templates: readonly PromptQueueTemplate[], id: string) {
  return templates.filter((item) => item.id !== id)
}

export function normalizePromptQueueStore(value: unknown): PromptQueueStore {
  if (!record(value)) return defaultPromptQueueStore
  return {
    items: normalizeRecord(value.items, normalizePromptQueueItems),
    failed: normalizeStringRecord(value.failed),
    paused: normalizeRecord(value.paused, normalizePromptQueuePause),
    edit: normalizeRecord(value.edit, normalizePromptQueueEdit),
    history: normalizeRecord(value.history, normalizePromptQueueHistory),
    templates: normalizePromptQueueTemplates(value.templates),
  }
}

function cloneQueueItem(item: PromptQueueItem): PromptQueueItem {
  return {
    id: item.id,
    ...cloneDraft(item),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    source: item.source,
  }
}

function cloneDraft(draft: FollowupDraft): FollowupDraft {
  return {
    sessionID: draft.sessionID,
    sessionDirectory: draft.sessionDirectory,
    prompt: clonePrompt(draft.prompt),
    context: cloneContext(draft.context),
    agent: draft.agent,
    model: { ...draft.model },
    variant: draft.variant,
  }
}

function clonePrompt(prompt: Prompt): Prompt {
  return prompt.map((part) => {
    if (part.type !== "file") return { ...part } as ContentPart
    return { ...part, selection: part.selection ? { ...part.selection } : undefined }
  })
}

function cloneContext(context: (ContextItem & { key: string })[]) {
  return context.map((item) => ({
    ...item,
    selection: item.selection ? { ...item.selection } : undefined,
  }))
}

function normalizePromptQueueItems(value: unknown) {
  if (!Array.isArray(value)) return undefined
  const items = value.flatMap((item) => {
    const normalized = normalizePromptQueueItem(item)
    return normalized ? [normalized] : []
  })
  return items.length ? items : undefined
}

function normalizePromptQueueHistory(value: unknown) {
  if (!Array.isArray(value)) return undefined
  const items = value.flatMap((item) => {
    const normalized = normalizePromptQueueHistoryEntry(item)
    return normalized ? [normalized] : []
  })
  return items.length ? items : undefined
}

function normalizePromptQueueTemplates(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const normalized = normalizePromptQueueTemplate(item)
    return normalized ? [normalized] : []
  })
}

function normalizePromptQueueItem(value: unknown): PromptQueueItem | undefined {
  if (!record(value)) return undefined
  const id = string(value.id)
  const sessionID = string(value.sessionID)
  const sessionDirectory = string(value.sessionDirectory)
  const agent = string(value.agent)
  const model = record(value.model) ? value.model : undefined
  const providerID = string(model?.providerID)
  const modelID = string(model?.modelID)
  if (!id || !sessionID || !sessionDirectory || !agent || !providerID || !modelID) return undefined
  if (!Array.isArray(value.prompt)) return undefined
  if (!Array.isArray(value.context)) return undefined
  return {
    id,
    sessionID,
    sessionDirectory,
    prompt: value.prompt.flatMap(normalizePromptPart),
    context: value.context.flatMap(normalizeContextItem),
    agent,
    model: { providerID, modelID },
    variant: string(value.variant),
    createdAt: number(value.createdAt, Date.now()),
    updatedAt: number(value.updatedAt, number(value.createdAt, Date.now())),
    source: value.source === "suggestion" ? "suggestion" : "user",
  }
}

function normalizePromptQueueHistoryEntry(value: unknown): PromptQueueHistoryItem | undefined {
  if (!record(value)) return undefined
  const item = normalizePromptQueueItem(value)
  const status = normalizeHistoryStatus(value.status)
  if (!item || !status) return undefined
  return {
    ...item,
    status,
    finishedAt: number(value.finishedAt, Date.now()),
    error: string(value.error),
  }
}

function normalizePromptQueueTemplate(value: unknown): PromptQueueTemplate | undefined {
  if (!record(value)) return undefined
  const item = normalizePromptQueueItem({ ...value, sessionID: "template", sessionDirectory: "template" })
  const name = string(value.name)?.trim()
  if (!item || !name) return undefined
  return {
    id: item.id,
    name,
    prompt: item.prompt,
    context: item.context,
    agent: item.agent,
    model: item.model,
    variant: item.variant,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function normalizePromptPart(value: unknown): ContentPart[] {
  if (!record(value)) return []
  if (value.type === "text" && typeof value.content === "string") {
    return [{ type: "text", content: value.content, start: number(value.start, 0), end: number(value.end, 0) }]
  }
  if (value.type === "agent" && typeof value.content === "string" && typeof value.name === "string") {
    return [
      {
        type: "agent",
        content: value.content,
        start: number(value.start, 0),
        end: number(value.end, 0),
        name: value.name,
      },
    ]
  }
  if (value.type === "file" && typeof value.content === "string" && typeof value.path === "string") {
    return [
      {
        type: "file",
        content: value.content,
        start: number(value.start, 0),
        end: number(value.end, 0),
        path: value.path,
        selection: normalizeSelection(value.selection),
        mime: string(value.mime),
        filename: string(value.filename),
        url: string(value.url),
      },
    ]
  }
  if (
    value.type === "image" &&
    typeof value.id === "string" &&
    typeof value.filename === "string" &&
    typeof value.mime === "string" &&
    typeof value.dataUrl === "string"
  ) {
    return [
      {
        type: "image",
        id: value.id,
        filename: value.filename,
        sourcePath: string(value.sourcePath),
        mime: value.mime,
        dataUrl: value.dataUrl,
      },
    ]
  }
  return []
}

function normalizeContextItem(value: unknown): (ContextItem & { key: string })[] {
  if (!record(value)) return []
  const key = string(value.key)
  const path = string(value.path)
  if (value.type !== "file" || !key || !path) return []
  return [
    {
      key,
      type: "file",
      path,
      selection: normalizeSelection(value.selection),
      comment: string(value.comment),
      commentID: string(value.commentID),
      commentOrigin:
        value.commentOrigin === "review" || value.commentOrigin === "file" ? value.commentOrigin : undefined,
      preview: string(value.preview),
    },
  ]
}

function normalizeSelection(value: unknown) {
  if (!record(value)) return undefined
  const startLine = number(value.startLine, Number.NaN)
  const startChar = number(value.startChar, 0)
  const endLine = number(value.endLine, Number.NaN)
  const endChar = number(value.endChar, 0)
  if (!Number.isFinite(startLine) || !Number.isFinite(endLine)) return undefined
  return { startLine, startChar, endLine, endChar }
}

function normalizePromptQueuePause(value: unknown): PromptQueuePause | undefined {
  if (value === true) return { manual: true }
  if (!record(value)) return undefined
  return {
    reason: string(value.reason),
    itemID: string(value.itemID),
    manual: value.manual === true ? true : undefined,
  }
}

function normalizePromptQueueEdit(value: unknown): PromptQueueEdit | undefined {
  if (record(value) && typeof value.id === "string" && Array.isArray(value.prompt) && Array.isArray(value.context)) {
    return {
      id: value.id,
      prompt: value.prompt.flatMap(normalizePromptPart),
      context: value.context.flatMap(normalizeContextItem),
    }
  }

  const item = normalizePromptQueueItem(value)
  if (!item) return undefined
  return { id: item.id, prompt: item.prompt, context: item.context }
}

function normalizeHistoryStatus(value: unknown): PromptQueueHistoryStatus | undefined {
  if (value === "completed" || value === "failed" || value === "skipped" || value === "canceled") return value
  return undefined
}

function normalizeRecord<T>(value: unknown, normalize: (value: unknown) => T | undefined) {
  if (!record(value)) return {}
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      const normalized = normalize(entry)
      if (!normalized) return []
      return [[key, normalized]]
    }),
  )
}

function normalizeStringRecord(value: unknown) {
  if (!record(value)) return {}
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) => {
      if (typeof entry !== "string") return []
      return [[key, entry]]
    }),
  )
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function string(value: unknown) {
  return typeof value === "string" ? value : undefined
}

function number(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}
