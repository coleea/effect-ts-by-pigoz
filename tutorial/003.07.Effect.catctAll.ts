import * as Effect from "@effect/io/Effect";
import * as Cause from "@effect/io/Cause";
import * as Data from "@effect/data/Data";
import * as Match from "@effect/match";
import * as Option from "@effect/data/Option";
import * as Either from "@effect/data/Either";
import { pipe } from "@effect/data/Function";

export interface FooError extends Data.Case {
  readonly _tag: "FooError";
  readonly error: string;
}

export const FooError = Data.tagged<FooError>("FooError");

// plain Typescript interfaces with corresponding constructor
// NOTE: this is the minimalist option if you want to use interfaces
export interface BatError {
  readonly _tag: "BatError";
  readonly error: unknown;
}

export const BatError = (error: unknown): BatError => ({
  _tag: "BatError",
  error,
});

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

import * as Equal from "@effect/data/Equal";

// This is true because the argument to FooError is compared by value
export const isEqual = Equal.equals(
  FooError({ error: "foo1" }),
  FooError({ error: "foo1" }),
);

export const isEqualClass = Equal.equals(
  new FooErrorClass({ error: "foo1" }),
  new FooErrorClass({ error: "foo1" }),
);

// This is not true, foo1 and foo2 are different!
export const isNotEqual = Equal.equals(
  FooError({ error: "foo1" }),
  FooError({ error: "foo2" }),
);

/*
 * NOTE: Aside from Data.Case, Data also has a few other handy data structures
 * to perform comparison by value: Data.struct, Data.tuple, Data.array.
 */

/*
 * Handling failures
 * =================
 *
 * Let's move on and use the Errors we defined! :)
 *
 * Suppose we have some similar code with two possible failures
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
);

example satisfies Effect.Effect<
  never,
  FooError | BarError,
  readonly ["success1", "success2"]
>;

/* If we want to recover from one of those failures, we can use catchTag.
 *
 * This will remove FooError from the E in Effect<R, E, A> in `example`,
 * and unify the return type of the callback with `example`.
 */
const catchTagSucceed = Effect.catchTag(example, "FooError", e =>
  Effect.succeed(["recover", e.error] as const),
);

// Notice how FooError disappeared from the E type, and A now has a union of
// the two possible return types
catchTagSucceed satisfies Effect.Effect<
  never,
  BarError,
  readonly ["success1", "success2"] | readonly ["recover", string]
>;

// Here, we caught FooError but returned another error called BazError!
// Now the E type has both BarError and BazError, and A didn't change
const catchTagFail = Effect.catchTag(example, "FooError", e =>
  Effect.fail(new BazError(e.error)),
);

catchTagFail satisfies Effect.Effect<
  never,
  BarError | BazError,
  readonly ["success1", "success2"]
>;

/* catchTags allows to catch multiple errors from the failure channel */
// we handled both errors and returned a string literal, which is now part of
// the A type
const catchTags = Effect.catchTags(example, {
  FooError: _e => Effect.succeed("foo" as const),
  BarError: _e => Effect.succeed("bar" as const),
});

catchTags satisfies Effect.Effect<
  never,
  never,
  readonly ["success1", "success2"] | "foo" | "bar"
>;

/* If you are integrating Effect in a legacy codebase and you defined
 * errors as tagged unions with a key different from _tag, you can use
 * Effect.catch. The following is equivalent to Effect.catchTag */
const catchCustomTag = Effect.catch(example, "_tag", "FooError", e =>
  Effect.fail(new BazError(e.error)),
);

catchCustomTag satisfies typeof catchTagFail;

/* catchAll recovers at once from all the errors in the failure channel.
 * You can use it to perform custom matching on errors in case you are not
 * using tagged unions.
 *
 * Observe how the A type perfectly maintains the possible return types
 *
 * NOTE: In the Effect internals, catchTag is built on top of catchAll!
 */
const catchAll = Effect.catchAll(example, e =>
  Effect.succeed(["recover", e._tag] as const),
);

catchAll satisfies Effect.Effect<
  never,
  never,
  | readonly ["success1", "success2"]
  | readonly ["recover", "FooError" | "BarError"]
>;

