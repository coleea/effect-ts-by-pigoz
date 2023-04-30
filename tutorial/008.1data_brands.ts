import * as Brand from "@effect/data/Brand";

export type Eur = number & Brand.Brand<"Eur">;
export const Eur = Brand.nominal<Eur>();

console.log('Eur');
console.log(Eur);

console.log('Eur(10)');
console.log(Eur(10));

console.log(`typeof Eur(10)`);
console.log(typeof Eur(10));

/*
Eur
[Function (anonymous)] {
  option: [Function: option],
  either: [Function: either],
  refine: [Function: refine],
  [Symbol(@effect/data/Brand/Refined)]: Symbol(@effect/data/Brand/Refined)
}
*/

/*
const nominal: <Eur>() => Brand.Brand<in out K extends string | symbol>.Constructor<Eur>
This function returns a Brand.Constructor that does not apply any runtime checks, 
it just returns the provided value. 

*** 핵심 *** 
brand는 nominal types를 만드는 데 사용된다

It can be used to create nominal types that allow distinguishing between two values of the same type 
but with different meanings.

If you also want to perform some validation, see refined.

@example

import * as Brand from "@effect/data/Brand"

type UserId = number & Brand.Brand<"UserId">

const UserId = Brand.nominal<UserId>()

assert.strictEqual(UserId(1), 1)
@since — 1.0.0

@category — constructors
*/




export type Payed = number & Brand.Brand<"Payed">;

// const Payed: Brand.Brand.Constructor<Payed>
export const Payed = Brand.nominal<Payed>();

// const payment: Payed
const payment = Payed(Eur(10));
console.log("euros: %o", payment);
console.log('typeof payment');
console.log(typeof payment);