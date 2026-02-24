// 메인 애플리케이션 로직

class PollagrandeApp {
    constructor() {
        this.consultations = [];
        this.calendar = null;
        this.currentEditId = null;
    }
    
    // 초기화
    async init() {
        await this.loadData();
        this.initCalendar();
        this.initEventListeners();
        this.updateStatistics();
        this.renderTables();
    }
    
    // 데이터 로드
    async loadData() {
        try {
            this.consultations = await sheetsAPI.fetchAll();
            console.log('데이터 로드 완료:', this.consultations.length + '건');
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            alert('데이터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
        }
    }
    
    // 캘린더 초기화
    initCalendar() {
        const calendarEl = document.getElementById('calendar');
        
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'ko',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            events: this.getCalendarEvents(),
            eventClick: (info) => {
                const id = info.event.id;
                const consultation = this.consultations.find(c => c.ID === id);
                if (consultation) {
                    this.openEditModal(consultation);
                }
            }
        });
        
        this.calendar.render();
    }
    
    // 캘린더 이벤트 데이터 생성
    getCalendarEvents() {
        return this.consultations.map(c => {
            let color = '#ffc107'; // 기본상담
            if (c['계약상태'] === '방문상담') color = '#17a2b8';
            if (c['계약상태'] === '확정') color = '#dc3545';
            
            return {
                id: c.ID,
                title: `${c['고객명']} - ${c['행사유형']}`,
                start: c['행사일자'],
                backgroundColor: color,
                borderColor: color
            };
        });
    }
    
    // 통계 업데이트
    updateStatistics() {
        const hopeCount = this.consultations.filter(c => c['계약상태'] === '기본상담').length;
        const visitCount = this.consultations.filter(c => c['계약상태'] === '방문상담').length;
        const confirmedCount = this.consultations.filter(c => c['계약상태'] === '확정').length;
        
        document.getElementById('hopeCount').textContent = hopeCount;
        document.getElementById('visitCount').textContent = visitCount;
        document.getElementById('confirmedCount').textContent = confirmedCount;
        
        // 월별 매출 계산
        const currentMonth = new Date().getMonth() + 1;
        const monthlyRevenue = this.consultations
            .filter(c => {
                const eventDate = new Date(c['행사일자']);
                return eventDate.getMonth() + 1 === currentMonth && c['계약상태'] === '확정';
            })
            .reduce((sum, c) => sum + (parseFloat(c['총금액']) || 0), 0);
        
        document.getElementById('monthlyRevenue').textContent = pricingCalculator.formatPrice(monthlyRevenue);
    }
    
    // 테이블 렌더링
    renderTables() {
        this.renderConsultTable();
        this.renderContractTable();
        this.renderUpcomingEvents();
    }
    
    // 상담 테이블
    renderConsultTable(filter = null) {
        const tbody = document.getElementById('consultTable');
        let data = this.consultations;
        
        if (filter) {
            data = data.filter(c => c['계약상태'] === filter);
        }
        
        tbody.innerHTML = data.map((c, idx) => `
            <tr onclick="app.openEditModal('${c.ID}')" style="cursor: pointer;">
                <td>${idx + 1}</td>
                <td>${c['고객명']}</td>
                <td>${c['연락처']}</td>
                <td>${c['행사유형']}</td>
                <td>${c['행사일자']}</td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(c['계약상태'])}">
                        ${c['계약상태']}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="event.stopPropagation(); app.printConsultation('${c.ID}')">
                        <i class="bi bi-printer"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); app.deleteConsultation('${c.ID}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    // 계약 테이블
    renderContractTable() {
        const tbody = document.getElementById('contractTable');
        const contracts = this.consultations.filter(c => c['계약상태'] === '확정');
        
        tbody.innerHTML = contracts.map(c => `
            <tr>
                <td>${c.ID}</td>
                <td>${c['고객명']}</td>
                <td>${c['행사일자']}</td>
                <td>${pricingCalculator.formatPrice(c['총금액'])}</td>
                <td>
                    <span class="badge ${c['잔금'] > 0 ? 'bg-warning' : 'bg-success'}">
                        ${c['잔금'] > 0 ? '미완료' : '완료'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.printContract('${c.ID}')">
                        <i class="bi bi-file-pdf"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    // 다가오는 행사
    renderUpcomingEvents() {
        const container = document.getElementById('upcomingEvents');
        const today = new Date();
        const upcoming = this.consultations
            .filter(c => new Date(c['행사일자']) >= today)
            .sort((a, b) => new Date(a['행사일자']) - new Date(b['행사일자']))
            .slice(0, 5);
        
        container.innerHTML = upcoming.map(c => `
            <div class="list-group-item" onclick="app.openEditModal('${c.ID}')" style="cursor: pointer;">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${c['고객명']}</h6>
                    <small>${c['행사일자']}</small>
                </div>
                <p class="mb-1">${c['행사유형']} - ${c['예상인원']}명</p>
                <small class="text-muted">${c['행사시간']}</small>
            </div>
        `).join('');
    }
    
    // 상태 배지 클래스
    getStatusBadgeClass(status) {
        if (status === '기본상담') return 'bg-warning text-dark';
        if (status === '방문상담') return 'bg-info';
        if (status === '확정') return 'bg-danger';
        return 'bg-secondary';
    }
    
    // 이벤트 리스너 초기화
    initEventListeners() {
        // 상담 추가 버튼
        document.getElementById('addConsultBtn').addEventListener('click', () => {
            this.openNewModal();
        });
        
        // 저장 버튼
        document.getElementById('saveConsultBtn').addEventListener('click', () => {
            this.saveConsultation();
        });
        
        // 행사 카테고리 변경
        document.getElementById('eventCategory').addEventListener('change', (e) => {
            this.updateEventSubTypes(e.target.value);
        });
        
        // 행사 유형 변경
        document.getElementById('eventSubType').addEventListener('change', () => {
            this.updatePriceCalculation();
        });
        
        // 검색
        document.getElementById('consultSearch').addEventListener('input', (e) => {
            this.searchConsultations(e.target.value);
        });
        
        // 통계 카드 클릭
        document.querySelectorAll('.card[onclick]').forEach(card => {
            const onclick = card.getAttribute('onclick');
            const status = onclick.match(/'([^']+)'/)[1];
            card.addEventListener('click', () => this.filterByStatus(status));
        });
    }
    
    // 새 상담 모달
    openNewModal() {
        this.currentEditId = null;
        document.getElementById('consultForm').reset();
        document.getElementById('eventSubType').disabled = true;
        const modal = new bootstrap.Modal(document.getElementById('consultModal'));
        modal.show();
    }
    
    // 수정 모달
    openEditModal(id) {
        const consultation = this.consultations.find(c => c.ID === id);
        if (!consultation) return;
        
        this.currentEditId = id;
        
        // 폼 채우기
        document.getElementById('customerName').value = consultation['고객명'];
        document.getElementById('customerPhone').value = consultation['연락처'];
        document.getElementById('eventDate').value = consultation['행사일자'];
        document.getElementById('eventTime').value = consultation['행사시간'];
        document.getElementById('guestCount').value = consultation['예상인원'];
        document.getElementById('eventCategory').value = consultation['행사카테고리'];
        
        this.updateEventSubTypes(consultation['행사카테고리']);
        document.getElementById('eventSubType').value = consultation['행사유형'];
        
        document.getElementById('promotion').value = consultation['프로모션'] || '';
        document.getElementById('promotionAmount').value = consultation['프로모션금액'] || 0;
        document.getElementById('contractStatus').value = consultation['계약상태'];
        document.getElementById('depositAmount').value = consultation['계약금'] || 0;
        document.getElementById('paymentMethod').value = consultation['지급방식'] || '현금';
        document.getElementById('consultMemo').value = consultation['특이사항'] || '';
        
        this.updatePriceCalculation();
        
        const modal = new bootstrap.Modal(document.getElementById('consultModal'));
        modal.show();
    }
    
    // 행사 하위 유형 업데이트
    updateEventSubTypes(category) {
        const subTypeSelect = document.getElementById('eventSubType');
        subTypeSelect.disabled = false;
        subTypeSelect.innerHTML = '<option value="">선택하세요</option>';
        
        if (CONFIG.EVENT_TYPES[category]) {
            CONFIG.EVENT_TYPES[category].forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                subTypeSelect.appendChild(option);
            });
        }
    }
    
    // 가격 계산 업데이트
    updatePriceCalculation() {
        const eventSubType = document.getElementById('eventSubType').value;
        const guestCount = parseInt(document.getElementById('guestCount').value) || 0;
        const promotionAmount = parseInt(document.getElementById('promotionAmount').value) || 0;
        
        // 기본 금액
        const basePrice = pricingCalculator.calculateBasePrice(eventSubType);
        
        // 추가 식대 (간단히 0으로 설정, 필요시 수정)
        const mealPrice = 0;
        
        // 옵션 (간단히 0으로 설정, 필요시 체크박스 추가)
        const optionPrice = 0;
        
        // 프로모션
        pricingCalculator.applyPromotion(promotionAmount);
        
        // 총액
        pricingCalculator.basePrice = basePrice;
        pricingCalculator.mealPrice = mealPrice;
        pricingCalculator.optionPrice = optionPrice;
        const totalPrice = pricingCalculator.calculateTotal();
        
        // UI 업데이트
        document.getElementById('basePrice').textContent = pricingCalculator.formatPrice(basePrice);
        document.getElementById('additionalMealPrice').textContent = pricingCalculator.formatPrice(mealPrice);
        document.getElementById('optionsPrice').textContent = pricingCalculator.formatPrice(optionPrice);
        document.getElementById('promotionPrice').textContent = '-' + pricingCalculator.formatPrice(promotionAmount);
        document.getElementById('totalPrice').textContent = pricingCalculator.formatPrice(totalPrice);
        
        // 잔금 계산
        this.calculateBalance();
    }
    
    // 잔금 계산
    calculateBalance() {
        const totalPrice = pricingCalculator.calculateTotal();
        const depositAmount = parseInt(document.getElementById('depositAmount').value) || 0;
        const balance = pricingCalculator.calculateBalance(totalPrice, depositAmount);
        
        document.getElementById('balanceAmount').value = pricingCalculator.formatPrice(balance);
    }
    
    // 상담 저장
    async saveConsultation() {
        const formData = {
            customerName: document.getElementById('customerName').value,
            customerPhone: document.getElementById('customerPhone').value,
            eventDate: document.getElementById('eventDate').value,
            eventTime: document.getElementById('eventTime').value,
            guestCount: document.getElementById('guestCount').value,
            eventCategory: document.getElementById('eventCategory').value,
            eventSubType: document.getElementById('eventSubType').value,
            basePrice: pricingCalculator.basePrice,
            mealPrice: pricingCalculator.mealPrice,
            optionPrice: pricingCalculator.optionPrice,
            promotion: document.getElementById('promotion').value,
            promotionAmount: parseInt(document.getElementById('promotionAmount').value) || 0,
            totalPrice: pricingCalculator.calculateTotal(),
            depositAmount: parseInt(document.getElementById('depositAmount').value) || 0,
            balanceAmount: pricingCalculator.calculateBalance(
                pricingCalculator.calculateTotal(),
                parseInt(document.getElementById('depositAmount').value) || 0
            ),
            paymentMethod: document.getElementById('paymentMethod').value,
            contractStatus: document.getElementById('contractStatus').value,
            memo: document.getElementById('consultMemo').value
        };
        
        try {
            if (this.currentEditId) {
                await sheetsAPI.update(this.currentEditId, formData);
                alert('수정되었습니다.');
            } else {
                await sheetsAPI.create(formData);
                alert('저장되었습니다.');
            }
            
            // 모달 닫기
            const modal = bootstrap.Modal.getInstance(document.getElementById('consultModal'));
            modal.hide();
            
            // 데이터 새로고침
            await this.loadData();
            this.calendar.removeAllEvents();
            this.calendar.addEventSource(this.getCalendarEvents());
            this.updateStatistics();
            this.renderTables();
            
        } catch (error) {
            alert('저장 실패: ' + error.message);
        }
    }
    
    // 상담 삭제
    async deleteConsultation(id) {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        
        try {
            await sheetsAPI.delete(id);
            alert('삭제되었습니다.');
            
            await this.loadData();
            this.calendar.removeAllEvents();
            this.calendar.addEventSource(this.getCalendarEvents());
            this.updateStatistics();
            this.renderTables();
        } catch (error) {
            alert('삭제 실패: ' + error.message);
        }
    }
    
    // 상담서 인쇄
    printConsultation(id) {
        const consultation = this.consultations.find(c => c.ID === id);
        if (!consultation) return;
        
        const params = new URLSearchParams({
            customerName: consultation['고객명'],
            customerPhone: consultation['연락처'],
            eventDate: consultation['행사일자'],
            eventTime: consultation['행사시간'],
            guestCount: consultation['예상인원'],
            eventCategory: consultation['행사카테고리'],
            eventSubType: consultation['행사유형'],
            basePrice: consultation['기본금액'],
            mealPrice: consultation['추가식대'],
            optionPrice: consultation['옵션금액'],
            promotionText: consultation['프로모션'],
            promotion: consultation['프로모션금액'],
            totalPrice: consultation['총금액'],
            depositAmount: consultation['계약금'],
            balanceAmount: consultation['잔금'],
            options: '없음'
        });
        
        window.open('print.html?' + params.toString(), '_blank');
    }
    
    // 계약서 인쇄
    printContract(id) {
        this.printConsultation(id); // 같은 페이지 사용
    }
    
    // 검색
    searchConsultations(keyword) {
        const filtered = this.consultations.filter(c => 
            c['고객명'].includes(keyword) || 
            c['연락처'].includes(keyword)
        );
        
        const tbody = document.getElementById('consultTable');
        tbody.innerHTML = filtered.map((c, idx) => `
            <tr onclick="app.openEditModal('${c.ID}')" style="cursor: pointer;">
                <td>${idx + 1}</td>
                <td>${c['고객명']}</td>
                <td>${c['연락처']}</td>
                <td>${c['행사유형']}</td>
                <td>${c['행사일자']}</td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(c['계약상태'])}">
                        ${c['계약상태']}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="event.stopPropagation(); app.printConsultation('${c.ID}')">
                        <i class="bi bi-printer"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); app.deleteConsultation('${c.ID}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    // 상태별 필터
    filterByStatus(status) {
        this.renderConsultTable(status);
    }
}

// 전역 인스턴스
const app = new PollagrandeApp();

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
