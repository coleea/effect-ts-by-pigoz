import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import { parseEither } from "./utils/decode";

const id = "97459c0045f373f4eaf126998d8f65dc";

const fetchGist = (id: string) =>
                                Effect.tryCatchPromise(
                                  () => fetch(`https://api.github.com/gists/${id}`),
                                  () => "fetch" as const,
                                ); // Effect.Effect<never, "fetch", Response>

const getJson = (res: Response) =>
                                  Effect.tryCatchPromise(
                                    () => res.json() as Promise<unknown>, // Promise<any> otherwise
                                    () => "json" as const,
                                  ); // Effect.Effect<never, "json", unknown>

const GistSchema = Schema.struct({
                                  url: Schema.string,
                                  files: Schema.record(
                                    Schema.string,
                                    Schema.struct({
                                      filename: Schema.string,
                                      type: Schema.string,
                                      language: Schema.string,
                                      raw_url: Schema.string,
                                    }),
                                  ),
                                });

export interface Gist extends Schema.To<typeof GistSchema> {}

const getAndParseGist = pipe(
                              id,
                              fetchGist,
                              Effect.flatMap(getJson),
                              Effect.map(parseEither(GistSchema)),
                              Effect.flatMap(Effect.fromEither),
                            );


Effect.runPromise(getAndParseGist)
      .then(console.log)
      .catch(console.error)