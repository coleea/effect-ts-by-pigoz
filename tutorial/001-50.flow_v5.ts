import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";

// flaky effect는 실행할 때마다 다른 결과를 반환하는 비동기 효과입니다.
function flakyEffectFromRandom(random: number) {
  return Effect.cond(
    () => random > 0.5,
    () => random,
    () => "fail" as const,
  );
}

export interface CustomRandom {  readonly next: () => number;}
export const CustomRandomTag = Context.Tag<CustomRandom>();

export const serviceExample = pipe(
  CustomRandomTag, // Context.Tag<CustomRandom, CustomRandom>
  Effect.map(random => random.next()), // Effect.Effect<CustomRandom, never, number>
  Effect.flatMap(flakyEffectFromRandom), // Effect.Effect<CustomRandom, 'fail', number>
  Effect.provideService(CustomRandomTag, { next: Math.random }),
);

console.log(
  Effect.runSync(serviceExample)
);

// export const provideServiceExample = pipe(
//   serviceExample,
//   Effect.provideService(CustomRandomTag, { next: Math.random }),
// );