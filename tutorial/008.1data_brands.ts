
import * as Brand from "@effect/data/Brand";


// TypeScript에서 &는 유형 병합 연산자로 사용되며, 
// 여러 타입을 결합하여 새로운 타입을 생성할 때 사용됩니다. 
// 이 연산자는 주로 교차 타입(cross types)을 정의할 때 사용되며, 
// 이는 여러 타입의 속성을 결합하여 하나의 타입으로 만드는 것을 의미합니다.
// 예를 들어, 두 객체 타입 A와 B가 있을 때, A & B는 A와 B의 속성을 모두 갖는 새로운 타입을 생성합니다.

export type Eur = number & Brand.Brand<"Eur">;
export const Eur = Brand.nominal<Eur>();

console.log('Eur');
console.log(Eur);
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







