import * as Effect from "@effect/io/Effect";
import * as Cause from "@effect/io/Cause";
import * as Data from "@effect/data/Data";
import * as Match from "@effect/match";
import * as Option from "@effect/data/Option";
import * as Either from "@effect/data/Either";
import { pipe } from "@effect/data/Function";

// =======================================================

export interface FooError extends Data.Case {
  readonly _tag: "FooError";
  readonly error: string;
}

// 데이터 타입 : Data.Case.Constructor<FooError, "_tag">
export const FooError = Data.tagged<FooError>("FooError");

export interface BatError {
  readonly _tag: "BatError";
  readonly error: unknown;
}

// =======================================================

//  (error: unknown) => BatError
export const BatError = (error: unknown): BatError => ({
  _tag: "BatError",
  error,
});

// Data.TaggedClass를 사용하여 클래스로 에러 타입을 표기한 모습
// 가장 심플하게 표현할 수 있다
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

// 무슨 이야기를 하고 싶은건지 이해가 되지 않음
// 핵심 : error 타입이 자동으로 or 형태로 합성된다
// 타입을 별도로 지정할 필요가 없다
export const effectObject = pipe(
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

effectObject satisfies Effect.Effect<
  never,
  FooError | BarError,
  readonly ["success1", "success2"]
>;
