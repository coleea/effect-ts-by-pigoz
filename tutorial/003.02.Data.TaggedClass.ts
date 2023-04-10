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
