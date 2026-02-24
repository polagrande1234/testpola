
(function () {

  const BASE_WEDDING_PRICE = 4900000;
  const BASE_WEDDING_COUNT = 24;

  const OPTION_PRICES = {
    space: 500000,
    flora: 800000,
    grande: 1200000,
    baby: 700000,
    sound: 300000,
    after: 600000
  };

  function getValue(name) {
    return document.querySelector(`[name="${name}"]`)?.value || "";
  }

  function getNumber(name) {
    return Number(getValue(name) || 0);
  }

  function getChecked(id) {
    return document.getElementById(id)?.checked || false;
  }

  function calculateExtension() {

    let total = 0;
    const category = getValue("category");
    const guests = getNumber("guests");
    const mealPrice = getNumber("mealPrice");

    if (category.includes("웨딩")) {
      total += BASE_WEDDING_PRICE;
      if (guests > BASE_WEDDING_COUNT) {
        total += (guests - BASE_WEDDING_COUNT) * mealPrice;
      }
    }

    if (category.includes("행사")) {
      total += guests * mealPrice;
    }

    Object.keys(OPTION_PRICES).forEach(key => {
      if (getChecked(key)) {
        total += OPTION_PRICES[key];
      }
    });

    return total;
  }

  function injectUI() {

    const container = document.createElement("div");
    container.style.marginTop = "40px";
    container.innerHTML = `
      <h3>협력업체 관리</h3>
      <input type="text" id="partnerName" placeholder="업체명"><br><br>
      <input type="number" id="partnerDeposit" placeholder="계약금"><br><br>
      <input type="number" id="partnerBalance" placeholder="잔금"><br><br>
      <label>
        <input type="checkbox" id="partnerPaid">
        지급완료
      </label>
      <hr>
      <div>
        확장 계산 금액: <span id="extensionAmount">0</span> 원
      </div>
    `;

    document.body.appendChild(container);
  }

  function liveUpdate() {
    function update() {
      const total = calculateExtension();
      const display = document.getElementById("extensionAmount");
      if (display) display.textContent = total.toLocaleString();
    }
    document.addEventListener("input", update);
    document.addEventListener("change", update);
  }

  function wrapExistingFunctions() {

    if (typeof window.calculateAmount === "function") {
      const original = window.calculateAmount;
      window.calculateAmount = function () {
        original();
        const extensionTotal = calculateExtension();
        const totalField = document.getElementById("totalAmount");
        if (totalField) {
          const current = Number(totalField.value || 0);
          totalField.value = current + extensionTotal;
        }
      };
    }

    if (typeof window.saveData === "function") {
      const originalSave = window.saveData;
      window.saveData = function () {

        window.extensionData = {
          partnerName: document.getElementById("partnerName")?.value || "",
          partnerDeposit: document.getElementById("partnerDeposit")?.value || 0,
          partnerBalance: document.getElementById("partnerBalance")?.value || 0,
          partnerPaid: getChecked("partnerPaid"),
          extensionAmount: calculateExtension()
        };

        originalSave();
      };
    }
  }

  window.addEventListener("DOMContentLoaded", function () {
    injectUI();
    liveUpdate();
    wrapExistingFunctions();
  });

})();
