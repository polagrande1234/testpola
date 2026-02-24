// Google Sheets API 연동 함수들

class SheetsAPI {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }
    
    // 모든 데이터 가져오기
    async fetchAll() {
        try {
            const response = await fetch(this.apiUrl);
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || '데이터 로딩 실패');
            }
            
            return result.data || [];
        } catch (error) {
            console.error('데이터 로딩 에러:', error);
            return [];
        }
    }
    
    // 새 예약 추가
    async create(data) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'create', ...data })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || '저장 실패');
            }
            
            return result;
        } catch (error) {
            console.error('저장 에러:', error);
            throw error;
        }
    }
    
    // 예약 수정
    async update(id, data) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'update', id, ...data })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || '수정 실패');
            }
            
            return result;
        } catch (error) {
            console.error('수정 에러:', error);
            throw error;
        }
    }
    
    // 예약 삭제
    async delete(id) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'delete', id })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || '삭제 실패');
            }
            
            return result;
        } catch (error) {
            console.error('삭제 에러:', error);
            throw error;
        }
    }
}

// 전역 인스턴스 생성
const sheetsAPI = new SheetsAPI(CONFIG.API_URL);
