import * as Brand from "@effect/data/Brand"

type UserId = number & Brand.Brand<"UserId">

const UserId = Brand.nominal<UserId>()

console.log(
  UserId(1) 
);

console.log(1);


// (UserId(1), 1)