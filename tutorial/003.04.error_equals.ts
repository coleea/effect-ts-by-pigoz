import * as Equal from "@effect/data/Equal";
import * as Data from "@effect/data/Data";

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
