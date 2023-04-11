# Effect-TS Practice

이 저장소는 pigoz의 [effect-crashcourse](https://github.com/pigoz/effect-crashcourse) 를 포크한 저장소이다

[Effect-TS](https://github.com/Effect-TS/io) 에 대한 튜토리얼을 제공한다

---

## 목차 

0. effect data type 
   - 원시 데이터 혹은 함수로 effect 데이터를 만드는 방법을 알아본다

1. 실행흐름
   - pipe를 활용해서 effect 데이터를 만든다

2. 비동기 실행 흐름
   - pipe를 활용해서 비동기 흐름을 제어하는 Effect 데이터 만든다

3. 에러 타입
   - 에러 타입을 만드는 방법 소개한다
   - 에러가 발생했을 때 그것을 catch하여 처리하는 방법을 Data.catch류의 함수로 설명한다
      - Data.tagged를 이용한 방법
      - javascript 객체를 이용한 방법
      - Data.TaggedClass를 이용하여 클래스를 생성하는 방법
      - Data.catchTag와 Data.catchAll을 이용하여 try-catch와 유사한 구문을 생성하는 방법


4. 콜백헬과 그 솔루션
   - Effect데이터를 생성하는 과정에서 콜백헬이 발생할 수 있음을 소개하고 그 대안을 소개한다. 구체적으로 다음의 솔루션이 있다
   1. Effect.all을 호출하여 의존성을 동시에 주입하기
   2. 제네레이터
   3. Do Notation으로 Effect.bind()를 호출하여 선형적으로 바인딩하기


5. Scope의 개념 소개 (자바스크립트의 그 Scope 아님)
   - 스코프란 생명주기를 관리하는 개념이다
   - Scoped Effect란 스코프가 포함된 이펙트를 일컫는다

6. Layer의 개념 소개

7. Fiber의 개념 소개


## 부족한 지식

- Effect 자료구조에서 unwrap하는 방법