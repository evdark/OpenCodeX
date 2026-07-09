/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { BuiltinTuiPlugin } from "../builtins"
import { createMemo, createResource, createSignal } from "solid-js"
import { DialogSelect } from "../../ui/dialog-select"
import { spawn } from "node:child_process"

const id = "internal:plus-git-ui"

type StatusRow = {
  file: string
  additions: number
  deletions: number
  status: string
  label: string
}

async function runGit(cwd: string, args: string[]) {
  return await new Promise<{ ok: boolean; stdout: string; stderr: string }>((resolve) => {
    const child = spawn("git", args, { cwd, stdio: ["ignore", "pipe", "pipe"] })
    const out: Buffer[] = []
    const err: Buffer[] = []
    child.stdout?.on("data", (chunk) => out.push(Buffer.from(chunk)))
    child.stderr?.on("data", (chunk) => err.push(Buffer.from(chunk)))
    child.on("error", (error) => {
      resolve({ ok: false, stdout: "", stderr: error.message })
    })
    child.on("close", (code) => {
      resolve({
        ok: code === 0,
        stdout: Buffer.concat(out).toString(),
        stderr: Buffer.concat(err).toString(),
      })
    })
  })
}

async function loadStatus(api: TuiPluginApi): Promise<{ branch?: string; rows: StatusRow[] }> {
  const directory = api.state.path.directory
  const [vcs, status] = await Promise.all([
    api.client.vcs.get({ directory }).catch(() => undefined),
    api.client.vcs.status({ directory }).catch(() => undefined),
  ])
  const rows = (status?.data ?? []).map((item) => ({
    file: item.file,
    additions: item.additions,
    deletions: item.deletions,
    status: item.status,
    label: `${item.status}  +${item.additions}/-${item.deletions}`,
  }))
  return { branch: vcs?.data?.branch ?? api.state.vcs?.branch, rows }
}

function GitStatusDialog(props: { api: TuiPluginApi }) {
  const [tick, setTick] = createSignal(0)
  const [status] = createResource(
    () => tick(),
    async () => loadStatus(props.api),
  )
  const options = createMemo(() => {
    const data = status()
    if (!data) return []
    if (data.rows.length === 0) {
      return [
        {
          title: "Working tree clean",
          description: data.branch ? `branch ${data.branch}` : "git",
          value: "__clean__",
          disabled: true,
        },
      ]
    }
    return data.rows.map((row) => ({
      title: row.file,
      description: row.label,
      category: row.status,
      value: row.file,
    }))
  })

  const refresh = () => setTick((n) => n + 1)
  const cwd = () => props.api.state.path.directory

  return (
    <DialogSelect
      title={status()?.branch ? `Git · ${status()!.branch}` : "Git status"}
      placeholder="filter files…"
      options={options()}
      actions={[
        {
          title: "stage",
          command: "plus.git.stage",
          onTrigger: async (item) => {
            if (item.value === "__clean__") return
            const result = await runGit(cwd(), ["add", "--", String(item.value)])
            props.api.ui.toast({
              variant: result.ok ? "success" : "error",
              message: result.ok ? `Staged ${item.value}` : result.stderr.trim() || "stage failed",
            })
            refresh()
          },
        },
        {
          title: "unstage",
          command: "plus.git.unstage",
          onTrigger: async (item) => {
            if (item.value === "__clean__") return
            const result = await runGit(cwd(), ["restore", "--staged", "--", String(item.value)])
            props.api.ui.toast({
              variant: result.ok ? "success" : "error",
              message: result.ok ? `Unstaged ${item.value}` : result.stderr.trim() || "unstage failed",
            })
            refresh()
          },
        },
        {
          title: "discard",
          command: "plus.git.discard",
          onTrigger: async (item) => {
            if (item.value === "__clean__") return
            const result = await runGit(cwd(), ["restore", "--", String(item.value)])
            props.api.ui.toast({
              variant: result.ok ? "success" : "error",
              message: result.ok ? `Discarded ${item.value}` : result.stderr.trim() || "discard failed",
            })
            refresh()
          },
        },
        {
          title: "diff",
          command: "plus.git.open_diff",
          onTrigger: () => {
            props.api.ui.dialog.clear()
            props.api.keymap.dispatchCommand("diff.open")
          },
        },
        {
          title: "commit",
          command: "plus.git.commit",
          onTrigger: () => {
            props.api.ui.dialog.clear()
            props.api.keymap.dispatchCommand("plus.git.commit")
          },
        },
        {
          title: "fetch",
          command: "plus.git.fetch",
          onTrigger: async () => {
            const result = await runGit(cwd(), ["fetch", "--all", "--prune"])
            props.api.ui.toast({
              variant: result.ok ? "success" : "error",
              message: result.ok ? "Fetched" : result.stderr.trim() || "fetch failed",
            })
            refresh()
          },
        },
        {
          title: "pull",
          command: "plus.git.pull",
          onTrigger: async () => {
            const result = await runGit(cwd(), ["pull", "--ff-only"])
            props.api.ui.toast({
              variant: result.ok ? "success" : "error",
              message: result.ok ? "Pulled" : result.stderr.trim() || "pull failed",
            })
            refresh()
          },
        },
        {
          title: "push",
          command: "plus.git.push",
          onTrigger: async () => {
            const result = await runGit(cwd(), ["push"])
            props.api.ui.toast({
              variant: result.ok ? "success" : "error",
              message: result.ok ? "Pushed" : result.stderr.trim() || "push failed",
            })
          },
        },
      ]}
      onSelect={(item) => {
        if (item.value === "__clean__") return
        void runGit(cwd(), ["add", "--", String(item.value)]).then((result) => {
          props.api.ui.toast({
            variant: result.ok ? "success" : "error",
            message: result.ok ? `Staged ${item.value}` : result.stderr.trim() || "stage failed",
          })
          refresh()
        })
      }}
    />
  )
}

function showGit(api: TuiPluginApi) {
  api.ui.dialog.replace(() => <GitStatusDialog api={api} />)
  api.ui.dialog.setSize("large")
}

const tui: TuiPlugin = async (api) => {
  api.keymap.registerLayer({
    commands: [
      {
        name: "plus.git.status",
        title: "Git status",
        category: "VCS",
        namespace: "palette",
        suggested: true,
        slashName: "git",
        run() {
          showGit(api)
        },
      },
      {
        name: "plus.git.commit",
        title: "Git commit",
        category: "VCS",
        namespace: "palette",
        run() {
          api.ui.dialog.replace(() => (
            <api.ui.DialogPrompt
              title="Commit message"
              placeholder="feat: …"
              onConfirm={async (message) => {
                const result = await runGit(api.state.path.directory, ["commit", "-m", message])
                api.ui.toast({
                  variant: result.ok ? "success" : "error",
                  message: result.ok ? "Committed" : result.stderr.trim() || result.stdout.trim() || "commit failed",
                })
                if (result.ok) showGit(api)
              }}
            />
          ))
        },
      },
      {
        name: "plus.git.branch",
        title: "Git checkout branch",
        category: "VCS",
        namespace: "palette",
        run() {
          void (async () => {
            const result = await runGit(api.state.path.directory, ["branch", "--list", "--format=%(refname:short)"])
            const branches = result.stdout
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
            api.ui.dialog.replace(() => (
              <DialogSelect
                title="Checkout branch"
                options={branches.map((branch) => ({
                  title: branch,
                  value: branch,
                }))}
                onSelect={async (option) => {
                  const out = await runGit(api.state.path.directory, ["checkout", String(option.value)])
                  api.ui.dialog.clear()
                  api.ui.toast({
                    variant: out.ok ? "success" : "error",
                    message: out.ok ? `Switched to ${option.value}` : out.stderr.trim() || "checkout failed",
                  })
                }}
              />
            ))
          })()
        },
      },
    ],
  })
}

const plugin: BuiltinTuiPlugin = {
  id,
  tui,
}

export default plugin
