import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import { parseEither } from "./utils/decode";
import * as fs from "node:fs";

// Effect.async 사용방법 : new Promise()의 인자로 (resolve,reject) => void 들어가는 것과 비슷함
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

console.log(
  Effect.runPromise(
    readFileEffect('./README.md')
  ).then(console.log)
);