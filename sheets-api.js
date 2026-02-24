class SheetsAPI {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }
    
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

const sheetsAPI = new SheetsAPI(CONFIG.API_URL);