import * as Equal from "@effect/data/Equal";
import * as Effect from "@effect/io/Effect";
import * as Data from "@effect/data/Data";
import { pipe } from "@effect/data/Function";

// import * as Cause from "@effect/io/Cause";
// import * as Match from "@effect/match";
// import * as Option from "@effect/data/Option";
// import * as Either from "@effect/data/Either";

export interface FooError extends Data.Case {
  readonly _tag: "FooError";
  readonly error: string;
}

export const FooError = Data.tagged<FooError>("FooError");

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
 * 클래스를 사용하는 것의 장점 : 타입과 constructor를 한방에 정의할 수 있다
 * 많은 사람들이 이것을 싫어하지만 어떤 방식을 취할지는 당신의 선택이다
 * 데이터를 통해 정의된 에러는 동일한 구현을 제공한다는 추가적인 혜택을 가진다  
 * 이것은 reference대신 값으로 에러를 비교하는 것을 가능하게 해준다
 */


/*
* Data.Case는 제쳐두고, Data 또한 value로 비교를 수행하는 일부 다른 가벼운 데이터 구조를 가진다 : Data.struct, Data.tuple, Data.array
 * 
 * 실패를 핸들링하기
 * =================
 *
 * 우리가 정의한 에러를 사용해 보자
 * Let's move on and use the Errors we defined! :)
 * 2가지 가능한 실패가 있다고 가정해 보자
 */

function flaky() {
  return Math.random() > 0.5;
}

const example2 = pipe(
  Effect.random(),
  // Effect.flatMap(random => random.next()), // Effect.Effect<never, never, number>
  Effect.flatMap(random => random.next()),
  Effect.flatMap((e) => {
    return Effect.cond(
      () => e > 0.5,
      () => Effect.succeed(1), 
      () => FooError({error : "error1"})
    )
  })
)

console.log(
  Effect.runSync(
    example2
  )
);

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
// Effect.catchAll는 에러를 잡아서 로그를 남길 때 사용할 수 있다
// 1줄 요약 : Effect.catchTag는 Effect.catchAll과 비슷하지만, 특정 에러만 잡아서 처리할 수 있다.
/* If we want to recover from one of those failures, we can use catchTag.
 *
 * This will remove FooError from the E in Effect<R, E, A> in `example`,
 * and unify the return type of the callback with `example`.
 */

// 한줄요약 : catchTag는 try catch이다
// 특정 종류의 에러를 잡아서 처리할 수 있다
// 이렇게 되면 특정 종류의 에러를 recover할 수 있는데 그렇게 되면 특정 에러가 사라지고, 그 에러를 처리한 결과가 A에 추가된다
// tag형태로 지정된 에러를 받아서 recover한다
// 이것은 FooError를 제거하고 그것을 succeed로 변환할 것이다
const catchTagSucceed = Effect.catchTag(
  example, "FooError", e =>  Effect.succeed(["recover", e.error] as const),
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
const catchTagFail = Effect.catchTag(example, "FooError", e => Effect.fail(new BazError(e.error)),);

catchTagFail satisfies Effect.Effect<
  never,
  BarError | BazError,
  readonly ["success1", "success2"]
>;