import * as Effect from "@effect/io/Effect";
import * as Cause from "@effect/io/Cause";
import * as Data from "@effect/data/Data";
import * as Match from "@effect/match";
import * as Option from "@effect/data/Option";
import * as Either from "@effect/data/Either";
import { pipe } from "@effect/data/Function";

// 3장은 에러 타입을 만드는 방법들을 소개한다
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
