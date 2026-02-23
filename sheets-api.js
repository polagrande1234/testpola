// sheets-api.js - Google Sheets API 통신

class SheetsAPI {
    constructor() {
        this.apiUrl = CONFIG.API_URL;
    }

    // 모든 상담 불러오기
    async fetchAll() {
        try {
            const response = await fetch(this.apiUrl);
            const result = await response.json();
            
            if (result.status === 'success') {
                return result.data;
            } else {
                throw new Error(result.message || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching consultations:', error);
            throw error;
        }
    }

    // 새 상담 추가
    async create(data) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'create',
                    ...data
                })
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                return result;
            } else {
                throw new Error(result.message || 'Failed to create consultation');
            }
        } catch (error) {
            console.error('Error creating consultation:', error);
            throw error;
        }
    }

    // 상담 수정
    async update(id, data) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'update',
                    id: id,
                    ...data
                })
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                return result;
            } else {
                throw new Error(result.message || 'Failed to update consultation');
            }
        } catch (error) {
            console.error('Error updating consultation:', error);
            throw error;
        }
    }

    // 상담 삭제
    async delete(id) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'delete',
                    id: id
                })
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                return result;
            } else {
                throw new Error(result.message || 'Failed to delete consultation');
            }
        } catch (error) {
            console.error('Error deleting consultation:', error);
            throw error;
        }
    }
}

// Global instance
const sheetsAPI = new SheetsAPI();
