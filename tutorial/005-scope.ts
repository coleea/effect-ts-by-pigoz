import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Scope from "@effect/io/Scope";
import * as Exit from "@effect/io/Exit";
import { FileDescriptor } from "tutorial/utils/contexts";
import * as fs from "node:fs";
import { promisify } from "node:util";

/*
 이 장에서는 스코프에 대해 살펴봅니다.
 다음 장에서 레이어를 이해하는 것이 스코프를 이해하는 데 도움을 주지만 레이어 없이도 스코프를 단독으로 사용할 수 있으므로 여기서는 먼저 소개합니다.
 스코프란 무엇인가요? 리소스의 수명을 모델링하기 위한 데이터 유형입니다.
 실제로는 파이널라이저의 모음입니다. 세 가지 주요 메서드가 있습니다:

 - addFinalizer: Scope에 새 파이널라이저를 추가합니다.
    파이널라이저는 스코프가 닫힐 때 실행되는 이펙트로, OOP의 디스트럭터와 비슷합니다.
 
  - close: 추가된 모든 파이널라이저를 실행하는 스코프를 닫습니다.
  - 포크: 주어진 스코프에서 자식 스코프를 생성합니다. 부모 스코프가 닫히면 자식 스코프도 닫힙니다.
 
 위에서 리소스에 대해 언급했습니다. 리소스란 무엇인가요?
 리소스는 "스코프 효과"라고도 합니다. 실행하려면 스코프가 필요한 이펙트입니다.

 타입은 다음과 같습니다:
  Effect.Effect<Scope.Scope, 데이터베이스 연결 오류, 데이터베이스 연결>
 
 "스코프가 지정된 효과"를 만드는 가장 일반적인 방법은 `acquireRelease` 함수입니다.
 반환 유형에서 알 수 있듯이 acquireRelease는 실행하기 위해 Scope가 필요한 효과(따라서 "스코프 지정 효과")를 반환합니다.
 스코프는 리소스의 수명을 관리하는 데 사용됩니다.
내부적으로 `acquireRelease`에서 반환된 "스코프 지정 효과"는 다음을 수행합니다:
 
 1) 획득 및 해제 효과가 모두 중단 없이 실행되도록 중단 불가능한 영역에 자신을 배치합니다.
 2) 환경으로부터 스코프를 가져오고(그래서 스코프가 R 제네릭에 있음), 포크가 있는 자식을 생성합니다.
 3) 획득 효과를 실행합니다. 성공하면 addFinalizer를 사용하여 포크된 스코프에 릴리스 효과가 추가됩니다.
 4) 획득 효과에서 A 값을 반환합니다.
 
 FileDescriptor 인터페이스를 구현하는 기본 리소스를 정의해 봅시다.
*/

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
 * The example above manages the lifetime of a File Descriptor.
 *
 * As you can imagine this could be any resource: a database connection pool,
 * a network connection, etc.
 *
 * Anyhow, we now have our "scoped effect". If we want to run it we have to
 * provide a Scope to it - which turns R from Scope to never.
 */
type useFileDescriptor = Effect.Effect<never, never, void>;

export const useFileDescriptorNaive: useFileDescriptor = Effect.gen(function* (
  $,
) {
  const scope = yield* $(Scope.make());
  const fd = yield* $(Effect.provideService(resource, Scope.Scope, scope));
  yield* $(Effect.logInfo(`useFileDescriptorNaive ${fd}`));
  yield* $(Scope.close(scope, Exit.unit()));
});

/* If you look closely at it, the previous code can be split in 3 steps:
 *
 *  - acquire: creates the scope with Scope.make
 *  - use: provides the scope to the resource and Effect.logInfo
 *  - release: closes the scope
 *
 *  Since this is a common pattern, Effect comes with a function called
 *  acquireUseRelease to build such effects.
 */
export const useFileDescriptorSmarter: useFileDescriptor =
  Effect.acquireUseRelease(
    Scope.make(),
    scope =>
      pipe(
        resource,
        Effect.tap(_ => Effect.logInfo(`useFileDescriptorSmarter ${_.fd}`)),
        Effect.provideService(Scope.Scope, scope),
      ),
    scope => Scope.close(scope, Exit.unit()),
  );

/* While the first example didn't have any error handling, this has the added
 * benefit of being a spiritual equivalent to try-catch.
 *
 * If the acquire effect succeeds, the release effect is guaranteed to be run
 * regardless of the use effect's result (similar to a finally clause).
 *
 * That was still quite long to write, and using scopes is very common.
 *
 * So Effect comes with a `scoped` function that does the whole
 * acquireUseRelease dance for you, providing a Scope to it's argument, and
 * closing it once it's done running.
 */
export const useFileDescriptor: useFileDescriptor = pipe(
  resource,
  Effect.tap(_ => Effect.logInfo(`useFileDescriptor ${_.fd}`)),
  Effect.scoped,
);

Effect.runPromise(useFileDescriptor);

/* Effect.runPromise(useFileDescriptor); will print something like:
 *
 * FileDescriptor acquired { fd: 22 }
 * useFileDescriptor { fd: 22 }
 * FileDescriptor released
 */

/* Bonus side note.
 *
 * acquireUseRelease is kind of a specialized version of acquireRelease.
 *
 * The main difference is acquireUseRelease knows when you are done using the
 * resource created with acquire (because you provide a use effect!), so it
 * also knows when it can execute release.
 *
 * On the other hand, with acquireRelease your whole code is the use effect,
 * so you have to go through closing a Scope to signal when your "use" has
 * completed.
 *
 * As an exercise, we can write acquireUseRelease in terms of acquireRelease.
 * The types are little more lax compared to the one provided by Effect, but
 * this is just to drive the point home.
 */
export const myAcquireUseRelease = <R, E, A, R2, E2, A2, R3, X>(
  acquire: Effect.Effect<R, E, A>,
  use: (a: A) => Effect.Effect<R2, E2, A2>,
  release: (
    a: A,
    exit: Exit.Exit<unknown, unknown>,
  ) => Effect.Effect<R3, never, X>,
) =>
  pipe(
    Effect.acquireRelease(acquire, release),
    Effect.flatMap(use),
    Effect.scoped,
  );

/*
 *
 * For our naive example, the following would have been perfectly fine, and
 * it would be fine to handle access to resources that aren't application wide
 * and meant to be reused.
 */
export const writeSomethingToDevNull = (something: string) =>
  Effect.acquireUseRelease(
    Effect.promise(() => promisify(fs.open)("/dev/null", "w")),
    fd => Effect.promise(() => promisify(fs.writeFile)(fd, something)),
    fd => Effect.promise(() => promisify(fs.close)(fd)),
  );

/*
 * We will see in the next chapter how to use Layer and Runtime to define
 * application wide resources.
 *
 * In that case the "use" effect is your whole application, thus inversion of
 * control is not possible and you have to use acquireRelease and Scope.
 */
