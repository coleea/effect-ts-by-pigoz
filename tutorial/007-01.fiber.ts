import * as Effect from "@effect/io/Effect";
import * as Exit from "@effect/io/Exit";
import * as Fiber from "@effect/io/Fiber";

import * as ReadonlyArray from "@effect/data/ReadonlyArray";
import * as Chunk from "@effect/data/Chunk";
import * as Duration from "@effect/data/Duration";
import { pipe } from "@effect/data/Function";

/*
* 지금까지는 이펙트를 동기적으로 보이게 하는 방식으로 실행했습니다.
 * 비동기 코드와 동기 코드를 별도의 함수 레이블을 지정하지 않고도 동일한 프로그램에서 혼합할 수 있다는 점이 이펙트의 특별한 점입니다.
 * 현재 프로세스를 블로킹하지 않고 이펙트를 실행하려면 가벼운 동시성 메커니즘인 파이버를 사용할 수 있습니다.
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