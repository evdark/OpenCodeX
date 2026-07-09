import { openCodePlusCategories, type OpenCodePlusCategoryID } from "@/context/settings"

export function isOpenCodePlusCategoryID(value: string): value is OpenCodePlusCategoryID {
  return openCodePlusCategories.some((category) => category.id === value)
}

export function normalizeOpenCodePlusAdvancedValue(value: unknown) {
  const values: unknown[] = Array.isArray(value) ? value : [value]
  return values.filter((item): item is OpenCodePlusCategoryID => {
    return typeof item === "string" && isOpenCodePlusCategoryID(item)
  })
}

export function opencodePlusSettingsMatches(query: string, values: readonly string[]) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return values.some((value) => value.toLowerCase().includes(normalized))
}

export function opencodePlusSettingsSearching(query: string) {
  return query.trim().length > 0
}

export function parseOpenCodePlusTokenThreshold(value: number | string) {
  const next = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(next)) return undefined
  return Math.max(0, Math.round(next))
}

export function parseOpenCodePlusQueueSize(value: number | string) {
  const next = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(next)) return undefined
  return Math.max(0, Math.min(200, Math.round(next)))
}
