// Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: No "exports" main defined in 
// /Users/gukbeomlee/project/effect-ts-practice-by-pigoz/node_modules/evolu/package.json

import React from 'react'
import { pipe } from "@effect/data/Function";
import * as Schema from "@effect/schema/Schema";
import * as Evolu from "evolu";
 
const TodoId = Evolu.id("Todo");
type TodoId = Schema.To<typeof TodoId>;
 
const NonEmptyString50 = pipe(
  Schema.string,
  Schema.minLength(1),
  Schema.maxLength(50),
  Schema.brand("NonEmptyString50")
);

type NonEmptyString50 = Schema.To<typeof NonEmptyString50>;
 
const TodoTable = Schema.struct({
  id: TodoId,
  title: NonEmptyString50,
  description: Schema.nullable(Evolu.NonEmptyString1000),
  isCompleted: Evolu.SqliteBoolean,
});

type TodoTable = Schema.To<typeof TodoTable>;
 
const Database = Schema.struct({todo: TodoTable,});
 
function ReactComponent({title} : {title : string}) {

    const { useQuery, useMutation } = Evolu.createHooks(Database);
 
    const { rows, isLoaded } = useQuery(
      (db) => db.selectFrom("todo").select(["id", "title"]).orderBy("createdAt"),
      (row) => row
    );
     
    const { create, update } = useMutation();
     
    if (!Schema.is(NonEmptyString50)(title)) return;
    const onComplete = () => console.log("update completed"); 
    const { id } = create("todo", { title, isCompleted: false });
    
    update("todo", { id, isCompleted: true }, onComplete);        

    return React.createElement('div', "hello")
}

console.log(
  ReactComponent({title : "some_suitable_title"})
);