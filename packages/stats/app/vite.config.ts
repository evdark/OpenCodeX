import { solidStart } from "@solidjs/start/config"
import { nitro } from "nitro/vite"
import { defineConfig, type PluginOption } from "vite"
import { solidStartManifestFallback } from "../../solid-start-manifest-fallback"

export default defineConfig({
  base: "/data/",
  plugins: [
    // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- SolidStart resolves through a bundled Vite patch version.
    solidStart() as PluginOption,
    solidStartManifestFallback(import.meta.url),
    nitro({
      compatibilityDate: "2024-09-19",
      preset: "cloudflare-module",
      cloudflare: {
        nodeCompat: true,
      },
    }),
  ],
  server: {
    allowedHosts: true,
  },
  build: {
    minify: false,
  },
})
