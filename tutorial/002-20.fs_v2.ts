import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import { parseEither } from "./utils/decode";
import * as fs from "node:fs";

export const readFileEffectInterrupt = (path: fs.PathOrFileDescriptor) =>
  // NOTE: this one of the few occasions where Effect needs us to pass in the
  // correct generics, otherwise types don't get inferred properly.
  Effect.asyncInterrupt<never, NodeJS.ErrnoException, Buffer>(resume => {
                                                                          const controller = new AbortController();

                                                                          fs.readFile(path, { signal: controller.signal }, (error, data) => {
                                                                            if (error) {
                                                                              resume(Effect.fail(error));
                                                                            } else {
                                                                              resume(Effect.succeed(data));
                                                                            }
                                                                          });

                                                                          return Effect.sync(() => controller.abort());
                                                                        });

// 어떻게 abort하지?
Effect.runPromise(
  readFileEffectInterrupt('./README.md')
).then(console.log)

