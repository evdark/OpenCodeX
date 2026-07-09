export type ReleaseFeed = {
  readonly owner: string
  readonly repo: string
}

export function releaseFeed(input: { channel: string; owner?: string; repo?: string }): ReleaseFeed {
  if (input.owner && input.repo) return { owner: input.owner, repo: input.repo }
  if (input.channel === "beta") return { owner: "anomalyco", repo: "opencode-beta" }
  return { owner: "anomalyco", repo: "opencode" }
}

export * as ReleaseFeed from "./release-feed"
