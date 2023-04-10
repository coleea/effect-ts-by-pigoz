import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";
import { log } from "console";

function isAbove0_5(random: number): Either.Either<"fail", number> {
  return random > 0.5 
        ? Either.right(random) 
        : Either.left("fail" as const);
}

// Same thing but using the number generator provided by Effect
export const flakyEffectAbsolved = pipe(
  Effect.random(), // Effect.Effect<never, never, Random>
  Effect.flatMap(random => random.next()), // Effect.Effect<never, never, number>
  Effect.map(isAbove0_5), // Effect.Effect<never, never, Either<'fail', number>>
  Effect.absolve, // Effect.Effect<never, 'fail', number>
  // Effect.absolve는 Effect.flatMap(Effect.fromEither)와 완전히 동일하다
);

Effect.runPromise(flakyEffectAbsolved)
      .then(console.log) 