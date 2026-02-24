/**
 * extensions/ext-config.js
 * 기존 파일을 수정하지 않고, CONFIG를 '추가 확장'하는 패치 파일
 * - null/undefined 안전
 */
(function () {
  "use strict";

  // CONFIG가 아직 없다면 아무 것도 하지 않음 (콘솔 에러 방지)
  if (typeof window.CONFIG !== "object" || !window.CONFIG) return;

  const CONFIG = window.CONFIG;

  // 안전하게 객체 보장
  CONFIG.EVENT_TYPES = CONFIG.EVENT_TYPES || {};
  CONFIG.PRICES = CONFIG.PRICES || {};
  CONFIG.MEAL_PRICES = CONFIG.MEAL_PRICES || {};
  CONFIG.OPTIONS = CONFIG.OPTIONS || {};

  // ✅ 대표님 요구사항 반영: 카테고리/상세유형 이름 변경 & 추가
  // - value는 "실제 저장/계산에 쓰는 키"로 사용
  // - text는 UI 표시용으로 ext-ui에서 따로 적용 (기존 updateEventSubTypes는 value==text 구조라 직접 쓰면 충돌 가능)

  // 새 표준 키(계산/저장에 사용하는 키)
  const NEW_EVENT_TYPES = {
    "웨딩": ["마이크로웨딩", "하우스웨딩", "가든웨딩"],
    "행사": ["돌잔치", "가족행사", "기업행사", "대관"]
  };

  // 기존 키도 남겨두되, 신규 키를 우선 사용하도록 ext-ui에서 렌더링
  CONFIG.EVENT_TYPES["웨딩"] = NEW_EVENT_TYPES["웨딩"];
  CONFIG.EVENT_TYPES["행사"] = NEW_EVENT_TYPES["행사"];

  // ✅ 가격 정책 (기본금액)
  // 웨딩: 24인 식대 포함 패키지 금액
  CONFIG.PRICES["마이크로웨딩"] = 4200000;
  CONFIG.PRICES["하우스웨딩"]   = 4900000;
  CONFIG.PRICES["가든웨딩"]     = 6200000;

  // 행사: "1인 식대 계산" 기반(별도 기본 패키지 금액을 주지 않으셨으므로 0으로 설정)
  // 돌잔치/가족행사/기업행사/대관은 식대로 총액이 잡히도록 기본금액 0
  ["돌잔치","가족행사","기업행사","대관"].forEach(function(k){
    if (typeof CONFIG.PRICES[k] !== "number") CONFIG.PRICES[k] = 0;
  });

  // ✅ 식대 (기존값 유지 + 명시)
  // western: 55,000 / korean: 59,000 (기존 config.js와 동일)
  if (typeof CONFIG.MEAL_PRICES["western"] !== "number") CONFIG.MEAL_PRICES["western"] = 55000;
  if (typeof CONFIG.MEAL_PRICES["korean"] !== "number")  CONFIG.MEAL_PRICES["korean"]  = 59000;

  // ✅ 선택 옵션 (금액 반영되는 옵션들)
  // 기존 옵션에 추가/정리. (이미 있으면 덮어씌움)
  CONFIG.OPTIONS["공간대여 패키지"] = 600000;
  CONFIG.OPTIONS["폴라돌상 패키지"] = 500000;
  CONFIG.OPTIONS["그란데돌상 패키지"] = 700000;
  CONFIG.OPTIONS["생신상 패키지"] = 200000;
  CONFIG.OPTIONS["음향.마이크"] = 80000;
  CONFIG.OPTIONS["애프터파티 패키지"] = 1500000;
  // 기타옵션은 UI에서 금액 입력 받아 별도 합산(키 등록 불필요)

  // 협력업체는 금액 미반영(체크/메모만 저장)
})();
