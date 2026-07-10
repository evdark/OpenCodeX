import { Effect } from "effect"
import { cmd } from "./cmd"
import { effectCmd } from "../effect-cmd"
import { UI } from "../ui"
import { Session } from "@/session/session"
import { Global } from "@opencode-ai/core/global"
import path from "path"
import fs from "fs/promises"
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "fs"
import { spawn } from "child_process"
import { EOL } from "os"
import open from "open"

type PlusFeatures = {
  dashboard?: boolean
  gitUi?: boolean
  searchEverywhere?: boolean
  commandCenter?: boolean
  agentHandoff?: boolean
  browserPanel?: boolean
  workspaceProfiles?: boolean
  statusBar?: boolean
}

type CliSettings = {
  version: 1
  firstLaunchDone?: boolean
  neverAskDesktopImport?: boolean
  theme?: string
  lastImportAt?: number
  features?: PlusFeatures
}

type MemoryNote = {
  id: string
  title: string
  body: string
  tags: string[]
  source: string
  at: number
  directory?: string
  sessionID?: string
}

type WorkspaceProfile = {
  id: string
  name: string
  at: number
  theme?: string
  layout?: Record<string, unknown>
  directory?: string
}

type LastSession = {
  id: string
  title?: string
  directory?: string
  at?: number
}

const DEFAULT_FEATURES: Required<PlusFeatures> = {
  dashboard: true,
  gitUi: true,
  searchEverywhere: true,
  commandCenter: true,
  agentHandoff: true,
  browserPanel: true,
  workspaceProfiles: true,
  statusBar: true,
}

function plusHome() {
  const next = path.join(Global.Path.data, "opencodex")
  const legacy = path.join(Global.Path.data, "opencode-plus")
  if (existsSync(next)) return next
  if (existsSync(legacy)) return legacy
  return next
}

function ensureDir(dir: string) {
  mkdirSync(dir, { recursive: true })
}

function settingsPath() {
  return path.join(plusHome(), "cli-settings.json")
}

function memoryPath() {
  return path.join(plusHome(), "project-memory.json")
}

function workspacePath() {
  return path.join(plusHome(), "workspace-profiles.json")
}

function lastSessionPath() {
  // resume-tracker writes under opencode-plus; also accept opencodex
  const candidates = [
    path.join(Global.Path.data, "opencode-plus", "last-session.json"),
    path.join(Global.Path.data, "opencodex", "last-session.json"),
    path.join(plusHome(), "last-session.json"),
  ]
  for (const file of candidates) {
    if (existsSync(file)) return file
  }
  return candidates[0]
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!existsSync(file)) return fallback
    return JSON.parse(readFileSync(file, "utf8")) as T
  } catch {
    return fallback
  }
}

function writeJson(file: string, value: unknown) {
  ensureDir(path.dirname(file))
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n")
}

function loadSettings(): CliSettings {
  const file = settingsPath()
  const legacy = path.join(Global.Path.data, "opencode-plus", "cli-settings.json")
  const next = path.join(Global.Path.data, "opencodex", "cli-settings.json")
  const preferred = existsSync(next) ? next : existsSync(legacy) ? legacy : file
  const raw = readJson<CliSettings>(preferred, { version: 1, features: { ...DEFAULT_FEATURES } })
  return {
    ...raw,
    version: 1,
    features: { ...DEFAULT_FEATURES, ...(raw.features ?? {}) },
  }
}

function saveSettings(settings: CliSettings) {
  writeJson(settingsPath(), settings)
}

function loadMemory(): { notes: MemoryNote[] } {
  return readJson(memoryPath(), { notes: [] })
}

function saveMemory(data: { notes: MemoryNote[] }) {
  writeJson(memoryPath(), data)
}

function loadWorkspaces(): { profiles: WorkspaceProfile[] } {
  return readJson(workspacePath(), { profiles: [] })
}

function saveWorkspaces(data: { profiles: WorkspaceProfile[] }) {
  writeJson(workspacePath(), data)
}

function desktopStateCandidates() {
  const home = Global.Path.home
  const support = process.platform === "darwin" ? path.join(home, "Library", "Application Support") : path.join(home, ".config")
  return [
    path.join(support, "ai.opencodex.desktop"),
    path.join(support, "ai.opencode-plus.desktop"),
    path.join(support, "ai.opencode.desktop"),
  ]
}

async function runGit(args: string[], cwd = process.cwd()) {
  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
    const child = spawn("git", args, { cwd, env: process.env })
    let stdout = ""
    let stderr = ""
    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk)
    })
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk)
    })
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }))
    child.on("error", (error) => resolve({ code: 1, stdout: "", stderr: error.message }))
  })
}

export const PlusCommand = cmd({
  command: "plus",
  describe: "OpenCodeX utilities (alias hub)",
  builder: (yargs) =>
    yargs
      .command(PlusSetupCommand)
      .command(PlusDashboardCommand)
      .command(PlusResumeCommand)
      .command(PlusMemoryCommand)
      .command(PlusProfilesCommand)
      .command(PlusGitCommand)
      .command(PlusWorkspaceCommand)
      .command(PlusSettingsCommand)
      .command(PlusSearchCommand)
      .command(PlusBrowserCommand)
      .demandCommand(1),
  async handler() {},
})

export const PlusSetupCommand = cmd({
  command: "setup",
  describe: "first-run setup (desktop detect / import / skip)",
  builder: (yargs) =>
    yargs
      .option("import", {
        type: "boolean",
        describe: "import desktop settings pointer if present",
        default: false,
      })
      .option("skip", {
        type: "boolean",
        describe: "mark first-run complete without import",
        default: false,
      })
      .option("never", {
        type: "boolean",
        describe: "never ask about desktop import again",
        default: false,
      }),
  async handler(args) {
    process.env.OPENCODEX = "1"
    process.env.OPENCODE_PLUS = "1"
    const settings = loadSettings()
    const desktopRoots = desktopStateCandidates().filter((dir) => existsSync(dir))

    UI.empty()
    UI.println(UI.Style.TEXT_INFO_BOLD + "OpenCodeX setup" + UI.Style.TEXT_NORMAL)
    UI.println(`Data dir: ${plusHome()}`)

    if (desktopRoots.length === 0) {
      UI.println("No desktop install detected.")
    } else {
      UI.println("Desktop roots:")
      for (const root of desktopRoots) UI.println(`  - ${root}`)
    }

    if (args.never) {
      settings.neverAskDesktopImport = true
      settings.firstLaunchDone = true
      saveSettings(settings)
      UI.println(UI.Style.TEXT_SUCCESS_BOLD + "OK" + UI.Style.TEXT_NORMAL + " — will not ask again.")
      return
    }

    if (args.skip) {
      settings.firstLaunchDone = true
      saveSettings(settings)
      UI.println(UI.Style.TEXT_SUCCESS_BOLD + "OK" + UI.Style.TEXT_NORMAL + " — setup skipped.")
      return
    }

    if (args.import && desktopRoots[0]) {
      const pointer = path.join(plusHome(), "desktop-state-path.txt")
      writeJson(path.join(plusHome(), "desktop-opencode.settings.json"), {
        importedFrom: desktopRoots[0],
        at: Date.now(),
      })
      ensureDir(plusHome())
      writeFileSync(pointer, desktopRoots[0] + "\n")
      // Non-destructive: copy auth only if missing locally
      const desktopAuth = path.join(desktopRoots[0], "auth.json")
      const localAuth = path.join(Global.Path.data, "auth.json")
      if (existsSync(desktopAuth) && !existsSync(localAuth)) {
        copyFileSync(desktopAuth, localAuth)
        UI.println("Copied desktop auth.json")
      }
      settings.firstLaunchDone = true
      settings.lastImportAt = Date.now()
      saveSettings(settings)
      UI.println(UI.Style.TEXT_SUCCESS_BOLD + "OK" + UI.Style.TEXT_NORMAL + " — desktop pointer imported.")
      return
    }

    settings.firstLaunchDone = true
    saveSettings(settings)
    UI.println("Setup complete. Use --import / --skip / --never on next runs if needed.")
  },
})

export const PlusDashboardCommand = effectCmd({
  command: "dashboard",
  describe: "status + quick OpenCodeX commands",
  instance: false,
  handler: Effect.fn("Cli.plus.dashboard")(function* () {
    process.env.OPENCODEX = "1"
    const settings = loadSettings()
    const memory = loadMemory()
    const workspaces = loadWorkspaces()
    const last = readJson<LastSession | null>(lastSessionPath(), null)

    UI.empty()
    UI.println(UI.Style.TEXT_INFO_BOLD + "OpenCodeX dashboard" + UI.Style.TEXT_NORMAL)
    UI.println(`Data:       ${plusHome()}`)
    UI.println(`First-run:  ${settings.firstLaunchDone ? "done" : "pending"}`)
    UI.println(`Memory:     ${memory.notes.length} notes`)
    UI.println(`Workspaces: ${workspaces.profiles.length}`)
    if (last?.id) UI.println(`Last sess:  ${last.id}${last.title ? ` (${last.title})` : ""}`)
    UI.empty()
    UI.println("Quick commands:")
    UI.println("  ocx resume          resume last session")
    UI.println("  ocx memory list     project memory")
    UI.println("  ocx git status      git UI helper")
    UI.println("  ocx settings list   feature flags")
    UI.println("  ocx workspace list  named profiles")
    UI.println("  ocx search <q>      search memory/settings/docs")
    UI.println("  ocx browser [url]   open localhost / URL")
    UI.empty()
    UI.println("Feature flags:")
    for (const [key, value] of Object.entries(settings.features ?? DEFAULT_FEATURES)) {
      UI.println(`  ${key.padEnd(20)} ${value ? "on" : "off"}`)
    }
  }),
})

function spawnResume(sessionID: string, directory?: string) {
  const entry = process.argv[1]
  const args = [entry, "--session", sessionID]
  if (directory) args.push(directory)
  const child = spawn(process.execPath, args, {
    stdio: "inherit",
    env: {
      ...process.env,
      OPENCODEX: "1",
      OPENCODE_PLUS: "1",
      BUN_BIN: process.env.BUN_BIN,
    },
    cwd: directory || process.cwd(),
  })
  return new Promise<void>((resolve) => {
    child.on("exit", (code) => {
      process.exitCode = code ?? 0
      resolve()
    })
    child.on("error", (error) => {
      UI.error(error.message)
      process.exitCode = 1
      resolve()
    })
  })
}

export const PlusResumeCommand = effectCmd({
  command: "resume",
  describe: "open last session marker or most recent root session",
  handler: Effect.fn("Cli.plus.resume")(function* () {
    process.env.OPENCODEX = "1"
    const last = readJson<LastSession | null>(lastSessionPath(), null)
    if (last?.id) {
      UI.println(`Resuming last session: ${last.id}`)
      if (last.directory) UI.println(`Directory: ${last.directory}`)
      if (last.title) UI.println(`Title: ${last.title}`)
      yield* Effect.promise(() => spawnResume(last.id, last.directory))
      return
    }

    const sessions = yield* Session.Service.use((svc) => svc.list({ roots: true, limit: 1 }))
    const recent = sessions[0]
    if (!recent) {
      UI.println("No sessions to resume.")
      return
    }
    UI.println(`Resuming most recent: ${recent.id} — ${recent.title}`)
    yield* Effect.promise(() => spawnResume(recent.id, recent.directory))
  }),
})

export const PlusMemoryCommand = cmd({
  command: "memory [action] [text..]",
  describe: "list / add / search project memory",
  builder: (yargs) =>
    yargs
      .positional("action", {
        type: "string",
        choices: ["list", "add", "search"] as const,
        default: "list",
      })
      .positional("text", {
        type: "string",
        array: true,
        describe: "note body (add) or query (search)",
      })
      .option("title", {
        type: "string",
        describe: "note title for add",
      }),
  async handler(args) {
    const action = args.action ?? "list"
    const text = (args.text ?? []).join(" ").trim()
    const data = loadMemory()

    if (action === "list") {
      if (data.notes.length === 0) {
        UI.println("No memory notes.")
        return
      }
      for (const note of data.notes) {
        UI.println(`${note.id.slice(0, 8)}  ${note.title}`)
        UI.println(`  ${note.body.slice(0, 120)}${note.body.length > 120 ? "…" : ""}`)
      }
      return
    }

    if (action === "add") {
      if (!text) {
        UI.error("Usage: ocx memory add <text> [--title name]")
        return
      }
      const note: MemoryNote = {
        id: crypto.randomUUID(),
        title: args.title?.trim() || "Note",
        body: text,
        tags: [],
        source: "manual",
        at: Date.now(),
        directory: process.cwd(),
      }
      data.notes.unshift(note)
      if (data.notes.length > 200) data.notes.length = 200
      saveMemory(data)
      UI.println(UI.Style.TEXT_SUCCESS_BOLD + "Saved" + UI.Style.TEXT_NORMAL + ` ${note.id}`)
      return
    }

    if (action === "search") {
      if (!text) {
        UI.error("Usage: ocx memory search <query>")
        return
      }
      const terms = text
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((t) => t.length > 1)
      const hits = data.notes.filter((note) => {
        const hay = `${note.title}\n${note.body}\n${note.tags.join(" ")}`.toLowerCase()
        return terms.every((term) => hay.includes(term))
      })
      if (hits.length === 0) {
        UI.println("No matches.")
        return
      }
      for (const note of hits.slice(0, 20)) {
        UI.println(`${note.id.slice(0, 8)}  ${note.title}`)
        UI.println(`  ${note.body.slice(0, 120)}${note.body.length > 120 ? "…" : ""}`)
      }
    }
  },
})

export const PlusProfilesCommand = cmd({
  command: "profiles",
  describe: "list shared provider profiles file",
  async handler() {
    const candidates = [
      path.join(plusHome(), "provider-profiles.json"),
      path.join(Global.Path.data, "provider-profiles.json"),
      path.join(Global.Path.state, "provider-profiles.json"),
    ]
    for (const file of candidates) {
      if (!existsSync(file)) continue
      UI.println(file)
      UI.println(readFileSync(file, "utf8"))
      return
    }
    UI.println("No provider profiles file found.")
    UI.println("Expected under opencodex data or app global storage.")
  },
})

export const PlusGitCommand = cmd({
  command: "git [action]",
  describe: "status / stage / commit / branch / fetch / pull / push",
  builder: (yargs) =>
    yargs
      .positional("action", {
        type: "string",
        choices: ["status", "stage", "commit", "branch", "fetch", "pull", "push"] as const,
        default: "status",
      })
      .option("message", {
        alias: "m",
        type: "string",
        describe: "commit message",
      })
      .option("all", {
        alias: "a",
        type: "boolean",
        describe: "stage all when committing/staging",
        default: false,
      }),
  async handler(args) {
    const action = args.action ?? "status"
    const cwd = process.cwd()

    if (action === "status") {
      const result = await runGit(["status", "-sb"], cwd)
      process.stdout.write(result.stdout || result.stderr)
      return
    }
    if (action === "branch") {
      const result = await runGit(["branch", "-vv"], cwd)
      process.stdout.write(result.stdout || result.stderr)
      return
    }
    if (action === "stage") {
      const result = await runGit(args.all ? ["add", "-A"] : ["add", "-u"], cwd)
      process.stdout.write(result.stdout || result.stderr)
      if (result.code !== 0) process.exitCode = result.code
      return
    }
    if (action === "commit") {
      if (args.all) await runGit(["add", "-A"], cwd)
      const message = args.message?.trim() || "chore: commit"
      const result = await runGit(["commit", "-m", message], cwd)
      process.stdout.write(result.stdout || result.stderr)
      if (result.code !== 0) process.exitCode = result.code
      return
    }
    if (action === "fetch" || action === "pull" || action === "push") {
      const result = await runGit([action], cwd)
      process.stdout.write(result.stdout || result.stderr)
      if (result.code !== 0) process.exitCode = result.code
    }
  },
})

export const PlusWorkspaceCommand = cmd({
  command: "workspace [action] [name]",
  describe: "named workspace profiles",
  builder: (yargs) =>
    yargs
      .positional("action", {
        type: "string",
        choices: ["list", "save", "use", "delete"] as const,
        default: "list",
      })
      .positional("name", {
        type: "string",
        describe: "profile name",
      }),
  async handler(args) {
    const action = args.action ?? "list"
    const data = loadWorkspaces()
    const name = args.name?.trim()

    if (action === "list") {
      if (data.profiles.length === 0) {
        UI.println("No workspace profiles.")
        return
      }
      for (const profile of data.profiles) {
        UI.println(`${profile.name}${profile.directory ? `  →  ${profile.directory}` : ""}`)
      }
      return
    }

    if (action === "save") {
      if (!name) {
        UI.error("Usage: ocx workspace save <name>")
        return
      }
      const existing = data.profiles.find((p) => p.name === name)
      if (existing) {
        existing.directory = process.cwd()
        existing.at = Date.now()
      } else {
        data.profiles.push({
          id: crypto.randomUUID(),
          name,
          at: Date.now(),
          directory: process.cwd(),
        })
      }
      saveWorkspaces(data)
      UI.println(UI.Style.TEXT_SUCCESS_BOLD + "Saved" + UI.Style.TEXT_NORMAL + ` workspace "${name}"`)
      return
    }

    if (action === "use") {
      if (!name) {
        UI.error("Usage: ocx workspace use <name>")
        return
      }
      const profile = data.profiles.find((p) => p.name === name)
      if (!profile?.directory) {
        UI.error(`Workspace not found: ${name}`)
        return
      }
      UI.println(`cd ${profile.directory}`)
      UI.println("(OpenCodeX does not change your shell cwd; open a session in that directory.)")
      return
    }

    if (action === "delete") {
      if (!name) {
        UI.error("Usage: ocx workspace delete <name>")
        return
      }
      data.profiles = data.profiles.filter((p) => p.name !== name)
      saveWorkspaces(data)
      UI.println(`Deleted workspace "${name}"`)
    }
  },
})

export const PlusSettingsCommand = cmd({
  command: "settings [action] [flag] [value]",
  describe: "toggle premium feature flags",
  builder: (yargs) =>
    yargs
      .positional("action", {
        type: "string",
        choices: ["list", "set", "get", "reset"] as const,
        default: "list",
      })
      .positional("flag", {
        type: "string",
        describe: "feature flag name",
      })
      .positional("value", {
        type: "string",
        describe: "on|off|true|false",
      }),
  async handler(args) {
    const action = args.action ?? "list"
    const settings = loadSettings()
    const features = { ...DEFAULT_FEATURES, ...(settings.features ?? {}) }

    if (action === "list") {
      for (const [key, value] of Object.entries(features)) {
        UI.println(`${key.padEnd(20)} ${value ? "on" : "off"}`)
      }
      UI.println(`${EOL}File: ${settingsPath()}`)
      return
    }

    if (action === "reset") {
      settings.features = { ...DEFAULT_FEATURES }
      saveSettings(settings)
      UI.println("Feature flags restored to defaults.")
      return
    }

    if (action === "get") {
      const flag = args.flag as keyof PlusFeatures | undefined
      if (!flag || !(flag in DEFAULT_FEATURES)) {
        UI.error(`Unknown flag. Known: ${Object.keys(DEFAULT_FEATURES).join(", ")}`)
        return
      }
      UI.println(`${flag}=${features[flag] ? "on" : "off"}`)
      return
    }

    if (action === "set") {
      const flag = args.flag as keyof PlusFeatures | undefined
      if (!flag || !(flag in DEFAULT_FEATURES)) {
        UI.error(`Unknown flag. Known: ${Object.keys(DEFAULT_FEATURES).join(", ")}`)
        return
      }
      const raw = (args.value ?? "").toLowerCase()
      const on = raw === "on" || raw === "true" || raw === "1"
      const off = raw === "off" || raw === "false" || raw === "0"
      if (!on && !off) {
        UI.error("Value must be on|off")
        return
      }
      features[flag] = on
      settings.features = features
      saveSettings(settings)
      UI.println(`${flag}=${on ? "on" : "off"}`)
    }
  },
})

export const PlusSearchCommand = cmd({
  command: "search [query..]",
  describe: "search commands, memory, settings, profiles, docs",
  builder: (yargs) =>
    yargs.positional("query", {
      type: "string",
      array: true,
    }),
  async handler(args) {
    const query = (args.query ?? []).join(" ").trim().toLowerCase()
    if (!query) {
      UI.error("Usage: ocx search <query>")
      return
    }

    const hits: string[] = []
    const commands = [
      "setup",
      "dashboard",
      "resume",
      "memory",
      "profiles",
      "git",
      "workspace",
      "settings",
      "search",
      "browser",
    ]
    for (const name of commands) {
      if (name.includes(query)) hits.push(`command: ocx ${name}`)
    }

    for (const note of loadMemory().notes) {
      const hay = `${note.title} ${note.body}`.toLowerCase()
      if (hay.includes(query)) hits.push(`memory: ${note.title}`)
    }

    for (const profile of loadWorkspaces().profiles) {
      if (profile.name.toLowerCase().includes(query)) hits.push(`workspace: ${profile.name}`)
    }

    const settings = loadSettings()
    for (const key of Object.keys(settings.features ?? {})) {
      if (key.toLowerCase().includes(query)) hits.push(`setting: ${key}`)
    }

    if (hits.length === 0) {
      UI.println("No matches.")
      return
    }
    for (const hit of hits.slice(0, 40)) UI.println(hit)
  },
})

export const PlusBrowserCommand = cmd({
  command: "browser [url]",
  describe: "open localhost / URL externally",
  builder: (yargs) =>
    yargs
      .positional("url", {
        type: "string",
        describe: "URL to open (default http://localhost:3000)",
      })
      .option("port", {
        type: "number",
        describe: "localhost port when url omitted",
        default: 3000,
      }),
  async handler(args) {
    const target = args.url?.trim() || `http://localhost:${args.port ?? 3000}`
    UI.println(`Opening ${target}`)
    await open(target).catch((error: unknown) => {
      UI.error(error instanceof Error ? error.message : String(error))
    })
  },
})
