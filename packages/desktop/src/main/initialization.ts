import { Deferred, Effect, type Duration } from "effect"

export type SidecarStartupData<Listener = unknown> = {
  readonly listener: Listener
  readonly health: { readonly wait: Promise<unknown> }
}

export function forwardInitializationFailure<A>(initialization: Deferred.Deferred<A, unknown>) {
  return <B, E, R>(effect: Effect.Effect<B, E, R>) =>
    effect.pipe(Effect.tapCause((cause) => Deferred.failCause(initialization, cause)))
}

export function awaitSidecarStartup<A, Listener>(input: {
  readonly startup: Effect.Effect<SidecarStartupData<Listener>, unknown>
  readonly ready: A
  readonly timeout: Duration.Input
  readonly onListener: (listener: Listener) => void
  readonly onHealthTimeout: (error: unknown) => void
}) {
  return Effect.gen(function* () {
    const sidecar = yield* input.startup
    input.onListener(sidecar.listener)
    yield* Effect.tryPromise({
      try: () => sidecar.health.wait,
      catch: (error) => error,
    }).pipe(
      Effect.timeout(input.timeout),
      Effect.catch((error) =>
        Effect.sync(() => {
          input.onHealthTimeout(error)
        }).pipe(Effect.andThen(Effect.fail(error))),
      ),
    )
    return input.ready
  })
}
