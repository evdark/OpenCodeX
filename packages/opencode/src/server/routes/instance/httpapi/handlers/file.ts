import * as InstanceState from "@/effect/instance-state"
import { EventV2Bridge } from "@/event-v2-bridge"
import { FileSystem } from "@opencode-ai/core/filesystem"
import { Watcher } from "@opencode-ai/core/filesystem/watcher"
import { LocationServiceMap, locationServiceMapLayer } from "@opencode-ai/core/location-services"
import { Ripgrep } from "@opencode-ai/core/ripgrep"
import { FSUtil } from "@opencode-ai/core/fs-util"
import { Location } from "@opencode-ai/core/location"
import { AbsolutePath, RelativePath } from "@opencode-ai/core/schema"
import { Effect, Layer, Option } from "effect"
import ignore from "ignore"
import path from "path"
import { HttpApiBuilder, HttpApiError } from "effect/unstable/httpapi"
import { InstanceHttpApi } from "../api"

function toRelative(directory: string, absolute: string) {
  return path.relative(directory, absolute).split(path.sep).join("/")
}

function resolveWithin(directory: string, input: string) {
  const absolute = path.resolve(directory, input)
  if (!FSUtil.contains(directory, absolute)) return
  return absolute
}

function copyCandidate(source: string, index: number) {
  const ext = path.extname(source)
  const base = path.basename(source, ext)
  const parent = path.dirname(source)
  const name = index === 1 ? `${base} copy${ext}` : `${base} copy ${index}${ext}`
  return path.join(parent, name)
}

export const fileHandlers = HttpApiBuilder.group(InstanceHttpApi, "file", (handlers) =>
  Effect.gen(function* () {
    const ripgrep = yield* Ripgrep.Service
    const locations = yield* LocationServiceMap.Service
    const events = yield* EventV2Bridge.Service

    const filesystem = Effect.fnUntraced(function* <A, E, R>(effect: Effect.Effect<A, E, R>) {
      return yield* effect.pipe(
        Effect.provide(
          locations.get(Location.Ref.make({ directory: AbsolutePath.make((yield* InstanceState.context).directory) })),
        ),
      )
    })

    const publishWatcher = (file: string, event: "add" | "change" | "unlink") =>
      events.publish(Watcher.Event.Updated, { file, event })

    const findText = Effect.fn("FileHttpApi.findText")(function* (ctx: { query: { pattern: string } }) {
      return (yield* ripgrep
        .grep({ cwd: (yield* InstanceState.context).directory, pattern: ctx.query.pattern, limit: 10 })
        .pipe(Effect.orDie)).map((match) => ({
        path: { text: match.entry.path },
        lines: { text: match.text },
        line_number: match.line,
        absolute_offset: match.offset,
        submatches: match.submatches.map((submatch) => ({
          match: { text: submatch.text },
          start: submatch.start,
          end: submatch.end,
        })),
      }))
    })

    const findFile = Effect.fn("FileHttpApi.findFile")(function* (ctx: {
      query: { query: string; dirs?: "true" | "false"; type?: "file" | "directory"; limit?: number }
    }) {
      const directory = (yield* InstanceState.context).directory
      const limit = ctx.query.limit ?? 10
      const type = ctx.query.type ?? (ctx.query.dirs === "false" ? "file" : undefined)
      const started = performance.now()
      const found = yield* filesystem(FileSystem.Service.use((fs) => fs.find({ query: ctx.query.query, limit, type })))
      yield* Effect.logInfo("find file", {
        query: ctx.query.query,
        type,
        directory,
        limit,
        results: found.length,
        duration: Math.round(performance.now() - started),
      })
      return found.map((item) => item.path)
    })

    const findSymbol = Effect.fn("FileHttpApi.findSymbol")(function* () {
      return []
    })

    const list = Effect.fn("FileHttpApi.list")(function* (ctx: { query: { path: string } }) {
      const directory = (yield* InstanceState.context).directory
      return yield* filesystem(
        Effect.gen(function* () {
          const fs = yield* FileSystem.Service
          const raw = yield* FSUtil.Service
          const location = yield* Location.Service
          const ignored = ignore()
          const gitignore = yield* raw
            .readFileString(path.join(location.project.directory, ".gitignore"))
            .pipe(Effect.catch(() => Effect.succeed("")))
          if (gitignore) ignored.add(gitignore)
          const ignorefile = yield* raw
            .readFileString(path.join(location.project.directory, ".ignore"))
            .pipe(Effect.catch(() => Effect.succeed("")))
          if (ignorefile) ignored.add(ignorefile)
          return (yield* fs.list({ path: RelativePath.make(ctx.query.path) })).map((item) => ({
            name: path.basename(item.path),
            path: item.path,
            absolute: path.resolve(location.directory, item.path),
            type: item.type,
            ignored: ignored.ignores(
              path.relative(location.project.directory, path.resolve(location.directory, item.path)) +
                (item.type === "directory" ? "/" : ""),
            ),
          }))
        }),
      )
    })

    const content = Effect.fn("FileHttpApi.content")(function* (ctx: { query: { path: string } }) {
      const directory = (yield* InstanceState.context).directory
      const file = path.resolve(directory, ctx.query.path)
      if (!FSUtil.contains(directory, file)) return yield* Effect.die(new Error("Path escapes the location"))
      if (!(yield* FSUtil.Service.use((fs) => fs.existsSafe(file)))) return { type: "text" as const, content: "" }
      return yield* filesystem(
        FileSystem.Service.use((fs) => fs.read({ path: RelativePath.make(ctx.query.path) })),
      ).pipe(
        Effect.flatMap((item) =>
          Effect.gen(function* () {
            const text = item.content.includes(0)
              ? Option.none<string>()
              : yield* Effect.sync(() => new TextDecoder("utf-8", { fatal: true }).decode(item.content)).pipe(
                  Effect.option,
                )
            return { item, text }
          }),
        ),
        Effect.map(({ item, text }) =>
          Option.isSome(text)
            ? { type: "text" as const, content: text.value.trim() }
            : {
                type: "binary" as const,
                content: Buffer.from(item.content).toString("base64"),
                encoding: "base64" as const,
                mimeType: item.mime,
              },
        ),
      )
    })

    const status = Effect.fn("FileHttpApi.status")(function* () {
      return []
    })

    const asBadRequest = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      effect.pipe(Effect.mapError(() => new HttpApiError.BadRequest({})))

    const rename = Effect.fn("FileHttpApi.rename")(function* (ctx: { payload: { from: string; to: string } }) {
      const directory = (yield* InstanceState.context).directory
      const from = resolveWithin(directory, ctx.payload.from)
      const to = resolveWithin(directory, ctx.payload.to)
      if (!from || !to) return yield* new HttpApiError.BadRequest({})
      if (from === to) return { path: toRelative(directory, to) }

      const fs = yield* FSUtil.Service
      if (!(yield* fs.existsSafe(from))) return yield* new HttpApiError.BadRequest({})
      if (yield* fs.existsSafe(to)) return yield* new HttpApiError.BadRequest({})

      yield* asBadRequest(fs.ensureDir(path.dirname(to)))
      yield* asBadRequest(fs.rename(from, to))
      yield* publishWatcher(from, "unlink")
      yield* publishWatcher(to, "add")
      return { path: toRelative(directory, to) }
    })

    const remove = Effect.fn("FileHttpApi.remove")(function* (ctx: { query: { path: string } }) {
      const directory = (yield* InstanceState.context).directory
      const target = resolveWithin(directory, ctx.query.path)
      if (!target || target === directory) return yield* new HttpApiError.BadRequest({})

      const fs = yield* FSUtil.Service
      if (!(yield* fs.existsSafe(target))) return yield* new HttpApiError.BadRequest({})

      yield* asBadRequest(fs.remove(target, { recursive: true, force: true }))
      yield* publishWatcher(target, "unlink")
      return { path: toRelative(directory, target) }
    })

    const copy = Effect.fn("FileHttpApi.copy")(function* (ctx: { payload: { path: string; to?: string } }) {
      const directory = (yield* InstanceState.context).directory
      const source = resolveWithin(directory, ctx.payload.path)
      if (!source) return yield* new HttpApiError.BadRequest({})

      const fs = yield* FSUtil.Service
      if (!(yield* fs.existsSafe(source))) return yield* new HttpApiError.BadRequest({})

      let target = ctx.payload.to ? resolveWithin(directory, ctx.payload.to) : undefined
      if (ctx.payload.to && !target) return yield* new HttpApiError.BadRequest({})

      if (!target) {
        let index = 1
        while (true) {
          const candidate = copyCandidate(source, index)
          if (!FSUtil.contains(directory, candidate)) return yield* new HttpApiError.BadRequest({})
          if (!(yield* fs.existsSafe(candidate))) {
            target = candidate
            break
          }
          index += 1
          if (index > 1000) return yield* new HttpApiError.BadRequest({})
        }
      }

      if (yield* fs.existsSafe(target)) return yield* new HttpApiError.BadRequest({})
      if (target === source) return yield* new HttpApiError.BadRequest({})

      yield* asBadRequest(fs.ensureDir(path.dirname(target)))
      if (yield* fs.isDir(source)) {
        yield* asBadRequest(fs.copy(source, target))
      } else {
        yield* asBadRequest(fs.copyFile(source, target))
      }
      yield* publishWatcher(target, "add")
      return { path: toRelative(directory, target) }
    })

    const write = Effect.fn("FileHttpApi.write")(function* (ctx: { payload: { path: string; content: string } }) {
      const directory = (yield* InstanceState.context).directory
      const target = resolveWithin(directory, ctx.payload.path)
      if (!target) return yield* new HttpApiError.BadRequest({})

      const fs = yield* FSUtil.Service
      if (yield* fs.existsSafe(target)) {
        if (yield* fs.isDir(target)) return yield* new HttpApiError.BadRequest({})
      }

      yield* asBadRequest(fs.writeWithDirs(target, ctx.payload.content))
      yield* publishWatcher(target, "change")
      return { path: toRelative(directory, target) }
    })

    return handlers
      .handle("findText", findText)
      .handle("findFile", findFile)
      .handle("findSymbol", findSymbol)
      .handle("list", list)
      .handle("content", content)
      .handle("status", status)
      .handle("rename", rename)
      .handle("remove", remove)
      .handle("copy", copy)
      .handle("write", write)
  }),
).pipe(Layer.provide(locationServiceMapLayer))
