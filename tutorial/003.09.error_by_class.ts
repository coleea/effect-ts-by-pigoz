import * as Effect from "@effect/io/Effect";
import * as Data from "@effect/data/Data";
import { pipe } from "@effect/data/Function";

// import * as Cause from "@effect/io/Cause";
// import * as Match from "@effect/match";
// import * as Option from "@effect/data/Option";
// import * as Either from "@effect/data/Either";
// import * as Equal from "@effect/data/Equal";

export interface FooError extends Data.Case {
  readonly _tag: "FooError";
  readonly error: string;
}
export const FooError = Data.tagged<FooError>("FooError");

// plain Typescript interfaces with corresponding constructor
// NOTE: this is the minimalist option if you want to use interfaces
// export interface BatError {
//   readonly _tag: "BatError";
//   readonly error: unknown;
// }
// export const BatError = (error: unknown): BatError => ({
//   _tag: "BatError",
//   error,
// });

// Data.TaggedClass
// most concise option using classes
export class FooErrorClass extends Data.TaggedClass("FooError")<{
  readonly error: string;
}> {}

// plain Typescript classes
export class BarError {
  readonly _tag = "BarError";
  constructor(readonly error: string) {}
}

export class BazError {
  readonly _tag = "BazError";
  constructor(readonly error: string) {}
}

/*
 * The nice thing about using classes is you can define the type and
 * constructor in one go. But many people dislike them, so it's your choice
 * which option to use.
 *
 * Errors defined through Data have the added benefit of providing an Equal
 * implementation. That allows to compare errors by value instead of reference.
 */

function flaky() {
  return Math.random() > 0.5;
}

export const example = pipe(
  Effect.cond(
    flaky,
    () => "success1" as const,
    () => FooError({ error: "error1" }),
  ),
  Effect.flatMap(a =>
    Effect.cond(
      flaky,
      () => [a, "success2"] as const,
      () => new BarError("error2"),
    ),
  ),
  // Effect.catchAll((e) => Effect.succeed(`error occured ${JSON.stringify(e)}`))
);

example satisfies Effect.Effect<
  never,
  FooError | BarError,
  readonly ["success1", "success2"]
>;

console.log(
  Effect.runSync(
    example
  )
);
