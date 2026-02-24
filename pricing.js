
class PricingCalculator {

    static calculate(data) {

        let base = 0;
        let meal = 0;
        let option = 0;

        if(data.category === '웨딩'){
            base = CONFIG.WEDDING_PRICES[data.subType] || 0;
            if(data.guestCount > CONFIG.WEDDING_BASE_GUEST){
                meal = (data.guestCount - CONFIG.WEDDING_BASE_GUEST) * CONFIG.WEDDING_EXTRA_MEAL;
            }
        }else{

            if(data.subType === '기업행사' || data.subType === '대관'){
                meal = data.guestCount * (data.customMeal || 0);
            }else{
                meal = data.guestCount * (CONFIG.MEAL_PRICES[data.mealType] || 0);
            }
        }

        if(data.options){
            data.options.forEach(o=>{
                option += CONFIG.OPTIONS[o] || 0;
            });
        }

        option += data.customOption || 0;

        const total = base + meal + option - (data.promotion || 0);

        return {
            base, meal, option, total
        };
    }
}
