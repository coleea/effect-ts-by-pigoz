import * as Effect from "@effect/io/Effect";
import * as Cause from "@effect/io/Cause";
import * as Data from "@effect/data/Data";
import * as Match from "@effect/match";
import * as Option from "@effect/data/Option";
import * as Either from "@effect/data/Either";
import { pipe } from "@effect/data/Function";
import {flakyEffect, BarError, BatError, BazError, FooError} from './003.00.flakyCode'

const catchTags = Effect.catchTags(flakyEffect, {
  FooError: _e => Effect.succeed("foo" as const),
  BarError: _e => Effect.succeed("bar" as const),
});

catchTags satisfies Effect.Effect<
  never,
  never,
  readonly ["success1", "success2"] | "foo" | "bar"
>;
