# 폴라그란데 예약관리 시스템

## 설치 가이드

### 1단계: Google Sheets 생성
1. 새 구글 스프레드시트 생성
2. 시트 이름을 "예약관리"로 변경
3. 첫 행에 다음 헤더 입력:
   ```
   ID | 고객명 | 연락처 | 행사일자 | 행사시간 | 예상인원 | 행사카테고리 | 행사유형 | 
   기본금액 | 추가식대 | 옵션금액 | 프로모션 | 프로모션금액 | 총금액 | 계약금 | 
   잔금 | 지급방식 | 계약상태 | 특이사항 | 등록일
   ```

### 2단계: Google Apps Script 설정
1. 스프레드시트에서 `확장 프로그램` > `Apps Script` 클릭
2. `google-apps-script.js` 파일의 코드를 복사하여 붙여넣기
3. `배포` > `새 배포` 클릭
4. 유형: `웹 앱`
5. 실행 계정: `나`
6. 액세스 권한: `모든 사용자`
7. 배포 후 나오는 URL 복사

### 3단계: config.js 수정
1. `config.js` 파일 열기
2. `API_URL` 값을 2단계에서 복사한 URL로 변경
3. 저장

### 4단계: GitHub Pages 배포
1. GitHub 저장소 생성
2. 모든 파일 업로드
3. Settings > Pages > Source를 `main branch`로 설정
4. 생성된 URL로 접속

## 파일 구조
```
📁 pollagrande/
├── 📄 index.html          # 메인 페이지
├── 📄 config.js           # API 설정
├── 📄 sheets-api.js       # Google Sheets 연동
├── 📄 pricing.js          # 가격 계산
├── 📄 app.js              # 메인 로직
├── 📄 print.html          # 인쇄 페이지
├── 📄 google-apps-script.js  # 백엔드 스크립트
└── 📄 README.md           # 이 파일
```

## 사용 방법
1. 메인 페이지 접속
2. "상담 추가" 버튼 클릭
3. 정보 입력 후 저장
4. 캘린더와 테이블에서 확인
5. 인쇄 아이콘 클릭으로 상담서 출력

## 문의
문제 발생 시 브라우저 콘솔(F12)에서 에러 메시지 확인
