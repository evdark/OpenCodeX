import { describe, expect, test } from "bun:test"
import { Cause, Deferred, Effect, Exit, Fiber } from "effect"
import { awaitSidecarStartup, forwardInitializationFailure } from "./initialization"

describe("desktop initialization", () => {
  const failure = new Error("sidecar startup failed")
  const expectFailure = (exit: Exit.Exit<unknown, unknown>) => {
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isSuccess(exit)) return
    expect(Cause.squash(exit.cause)).toBe(failure)
  }

  test("forwards loading task failures before renderer initialization", () => {
    const exit = Effect.runSync(
      Effect.gen(function* () {
        const initialization = yield* Deferred.make<never, unknown>()
        yield* forwardInitializationFailure(initialization)(Effect.die(failure)).pipe(Effect.exit)
        return yield* Deferred.await(initialization).pipe(Effect.exit)
      }),
    )

    expectFailure(exit)
  })

  test("forwards loading task failures while renderer initialization waits", () => {
    const exit = Effect.runSync(
      Effect.gen(function* () {
        const initialization = yield* Deferred.make<never, unknown>()
        const waiting = yield* Deferred.await(initialization).pipe(Effect.exit, Effect.forkChild)
        yield* forwardInitializationFailure(initialization)(Effect.die(failure)).pipe(Effect.exit)
        return yield* Fiber.join(waiting)
      }),
    )

    expectFailure(exit)
  })

  test("publishes initialization only after sidecar health resolves", async () => {
    const ready = { url: "http://127.0.0.1:1234", username: "opencode", password: "secret" }
    const result = await Effect.runPromise(
      awaitSidecarStartup({
        startup: Effect.succeed({ listener: "listener", health: { wait: Promise.resolve() } }),
        ready,
        timeout: "1 second",
        onListener: () => undefined,
        onHealthTimeout: () => undefined,
      }),
    )

    expect(result).toBe(ready)
  })

  test("fails initialization when sidecar health fails", async () => {
    const failure = new Error("sidecar did not become healthy")
    const errors: unknown[] = []

    const exit = await Effect.runPromise(
      awaitSidecarStartup({
        startup: Effect.succeed({ listener: "listener", health: { wait: Promise.reject(failure) } }),
        ready: { url: "http://127.0.0.1:1234", username: "opencode", password: "secret" },
        timeout: "1 second",
        onListener: () => undefined,
        onHealthTimeout: (error) => errors.push(error),
      }).pipe(Effect.exit),
    )

    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isSuccess(exit)) return
    expect(Cause.squash(exit.cause)).toBe(failure)
    expect(errors).toEqual([failure])
  })
})
