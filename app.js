
document.addEventListener("DOMContentLoaded",()=>{

    const categorySelect = document.getElementById("category");
    const subSelect = document.getElementById("subType");
    const optionArea = document.getElementById("optionArea");

    Object.keys(CONFIG.EVENT_TYPES).forEach(cat=>{
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        categorySelect.appendChild(opt);
    });

    function loadSubTypes(){
        subSelect.innerHTML="";
        CONFIG.EVENT_TYPES[categorySelect.value].forEach(s=>{
            const opt=document.createElement("option");
            opt.value=s;
            opt.textContent=s;
            subSelect.appendChild(opt);
        });
    }

    loadSubTypes();
    categorySelect.addEventListener("change",loadSubTypes);

    Object.keys(CONFIG.OPTIONS).forEach(o=>{
        const label=document.createElement("label");
        label.innerHTML=`<input type="checkbox" value="${o}"> ${o}`;
        optionArea.appendChild(label);
        optionArea.appendChild(document.createElement("br"));
    });

});

function calculate(){

    const data={
        category:category.value,
        subType:subType.value,
        guestCount:parseInt(guest.value)||0,
        mealType:mealType.value,
        customMeal:parseInt(customMeal.value)||0,
        customOption:parseInt(customOption.value)||0,
        promotion:parseInt(promotion.value)||0,
        options:[...document.querySelectorAll("#optionArea input:checked")].map(c=>c.value)
    };

    const resultData = PricingCalculator.calculate(data);

    document.getElementById("result").innerText =
        "총 금액 : ₩"+ resultData.total.toLocaleString();
}
