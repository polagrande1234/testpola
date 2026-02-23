// Google Apps Script 배포 URL을 여기에 입력하세요
// 예시: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

const CONFIG = {
    API_URL: '',
    
    // 행사 유형 정의
    EVENT_TYPES: {
        '웨딩': ['마이크로웨딩', '하우스웨딩', '가든웨딩'],
        '행사': ['돌잔치', '가족행사', '기업행사', '대관']
    },
    
    // 웨딩 기본 가격표 (24인 식대포함)
    WEDDING_PRICES: {
        '마이크로웨딩': { base: 4200000, includedGuests: 24, perPerson: 55000 },
        '하우스웨딩': { base: 4900000, includedGuests: 24, perPerson: 55000 },
        '가든웨딩': { base: 6200000, includedGuests: 24, perPerson: 55000 }
    },
    
    // 행사 식사 가격
    MEAL_PRICES: {
        '양식': 55000,
        '한식케이터링': 59000
    },
    
    // 추가 옵션
    OPTIONS: {
        '공간대여패키지': 600000,
        '폴라돌상패키지': 500000,
        '그란데돌상패키지': 700000,
        '생신상패키지': 200000,
        '음향마이크': 80000,
        '애프터파티패키지': 1500000
    },
    
    // 협력업체 목록
    PARTNERS: ['사회자', '촬영', '드레스', '메이크업', '생화장식', '부케', '기타']
};
