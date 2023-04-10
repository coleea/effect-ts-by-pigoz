import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";

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
