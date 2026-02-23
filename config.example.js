// config.example.js - 설정 예시 파일
// 실제 사용 시 config.js로 복사하여 API_URL을 설정하세요

const CONFIG = {
    // Google Apps Script 배포 URL을 여기에 입력하세요
    API_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
    
    // 행사 카테고리 및 유형
    EVENT_TYPES: {
        '웨딩': ['마이크로웨딩', '하우스웨딩', '가든웨딩'],
        '행사': ['돌잔치', '가족행사', '기업행사', '대관']
    },
    
    // 웨딩 가격 (24인 포함)
    WEDDING_PRICES: {
        '마이크로웨딩': {
            base: 4200000,
            includedGuests: 24,
            perPerson: 55000
        },
        '하우스웨딩': {
            base: 4900000,
            includedGuests: 24,
            perPerson: 55000
        },
        '가든웨딩': {
            base: 6200000,
            includedGuests: 24,
            perPerson: 55000
        }
    },
    
    // 식사 가격 (1인당)
    MEAL_PRICES: {
        '양식': 55000,
        '한식': 59000
    },
    
    // 선택 옵션
    OPTIONS: [
        { key: 'space', label: '공간대여 패키지', price: 600000, categories: ['웨딩', '행사'] },
        { key: 'dolsang_polar', label: '폴라돌상 패키지', price: 500000, categories: ['행사'], eventTypes: ['돌잔치'] },
        { key: 'dolsang_grande', label: '그란데돌상 패키지', price: 700000, categories: ['행사'], eventTypes: ['돌잔치'] },
        { key: 'birthday_table', label: '생신상 패키지', price: 200000, categories: ['행사'], eventTypes: ['가족행사'] },
        { key: 'sound', label: '음향·마이크', price: 80000, categories: ['웨딩', '행사'] },
        { key: 'afterparty', label: '애프터파티 패키지', price: 1500000, categories: ['웨딩'] }
    ]
};
