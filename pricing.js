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
    
    // 웨딩 추가 식대 계산 (25인부터 추가)
    calculateWeddingMealPrice(guestCount) {
        if (guestCount <= 24) {
            this.mealPrice = 0;
        } else {
            const additionalGuests = guestCount - 24;
            this.mealPrice = additionalGuests * 55000;
        }
        return this.mealPrice;
    }
    
    // 행사 식대 계산
    calculateEventMealPrice(guestCount, mealType, customPrice = 0) {
        if (customPrice > 0) {
            // 기업행사/대관 - 직접입력
            this.mealPrice = guestCount * customPrice;
        } else {
            // 돌잔치/가족행사 - 양식/한식
            const pricePerPerson = CONFIG.MEAL_PRICES[mealType] || 0;
            this.mealPrice = guestCount * pricePerPerson;
        }
        return this.mealPrice;
    }
    
    // 옵션 금액 계산
    calculateOptionPrice(selectedOptions) {
        this.optionPrice = 0;
        selectedOptions.forEach(option => {
            if (option.type === '기타옵션' && option.customPrice) {
                this.optionPrice += option.customPrice;
            } else {
                this.optionPrice += CONFIG.OPTIONS[option.type] || 0;
            }
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
