/**
 * extensions/ext-ui.js
 * - 기존 DOM 구조를 분석한 뒤, 모달 내부의 "행사 유형" / "금액 요약" 섹션 사이에 UI를 삽입
 * - app.updateEventSubTypes / app.updatePriceCalculation 을 wrapper 방식으로 확장
 * - 콘솔 에러 방지를 위해 null 체크 철저
 */
(function () {
  "use strict";

  function $(sel, root) {
    try { return (root || document).querySelector(sel); } catch (e) { return null; }
  }
  function $all(sel, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); } catch (e) { return []; }
  }
  function on(el, evt, handler) {
    if (!el || !el.addEventListener) return;
    el.addEventListener(evt, handler);
  }
  function safeText(el, text) {
    if (!el) return;
    el.textContent = text;
  }
  function parseIntSafe(v, dft) {
    var n = parseInt(v, 10);
    return isNaN(n) ? (dft || 0) : n;
  }

  // --------- 확장 데이터(옵션/협력업체) 수집 ---------
  function collectSelectedOptions() {
    var wrap = $("#extOptionsWrap");
    if (!wrap) return { list: [], extraLabel: "", extraAmount: 0 };
    var list = [];
    $all("input[type=checkbox][data-ext-option]", wrap).forEach(function (cb) {
      if (cb && cb.checked) list.push(cb.getAttribute("data-ext-option"));
    });

    var extraLabelEl = $("#extOtherOptionText", wrap);
    var extraAmtEl = $("#extOtherOptionAmount", wrap);
    var extraLabel = extraLabelEl ? (extraLabelEl.value || "").trim() : "";
    var extraAmount = extraAmtEl ? parseIntSafe(extraAmtEl.value, 0) : 0;
    if (extraAmount < 0) extraAmount = 0;

    return { list: list, extraLabel: extraLabel, extraAmount: extraAmount };
  }

  function collectPartners() {
    var wrap = $("#extPartnersWrap");
    if (!wrap) return [];
    var items = [];
    $all("[data-ext-partner-row]", wrap).forEach(function (row) {
      var cb = $("input[type=checkbox][data-ext-partner]", row);
      var input = $("input[type=text][data-ext-partner-note]", row);
      if (!cb) return;
      var checked = !!cb.checked;
      var name = cb.getAttribute("data-ext-partner") || "";
      var note = input ? (input.value || "").trim() : "";
      if (checked || note) items.push({ name: name, checked: checked, note: note });
    });
    return items;
  }

  function formatOptionsText(opt) {
    var parts = [];
    (opt.list || []).forEach(function (k) { if (k) parts.push(k); });
    if (opt.extraLabel || (opt.extraAmount > 0)) {
      var label = opt.extraLabel ? opt.extraLabel : "기타옵션";
      parts.push(label + " (" + (opt.extraAmount || 0).toLocaleString("ko-KR") + "원)");
    }
    return parts.length ? parts.join(", ") : "없음";
  }

  function formatPartnersText(items) {
    if (!items || !items.length) return "없음";
    return items.map(function (it) {
      var base = it.name || "협력업체";
      var tail = it.note ? " - " + it.note : "";
      return base + (it.checked ? "" : " (미체크)") + tail;
    }).join(", ");
  }

  function mergeMemo(originalMemo, optionsText, partnersText) {
    var memo = (originalMemo || "").trim();

    // 이미 확장 섹션이 들어갔다면 중복 삽입 방지
    var marker1 = "[선택옵션]";
    var marker2 = "[협력업체]";
    if (memo.indexOf(marker1) >= 0 || memo.indexOf(marker2) >= 0) return memo;

    var blocks = [];
    blocks.push(marker1 + " " + (optionsText || "없음"));
    blocks.push(marker2 + " " + (partnersText || "없음"));

    return (memo ? (memo + "\n\n") : "") + blocks.join("\n");
  }

  // --------- UI 삽입 ---------
  function injectUIOnce() {
    // 모달 폼 내에서만 삽입 (document.body append 금지)
    var form = $("#consultForm");
    if (!form) return;

    if ($("#extInjected")) return; // 중복 방지

    // "행사 유형" 섹션(아이콘 bi-grid) 다음에 붙이기: 행사유형 select들이 있는 row 내부를 찾아 그 다음에 삽입
    // index.html 구조: <div class="col-12 mb-3 mt-3"><h6 ...> 행사 유형</h6></div> 이후 select 2개가 이어짐
    var eventTypeHeader = null;
    $all("h6.border-bottom.pb-2", form).forEach(function (h) {
      if ((h.textContent || "").indexOf("행사 유형") >= 0) eventTypeHeader = h;
    });
    if (!eventTypeHeader) return;

    // header가 들어있는 col-12 div를 기준으로, 그 '다음' 위치에 넣기
    var headerCol = eventTypeHeader.closest(".col-12");
    if (!headerCol || !headerCol.parentElement) return;
    var parentRow = headerCol.parentElement;

    // headerCol 다음 형제들이 select 2개 (col-md-6) 2개. 그 다음 위치를 찾아 삽입
    // 안전하게: headerCol 이후 첫 번째 ".col-12.mb-3.mt-3" (금액요약 header) 앞에 넣는다.
    var children = Array.prototype.slice.call(parentRow.children);
    var insertBefore = null;
    for (var i = 0; i < children.length; i++) {
      var el = children[i];
      if (el === headerCol) continue;
      // 금액 요약 헤더를 찾음
      var h6 = $("h6.border-bottom.pb-2", el);
      if (h6 && (h6.textContent || "").indexOf("금액 요약") >= 0) {
        insertBefore = el;
        break;
      }
    }
    if (!insertBefore) return;

    // UI 블록 HTML
    var wrapper = document.createElement("div");
    wrapper.id = "extInjected";
    wrapper.className = "col-12";
    wrapper.innerHTML = `
      <div class="ext-block">
        <div class="ext-title">
          <span class="ext-badge">추가</span>
          선택옵션 / 협력업체 / 식대 설정
        </div>

        <div class="row g-3">
          <div class="col-lg-6">
            <div class="ext-card" id="extMealWrap">
              <div class="ext-card-title">식대 설정</div>

              <div class="ext-row">
                <label class="ext-label" for="extMealMode">행사 식대 방식</label>
                <select class="form-select form-select-sm" id="extMealMode">
                  <option value="auto">자동 (카테고리/유형 기준)</option>
                  <option value="manual">직접 입력</option>
                </select>
              </div>

              <div class="ext-row" id="extMealTypeRow">
                <label class="ext-label">행사 식대 선택</label>
                <div class="d-flex gap-2 flex-wrap">
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="extMealType" id="extMealWestern" value="western" checked>
                    <label class="form-check-label" for="extMealWestern">양식 55,000원</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="extMealType" id="extMealKorean" value="korean">
                    <label class="form-check-label" for="extMealKorean">한식 59,000원</label>
                  </div>
                </div>
                <div class="ext-hint mt-1">
                  기업행사/대관 선택 시: 음식 항목/1인 식대는 '직접 입력'으로 계산됩니다.
                </div>
              </div>

              <div class="ext-row" id="extManualMealRow" style="display:none;">
                <label class="ext-label" for="extManualMealPerPerson">1인 식대(직접입력)</label>
                <input type="number" class="form-control form-control-sm" id="extManualMealPerPerson" min="0" placeholder="예: 55000">
                <div class="ext-row mt-2">
                  <label class="ext-label" for="extManualFoodText">음식 항목(메모)</label>
                  <input type="text" class="form-control form-control-sm" id="extManualFoodText" placeholder="예: 기업행사 핑거푸드 / 대관 간단다과">
                </div>
              </div>

              <div class="ext-hint mt-2" id="extWeddingHint" style="display:none;">
                웨딩은 24인 식대 포함입니다. 25인부터 1인당 55,000원이 자동 추가됩니다.
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="ext-card" id="extOptionsWrap">
              <div class="ext-card-title">선택옵션 (금액 합산)</div>
              <div class="row g-2">
                ${[
                  "공간대여 패키지",
                  "폴라돌상 패키지",
                  "그란데돌상 패키지",
                  "생신상 패키지",
                  "음향.마이크",
                  "애프터파티 패키지"
                ].map(function (k, idx) {
                  var id = "extOpt_" + idx;
                  return `
                    <div class="col-md-6">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="${id}" data-ext-option="${k}">
                        <label class="form-check-label" for="${id}">${k}</label>
                      </div>
                    </div>`;
                }).join("")}
                <div class="col-12">
                  <div class="ext-other">
                    <div class="form-check me-2">
                      <input class="form-check-input" type="checkbox" id="extOtherOptionEnabled">
                      <label class="form-check-label" for="extOtherOptionEnabled">기타옵션</label>
                    </div>
                    <input type="text" class="form-control form-control-sm" id="extOtherOptionText" placeholder="내용">
                    <input type="number" class="form-control form-control-sm" id="extOtherOptionAmount" min="0" placeholder="금액">
                  </div>
                </div>
              </div>
              <div class="ext-hint mt-2">옵션 금액은 "선택 옵션" 합계에만 1회 반영됩니다(중복합산 방지).</div>
            </div>
          </div>

          <div class="col-12">
            <div class="ext-card" id="extPartnersWrap">
              <div class="ext-card-title">협력업체 (금액 미반영 / 체크+메모 저장)</div>
              <div class="row g-2">
                ${[
                  "사회자",
                  "촬영",
                  "드레스",
                  "메이크업",
                  "생화장식",
                  "부케",
                  "기타"
                ].map(function (k, idx) {
                  var id = "extPartner_" + idx;
                  var noteId = "extPartnerNote_" + idx;
                  return `
                    <div class="col-lg-6" data-ext-partner-row>
                      <div class="ext-partner-row">
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" id="${id}" data-ext-partner="${k}">
                          <label class="form-check-label" for="${id}">${k}</label>
                        </div>
                        <input type="text" class="form-control form-control-sm" id="${noteId}" data-ext-partner-note placeholder="내용 입력">
                      </div>
                    </div>`;
                }).join("")}
              </div>
              <div class="ext-hint mt-2">협력업체 내용은 저장 시 ‘특이사항’에 자동 합쳐집니다.</div>
            </div>
          </div>
        </div>
      </div>
    `;

    parentRow.insertBefore(wrapper, insertBefore);

    // 기타옵션 체크 시 입력 활성화
    var otherEnabled = $("#extOtherOptionEnabled", form);
    var otherText = $("#extOtherOptionText", form);
    var otherAmt = $("#extOtherOptionAmount", form);
    function syncOtherEnabled() {
      var onoff = !!(otherEnabled && otherEnabled.checked);
      if (otherText) otherText.disabled = !onoff;
      if (otherAmt) otherAmt.disabled = !onoff;
      if (!onoff) {
        if (otherText) otherText.value = "";
        if (otherAmt) otherAmt.value = "";
      }
    }
    on(otherEnabled, "change", function () { syncOtherEnabled(); triggerRecalc(); });
    syncOtherEnabled();

    // 식대모드 변경
    var mealMode = $("#extMealMode", form);
    function syncMealModeUI() {
      var mode = mealMode ? mealMode.value : "auto";
      var manualRow = $("#extManualMealRow", form);
      var typeRow = $("#extMealTypeRow", form);
      if (manualRow) manualRow.style.display = (mode === "manual") ? "" : "none";
      if (typeRow) typeRow.style.opacity = (mode === "manual") ? "0.5" : "1";
    }
    on(mealMode, "change", function(){ syncMealModeUI(); triggerRecalc(); });
    syncMealModeUI();

    // 각종 입력 변경 시 재계산
    $all("#extInjected input, #extInjected select", form).forEach(function (el) {
      on(el, "input", triggerRecalc);
      on(el, "change", triggerRecalc);
    });

    // 기존 필드 변경에도 반응(guestCount 등)
    ["guestCount","eventCategory","eventSubType","promotionAmount","depositAmount"].forEach(function(id){
      var el = document.getElementById(id);
      on(el, "input", triggerRecalc);
      on(el, "change", triggerRecalc);
    });
  }

  // --------- 계산 로직(기존 함수 wrapper) ---------
  function getEventCategory() {
    var el = document.getElementById("eventCategory");
    return el ? (el.value || "") : "";
  }
  function getEventSubType() {
    var el = document.getElementById("eventSubType");
    return el ? (el.value || "") : "";
  }
  function getGuestCount() {
    var el = document.getElementById("guestCount");
    return el ? parseIntSafe(el.value, 0) : 0;
  }
  function getPromotionAmount() {
    var el = document.getElementById("promotionAmount");
    return el ? parseIntSafe(el.value, 0) : 0;
  }

  function getSelectedMealType() {
    var w = document.getElementById("extMealWestern");
    var k = document.getElementById("extMealKorean");
    if (k && k.checked) return "korean";
    if (w && w.checked) return "western";
    return "western";
  }

  function getMealMode() {
    var el = document.getElementById("extMealMode");
    return el ? (el.value || "auto") : "auto";
  }

  function getManualMealPerPerson() {
    var el = document.getElementById("extManualMealPerPerson");
    return el ? parseIntSafe(el.value, 0) : 0;
  }

  function showWeddingHint(show) {
    var el = document.getElementById("extWeddingHint");
    if (!el) return;
    el.style.display = show ? "" : "none";
  }

  function setPriceUI(id, value, prefixMinus) {
    var el = document.getElementById(id);
    if (!el) return;
    var pc = window.pricingCalculator;
    if (pc && typeof pc.formatPrice === "function") {
      var txt = pc.formatPrice(value);
      if (prefixMinus) txt = "-" + txt;
      el.textContent = txt;
    } else {
      // fallback
      el.textContent = (prefixMinus ? "-" : "") + "₩" + (value || 0).toLocaleString("ko-KR");
    }
  }

  function computeOptionPrice() {
    var pc = window.pricingCalculator;
    var CONFIG = window.CONFIG;
    if (!pc || !CONFIG) return 0;

    var selected = collectSelectedOptions();
    var sum = 0;

    (selected.list || []).forEach(function (k) {
      if (CONFIG.OPTIONS && typeof CONFIG.OPTIONS[k] === "number") sum += CONFIG.OPTIONS[k];
    });

    // 기타옵션: 체크되어 있을 때만 합산
    var otherEnabled = document.getElementById("extOtherOptionEnabled");
    if (otherEnabled && otherEnabled.checked) {
      sum += (selected.extraAmount || 0);
    }
    return Math.max(0, sum);
  }

  function computeMealPrice(category, subType, guestCount) {
    var pc = window.pricingCalculator;
    var CONFIG = window.CONFIG;
    if (!pc || !CONFIG) return 0;

    // 웨딩: 24인 포함, 추가 인원 55,000원(양식 단가로 동일 적용)
    if (category === "웨딩") {
      showWeddingHint(true);
      // 25인부터 추가
      var additionalGuests = Math.max(0, guestCount - 24);
      return additionalGuests * 55000;
    }
    showWeddingHint(false);

    // 행사: 기본은 1인 식대(양식/한식)
    // 기업행사/대관은 직접입력(사용자 지시)
    var mode = getMealMode();

    if (subType === "기업행사" || subType === "대관") {
      mode = "manual";
    }

    if (mode === "manual") {
      var per = Math.max(0, getManualMealPerPerson());
      return guestCount * per;
    }

    // auto
    var mealType = getSelectedMealType();
    var perPrice = (CONFIG.MEAL_PRICES && typeof CONFIG.MEAL_PRICES[mealType] === "number")
      ? CONFIG.MEAL_PRICES[mealType] : 0;
    return guestCount * perPrice;
  }

  function computeBasePrice(subType) {
    var pc = window.pricingCalculator;
    if (!pc || typeof pc.calculateBasePrice !== "function") return 0;
    return pc.calculateBasePrice(subType);
  }

  function triggerRecalc() {
    // app.updatePriceCalculation이 있을 때만 호출
    if (window.app && typeof window.app.updatePriceCalculation === "function") {
      try { window.app.updatePriceCalculation(); } catch (e) { /* no console spam */ }
    }
  }

  function patchApp() {
    if (!window.app || !window.pricingCalculator || !window.CONFIG) return false;

    var app = window.app;
    var pc = window.pricingCalculator;

    // 1) updateEventSubTypes wrapper: 표시 텍스트를 요구사항대로 변경
    if (typeof app.updateEventSubTypes === "function" && !app.updateEventSubTypes.__ext_patched) {
      var _origUpdateSub = app.updateEventSubTypes.bind(app);

      var weddingDisplay = {
        "마이크로웨딩": "마이크로웨딩(24인 식대포함 420만원)",
        "하우스웨딩": "하우스웨딩(24인 식대포함 490만원)",
        "가든웨딩": "가든웨딩(24인 식대포함 620만원)"
      };
      var eventDisplay = {
        "돌잔치": "돌잔치",
        "가족행사": "가족행사",
        "기업행사": "기업행사",
        "대관": "대관"
      };

      app.updateEventSubTypes = function (category) {
        // 기본 동작을 깨지 않기 위해, 기존 함수 대신 'DOM 기반'으로 직접 렌더링
        var subTypeSelect = document.getElementById("eventSubType");
        if (!subTypeSelect) return;
        subTypeSelect.disabled = false;
        subTypeSelect.innerHTML = '<option value="">선택하세요</option>';

        var types = (window.CONFIG && window.CONFIG.EVENT_TYPES && window.CONFIG.EVENT_TYPES[category])
          ? window.CONFIG.EVENT_TYPES[category] : [];

        types.forEach(function (type) {
          var opt = document.createElement("option");
          opt.value = type;
          if (category === "웨딩") opt.textContent = weddingDisplay[type] || type;
          else opt.textContent = eventDisplay[type] || type;
          subTypeSelect.appendChild(opt);
        });

        // 식대 UI 자동 전환 힌트
        try { injectUIOnce(); } catch (e) {}
        try { triggerRecalc(); } catch (e) {}
      };
      app.updateEventSubTypes.__ext_patched = true;
      app.updateEventSubTypes.__ext_orig = _origUpdateSub;
    }

    // 2) updatePriceCalculation wrapper: 실제 계산 로직 확장
    if (typeof app.updatePriceCalculation === "function" && !app.updatePriceCalculation.__ext_patched) {
      var _origCalc = app.updatePriceCalculation.bind(app);

      app.updatePriceCalculation = function () {
        // 기존 UI/흐름 보존을 위해, 먼저 UI 삽입을 보장
        try { injectUIOnce(); } catch (e) {}

        var category = getEventCategory();
        var subType = getEventSubType();
        var guestCount = getGuestCount();
        var promo = getPromotionAmount();

        // 값이 없으면 안전하게 0으로
        var base = 0, meal = 0, opt = 0, total = 0;

        // base price
        base = computeBasePrice(subType);

        // meal price
        meal = computeMealPrice(category, subType, guestCount);

        // option price
        opt = computeOptionPrice();

        // promotion
        if (typeof pc.applyPromotion === "function") pc.applyPromotion(promo);
        pc.basePrice = base;
        pc.mealPrice = meal;
        pc.optionPrice = opt;

        if (typeof pc.calculateTotal === "function") total = pc.calculateTotal();
        else total = Math.max(0, base + meal + opt - promo);

        // UI 업데이트 (index.html의 실제 id 사용)
        setPriceUI("basePrice", base, false);
        setPriceUI("additionalMealPrice", meal, false);
        setPriceUI("optionsPrice", opt, false);
        setPriceUI("promotionPrice", promo, true);

        // totalPrice는 <h5 id="totalPrice"><strong>₩0</strong></h5> 구조지만 textContent로 덮어씀
        var totalEl = document.getElementById("totalPrice");
        if (totalEl) {
          if (pc && typeof pc.formatPrice === "function") totalEl.textContent = pc.formatPrice(total);
          else totalEl.textContent = "₩" + (total || 0).toLocaleString("ko-KR");
        }

        // 잔금 계산
        if (typeof app.calculateBalance === "function") {
          try { app.calculateBalance(); } catch (e) {}
        }
      };

      app.updatePriceCalculation.__ext_patched = true;
      app.updatePriceCalculation.__ext_orig = _origCalc;
    }

    // 3) 저장 시 memo 병합: sheetsAPI.create/update wrapper
    if (window.sheetsAPI && !window.sheetsAPI.__ext_patched) {
      var api = window.sheetsAPI;

      function patchMethod(methodName) {
        if (!api[methodName] || api[methodName].__ext_patched) return;
        var _orig = api[methodName].bind(api);

        api[methodName] = async function () {
          var args = Array.prototype.slice.call(arguments);
          // create(data) / update(id, data)
          var dataIndex = (methodName === "update") ? 1 : 0;
          var data = args[dataIndex] || {};

          // 확장 텍스트 생성
          var optObj = collectSelectedOptions();
          var partners = collectPartners();

          var optText = formatOptionsText(optObj);
          var partnerText = formatPartnersText(partners);

          // 기업행사/대관: 음식 항목 메모 추가
          var category = getEventCategory();
          var subType = getEventSubType();
          var foodTextEl = document.getElementById("extManualFoodText");
          var foodText = foodTextEl ? (foodTextEl.value || "").trim() : "";
          var foodLine = "";
          if ((subType === "기업행사" || subType === "대관") && foodText) {
            foodLine = "[음식항목] " + foodText;
          }

          var merged = mergeMemo(data.memo, optText, partnerText);
          if (foodLine && merged.indexOf("[음식항목]") < 0) {
            merged = (merged ? (merged + "\n") : "") + foodLine;
          }

          // args에 반영 (원본 객체를 변경하지 않도록 복사)
          var patchedData = Object.assign({}, data, { memo: merged });
          args[dataIndex] = patchedData;

          return _orig.apply(null, args);
        };
        api[methodName].__ext_patched = true;
        api[methodName].__ext_orig = _orig;
      }

      patchMethod("create");
      patchMethod("update");

      api.__ext_patched = true;
    }

    return true;
  }

  // 초기화: app.init 이후에도 동작하도록 반복 시도(짧게)
  function boot() {
    injectUIOnce();
    if (patchApp()) {
      // 최초 1회 계산 반영
      try { triggerRecalc(); } catch (e) {}
      return;
    }
    // app이 아직 준비 안 됐을 수 있으니 20회까지만 재시도
    var tries = 0;
    var t = setInterval(function () {
      tries += 1;
      injectUIOnce();
      if (patchApp() || tries > 20) clearInterval(t);
      if (tries > 20) clearInterval(t);
    }, 150);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
