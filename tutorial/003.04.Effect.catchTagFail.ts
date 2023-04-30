import * as Equal from "@effect/data/Equal";
import * as Effect from "@effect/io/Effect";
import * as Data from "@effect/data/Data";
import { pipe } from "@effect/data/Function";
import {flakyEffect, BarError, BatError, BazError, FooError} from './003.00.flakyCode'

// 1줄 요약 : Effect.catchTag는 특정 에러만 잡아서 처리할 수 있다

const catchTagFail = Effect.catchTag(
  flakyEffect, 
  "FooError", 
  e => Effect.fail(new BazError(e.error)),
);

catchTagFail satisfies Effect.Effect<
  never,
  BarError | BazError,
  readonly ["success1", "success2"]
>;