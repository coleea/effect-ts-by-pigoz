import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";
import { log } from "console";

/*
 * Some basic control flow
 * =======================
 *
 * The following is an example of a computation that can fail. We will look at
 * more error handling in a later chapter.
 */
function isAbove0_5(random: number): Either.Either<"fail", number> {
  return random > 0.5 
        ? Either.right(random) 
        : Either.left("fail" as const);
}

const createRandom = () => Math.random()
// This will fail sometimes
export const flakyEffect = pipe(
  createRandom,
  Effect.sync, // Effect.Effect<never, never, number>
  Effect.map(isAbove0_5), // Effect.Effect<never, never, Either<'fail', number>>
  Effect.flatMap(Effect.fromEither), // Effect.Effect<never, 'fail', number>
  // Effect.reduceAll
);




// flakyEffect : EffectPrimitive
const res = Effect.runSync(flakyEffect)
console.log(res);

// log( flakyEffect)

// Effect.run

// Same thing but using the number generator provided by Effect
// export const flakyEffectAbsolved = pipe(
//   Effect.random(), // Effect.Effect<never, never, Random>
//   Effect.flatMap(random => random.next()), // Effect.Effect<never, never, number>
//   Effect.map(isAbove0_5), // Effect.Effect<never, never, Either<'fail', number>>
//   Effect.absolve, // Effect.Effect<never, 'fail', number>
// );
/* NOTE:
 * Effect.flatMap(Effect.fromEither) is so common that there's a built in function
 * that's equivalent to it: Effect.absolve.
 */

/* Up to this point we only constructed Effect values, none of the computations
 * that we defined have been executed. Effects are just objects that
 * wrap your computations as they are, for example `pipe(a, flatMap(f))` is
 * represented as `new FlatMap(a, f)`.
 *
 * This allows us to modify computations until we are happy with what they
 * do (using map, flatMap, etc), and then execute them.
 * Think of it as defining a workflow, and then running it only when you are ready.
 */

// Effect.runPromise(flakyEffectAbsolved); // executes flakyEffectAbsolved
