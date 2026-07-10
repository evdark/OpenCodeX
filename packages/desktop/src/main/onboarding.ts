import { cpSync, copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { mkdir } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { app, dialog } from "electron"
import { getStore } from "./store"
import { DATA_SETUP_CHOICE_KEY, FIRST_LAUNCH_ONBOARDING_COMPLETE_KEY } from "./store-keys"
import { write as writeLog } from "./logging"

const DEFAULT_PROJECT_DIR = "New OpenCode Project"
const OPENCODE_APP = "opencode"
const OPENCODEX_APP = "opencodex"

export type DataSetupChoice = "import" | "fresh"

function xdg(kind: "data" | "config" | "cache" | "state") {
  const home = homedir()
  if (kind === "data") return process.env.XDG_DATA_HOME || join(home, ".local", "share")
  if (kind === "config") return process.env.XDG_CONFIG_HOME || join(home, ".config")
  if (kind === "cache") return process.env.XDG_CACHE_HOME || join(home, ".cache")
  return process.env.XDG_STATE_HOME || join(home, ".local", "state")
}

function appRoots(name: string) {
  return {
    data: join(xdg("data"), name),
    config: join(xdg("config"), name),
    cache: join(xdg("cache"), name),
    state: join(xdg("state"), name),
  }
}

function copyIfMissing(from: string, to: string) {
  if (!existsSync(from) || existsSync(to)) return false
  mkdirSync(join(to, ".."), { recursive: true })
  const stat = statSync(from)
  if (stat.isDirectory()) {
    cpSync(from, to, { recursive: true, force: false, errorOnExist: false })
    return true
  }
  copyFileSync(from, to)
  return true
}

function importTree(sourceRoot: string, targetRoot: string) {
  if (!existsSync(sourceRoot)) return 0
  let count = 0
  for (const entry of readdirSync(sourceRoot, { withFileTypes: true })) {
    if (copyIfMissing(join(sourceRoot, entry.name), join(targetRoot, entry.name))) count += 1
  }
  return count
}

function applyHomeChoiceLocal(choice: DataSetupChoice) {
  const next = appRoots(OPENCODEX_APP)
  const legacy = appRoots(OPENCODE_APP)
  for (const dir of Object.values(next)) mkdirSync(dir, { recursive: true })

  let imported = 0
  if (choice === "import") {
    imported += importTree(legacy.config, next.config)
    imported += importTree(legacy.data, next.data)
    imported += copyIfMissing(join(legacy.data, "auth.json"), join(next.data, "auth.json")) ? 1 : 0
  }

  writeFileSync(
    join(next.config, ".opencodex-setup.json"),
    JSON.stringify({ version: 1, choice, imported, at: Date.now() }, null, 2) + "\n",
  )
  return { paths: next, imported, choice }
}

export function isFirstLaunchOnboardingPending() {
  const pending = getStore().get(FIRST_LAUNCH_ONBOARDING_COMPLETE_KEY) !== true
  writeLog("onboarding", "first launch onboarding pending checked", { pending })
  return pending
}

export function isDataSetupPending() {
  const choice = getStore().get(DATA_SETUP_CHOICE_KEY)
  return choice !== "import" && choice !== "fresh"
}

export function getDataSetupChoice(): DataSetupChoice | null {
  const choice = getStore().get(DATA_SETUP_CHOICE_KEY)
  if (choice === "import" || choice === "fresh") return choice
  return null
}

export async function applyDataSetupChoice(choice: DataSetupChoice) {
  process.env.OPENCODEX = "1"
  process.env.OPENCODE_PLUS = "1"
  const result = applyHomeChoiceLocal(choice)
  getStore().set(DATA_SETUP_CHOICE_KEY, choice)
  writeLog("onboarding", "data setup choice applied", { choice, imported: result.imported })
  return result
}

/** Native first-run prompt so OpenCodeX paths are ready before the server starts. */
export async function ensureDataSetupBeforeServer() {
  process.env.OPENCODEX = "1"
  process.env.OPENCODE_PLUS = "1"
  if (!isDataSetupPending()) {
    const existing = getDataSetupChoice()
    if (existing) await applyDataSetupChoice(existing)
    return getDataSetupChoice() ?? "fresh"
  }

  const result = await dialog.showMessageBox({
    type: "question",
    buttons: ["Import from OpenCode", "Start from scratch"],
    defaultId: 0,
    cancelId: 1,
    title: "OpenCodeX setup",
    message: "How should OpenCodeX store providers, plugins, and settings?",
    detail:
      "Import copies OpenCode config/data into a dedicated OpenCodeX folder (never overwrites existing OpenCodeX files). Start from scratch creates empty OpenCodeX folders.",
  })

  const choice: DataSetupChoice = result.response === 0 ? "import" : "fresh"
  await applyDataSetupChoice(choice)
  return choice
}

export async function finishFirstLaunchOnboarding(createDefaultProject: boolean) {
  if (!isFirstLaunchOnboardingPending()) {
    writeLog("onboarding", "first launch onboarding already completed")
    return null
  }

  const defaultProject = createDefaultProject ? join(app.getPath("documents"), DEFAULT_PROJECT_DIR) : null
  if (defaultProject) await mkdir(defaultProject, { recursive: true })

  getStore().set(FIRST_LAUNCH_ONBOARDING_COMPLETE_KEY, true)
  writeLog("onboarding", "first launch onboarding completed", { createDefaultProject, defaultProject })
  return defaultProject
}
