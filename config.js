
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbyxlB-aT5lD1ymw0Kqpv-AIlJfOMrExXZzANPj67jQ66Zpgto0VvvUmnnk76Q2pFL-DNg/exec',

    EVENT_TYPES: {
        '웨딩': [
            '마이크로웨딩(24인 식대포함 420만원)',
            '하우스웨딩(24인 식대포함 490만원)',
            '가든웨딩(24인 식대포함 620만원)'
        ],
        '행사': [
            '돌잔치',
            '가족행사',
            '기업행사',
            '대관'
        ]
    },

    WEDDING_BASE_GUEST: 24,
    WEDDING_EXTRA_MEAL: 55000,

    MEAL_PRICES: {
        western: 55000,
        korean: 59000
    },

    WEDDING_PRICES: {
        '마이크로웨딩(24인 식대포함 420만원)': 4200000,
        '하우스웨딩(24인 식대포함 490만원)': 4900000,
        '가든웨딩(24인 식대포함 620만원)': 6200000
    },

    OPTIONS: {
        '공간대여 패키지': 600000,
        '폴라돌상 패키지': 500000,
        '그란데돌상 패키지': 700000,
        '생신상 패키지': 200000,
        '음향.마이크': 80000,
        '애프터파티 패키지': 1500000
    }
};
