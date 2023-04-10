import * as Effect from "@effect/io/Effect";
import * as Exit from "@effect/io/Exit";
import * as Fiber from "@effect/io/Fiber";

import * as ReadonlyArray from "@effect/data/ReadonlyArray";
import * as Chunk from "@effect/data/Chunk";
import * as Duration from "@effect/data/Duration";
import { pipe } from "@effect/data/Function";

/*
 * Until now we executed effects in a way that made them look synchronous.
 *
 * That's one special aspect of Effect - you can mix async and sync code in
 * the same program, without labeling functions separately.
 *
 * To execute an effect without blocking the current process, we can use fibers,
 * which are a lightweight concurrency mechanism.
 */

class Identifier {
  constructor(readonly id: number) {}
}

const sleeper = (id: number, seconds = 1000) => {
  const identifier = new Identifier(id);
  return pipe(
    Effect.sleep(Duration.millis(seconds)),
    Effect.tap(() => Effect.logInfo(`waked from ${identifier.id}`)),
    Effect.flatMap(() => Effect.succeed(identifier)),
  );
};

export const example1 = Effect.gen(function* ($) {
  yield* $(Effect.logInfo("before"));

  // These types can be inferred, we're just explicitly annotating it here
  type fiberT = Fiber.RuntimeFiber<never, Identifier>;
  const fiber: fiberT = yield* $(Effect.fork(sleeper(1)));

  yield* $(Effect.logInfo("after"));

  const id: Identifier = yield* $(Fiber.join(fiber));

  yield* $(Effect.logInfo(JSON.stringify(id)));
});

// Effect.runPromise(example1);

/*
 * Running it yields:
 *
 * fiber=#0 message="before"
 * fiber=#0 message="after"
 * fiber=#1 message="waked from 1"
 * fiber=#0 message="{"op":6,"value":1}"
 *
 * As you can notice, the forked code runs in a separate fiber.
 */

const longFailing = (id: Identifier) =>
  pipe(
    Effect.sleep(Duration.seconds(1)),
    Effect.flatMap(() => Effect.fail("blah" as const)),
    Effect.tap(() => Effect.logInfo(`waked from ${id.id}`)),
    Effect.flatMap(() => Effect.succeed(id)),
  );



  console.log(longFailing(new Identifier(1)));
  