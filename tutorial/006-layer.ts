import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Scope from "@effect/io/Scope";
import * as Exit from "@effect/io/Exit";
import * as Runtime from "@effect/io/Runtime";
import * as Context from "@effect/data/Context";
import * as fs from "node:fs";
import { promisify } from "node:util";

/* 
001-basic.ts에서 우리는 의존성 주입을 처리하기 위해 Layer를 사용하는 매우 간단한 예제를 보았습니다. 
여기서는 실제 프로덕션 애플리케이션에서 사용할 수 있는 범위와 런타임을 사용하는 현실적인 Layer 예제를 빌드합니다.
먼저 몇 가지 서비스 정의를 가져옵니다:
 */
import { Foo, Bar, FileDescriptor } from "tutorial/utils/contexts";

/*
 * Now we define some Effects using those services.
 * Everything should look familiar to the previous chapters.
 */
// 제네레이터를 사용하는 이유 : 의존성을 주입하기 위해서
const program1 = Effect.gen(function* ($) {
  const foo = yield* $(Foo);
              yield* $(Effect.logInfo(`program1 ${JSON.stringify(foo)}`));
});

// 아래 예제에서 FileDescriptor는 의존성
// bar도 의존성
const program2 = Effect.gen(function* ($) {
  const baz = yield* $(FileDescriptor);
  const bar = yield* $(Bar);
  yield* $(
    Effect.logInfo(`program2 ${JSON.stringify(bar)} ${JSON.stringify(baz)}`),
  );
});

// These are simple Layers with no lifetime
const FooLive = Layer.succeed(Foo, { foo: 4 });

// You can even build a layer from an effect
const BarLive = Layer.effect(
  Bar,
  pipe(
    Effect.random(),
    Effect.flatMap(random => random.next()),
    Effect.map(bar => ({ bar })),
  ),
);

// This is the exact same "scoped effect" we defined in 004-scope to manage a
// FileDescriptor lifetime!
export const resource: Effect.Effect<Scope.Scope, never, FileDescriptor> =
  Effect.acquireRelease(
    pipe(
      Effect.promise(() => promisify(fs.open)("/dev/null", "w")),
      Effect.map(fd => ({ fd })),
      Effect.tap(() => Effect.logInfo("FileDescriptor acquired")),
    ),
    ({ fd }) =>
      pipe(
        Effect.promise(() => promisify(fs.close)(fd)),
        Effect.tap(() => Effect.logInfo("FileDescriptor released")),
      ),
  );

/*
지금부터 재미있는 파트가 시작된다
Effect.scope로 Scoped Effect를 생성해 보았지만, Layer.scope는 scoped effect로부터 레이어를 생성한다
그리고 scoped effect에 스코프를 제공한다. 즉 scope effect에 레이어를 제공한다
모든 레이어는 암묵적인 스코프를 가지고 있다. 이것은 requirements에 나타나지 않는다
그리고 스코프는 build with props에 전달된다

 * Now comes the interesting part.
 *
 * Similar to how we used Effect.scoped to provide a Scope to our scoped
 * effect, Layer.scoped builds a Layer from a scoped effect and provides a
 * Scope to it.
 *
 * Every Layer has an implicit Scope which doesn't appear in it's requirements (R),
 * and is the Scope passed to buildWithScope.
 *
 * 핵심 차이점
 * The main difference 
 * is that Effect.scoped provides a scope that's newly
 * created with Scope.make. 
 * 
 * vs
 * 
 * Layer.scope forks the implicit Scope and provides the child to the scoped Effect.
 *
 * This results in the scoped Effect's release being executed when the implicit
 * Scope is closed (if you recall the previous chapter, acquireRelease adds
 * the release effect to the Scope with addFinalizer).
 */
export const FileDescriptorLive: Layer.Layer<never, never, FileDescriptor> =
  Layer.scoped(FileDescriptor, resource);

/* This next part is the final glue code needed and is platform specific.
 * We assume a Node environment.
 *
 * Firstly, we define a function that given a Layer creates a Runtime and a
 * cleanup Effect (close) that should be run after the Runtime is not useful
 * anymore.
 */
const makeAppRuntime = <R, E, A>(layer: Layer.Layer<R, E, A>) =>
  Effect.gen(function* ($) {
    const scope = yield* $(Scope.make());
    const ctx: Context.Context<A> = yield* $(
      Layer.buildWithScope(scope)(layer),
    );
    const runtime = yield* $(
      pipe(Effect.runtime<A>(), Effect.provideContext(ctx)),
    );

    return {
      runtime,
      close: Scope.close(scope, Exit.unit()),
    };
  });

/*
 * We create a layer for our application, concatenating all the "live" layer
 * implementations we defined.
 */
type AppLayer = Foo | Bar | FileDescriptor;

const appLayerLive: Layer.Layer<never, never, AppLayer> = pipe(
  FooLive,
  Layer.provideMerge(BarLive),
  Layer.provideMerge(FileDescriptorLive),
);

/*
 * We create a runtime and the close effect
 */
const promise = Effect.runPromise(makeAppRuntime(appLayerLive));

promise.then(({ runtime, close }) => {
  /*
   * Since we are in a Node environment, we register the close effect to be run
   * on node's exit. This will run the release Effect for all the resources in
   * our AppLayer.
   */
  process.on("beforeExit", () => Effect.runPromise(close));

  /*
   * Finally, we can run the effects reusing resources. In a webapp these could
   * be requests.
   */
  Runtime.runPromise(runtime)(program1);
  Runtime.runPromise(runtime)(program2);
  Runtime.runPromise(runtime)(program2);
});

/* prints out:
 *
 * FileDescriptor acquire { fd: 22 }
 * program1 { foo: 4 }
 * program2 { bar: 2 } { fd: 22 }
 * program2 { bar: 2 } { fd: 22 }
 * FileDescriptor release
 */
