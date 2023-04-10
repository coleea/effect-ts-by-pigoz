import * as Effect from '@effect/io/Effect'
import * as T from '@effect/core/'
import {Tag} from '@effect/data/Context'

type IO<A> = () => A

interface ConsoleService {
    Console : {
        log : (msg : string) => Effect.Effect<unknown, never, void>
    }
}

// Tag is now a subtype of Effect, so you can flatMap / map it directly to get access to your services
const consoleService = Tag(helloWorld) ; 



// const log = (msg : string) => effect.access


function helloWorld(name:string) {
    // 이것으로 함수가 리턴값을 갖게 되었다
    // retuirn consoleService.lo
     return () => { 
         console.log(`hello world, ${name}!`)        
        //  either.
        //  effect.suc/
    }
}

const helloworldFunction = helloWorld('lee') ; 
helloworldFunction()