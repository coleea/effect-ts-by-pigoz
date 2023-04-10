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

// Effect.catchAll이란 Effect.catchTag와 비슷하지만, 모든 에러를 잡아서 처리할 수 있다.
// Effect.catchAll을 언제 사용하냐면 예를 들어서, 에러를 잡아서 로그를 남기거나, 에러를 잡아서 다른 에러로 바꾸거나, 에러를 잡아서 다른 에러로 바꾸고 다시 던지거나, 에러를 잡아서 다른 에러로 바꾸고 다시 던지고 다시 잡아서 처리하거나, 에러를 잡아서 다른 에러로 바꾸고 다시 던지고 다�
// when to use Effect.catchAll? the answer is that you can use it to log the error, or to convert the error to another error, or to convert the error to another error and throw it again, or to convert the error to another error and throw it again and catch it again, or to convert the error to another error and throw it again and catch it again and do something else with it, or to convert the error to another error and throw it ag
// 1줄 요약 : Effect.catchTag는 Effect.catchAll과 비슷하지만, 특정 에러만 잡아서 처리할 수 있다.
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

/* catchSome recovers from some (or all) errors in the failure channel.
 *
 * Unlike catchAll, or catchTag, catchSome doesn't narrow the error type, but
 * it can widen it to a broader class of errors.
 *
 * In real world code, you probably always want to use use catchTag instead
 * since it can both narrow and widen the error type.
 */
const catchSome = Effect.catchSome(example, e =>
  pipe(
    Match.value(e),
    Match.tag("FooError", e =>
      Effect.cond(
        () => e.error === "foo",
        () => "foo" as const,
        () => e,
      ),
    ),
    Match.option,
  ),
);

// Note: Match (@effect/match) is a pattern matching library from the Effect
// ecosystem

catchSome satisfies Effect.Effect<
  never,
  FooError | BarError,
  readonly ["success1", "success2"] | "foo"
>;

/* orElse* functions are similar to catchAll but on top of failures they
 * also catch interruptions.
 *
 * Notice how E is now the never type, and A is a union of the two possible
 * return types
 */
const fallback = Effect.orElse(example, () => Effect.succeed("foo" as const));

fallback satisfies Effect.Effect<
  never,
  never,
  readonly ["success1", "success2"] | "foo"
>;

/*
 * orElseEither uses an Either to store the original success value, or the
 * fallback success value
 */
const fallbackEither = Effect.orElseEither(example, () =>
  Effect.succeed("foo" as const),
);

fallbackEither satisfies Effect.Effect<
  never,
  never,
  Either.Either<readonly ["success1", "success2"], "foo">
>;

/* The last option is folding, known as matching in Effect */
const match = Effect.match(
  example,
  error => error._tag,
  success => success[0],
);

match satisfies Effect.Effect<
  never,
  never,
  "FooError" | "BarError" | "success1"
>;

/* Handling Defects
 * ================
 *
 * As mentioned in the original summary, defects are unexpected errors that
 * don't appear in the failure channel (E of Effect<R,E,A>).
 *
 * Even though they don't appear in E, the Effect runtime still keeps track
 * of them in a data structure called Cause.
 *
 * Here are the constructors for all Cause types:
 */

Cause.empty; // Cause of an Effect that succeeds
Cause.fail; // Cause of an Effect that errors with fail (failure)
Cause.die; // Cause of an Effect that errors with die (defect)
Cause.interrupt; // Cause of an Effect that errors with interrupt
Cause.annotated; // represents a cause with metadata (for example the stack trace)
Cause.sequential; // represents two errors that have occurred in sequence
Cause.parallel; // represents two errors that have occurred in parallel

// And with Cause.match you can match a cause by it's type:
Cause.match(
  Cause.empty,
  "empty",
  error => `fail ${error}`,
  defect => `die ${defect}`,
  fiberid => `interrupt ${fiberid}`,
  (value, annotation) => `annotated ${value} ${annotation}`,
  (left, right) => `sequential ${left} ${right}`,
  (left, right) => `parallel ${left} ${right}`,
);

// Effect.cause returns an Effect that succeeds with the argument's Cause, or
// the empty Cause if the argument succeeds.
const emptyCause = Effect.cause(Effect.succeed(1));
emptyCause satisfies Effect.Effect<never, never, Cause.Cause<never>>;

const failCause = Effect.cause(Effect.fail(1));
failCause satisfies Effect.Effect<never, never, Cause.Cause<number>>;

/*
 * Since defects are unexpected errors, most of the time you just may want to
 * log them with catchAllCause and logErrorCause:
 */

const dieExample = pipe(
  example,
  Effect.flatMap(() => Effect.die("💥")),
);

/*
 * Effect.catchAllCause is similar to Effect.catchAll but exposes the full
 * Cause<E> in the callback, instead of just E
 */
const catchAllCauseLog = Effect.catchAllCause(dieExample, cause =>
  Effect.logErrorCauseMessage("something went wrong", cause),
);

catchAllCauseLog satisfies Effect.Effect<never, never, void>;

/*
 * Effect.runPromise(catchAllCauseLog) will print a stack trace. i.e:
 *
 * timestamp=2023-02-14T17:19:17.373Z level=ERROR fiber=#0 message="something went wrong" cause="
 * Error: 💥
 *     at 002-errors.ts:233:21
 *     at 002-errors.ts:233:5
 *     at 002-errors.ts:236:28
 */

/* Defect to Failure
 *
 * Effect.absorb and Effect.resurrect allow to recover from defects and
 * transform them into failure discarding all the information about the Cause
 *
 * They have the same type signature, but while absorb only recovers from
 * Defects, resurrect also recovers from Interrupts.
 */

const interruptExample = pipe(
  example,
  Effect.flatMap(() => Effect.interrupt()),
);

const absorb = pipe(dieExample, Effect.absorb, Effect.ignore);
const resurrect = pipe(interruptExample, Effect.resurrect, Effect.ignore);

const successful = pipe(
  absorb,
  Effect.flatMap(() => resurrect),
  Effect.flatMap(() => Effect.succeed("recovered" as const)),
  Effect.zipLeft(Effect.logInfo("exited successfully")),
);

/*
 * Note: Effect.zipLeft(a, b) combines (zips) a and b in a single Effect that
 * runs a and b sequentially, and returns the return value of a.
 *
 * Here it's used to run logInfo but discard it's result.
 */

successful satisfies Effect.Effect<never, never, "recovered">;

/* Failure to Defect
 *
 * Effect.refine* functions allow to convert all failures except some into
 * defects.
 */

const refineTagOrDie = Effect.refineTagOrDie(example, "FooError");

refineTagOrDie satisfies Effect.Effect<
  never,
  FooError,
  readonly ["success1", "success2"]
>;

/* Sandbox
 *
 * catchSomeCause and catchAllCause are actually shorthands for using
 * sandbox -> catchSome/catchAll -> unsandbox
 *
 * sandbox exposes the full Cause in the failure channel (E), while unsandbox
 * submerges it.
 */
export const sandboxed = pipe(
  dieExample,
  Effect.sandbox,
  // Hover over _errorCause to see its type
  Effect.catchSome(_errorCause => Option.some(Effect.succeed(1))),
  Effect.unsandbox,
);
