import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";

// 배운 점
// effect 데이터 타입은 primitive data type으로 만들 수도 있고 함수로 만들 수도 있다
// 의문점 : effect 데이터 타입을 왜 굳이 primitive data type으로 만드는지는 의문이다
// 그냥 primitive data type를 바로 사용하면 되는 것이 아닌가

export const succeed = Effect.succeed(7);

export const fail = Effect.fail(3);

export const sync = Effect.sync(() => new Date());

// sync.traced();

// export const failSync = Effect.failSync(() => new Date());

// export const suspend =
//   //         ^ Effect.Effect<never, '<.5', Date>;
//   Effect.suspend(() =>
//     Math.random() > 0.5
//       ? Effect.succeed(new Date())
//       : Effect.fail("<.5" as const),
//   );
