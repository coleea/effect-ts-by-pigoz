import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Context from "@effect/data/Context";
// import { CustomRandomTag } from "tutorial/000-01.effect-type";

export interface Foo {readonly foo: number;}
export const FooTag = Context.Tag<Foo>();
export interface Bar {readonly bar: number;}
export const BarTag = Context.Tag<Bar>();

export const generator = Effect.gen(function* ($) {
  const random = yield* $(Effect.random());
  const foo = yield* $(FooTag);
  const bar = yield* $(BarTag);
  console.log("this is pretty cool!", random.next(), foo.foo, bar.bar);
  return "generator" as const;
});

export const doNotation = pipe(
  Effect.Do(),
  Effect.bind("random", () => Effect.random()),
  Effect.bind("foo", () => FooTag),
  Effect.bind("bar", () => BarTag),
  Effect.flatMap(({ random, foo, bar }) =>
    Effect.sync(() =>
      console.log("this is pretty cool!", random.next(), foo.foo, bar.bar),
    ),
  ),
);

/*
 * TLDR: With generators you can write Effect code that looks imperative!
 * It's equivalent to what ZIO does in Scala with for comprehensions.
 *
 * Admittedly, `gen(function* ($) {` and `yield* $(` add quite a bit of noise,
 * but considering the limitations of JavaScript and TypeScript, it's quite
 * amazing that this is possible at all.
 *
 * Code snippets are advised to write out the `gen(function *($)` and `yield* $()`
 * boilerplate. For reference, I setup mine like this:
{
  "Gen Function $": {
    "prefix": "gen$",
    "body": ["function* ($) {\n\t$0\n}"],
    "description": "Generator function with $ input"
  },
  "Gen Function $ (wrapped)": {
    "prefix": "egen$",
    "body": ["Effect.gen(function* ($) {\n\t$0\n})"],
    "description": "Generator function with $ input"
  },
  "Gen Yield $": {
    "prefix": "yield$",
    "body": ["yield* $($0)"],
    "description": "Yield generator calling $()"
  },
  "Gen Yield $ (const)": {
    "prefix": "cyield$",
    "body": ["const $1 = yield* $($0)"],
    "description": "Yield generator calling $()"
  }
}
*/
