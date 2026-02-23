# 폴라그란데 예약 관리 시스템

복합 이벤트 공간 폴라그란데의 예약·상담 관리 웹 애플리케이션입니다.

## 📋 주요 기능

### 행사 유형
- **웨딩**: 마이크로웨딩(420만원), 하우스웨딩(490만원), 가든웨딩(620만원)
- **행사**: 돌잔치, 가족행사, 기업행사, 대관

### 가격 체계
- 웨딩: 기본 24인 포함, 추가 인당 5.5만원
- 행사: 양식 5.5만원/인, 한식 5.9만원/인
- 기업행사/대관: 수동 입력

### 선택 옵션
- 공간대여 패키지: 60만원
- 폴라돌상 패키지: 50만원
- 그란데돌상 패키지: 70만원
- 생신상 패키지: 20만원
- 음향·마이크: 8만원
- 애프터파티 패키지: 150만원
- 기타 옵션: 자유 입력

### 협력업체
- 사회자, 촬영, 드레스, 메이크업, 생화장식, 부케, 기타

### 인쇄 기능
- A4 세로 2페이지 계약서
- 페이지 1: 상담 정보 및 금액 요약
- 페이지 2: 행사 최종 확인 안내

## 🚀 설치 및 배포

### 1. config.js 설정
```bash
cp config.example.js config.js
# config.js의 API_URL에 Google Apps Script 배포 URL 입력
```

### 2. GitHub Pages 배포
```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

### 3. Google Sheets 연동
1. Google Sheets에서 새 스프레드시트 생성
2. 시트 이름을 `consultations`로 변경
3. 첫 행에 헤더 추가 (id, customerName, phone, eventDate 등)
4. Apps Script 배포 (GoogleAppsScript.gs 참고)
5. config.js에 배포 URL 입력

## 📱 반응형 디자인
- PC (≥1024px): 4열 카드, 2열 폼
- 태블릿 (768-1024px): 2열
- 모바일 (<768px): 단일 열

## 🔒 보안
- config.js는 .gitignore에 포함되어 Git에서 제외됩니다
- 테스트/본서버는 각각 다른 config.js 사용

## 📞 문의
폴라그란데 | 충북 청주
