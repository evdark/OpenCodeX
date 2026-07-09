import { createRequire } from "node:module"
import { dirname, join } from "node:path"

export function solidStartManifestFallback(configUrl: string) {
  const require = createRequire(configUrl)
  const solidStartRoot = dirname(dirname(dirname(require.resolve("@solidjs/start/config"))))
  const enforce = "pre" as const

  return {
    name: "solid-start-manifest-fallback",
    enforce,
    resolveId(id: string) {
      return id === "solid-start:get-manifest"
        ? join(solidStartRoot, "dist/server/manifest/ssr-manifest.js")
        : undefined
    },
  }
}
