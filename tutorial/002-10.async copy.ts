import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import { parseEither } from "./utils/decode";

// The second main type of code you can find in the wild is callback based
import * as fs from "node:fs";

/*
 * Here we wrap the readFile function provided by Node, using Effect.async.
 *
 * Effect.async provides us with a resume function that we can call passing a
 * succeeding effect or a failure in order to resume the suspended computation.
 *
 * It's similar to a Promise's resolve function, but with an explicit error value.
 */
// path를 받아서 effect.async를 리턴하는 함수
// effect.async는 promise-like 객체이고 resume이 resolve함수와 유사함
// 비동기 컨트롤을 promise가 아닌 effect.async객체가 하고 싶다는 뜻
// 그렇게 하면 Effect.fail과 Effect.succeed 등으로 container에 wrapping할 수 있기 때문
export const readFileEffect = (path: fs.PathOrFileDescriptor) =>
                              Effect.async<never, NodeJS.ErrnoException, Buffer>(resume =>
                                                                                  fs.readFile(path, (error, data) => {
                                                                                    if (error) {
                                                                                      resume(Effect.fail(error));
                                                                                    } else {
                                                                                      resume(Effect.succeed(data));
                                                                                    }
                                                                                  }),
                                                                                );

/*
 * asyncInterrupt works similarly, but also allows to handle interruptions
 * (we will explore what interruptions are in future chapters)
 *
 * If the Effect returned from readFileEffectInterrupt gets interrupted by
 * the runtime controller.abort() will be called, resulting in the underlying
 * fs.readFile being interrupted too.
 */
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
