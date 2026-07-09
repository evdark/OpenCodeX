#!/usr/bin/env node

/**
 * OpenCodeX CLI entry.
 * Same engine as `opencode`, branded launcher + OpenCodeX middleware.
 *
 * .cjs so Node loads CommonJS even when package.json has "type": "module".
 */
"use strict"

const fs = require("fs")
const path = require("path")
const Module = require("module")
const childProcess = require("child_process")

process.env.OPENCODEX = "1"
process.env.OPENCODE_PLUS = "1"
process.env.OPENCODE_APP_NAME = process.env.OPENCODE_APP_NAME || "ocx"

const scriptDir = __dirname
const srcEntry = path.join(scriptDir, "..", "src", "index.ts")
const platformBinary = process.env.OPENCODE_BIN_PATH
const cached = path.join(scriptDir, ".opencode")

function runSource() {
  if (!fs.existsSync(srcEntry)) return false
  const bun = process.env.BUN_BIN || "bun"
  const child = childProcess.spawn(bun, ["run", "--conditions=browser", srcEntry, ...process.argv.slice(2)], {
    stdio: "inherit",
    env: process.env,
  })
  child.on("error", (error) => {
    console.error(error.message)
    process.exit(1)
  })
  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }
    process.exit(typeof code === "number" ? code : 0)
  })
  return true
}

// Prefer an already-built native binary when present.
if (platformBinary || fs.existsSync(cached)) {
  const launcher = path.join(scriptDir, "opencode")
  const source = fs.readFileSync(launcher, "utf8")
  const mod = new Module(launcher, module)
  mod.filename = launcher
  mod.paths = Module._nodeModulePaths(scriptDir)
  mod._compile(source, launcher)
} else if (runSource()) {
  // monorepo / from-source dev path
} else {
  // Fall back to the standard platform package resolver.
  const launcher = path.join(scriptDir, "opencode")
  const source = fs.readFileSync(launcher, "utf8")
  const mod = new Module(launcher, module)
  mod.filename = launcher
  mod.paths = Module._nodeModulePaths(scriptDir)
  mod._compile(source, launcher)
}
