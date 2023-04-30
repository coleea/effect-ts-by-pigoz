import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";

const createRandom = () => Math.random()

function isAbove0_5(random: number): Either.Either<"fail", number> {
  return random > 0.5 
        ? Either.right(random) 
        : Either.left("fail" as const);
}

// const flakyEffect = pipe(
//   createRandom,
//   Effect.sync, // effect 데이터를 생성한다. Effect.Effect<never, never, number>
//   Effect.map(isAbove0_5), // Effect.Effect<never, never, Either<'fail', number>>
//   Effect.flatMap(Effect.fromEither), // Effect.Effect<never, 'fail', number>
//   // 결국 pipe의 최종 리턴값은 Effect 데이터가 될 것이다 
//   // 그리고 이 effect는 바로 실행되지 않는다
//   // effect 데이터는 run을 통해서만 실행된다. 이러한 게으름(laziness)는 effect의 큰 특징이다
//   // 이렇게 함으로서 제어권을 가지게 된다
// );

console.log(
  Effect.runSync(
    pipe(
      createRandom,
      Effect.sync,
      Effect.tapEither((a) => Effect.logInfo(JSON.stringify(a))),
      Effect.map(isAbove0_5),
      Effect.flatMap((v) =>  Effect.fromEither(v)
      ),
    )
  )  
);