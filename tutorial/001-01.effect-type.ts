import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";

/*
 Effect의 고유한 인사이트는 오류와 요구사항/종속성을 프로그램의 제어 흐름에서 모델링해야 한다는 것입니다. 
 
 이는 함수가 "성공" 값을 반환하거나 유형이 지정되지 않은 예외를 던질 수 있는 일반적인 타입스크립트 코드와 대조적입니다.

 Effect의 데이터 유형은 다음과 같습니다:

 * Effect<R, E, A>
 *
 * The computation has requirements (R), can fail (E) or succeed (A).
 *
 * You can loosely think of Effect<R, E, A> as the following type:
 *
 *   (r: R) => Promise<Either<E, A>> | Either<E, A>
 *
 *  - R is the computation requirements
 *  - E is the type of the error in case the computation fails
 *  - A is the return type in case the computation succeeds
 *
 * Think of these as separate channels, all of which you can interact within
 * your program. R is the requirements channel, E is the failure/error channel,
 * and A is the success channel.
 *
 * R will be covered in more detail later, don't worry if it doesn't make
 * sense yet. Focus on understanding E and A first.
 *
 * Effect is inspired by ZIO (a Scala library)
 */

/*
 * Notes while going through the rest of this crash course:
 * 1. Effect has excellent type inference. You rarely need to specify types manually.
 * 2. There are explicit type annotations in several parts of this crash course
 * to make it easier for you to follow.
 */

/* Basic constructors
 * ==================
 *
 * The point of these functions is to demonstrate a couple basic ways to
 * create an "Effect" value.
 *
 * Notice how the types change based on the function you call.
 * */

/*
 * succeed creates an Effect value that includes it's argument in the
 * success channel (A in Effect<R, E, A>)
 */
export const succeed = Effect.succeed(7);
console.log(succeed);

//           ^ Effect.Effect<never, never, number>;

/*
 * fail creates an Effect value that includes it's argument in the
 * failure channel (E in Effect<R, E, A>)
 */
export const fail = Effect.fail(3);
//           ^ Effect.Effect<never, number, never>;

/*
 * sync can be thought as a lazy alternative to succeed.
 * A is built lazily only when the Effect is run.
 */
export const sync = Effect.sync(() => new Date());
//           ^ Effect.Effect<never, never, Date>;

/*
 * NOTE: if we used Effect.succeed(new Date()), the date stored in the success
 * channel would be the one when the javascript virtual machine initially
 * loads and executes our code.
 *
 * For values that do not change like a number, it doesn't make any difference.
 */

/*
 * failSync can be thought as a lazy alternative to fail.
 * E is built lazily only when the Effect is run.
 */
export const failSync = Effect.failSync(() => new Date());
//           ^ Effect.Effect<never, Date, never>;

/* suspend allows to lazily build an Effect value.
 *
 * While sync builds A lazily, and failSync builds E lazily, suspend builds
 * the whole Effect<R, E, A> lazily!
 */
export const suspend =
  //         ^ Effect.Effect<never, '<.5', Date>;
  Effect.suspend(() =>
    Math.random() > 0.5
      ? Effect.succeed(new Date())
      : Effect.fail("<.5" as const),
  );
