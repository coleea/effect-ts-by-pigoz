import { pipe } from "@effect/data/Function";
import * as ReadonlyArray from "@effect/data/ReadonlyArray";
import * as Effect from "@effect/io/Effect";
import * as fs from "node:fs";
import { effectify, effectifyMapError } from "tutorial/utils/effectify";

export class ReadFileError {
  readonly _tag = "ReadFileError";
  constructor(readonly error: NodeJS.ErrnoException) {}
}

export const readFile = effectifyMapError(
  fs.readFile,
  e => new ReadFileError(e),
);

(function run(filename:string) {
  Effect.runPromise(
    pipe(
      readFile(filename),
      // readFile("dadaasd"),
      Effect.map(x => x.toString().split("\n")),
      Effect.map(ReadonlyArray.take(5)),
    ),
  ).then(x => console.log(x))
   .catch(x => console.error(x));  
})("test.txt");
