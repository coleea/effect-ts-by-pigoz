import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";

/* As an alternative, instead of using eitherFromRandom and dealing with an
 * Either that we later lift into an Effect, we can write that conditional
 * Effect directly.
 *
 * Both are valid alternatives and the choice on which to use comes down to
 * preference.
 *
 * By using Option/Either and lifting to Effect only when necessary you can
 * keep large portions of code side effect free, stricly syncronous, and not
 * require the Effect runtime to run.
 *
 * Using Effect directly you lose some purity but gain in convenience.
 * It may be warranted if you are using the dependency injection features a
 * lot (especially in non library code).
 */

// This is an Effect native implementation of eitherFromRandom defined above
function flakyEffectFromRandom(random: number) {
  return Effect.cond(
    () => random > 0.5,
    () => random,
    () => "fail" as const,
  );
}

export const flakyEffectNative = pipe(
  Effect.random(), // Effect.Effect<never, never, Random>
  Effect.flatMap(random => random.next()), // Effect.Effect<never, never, number>
  Effect.flatMap(flakyEffectFromRandom), // Effect.Effect<never, 'fail', number>  
);

console.log(flakyEffectNative);
