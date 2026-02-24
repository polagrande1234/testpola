/**
 * extensions/ext-print.js
 * - app.printConsultation / app.printContract wrapper: 확장된 인쇄 페이지(print2.html)로 연결
 * - 기존 print.html은 그대로 둠 (수정 금지)
 */
(function () {
  "use strict";

  function safeGet(obj, key) {
    try { return obj ? obj[key] : undefined; } catch (e) { return undefined; }
  }

  function boot() {
    if (!window.app) return false;

    var app = window.app;

    function buildParams(consultation) {
      var params = new URLSearchParams({
        customerName: safeGet(consultation, "고객명") || "",
        customerPhone: safeGet(consultation, "연락처") || "",
        eventDate: safeGet(consultation, "행사일자") || "",
        eventTime: safeGet(consultation, "행사시간") || "",
        guestCount: safeGet(consultation, "예상인원") || "",
        eventCategory: safeGet(consultation, "행사카테고리") || "",
        eventSubType: safeGet(consultation, "행사유형") || "",
        basePrice: safeGet(consultation, "기본금액") || 0,
        mealPrice: safeGet(consultation, "추가식대") || 0,
        optionPrice: safeGet(consultation, "옵션금액") || 0,
        promotionText: safeGet(consultation, "프로모션") || "",
        promotion: safeGet(consultation, "프로모션금액") || 0,
        totalPrice: safeGet(consultation, "총금액") || 0,
        depositAmount: safeGet(consultation, "계약금") || 0,
        balanceAmount: safeGet(consultation, "잔금") || 0,
        memo: safeGet(consultation, "특이사항") || ""
      });
      return params.toString();
    }

    // 원본 함수 백업
    if (typeof app.printConsultation === "function" && !app.printConsultation.__ext_patched) {
      var _orig = app.printConsultation.bind(app);

      app.printConsultation = function (id) {
        try {
          var c = (app.consultations || []).find(function (x) { return x && x.ID === id; });
          if (!c) return;
          var qs = buildParams(c);
          window.open("print2.html?" + qs, "_blank");
        } catch (e) {
          // 실패 시 원본으로 폴백
          try { _orig(id); } catch (e2) {}
        }
      };
      app.printConsultation.__ext_patched = true;
      app.printConsultation.__ext_orig = _orig;
    }

    if (typeof app.printContract === "function" && !app.printContract.__ext_patched) {
      var _orig2 = app.printContract.bind(app);
      app.printContract = function (id) {
        try { app.printConsultation(id); } catch (e) { try { _orig2(id); } catch (e2) {} }
      };
      app.printContract.__ext_patched = true;
      app.printContract.__ext_orig = _orig2;
    }

    return true;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var tries = 0;
    var t = setInterval(function () {
      tries += 1;
      if (boot() || tries > 20) clearInterval(t);
    }, 150);
  });
})();
