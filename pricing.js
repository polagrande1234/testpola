class PricingCalculator {
    constructor() {
        this.basePrice = 0;
        this.mealPrice = 0;
        this.optionPrice = 0;
        this.promotionAmount = 0;
    }
    
    calculateBasePrice(eventSubType) {
        this.basePrice = CONFIG.PRICES[eventSubType] || 0;
        return this.basePrice;
    }
    
    calculateMealPrice(guestCount, eventSubType, mealType, customMealPrice = 0) {
        const weddingTypes = ['마이크로웨딩', '하우스웨딩', '가든웨딩'];
        
        if (weddingTypes.includes(eventSubType)) {
            const baseGuests = 24;
            const additionalGuests = Math.max(0, guestCount - baseGuests);
            this.mealPrice = additionalGuests * 55000;
        } else {
            if (mealType === 'custom') {
                this.mealPrice = guestCount * customMealPrice;
            } else if (mealType === 'western' || mealType === 'korean') {
                const pricePerPerson = CONFIG.MEAL_PRICES[mealType] || 0;
                this.mealPrice = guestCount * pricePerPerson;
            } else {
                this.mealPrice = 0;
            }
        }
        
        return this.mealPrice;
    }
    
    calculateOptionPrice() {
        this.optionPrice = 0;
        
        for (let i = 1; i <= 6; i++) {
            const checkbox = document.getElementById('opt' + i);
            if (checkbox && checkbox.checked) {
                this.optionPrice += parseInt(checkbox.value) || 0;
            }
        }
        
        const opt7 = document.getElementById('opt7');
        if (opt7 && opt7.checked) {
            const customPrice = parseInt(document.getElementById('customOptionPrice')?.value) || 0;
            this.optionPrice += customPrice;
        }
        
        return this.optionPrice;
    }
    
    applyPromotion(amount) {
        this.promotionAmount = Math.max(0, parseInt(amount) || 0);
        return this.promotionAmount;
    }
    
    calculateTotal() {
        return Math.max(0, this.basePrice + this.mealPrice + this.optionPrice - this.promotionAmount);
    }
    
    calculateBalance(depositAmount) {
        return Math.max(0, this.calculateTotal() - (parseInt(depositAmount) || 0));
    }
}