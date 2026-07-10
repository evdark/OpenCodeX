import fs from "fs"
import path from "path"
import os from "os"
import { xdgCache, xdgConfig, xdgData, xdgState } from "xdg-basedir"

/** OpenCode legacy app id used for import-from-opencode. */
export const OPENCODE_APP = "opencode"
/** OpenCodeX app id for data/config/cache/state. */
export const OPENCODEX_APP = "opencodex"

export type HomeChoice = "import" | "fresh"

export function isOpenCodeXMode() {
  return process.env.OPENCODEX === "1" || process.env.OPENCODE_PLUS === "1"
}

export function appName() {
  if (isOpenCodeXMode()) return OPENCODEX_APP
  return OPENCODE_APP
}

export function xdgRoots() {
  const home = process.env.OPENCODE_TEST_HOME ?? os.homedir()
  return {
    home,
    data: xdgData ?? path.join(home, ".local", "share"),
    config: xdgConfig ?? path.join(home, ".config"),
    cache: xdgCache ?? path.join(home, ".cache"),
    state: xdgState ?? path.join(home, ".local", "state"),
  }
}

export function appPaths(name = appName()) {
  const roots = xdgRoots()
  return {
    home: roots.home,
    data: path.join(roots.data, name),
    config: path.join(roots.config, name),
    cache: path.join(roots.cache, name),
    state: path.join(roots.state, name),
    tmp: path.join(os.tmpdir(), name),
  }
}

function setupMarker(configDir: string) {
  return path.join(configDir, ".opencodex-setup.json")
}

export function readSetupChoice(configDir = appPaths(OPENCODEX_APP).config): HomeChoice | undefined {
  try {
    const raw = fs.readFileSync(setupMarker(configDir), "utf8")
    const parsed = JSON.parse(raw) as { choice?: HomeChoice }
    if (parsed.choice === "import" || parsed.choice === "fresh") return parsed.choice
  } catch {
    // missing or invalid
  }
  return
}

export function isSetupPending(configDir = appPaths(OPENCODEX_APP).config) {
  return !readSetupChoice(configDir)
}

function copyIfMissing(from: string, to: string) {
  if (!fs.existsSync(from)) return false
  if (fs.existsSync(to)) return false
  fs.mkdirSync(path.dirname(to), { recursive: true })
  const stat = fs.statSync(from)
  if (stat.isDirectory()) {
    fs.cpSync(from, to, { recursive: true, force: false, errorOnExist: false })
    return true
  }
  fs.copyFileSync(from, to)
  return true
}

function importTree(sourceRoot: string, targetRoot: string) {
  if (!fs.existsSync(sourceRoot)) return 0
  let count = 0
  const entries = fs.readdirSync(sourceRoot, { withFileTypes: true })
  for (const entry of entries) {
    const from = path.join(sourceRoot, entry.name)
    const to = path.join(targetRoot, entry.name)
    if (copyIfMissing(from, to)) count += 1
  }
  return count
}

/**
 * Create OpenCodeX home dirs. Optionally import non-destructively from OpenCode.
 * Never overwrites existing OpenCodeX files.
 */
export function applyHomeChoice(choice: HomeChoice) {
  const next = appPaths(OPENCODEX_APP)
  const legacy = appPaths(OPENCODE_APP)

  for (const dir of [next.data, next.config, next.cache, next.state, next.tmp]) {
    fs.mkdirSync(dir, { recursive: true })
  }

  let imported = 0
  if (choice === "import") {
    imported += importTree(legacy.config, next.config)
    imported += importTree(legacy.data, next.data)
    // Auth commonly lives under data/
    imported += copyIfMissing(path.join(legacy.data, "auth.json"), path.join(next.data, "auth.json")) ? 1 : 0
  }

  fs.writeFileSync(
    setupMarker(next.config),
    JSON.stringify({ version: 1, choice, imported, at: Date.now() }, null, 2) + "\n",
  )

  return { paths: next, imported, choice }
}
