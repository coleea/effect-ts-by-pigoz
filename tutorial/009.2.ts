import { effectify, effectifyMapError } from "tutorial/utils/effectify";
import { promisify } from "node:util";

// import { pipe } from "@effect/data/Function";
// import * as ReadonlyArray from "@effect/data/ReadonlyArray";
// import * as Effect from "@effect/io/Effect";
// import * as fs from "node:fs";

type CustomPromisifySymbolExample = {
  (x: number, cb: (err: number, data: string) => void): void;
  [promisify.custom]: () => Promise<string>;
};

const customSymbol: CustomPromisifySymbolExample = (() => {}) as any;

function foo(x: number, cb: (err: number, data: string) => void) {}
const x = effectify(customSymbol);
const y = effectify(foo);

export class ReadFileError {
  readonly _tag = "ReadFileError";
  constructor(readonly error: NodeJS.ErrnoException) {}
}

