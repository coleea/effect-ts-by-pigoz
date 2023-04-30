import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Context from "@effect/data/Context";

export interface Foo {readonly foo: number;}
export interface Bar {readonly bar: number;}
export const FooTag = Context.Tag<Foo>();
export const BarTag = Context.Tag<Bar>();

/*
// 문제 요약
// tag란 : 외부 의존성
// tag란 : 함수 인자
// 외부에서 주입된 변수를 사용하기 위해서는 Effect.flatMap을 사용
// Effect.flatMap을 중첩으로 적용하다 보면 콜백헬 패턴이 생성
// 요약
// Effect.flatMap을 중첩으로 사용하다 보면 콜백헬 패턴이 생성
 */
export const hell = pipe(
  Effect.random(),
  // Effect.map(e => e.next()),
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

// Effect.runSync(
//   hell
// )