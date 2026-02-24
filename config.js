// Google Apps Script 배포 URL을 여기에 입력하세요
// 예시: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbyxlB-aT5lD1ymw0Kqpv-AIlJfOMrExXZzANPj67jQ66Zpgto0VvvUmnnk76Q2pFL-DNg/exec',
    
    // 행사 유형 정의
    EVENT_TYPES: {
        '웨딩': ['스몰웨딩', '프라이빗웨딩', '가든웨딩'],
        '행사': ['돌잔치', '칠순/팔순', '기업행사', '브런치모임']
    },
    
    // 기본 가격표
    PRICES: {
        '스몰웨딩': 3500000,
        '프라이빗웨딩': 5000000,
        '가든웨딩': 6000000,
        '돌잔치': 2000000,
        '칠순/팔순': 2500000,
        '기업행사': 3000000,
        '브런치모임': 1500000
    },
    
    // 식사 가격
    MEAL_PRICES: {
        'western': 55000,
        'korean': 59000
    },
    
    // 추가 옵션
    OPTIONS: {
        '사진촬영': 500000,
        '영상촬영': 800000,
        '플라워장식': 300000,
        '음향설비': 200000,
        '사회자': 400000
    }
};
