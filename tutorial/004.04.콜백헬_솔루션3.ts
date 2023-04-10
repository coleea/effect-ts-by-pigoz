import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Context from "@effect/data/Context";
import { CustomRandomTag } from "tutorial/000-01.effect-type";

export interface Foo {
  readonly foo: number;
}

export const FooTag = Context.Tag<Foo>();

export interface Bar {
  readonly bar: number;
}

export const BarTag = Context.Tag<Bar>();

// 가장 큰 문제는 코드에 새로운 * 종속성이 있을 때마다 flatMap을 사용하게 되고 들여쓰기가 커진다는 것입니다.
// 즉 tag는 의존성이다
// tag를 Effect.flatMap의 인자로 넣는 작업을 반복할 때 콜백헬이 발생한다
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

/*
 * But you would still end up with messy code in real application code, not to
 * mention testing code!
 *
 * To address this issue, Effect has an API that uses generators to avoid
 * callback hell.
 */
export const generator = Effect.gen(function* ($) {
  /* NOTE: Unfortunately Effects must be wrapped in this $ function because of
   * shortcomings in the TypeScript language. Someday the TypeScript team might
   * improve how typings in generators work and Effect could drop this $ as a
   * result.
   */
  const random = yield* $(CustomRandomTag);
  const foo = yield* $(FooTag);
  const bar = yield* $(BarTag);

  console.log("this is pretty cool!", random.next(), foo.foo, bar.bar);
  return "generator" as const;
});

/* A legit question would be: How do you error out of a generator function?
 * Just yield a failing Effect
 */
export const generatorerr = Effect.gen(function* ($) {
  const foo = yield* $(FooTag);
  const bar = yield* $(BarTag);

  /* NOTE: The cool part is at least $ can also be used as a pipe so we can
   * shorten $(pipe(var, Effect.map(...))) into $(var, Effect.map(...))
   */
  const random = yield* $(
    CustomRandomTag,
    Effect.map(random => random.next()),
  );

  if (random > 0.5) {
    // Whenever this code block is reached, it will exact this generator
    yield* $(Effect.fail("bad random" as const));
  }

  console.log("this is pretty cool!", random, foo.foo, bar.bar);
  return "generator" as const;
});

/*
 * Another option for avoiding callback hell is "Do notation".
 * This lets you bind effects/values to names when using pipe without
 * introducing more nesting.
 *
 * NOTE: when working with Effect streams, generators don't work. In those
 * instances the Do notation the only option.
 */
export const doNotation = pipe(
  Effect.Do(),
  Effect.bind("random", () => CustomRandomTag),
  Effect.bind("foo", () => FooTag),
  Effect.bind("bar", () => BarTag),
  Effect.flatMap(({ random, foo, bar }) =>
    Effect.sync(() =>
      console.log("this is pretty cool!", random.next(), foo.foo, bar.bar),
    ),
  ),
);

/*
  요약: 제너레이터를 사용하면 명령형으로 보이는 effect 코드를 작성할 수 있습니다
  이는 스칼라에서 ZIO가 comprehension를 위해 하는 것과 동일합니다.
 
  물론 `gen(function ($) {`와 `yield $(`는 꽤 많은 노이즈를 추가하지만, 자바스크립트와 타입스크립트의 한계를 고려하면 이것이 가능하다는 사실이 매우 놀랍습니다.
  코드 스니펫은 `gen(function ($)` 및 `yield $()` 상용구를 작성하는 것이 좋습니다. 참고로 저는 이렇게 설정했습니다:
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