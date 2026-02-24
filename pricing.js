// 가격 계산 로직

class PricingCalculator {
    constructor() {
        this.basePrice = 0;
        this.mealPrice = 0;
        this.optionPrice = 0;
        this.promotionAmount = 0;
    }
    
    // 기본 금액 계산
    calculateBasePrice(eventSubType) {
        this.basePrice = CONFIG.PRICES[eventSubType] || 0;
        return this.basePrice;
    }
    
    // 추가 식대 계산
    calculateMealPrice(guestCount, mealType, baseGuests = 0) {
        const additionalGuests = Math.max(0, guestCount - baseGuests);
        const pricePerPerson = CONFIG.MEAL_PRICES[mealType] || 0;
        this.mealPrice = additionalGuests * pricePerPerson;
        return this.mealPrice;
    }
    
    // 옵션 금액 계산
    calculateOptionPrice(selectedOptions) {
        this.optionPrice = 0;
        selectedOptions.forEach(option => {
            this.optionPrice += CONFIG.OPTIONS[option] || 0;
        });
        return this.optionPrice;
    }
    
    // 프로모션 적용
    applyPromotion(amount) {
        this.promotionAmount = Math.max(0, amount);
        return this.promotionAmount;
    }
    
    // 총 금액 계산
    calculateTotal() {
        return Math.max(0, this.basePrice + this.mealPrice + this.optionPrice - this.promotionAmount);
    }
    
    // 잔금 계산
    calculateBalance(totalPrice, depositAmount) {
        return Math.max(0, totalPrice - depositAmount);
    }
    
    // 금액 포맷팅
    formatPrice(price) {
        return '₩' + price.toLocaleString('ko-KR');
    }
    
    // 전체 계산 결과 반환
    getCalculation() {
        return {
            basePrice: this.basePrice,
            mealPrice: this.mealPrice,
            optionPrice: this.optionPrice,
            promotionAmount: this.promotionAmount,
            totalPrice: this.calculateTotal()
        };
    }
}

// 전역 인스턴스
const pricingCalculator = new PricingCalculator();
