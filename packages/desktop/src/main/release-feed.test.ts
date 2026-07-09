import { describe, expect, test } from "bun:test"
import { releaseFeed } from "./release-feed"

describe("releaseFeed", () => {
  test("keeps upstream OpenCode defaults", () => {
    expect(releaseFeed({ channel: "prod" })).toEqual({ owner: "anomalyco", repo: "opencode" })
    expect(releaseFeed({ channel: "beta" })).toEqual({ owner: "anomalyco", repo: "opencode-beta" })
  })

  test("uses fork release coordinates when provided", () => {
    expect(releaseFeed({ channel: "prod", owner: "evdark", repo: "opencode-plus" })).toEqual({
      owner: "evdark",
      repo: "opencode-plus",
    })
  })
})
