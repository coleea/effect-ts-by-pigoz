import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Context from "@effect/data/Context";
import { CustomRandomTag } from "tutorial/000-01.effect-type";

export interface Foo {readonly foo: number;}
export interface Bar {readonly bar: number;}

// 핵심
// tag란 외부 의존성이다. 다른말로 외부로부터 주입받는 인자이다
export const FooTag = Context.Tag<Foo>();
export const BarTag = Context.Tag<Bar>();

/*
// 문제 요약
// tag란 외부 의존성이다. 다른말로 외부로부터 주입받는 인자이다
// 외부에서 주입된 변수를 사용하기 위해서는 Effect.flatMap을 사용해야 한다
// Effect.flatMap을 중첩으로 적용하다 보면 콜백 헬이 생긴다
 */
// 2줄 요약 : 
// 외부 의존성 주입과 그로 인해 호출되는 Effect.flatMap
// Effect.flatMap을 중첩으로 사용하다 보면 콜백 헬이 생긴다
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