import { describe, expect, test } from "bun:test"
import type { FollowupDraft } from "@/components/prompt-input/submit"
import {
  createPromptQueueItem,
  deletePromptQueueTemplate,
  deletePromptQueueItem,
  duplicatePromptQueueItem,
  enqueuePromptQueueItem,
  movePromptQueueItem,
  normalizePromptQueueStore,
  promptQueueHistoryItem,
  promptQueueItemFromTemplate,
  promptQueuePreview,
  promptQueueTemplateFromItem,
  restorePromptQueueHistoryItem,
  upsertPromptQueueTemplate,
} from "./prompt-queue"

describe("prompt queue model", () => {
  test("enqueues immutable prompt snapshots with a maximum size", () => {
    const draft = draftFor("Update docs")
    const item = createPromptQueueItem(draft, { id: "queued-1", now: 100 })
    const part = draft.prompt[0]
    if (part?.type !== "text") throw new Error("Expected text prompt part")
    part.content = "mutated"

    expect(item.prompt[0]).toMatchObject({ content: "Update docs" })
    expect(enqueuePromptQueueItem([], item, 1)).toEqual({ ok: true, items: [item] })
    expect(enqueuePromptQueueItem([item], createPromptQueueItem(draftFor("Tests"), { id: "queued-2" }), 1)).toEqual({
      ok: false,
      reason: "maximum-size",
    })
  })

  test("duplicates, deletes, and reorders queue items", () => {
    const first = createPromptQueueItem(draftFor("First"), { id: "first", now: 100 })
    const second = createPromptQueueItem(draftFor("Second"), { id: "second", now: 200 })
    const duplicated = duplicatePromptQueueItem([first, second], "first", { id: "copy", now: 300 })

    expect(duplicated.map((item) => item.id)).toEqual(["first", "copy", "second"])
    expect(movePromptQueueItem(duplicated, "second", 0).map((item) => item.id)).toEqual(["second", "first", "copy"])
    expect(deletePromptQueueItem(duplicated, "copy").map((item) => item.id)).toEqual(["first", "second"])
  })

  test("moves completed history items back into the queue as user prompts", () => {
    const item = createPromptQueueItem(draftFor("Generate tests"), {
      id: "queued-1",
      now: 100,
      source: "suggestion",
    })
    const restored = restorePromptQueueHistoryItem(promptQueueHistoryItem(item, "completed", { now: 200 }), {
      id: "restored",
      now: 300,
    })

    expect(restored.id).toBe("restored")
    expect(restored.source).toBe("user")
    expect(restored.createdAt).toBe(300)
    expect(promptQueuePreview(restored.prompt, "attachment")).toBe("Generate tests")
  })

  test("normalizes old queue stores without losing usable prompts", () => {
    const normalized = normalizePromptQueueStore({
      items: {
        session: [
          {
            id: "old",
            sessionID: "session",
            sessionDirectory: "/repo",
            prompt: [{ type: "text", content: "Continue", start: 0, end: 8 }],
            context: [],
            agent: "build",
            model: { providerID: "provider", modelID: "model" },
          },
          { id: "broken" },
        ],
      },
      paused: { session: true },
    })

    expect(normalized.items.session).toHaveLength(1)
    expect(normalized.items.session?.[0].source).toBe("user")
    expect(normalized.paused.session).toEqual({ manual: true })
  })

  test("saves templates and restores them as session queue items", () => {
    const item = createPromptQueueItem(draftFor("Ship it"), { id: "queued", now: 100 })
    const template = promptQueueTemplateFromItem(item, { id: "template", name: "Ship it", now: 200 })
    const restored = promptQueueItemFromTemplate(template, {
      id: "queued-next",
      sessionID: "new-session",
      sessionDirectory: "/next",
      now: 300,
    })

    expect(template).toMatchObject({ id: "template", name: "Ship it", createdAt: 200 })
    expect(restored).toMatchObject({
      id: "queued-next",
      sessionID: "new-session",
      sessionDirectory: "/next",
      source: "user",
      createdAt: 300,
    })
    expect(promptQueuePreview(restored.prompt, "attachment")).toBe("Ship it")
  })

  test("upserts, deletes, and normalizes prompt queue templates", () => {
    const first = promptQueueTemplateFromItem(createPromptQueueItem(draftFor("One"), { id: "one" }), {
      id: "template-one",
      name: "Same",
    })
    const second = promptQueueTemplateFromItem(createPromptQueueItem(draftFor("Two"), { id: "two" }), {
      id: "template-two",
      name: "Same",
    })
    const templates = upsertPromptQueueTemplate(upsertPromptQueueTemplate([], first), second)

    expect(templates.map((item) => item.id)).toEqual(["template-two"])
    expect(deletePromptQueueTemplate(templates, "template-two")).toEqual([])
    expect(
      normalizePromptQueueStore({
        templates: [{ ...second, name: "Same" }, { id: "broken" }],
      }).templates,
    ).toHaveLength(1)
  })
})

function draftFor(text: string): FollowupDraft {
  return {
    sessionID: "session",
    sessionDirectory: "/repo",
    prompt: [{ type: "text", content: text, start: 0, end: text.length }],
    context: [],
    agent: "build",
    model: { providerID: "provider", modelID: "model" },
  }
}
