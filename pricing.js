// pricing.js - 가격 계산 로직

const PricingCalculator = {
    // 웨딩 가격 계산
    calculateWeddingPrice(eventType, guestCount, selectedOptions) {
        const weddingConfig = CONFIG.WEDDING_PRICES[eventType];
        if (!weddingConfig) return { base: 0, meal: 0, options: 0 };

        let basePrice = weddingConfig.base;
        let mealPrice = 0;

        // 24명 이상일 때만 추가 인당 식대 계산
        if (guestCount > weddingConfig.includedGuests) {
            const extraGuests = guestCount - weddingConfig.includedGuests;
            mealPrice = extraGuests * weddingConfig.perPerson;
        }

        // 옵션 가격 계산
        const optionPrice = this.calculateOptions(selectedOptions);

        return {
            base: basePrice,
            meal: mealPrice,
            options: optionPrice
        };
    },

    // 행사 가격 계산
    calculateEventPrice(guestCount, mealType, selectedOptions) {
        let mealPrice = 0;

        if (mealType && CONFIG.MEAL_PRICES[mealType]) {
            mealPrice = guestCount * CONFIG.MEAL_PRICES[mealType];
        }

        const optionPrice = this.calculateOptions(selectedOptions);

        return {
            base: 0, // 행사는 기본 금액 없음
            meal: mealPrice,
            options: optionPrice
        };
    },

    // 옵션 가격 계산
    calculateOptions(selectedOptions) {
        let total = 0;
        
        if (Array.isArray(selectedOptions)) {
            selectedOptions.forEach(optionKey => {
                const option = CONFIG.OPTIONS.find(opt => opt.key === optionKey);
                if (option) {
                    total += option.price;
                }
            });
        }

        return total;
    },

    // 최종 금액 계산
    calculateTotal(basePrice, mealPrice, optionPrice, promotionAmount, depositAmount) {
        const subtotal = basePrice + mealPrice + optionPrice;
        const totalPrice = subtotal - promotionAmount;
        const balancePrice = totalPrice - depositAmount;

        return {
            subtotal,
            totalPrice,
            balancePrice
        };
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PricingCalculator;
}
