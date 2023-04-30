import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";
import * as Layer from "@effect/io/Layer";
import * as Context from "@effect/data/Context";

(function basicOperation() {
    // const succeed = Effect.succeed(7);
    // const fail = Effect.fail(3);
    const sync = Effect.sync(() => new Date());
    console.log(
        Effect.runSync(sync)
    );        
})();

(function trace() {    
    // 1개의 인수가 필요한데 0개를 가져왔습니다.ts(2554)
    // Effect.d.ts(92, 12): 'trace'의 인수가 제공되지 않았습니다.
    // sync.traced();
})();

(function fail() {
    const failSync = Effect.failSync(() => new Date());    
    // Effect.runSync(
    //     Effect.tryCatch(
    //         failSync,
    //         () => console.log("error occured")
    //     )
    // )    
})();

(function suspend() {
    // const suspend =  
    //   Effect.suspend(() =>
    //     Math.random() > 0
    //       ? Effect.succeed(new Date())
    //       : Effect.fail("<.5" as const),
    //   );
    console.log(
        Effect.runSync(
            // 함수를 호출해서 이펙트 타입을 만드는 패턴
            //분기에 따라 성공 실패를 나눌때 사용된다
            Effect.suspend(() =>
                Math.random() > 0
                ? Effect.succeed(new Date())
                : Effect.fail("<.5" as const),
            )
        )
    );    
})()