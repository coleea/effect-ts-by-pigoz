import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Context from "@effect/data/Context";
import { CustomRandomTag } from "tutorial/000-01.effect-type";

/* Callback hell.
 *
 * If you have written any JavaScript you have seen it. Sadly, even fp-ts code
 * or other code written in a functional style is not immune to it, even inside
 * high quality codebases.
 */


export interface Foo {
  readonly foo: number;
}

export const FooTag = Context.Tag<Foo>();

export interface Bar {
  readonly bar: number;
}

export const BarTag = Context.Tag<Bar>();

/*
 * Effect would be very similar - the main issue is any time you have a new
 * dependency in your code, you end up using flatMap and the indentation grows.
 */
// 1줄 요약 : tag를 Effect.flatMap의 인자로 넣는 작업을 반복할 때 콜백헬이 발생한다
export const hell = pipe(
  CustomRandomTag,
  Effect.flatMap(random =>
    pipe(
      FooTag,
      Effect.flatMap(foo =>
        pipe(
          BarTag,
          Effect.flatMap(bar =>
            Effect.sync(() => {
              console.log("please stop!!!", random.next(), foo.foo, bar.bar);
              return "hell" as const;
            }),
          ),
        ),
      ),
    ),
  ),
);

/*
 * For an example so trivial we can actually still get away with the pipe based
 * API using the "all" function built in into Effect.
 */
export const tuple = pipe(
  Effect.all(CustomRandomTag, FooTag, BarTag),
  Effect.flatMap(([random, foo, bar]) =>
    Effect.sync(() => {
      console.log("not as bad!", random.next(), foo.foo, bar.bar);
      return "tuple" as const;
    }),
  ),
);

// Effect.all preserves the shape of it's argument
export const tuple2 = pipe(
  Effect.all({ random: CustomRandomTag, foo: FooTag, bar: BarTag }),
  Effect.flatMap(({ random, foo, bar }) =>
    Effect.sync(() => {
      console.log("not as bad!", random.next(), foo.foo, bar.bar);
      return "tuple" as const;
    }),
  ),
);
