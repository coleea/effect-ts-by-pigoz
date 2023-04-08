import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";

/* As an alternative, instead of using eitherFromRandom and dealing with an
 * Either that we later lift into an Effect, we can write that conditional
 * Effect directly.
 *
 * Both are valid alternatives and the choice on which to use comes down to
 * preference.
 *
 * By using Option/Either and lifting to Effect only when necessary you can
 * keep large portions of code side effect free, stricly syncronous, and not
 * require the Effect runtime to run.
 *
 * Using Effect directly you lose some purity but gain in convenience.
 * It may be warranted if you are using the dependency injection features a
 * lot (especially in non library code).
 */

// This is an Effect native implementation of eitherFromRandom defined above
function flakyEffectFromRandom(random: number) {
  return Effect.cond(
    () => random > 0.5,
    () => random,
    () => "fail" as const,
  );
}

export const flakyEffectNative = pipe(
  Effect.random(), // Effect.Effect<never, never, Random>
  Effect.flatMap(random => random.next()), // Effect.Effect<never, never, number>
  Effect.flatMap(flakyEffectFromRandom), // Effect.Effect<never, 'fail', number>
);

/* Context
 * =======
 *
 * Up until now we only dealt with Effects that have no dependencies.
 *
 * The R in Effect<R, E, A> has always been never, meaning that that the
 * Effects we've defined don't depend on anything.
 *
 * Suppose we want to implement our own custom random generator, and use it in
 * our code as a dependency, similar to how we used the one provided by Effect
 * (the Effect.random() above)
 */
export interface CustomRandom {
  readonly next: () => number;
}

export const CustomRandomTag = Context.Tag<CustomRandom>();

/* To provide us with dependency injection features, Effect uses a data
 * structure called Context. It is a table mapping Tags to their
 * implementation (called Service).
 *
 * Think of it as the following type: Map<Tag, Service>.
 *
 * An interesting property of Tag is it is a subtype of Effect, so you can for
 * example map and flatMap over it to get to the service.
 *
 * In our case we can do something like:
 *
 *    Effect.map(CustomRandom, (service) => ...)
 *
 * Doing so will introduce a dependency on CustomRandom in our code.
 * That will be reflected in the Effect<R, E, A> datatype, where the
 * requirements channel (R) will become of type CustomRandom.
 */

export const serviceExample = pipe(
  CustomRandomTag, // Context.Tag<CustomRandom, CustomRandom>
  Effect.map(random => random.next()), // Effect.Effect<CustomRandom, never, number>
  Effect.flatMap(flakyEffectFromRandom), // Effect.Effect<CustomRandom, 'fail', number>
);

/*
 * Notice how R above is now CustomRandom, meaning that our Effect depends on it.
 * However CustomRandom is just an interface and we haven't provided an
 * implementation for it... yet.
 *
 * How to do that?
 *
 * Taking a step back and trying to compile the following:
 *
 * Effect.runPromise(serviceExample);
 *
 * Would lead to the following type error:
 *
 * Argument of type 'Effect<CustomRandom, "fail", number>' is not assignable
 * to parameter of type 'Effect<never, "fail", number>'.
 * Type 'CustomRandom' is not assignable to type 'never'.
 *
 * To run an Effect we need it to have no missing dependencies, in other
 * words R must be never.
 *
 * By providing an implementation, we turn the R in Effect<R, E, A> into a
 * `never`, so we end up with a Effect<never, E, A> which we can run.
 *
 * Effect has a handful of functions that allow us to provide an implementation.
 *
 * For example, we can use provideService, provideContext, provideLayer, to
 * provide and implementation.
 *
 */

// Providing an implementation with provideService
// (handy for Effects that depend on a single service)
export const provideServiceExample = pipe(
  serviceExample,
  Effect.provideService(CustomRandomTag, { next: Math.random }),
);

// Providing an implementation with provideContext
// (handy for Effects that depend on multiple services)
const context = pipe(
  Context.empty(),
  Context.add(CustomRandomTag, { next: Math.random }),
  // Context.add(FooTag)({ foo: 'foo' })
);

export const provideContextExample = pipe(
  serviceExample, // Effect.Effect<CustomRandom, 'fail', number>
  Effect.provideContext(context), // Effect.Effect<never, 'fail', number>
);

// Providing an implementation with layers
// (handy for real world systems with complex dependency trees)
// (will go more in depth about layers in a future guide)
export const CustomRandomServiceLive = () => ({
  next: Math.random,
});

export const liveProgram = pipe(
  serviceExample,
  Effect.provideLayer(
    Layer.succeed(CustomRandomTag, CustomRandomServiceLive()),
  ),
);

/*
 * The powerful part of Effect is you can have multiple implementations for
 * the services you depend on.
 *
 * This can be useful for i.e. mocking:
 *
 * For example, you can use a mocked implementation of CustomRandom in your
 * tests, and a real one in production.
 *
 * You can define these implementations without having to change any of the
 * core logic of your program. Notice how serviceExample doesn't change, but
 * the implementation of CustomRandom can be changed later.
 */
export const CustomRandomServiceTest = () => ({
  next: () => 0.3,
});

export const testProgram = pipe(
  serviceExample,
  Effect.provideService(CustomRandomTag, CustomRandomServiceTest()),
);

