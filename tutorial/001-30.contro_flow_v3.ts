import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";

function flakyEffectFromRandom(random: number) {
  // Effect.cond는 if-else를 표현할 수 있는 함수이다.
  return Effect.cond(
    () => random > 0.5,
    () => random,
    () => "fail" as const,
  );
}

export const flakyEffectNative = pipe(
  // Effect.random은 random number를 생성하는 Effect를 반환한다.
  Effect.random(), // Effect.Effect<never, never, Random>
  Effect.flatMap(random => random.next()), // Effect.Effect<never, never, number>
  Effect.flatMap(random => Effect.cond(
    () => random > 0.5,
    () => random,
    () => "Fail" as const,
    )),
  Effect.catchAll((e) => Effect.succeed("it failed")),
  //Effect.flatMap(flakyEffectFromRandom), // Effect.Effect<never, 'fail', number>  
  // Effect.cond를 사용했으므로 Effect.flatMap(Effect.fromEither)을 수행할 필요가 없다
  // Effect.absolve,  
);

console.log(
  Effect.runSync(flakyEffectNative)
);
