// Google Apps Script 배포 URL을 여기에 입력하세요
// 예시: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbyxlB-aT5lD1ymw0Kqpv-AIlJfOMrExXZzANPj67jQ66Zpgto0VvvUmnnk76Q2pFL-DNg/exec',
    
    // 행사 유형 정의
    EVENT_TYPES: {
        '웨딩': ['마이크로웨딩', '하우스웨딩', '가든웨딩'],
        '행사': ['돌잔치', '가족행사', '기업행사', '대관']
    },
    
    // 기본 가격표 (24인 식대 포함)
    PRICES: {
        '마이크로웨딩': 4200000,
        '하우스웨딩': 4900000,
        '가든웨딩': 6200000,
        '돌잔치': 2000000,
        '가족행사': 2500000,
        '기업행사': 0,
        '대관': 0
    },
    
    // 식사 가격
    MEAL_PRICES: {
        'western': 55000,
        'korean': 59000
    },
    
    // 선택 옵션
    OPTIONS: {
        '공간대여 패키지': 600000,
        '폴라돌상 패키지': 500000,
        '그란데돌상 패키지': 700000,
        '생신상 패키지': 200000,
        '음향·마이크': 80000,
        '애프터파티 패키지': 1500000
    },
    
    // 협력업체 (금액 없음, 체크만)
    PARTNERS: ['사회자', '촬영', '드레스', '메이크업', '생화장식', '부케', '기타']
};
