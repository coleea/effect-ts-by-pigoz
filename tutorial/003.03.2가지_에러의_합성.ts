import * as Effect from "@effect/io/Effect";
import * as Data from "@effect/data/Data";
import { pipe } from "@effect/data/Function";

// import * as Cause from "@effect/io/Cause";
// import * as Match from "@effect/match";
// import * as Option from "@effect/data/Option";
// import * as Either from "@effect/data/Either";

// plain Typescript classes
export class BarError {
  readonly _tag = "BarError";
  constructor(readonly error: string) {}
}

export class BazError {
  readonly _tag = "BazError";
  constructor(readonly error: string) {}
}

export interface BatError {
  readonly _tag: "BatError";
  readonly error: unknown;
}

export interface FooError extends Data.Case {
  readonly _tag: "FooError";
  // constructor(readonly error: string) {}
  readonly error: string;
}

// const barError = Data.tagged<BarError>("BarError")
const FooError = Data.tagged<FooError>("FooError");
// const FooError = Data.tagged<FooError>("FooError");

// Data.TaggedClass를 사용하여 클래스로 에러 타입을 표기한 모습
// 가장 심플하게 표현할 수 있다
export class FooErrorClass extends Data.TaggedClass("FooError")<{
  readonly error: string;
}> {}

// 핵심 : Effect 타입은 error 타입이 자동으로 유니온 형태로 합성된다
// 에러 타입을 별도로 지정할 필요가 없다
export const effectObject = pipe(
  Effect.cond(
    () => Math.random() > 0.9,
    () => "success1" as const,
    // () => new FooErrorClass("")
    () => FooError({ error: "error1" }),
  ),
  Effect.tapEither((a) => Effect.logInfo(JSON.stringify(a))),
  Effect.flatMap(a =>
    // Effect.tapEither((a) => Effect.logInfo(JSON.stringify(a))),
    Effect.cond(
      () => Math.random() > 0.9,
      () => [a, "success2"] as const,
      () => new BarError("error2"),
    ),
  ),
  // Effect.catchAll(e => Effect.succeed(`error occured : ${JSON.stringify(e)}`))
);

console.log(
  Effect.runSync(
    effectObject
  )
);

effectObject satisfies Effect.Effect<
  never,
  FooError | BarError,
  readonly ["success1", "success2"]
>;
