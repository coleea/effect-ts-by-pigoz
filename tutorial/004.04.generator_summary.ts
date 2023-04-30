/*
  요약: 제너레이터를 사용하면 명령형으로 보이는 effect 코드를 작성할 수 있습니다
  이는 스칼라에서 ZIO가 comprehension를 위해 하는 것과 동일합니다.
 
  물론 `gen(function ($) {`와 `yield $(`는 꽤 많은 노이즈를 추가하지만, 자바스크립트와 타입스크립트의 한계를 고려하면 이것이 가능하다는 사실이 매우 놀랍습니다.
  코드 스니펫은 `gen(function ($)` 및 `yield $()` 상용구를 작성하는 것이 좋습니다. 참고로 저는 이렇게 설정했습니다:
  {
    "Gen Function $": {
      "prefix": "gen$",
      "body": ["function* ($) {\n\t$0\n}"],
      "description": "Generator function with $ input"
    },
    "Gen Function $ (wrapped)": {
      "prefix": "egen$",
      "body": ["Effect.gen(function* ($) {\n\t$0\n})"],
      "description": "Generator function with $ input"
    },
    "Gen Yield $": {
      "prefix": "yield$",
      "body": ["yield* $($0)"],
      "description": "Yield generator calling $()"
    },
    "Gen Yield $ (const)": {
      "prefix": "cyield$",
      "body": ["const $1 = yield* $($0)"],
      "description": "Yield generator calling $()"
    }
  }
*/