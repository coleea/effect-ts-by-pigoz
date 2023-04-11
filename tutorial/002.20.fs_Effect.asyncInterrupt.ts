import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import { parseEither } from "./utils/decode";
import * as fs from "node:fs";

// 이 단원의 핵심
// Effect.asyncInterrupt는 new Promise()와 비슷한 방법으로 사용한다
// promise의 resolve에 해당하는 것이 resume()이다
export const readFileEffectInterrupt = (path: fs.PathOrFileDescriptor) =>
  // 이 경우 Effect가 올바른 제네릭을 전달해야 하는 몇 안 되는 경우 중 하나입니다
  // 제네릭이 제대로 그렇지 않으면 유형이 제대로 추론되지 않습니다.
  Effect.asyncInterrupt
  <never, NodeJS.ErrnoException, Buffer>(resume => {
                                            const controller = new AbortController();
                                            fs.readFile(path, { signal: controller.signal }, 
                                                        (error, data) => {
                                                          if (error) {
                                                            resume(Effect.fail(error));
                                                          } else {
                                                            resume(Effect.succeed(data));
                                                          }
                                                        });
                                                      return Effect.sync(() => controller.abort());
                                          });

// 어떻게 abort하지?
Effect.runPromise(readFileEffectInterrupt('./README.md'))
      .then(console.log)

