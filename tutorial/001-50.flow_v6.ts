import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";

function flakyEffectFromRandom(random: number) {
  return Effect.cond(
    () => random > 0.5,
    () => random,
    () => "fail" as const,
  );
}

export interface CustomRandom {
  readonly next: () => number;
}

export const CustomRandomTag = Context.Tag<CustomRandom>();

export const serviceExample = pipe(
  CustomRandomTag, // Context.Tag<CustomRandom, CustomRandom>
  Effect.map(random => random.next()), // Effect.Effect<CustomRandom, never, number>
  Effect.flatMap(flakyEffectFromRandom), // Effect.Effect<CustomRandom, 'fail', number>
);

export const provideServiceExample = pipe(
  serviceExample,
  Effect.provideService(CustomRandomTag, { next: Math.random }),
);

const context = pipe(
  Context.empty(),
  Context.add(CustomRandomTag, { next: Math.random }),
  // Context.add(FooTag)({ foo: 'foo' })
);

export const provideContextExample = pipe(
  serviceExample, // Effect.Effect<CustomRandom, 'fail', number>
  Effect.provideContext(context), // Effect.Effect<never, 'fail', number>
);

export const CustomRandomServiceLive = () => ({
  next: Math.random,
});

export const liveProgram = pipe(
  serviceExample,
  Effect.provideLayer(
    Layer.succeed(CustomRandomTag, CustomRandomServiceLive()),
  ),
);

export const CustomRandomServiceTest = () => ({
  next: () => 0.3,
});

export const testProgram = pipe(
  serviceExample,
  Effect.provideService(CustomRandomTag, CustomRandomServiceTest()),
);