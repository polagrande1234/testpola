class PollagrandeApp {
    constructor() {
        this.consultations = [];
        this.calendar = null;
        this.currentEditId = null;
        this.calculator = new PricingCalculator();
        this.modal = null;
    }
    
    async init() {
        await this.loadData();
        this.initCalendar();
        this.initEventListeners();
        this.updateStatistics();
        this.renderTables();
        this.modal = new bootstrap.Modal(document.getElementById('consultationModal'));
    }
    
    async loadData() {
        try {
            this.consultations = await sheetsAPI.fetchAll();
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            alert('데이터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
        }
    }
    
    initCalendar() {
        const calendarEl = document.getElementById('calendar');
        
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: window.innerWidth < 768 ? 'listWeek' : 'dayGridMonth',
            locale: 'ko',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: window.innerWidth < 768 ? 'listWeek' : 'dayGridMonth,timeGridWeek,listWeek'
            },
            events: [],
            eventClick: (info) => {
                const consultation = this.consultations.find(c => c.id === info.event.id);
                if (consultation) {
                    this.openModal(consultation);
                }
            },
            height: 'auto'
        });
        
        this.calendar.render();
        this.updateCalendarEvents();
    }
    
    updateCalendarEvents() {
        if (!this.calendar) return;
        
        this.calendar.removeAllEvents();
        
        this.consultations.forEach(consultation => {
            if (consultation.eventDate && consultation.contractStatus !== '취소') {
                this.calendar.addEvent({
                    id: consultation.id,
                    title: `${consultation.customerName} - ${consultation.eventSubType}`,
                    start: consultation.eventDate,
                    backgroundColor: this.getStatusColor(consultation.contractStatus),
                    borderColor: this.getStatusColor(consultation.contractStatus)
                });
            }
        });
    }
    
    getStatusColor(status) {
        const colors = {
            '기본상담': '#ffc107',
            '계약체결': '#17a2b8',
            '행사완료': '#28a745',
            '취소': '#dc3545'
        };
        return colors[status] || '#6c757d';
    }
    
    initEventListeners() {
        document.getElementById('eventCategory').addEventListener('change', (e) => {
            this.updateEventSubTypes(e.target.value);
        });
        
        document.getElementById('eventSubType').addEventListener('change', () => {
            this.updateMealOptions();
            this.calculatePrice();
        });
        
        document.getElementById('guestCount').addEventListener('input', () => {
            this.calculatePrice();
        });
        
        document.getElementById('mealType').addEventListener('change', (e) => {
            const customMealGroup = document.getElementById('customMealGroup');
            if (e.target.value === 'custom') {
                customMealGroup.style.display = 'block';
            } else {
                customMealGroup.style.display = 'none';
            }
            this.calculatePrice();
        });
        
        document.getElementById('customMealPrice').addEventListener('input', () => {
            this.calculatePrice();
        });
        
        for (let i = 1; i <= 7; i++) {
            const checkbox = document.getElementById('opt' + i);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    if (i === 7) {
                        const customGroup = document.getElementById('customOptionGroup');
                        if (checkbox.checked) {
                            customGroup.style.display = 'block';
                        } else {
                            customGroup.style.display = 'none';
                        }
                    }
                    this.calculatePrice();
                });
            }
        }
        
        const customOptionName = document.getElementById('customOptionName');
        const customOptionPrice = document.getElementById('customOptionPrice');
        
        if (customOptionName) {
            customOptionName.addEventListener('input', () => {
                this.calculatePrice();
            });
        }
        
        if (customOptionPrice) {
            customOptionPrice.addEventListener('input', () => {
                this.calculatePrice();
            });
        }
        
        document.getElementById('promotionAmount').addEventListener('input', () => {
            this.calculatePrice();
        });
        
        document.getElementById('depositAmount').addEventListener('input', () => {
            this.calculatePrice();
        });
        
        for (let i = 1; i <= 7; i++) {
            const checkbox = document.getElementById('partner' + i);
            const detail = document.getElementById('partner' + i + 'Detail');
            if (checkbox && detail) {
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        detail.style.display = 'block';
                    } else {
                        detail.style.display = 'none';
                        detail.value = '';
                    }
                });
            }
        }
    }
    
    updateEventSubTypes(category) {
        const subTypeSelect = document.getElementById('eventSubType');
        subTypeSelect.innerHTML = '<option value="">선택하세요</option>';
        
        if (category && CONFIG.EVENT_TYPES[category]) {
            CONFIG.EVENT_TYPES[category].forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                subTypeSelect.appendChild(option);
            });
        }
        
        this.updateMealOptions();
        this.calculatePrice();
    }
    
    updateMealOptions() {
        const eventSubType = document.getElementById('eventSubType').value;
        const mealTypeGroup = document.getElementById('mealTypeGroup');
        const weddingTypes = ['마이크로웨딩', '하우스웨딩', '가든웨딩'];
        
        if (weddingTypes.includes(eventSubType)) {
            mealTypeGroup.style.display = 'none';
            document.getElementById('mealType').value = '';
            document.getElementById('customMealGroup').style.display = 'none';
        } else if (eventSubType) {
            mealTypeGroup.style.display = 'block';
        } else {
            mealTypeGroup.style.display = 'none';
        }
    }
    
    calculatePrice() {
        const eventSubType = document.getElementById('eventSubType').value;
        const guestCount = parseInt(document.getElementById('guestCount').value) || 0;
        const mealType = document.getElementById('mealType').value;
        const customMealPrice = parseInt(document.getElementById('customMealPrice')?.value) || 0;
        const promotionAmount = parseInt(document.getElementById('promotionAmount').value) || 0;
        const depositAmount = parseInt(document.getElementById('depositAmount').value) || 0;
        
        this.calculator.calculateBasePrice(eventSubType);
        this.calculator.calculateMealPrice(guestCount, eventSubType, mealType, customMealPrice);
        this.calculator.calculateOptionPrice();
        this.calculator.applyPromotion(promotionAmount);
        
        const totalPrice = this.calculator.calculateTotal();
        const balanceAmount = this.calculator.calculateBalance(depositAmount);
        
        document.getElementById('displayBasePrice').textContent = this.formatCurrency(this.calculator.basePrice);
        document.getElementById('displayMealPrice').textContent = this.formatCurrency(this.calculator.mealPrice);
        document.getElementById('displayOptionPrice').textContent = this.formatCurrency(this.calculator.optionPrice);
        document.getElementById('displayPromotion').textContent = '-' + this.formatCurrency(this.calculator.promotionAmount);
        document.getElementById('displayTotalPrice').textContent = this.formatCurrency(totalPrice);
        document.getElementById('displayBalance').textContent = this.formatCurrency(balanceAmount);
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    }
    
    openModal(consultation = null) {
        this.currentEditId = consultation ? consultation.id : null;
        
        document.getElementById('modalTitle').textContent = consultation ? '상담 수정' : '새 상담 등록';
        document.getElementById('consultationForm').reset();
        
        document.getElementById('customOptionGroup').style.display = 'none';
        document.getElementById('customMealGroup').style.display = 'none';
        document.getElementById('mealTypeGroup').style.display = 'none';
        
        for (let i = 1; i <= 7; i++) {
            const detail = document.getElementById('partner' + i + 'Detail');
            if (detail) {
                detail.style.display = 'none';
            }
        }
        
        if (consultation) {
            document.getElementById('customerName').value = consultation.customerName || '';
            document.getElementById('customerPhone').value = consultation.customerPhone || '';
            document.getElementById('eventDate').value = consultation.eventDate || '';
            document.getElementById('eventTime').value = consultation.eventTime || '';
            document.getElementById('guestCount').value = consultation.guestCount || '';
            document.getElementById('eventCategory').value = consultation.eventCategory || '';
            
            this.updateEventSubTypes(consultation.eventCategory);
            
            document.getElementById('eventSubType').value = consultation.eventSubType || '';
            
            this.updateMealOptions();
            
            document.getElementById('promotion').value = consultation.promotion || '';
            document.getElementById('promotionAmount').value = consultation.promotionAmount || 0;
            document.getElementById('paymentMethod').value = consultation.paymentMethod || '계좌이체';
            document.getElementById('depositAmount').value = consultation.depositAmount || 0;
            document.getElementById('contractStatus').value = consultation.contractStatus || '기본상담';
            document.getElementById('memo').value = consultation.memo || '';
            
            if (consultation.options) {
                try {
                    const options = JSON.parse(consultation.options);
                    options.forEach(opt => {
                        if (opt.id && opt.id <= 7) {
                            const checkbox = document.getElementById('opt' + opt.id);
                            if (checkbox) {
                                checkbox.checked = true;
                                if (opt.id === 7) {
                                    document.getElementById('customOptionGroup').style.display = 'block';
                                    document.getElementById('customOptionName').value = opt.name || '';
                                    document.getElementById('customOptionPrice').value = opt.price || 0;
                                }
                            }
                        }
                    });
                } catch (e) {
                    console.error('옵션 파싱 에러:', e);
                }
            }
            
            if (consultation.partners) {
                try {
                    const partners = JSON.parse(consultation.partners);
                    partners.forEach(partner => {
                        if (partner.id && partner.id <= 7) {
                            const checkbox = document.getElementById('partner' + partner.id);
                            const detail = document.getElementById('partner' + partner.id + 'Detail');
                            if (checkbox && detail) {
                                checkbox.checked = true;
                                detail.style.display = 'block';
                                detail.value = partner.detail || '';
                            }
                        }
                    });
                } catch (e) {
                    console.error('협력업체 파싱 에러:', e);
                }
            }
            
            if (consultation.mealType) {
                document.getElementById('mealType').value = consultation.mealType;
                if (consultation.mealType === 'custom') {
                    document.getElementById('customMealGroup').style.display = 'block';
                    document.getElementById('customMealPrice').value = consultation.customMealPrice || 0;
                }
            }
        }
        
        this.calculatePrice();
        this.modal.show();
    }
    
    async saveConsultation() {
        const form = document.getElementById('consultationForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const options = [];
        for (let i = 1; i <= 6; i++) {
            const checkbox = document.getElementById('opt' + i);
            if (checkbox && checkbox.checked) {
                const labelText = checkbox.nextElementSibling.textContent;
                const name = labelText.split(' - ')[0];
                options.push({
                    id: i,
                    name: name,
                    price: parseInt(checkbox.value)
                });
            }
        }
        
        const opt7 = document.getElementById('opt7');
        if (opt7 && opt7.checked) {
            const customName = document.getElementById('customOptionName').value;
            const customPrice = parseInt(document.getElementById('customOptionPrice').value) || 0;
            options.push({
                id: 7,
                name: customName || '기타옵션',
                price: customPrice
            });
        }
        
        const partners = [];
        for (let i = 1; i <= 7; i++) {
            const checkbox = document.getElementById('partner' + i);
            const detail = document.getElementById('partner' + i + 'Detail');
            if (checkbox && checkbox.checked) {
                partners.push({
                    id: i,
                    name: checkbox.nextElementSibling.textContent,
                    detail: detail?.value || ''
                });
            }
        }
        
        const eventSubType = document.getElementById('eventSubType').value;
        const guestCount = parseInt(document.getElementById('guestCount').value) || 0;
        const mealType = document.getElementById('mealType').value;
        const customMealPrice = parseInt(document.getElementById('customMealPrice')?.value) || 0;
        const promotionAmount = parseInt(document.getElementById('promotionAmount').value) || 0;
        const depositAmount = parseInt(document.getElementById('depositAmount').value) || 0;
        
        this.calculator.calculateBasePrice(eventSubType);
        this.calculator.calculateMealPrice(guestCount, eventSubType, mealType, customMealPrice);
        this.calculator.calculateOptionPrice();
        this.calculator.applyPromotion(promotionAmount);
        
        const totalPrice = this.calculator.calculateTotal();
        const balanceAmount = this.calculator.calculateBalance(depositAmount);
        
        const data = {
            customerName: document.getElementById('customerName').value,
            customerPhone: document.getElementById('customerPhone').value,
            eventDate: document.getElementById('eventDate').value,
            eventTime: document.getElementById('eventTime').value,
            guestCount: guestCount,
            eventCategory: document.getElementById('eventCategory').value,
            eventSubType: eventSubType,
            mealType: mealType,
            customMealPrice: customMealPrice,
            basePrice: this.calculator.basePrice,
            mealPrice: this.calculator.mealPrice,
            optionPrice: this.calculator.optionPrice,
            promotion: document.getElementById('promotion').value,
            promotionAmount: promotionAmount,
            totalPrice: totalPrice,
            depositAmount: depositAmount,
            balanceAmount: balanceAmount,
            paymentMethod: document.getElementById('paymentMethod').value,
            contractStatus: document.getElementById('contractStatus').value,
            memo: document.getElementById('memo').value,
            options: JSON.stringify(options),
            partners: JSON.stringify(partners)
        };
        
        try {
            if (this.currentEditId) {
                await sheetsAPI.update(this.currentEditId, data);
                alert('수정되었습니다.');
            } else {
                await sheetsAPI.create(data);
                alert('저장되었습니다.');
            }
            
            this.modal.hide();
            await this.loadData();
            this.updateStatistics();
            this.renderTables();
            this.updateCalendarEvents();
        } catch (error) {
            alert('저장에 실패했습니다: ' + error.message);
        }
    }
    
    async deleteConsultation(id) {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        
        try {
            await sheetsAPI.delete(id);
            alert('삭제되었습니다.');
            await this.loadData();
            this.updateStatistics();
            this.renderTables();
            this.updateCalendarEvents();
        } catch (error) {
            alert('삭제에 실패했습니다: ' + error.message);
        }
    }
    
    updateStatistics() {
        const total = this.consultations.length;
        const pending = this.consultations.filter(c => c.contractStatus === '기본상담').length;
        const contract = this.consultations.filter(c => c.contractStatus === '계약체결').length;
        const complete = this.consultations.filter(c => c.contractStatus === '행사완료').length;
        
        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-pending').textContent = pending;
        document.getElementById('stat-contract').textContent = contract;
        document.getElementById('stat-complete').textContent = complete;
    }
    
    renderTables() {
        const tbody = document.querySelector('#consultationTable tbody');
        tbody.innerHTML = '';
        
        const sortedConsultations = [...this.consultations].sort((a, b) => {
            if (a.eventDate && b.eventDate) {
                return new Date(b.eventDate) - new Date(a.eventDate);
            }
            return 0;
        });
        
        sortedConsultations.forEach(consultation => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${consultation.id || ''}</td>
                <td>${consultation.customerName || ''}</td>
                <td>${consultation.customerPhone || ''}</td>
                <td>${consultation.eventDate || ''}</td>
                <td>${consultation.eventSubType || ''}</td>
                <td>${consultation.guestCount || ''}명</td>
                <td>${this.formatCurrency(consultation.totalPrice || 0)}</td>
                <td><span class="badge" style="background-color: ${this.getStatusColor(consultation.contractStatus)}">${consultation.contractStatus || ''}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="app.editConsultation('${consultation.id}')" title="수정">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="app.printConsultation('${consultation.id}')" title="인쇄">
                        <i class="bi bi-printer"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteConsultation('${consultation.id}')" title="삭제">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
        });
    }
    
    editConsultation(id) {
        const consultation = this.consultations.find(c => c.id === id);
        if (consultation) {
            this.openModal(consultation);
        }
    }
    
    printConsultation(id) {
        const consultation = this.consultations.find(c => c.id === id);
        if (!consultation) return;
        
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        printWindow.document.write(this.generatePrintHTML(consultation));
        printWindow.document.close();
        
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
            }, 250);
        };
    }
    
    generatePrintHTML(consultation) {
        const options = consultation.options ? JSON.parse(consultation.options) : [];
        const partners = consultation.partners ? JSON.parse(consultation.partners) : [];
        
        let optionsHTML = '';
        if (options.length > 0) {
            options.forEach(opt => {
                optionsHTML += `<div class="option-line">${opt.name}: ${this.formatCurrency(opt.price)}</div>`;
            });
        } else {
            optionsHTML = '<p style="color: #999; margin: 10px 0;">선택된 옵션이 없습니다.</p>';
        }
        
        let partnersHTML = '';
        if (partners.length > 0) {
            partners.forEach(partner => {
                partnersHTML += `<div class="partner-line"><strong>${partner.name}:</strong> ${partner.detail || '내용 없음'}</div>`;
            });
        } else {
            partnersHTML = '<p style="color: #999; margin: 10px 0;">선택된 협력업체가 없습니다.</p>';
        }
        
        let mealTypeText = '';
        if (consultation.mealType) {
            if (consultation.mealType === 'western') {
                mealTypeText = '양식 (55,000원/인)';
            } else if (consultation.mealType === 'korean') {
                mealTypeText = '한식 (59,000원/인)';
            } else if (consultation.mealType === 'custom') {
                mealTypeText = `직접입력 (${this.formatCurrency(consultation.customMealPrice || 0)}/인)`;
            }
        }
        
        return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>폴라그란데 상담서</title>
    <style>
        @page {
            size: A4;
            margin: 10mm;
        }
        
        @media print {
            .no-print { display: none !important; }
            body { 
                margin: 0; 
                padding: 7mm;
                font-size: 11pt;
            }
            .page-break { 
                page-break-after: always;
                page-break-inside: avoid;
            }
            .print-container {
                box-shadow: none;
                padding: 0;
            }
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
            background-color: #faf8f3;
            padding: 15px;
            margin: 0;
            line-height: 1.6;
        }
        
        .print-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .header-section {
            text-align: center;
            padding: 20px 0;
            border-bottom: 3px solid #8B4513;
            margin-bottom: 25px;
        }
        
        .header-section h1 {
            color: #8B4513;
            font-size: 28px;
            margin: 0 0 8px 0;
            font-weight: bold;
        }
        
        .header-section p {
            color: #666;
            margin: 4px 0;
            font-size: 14px;
        }
        
        .section-title {
            background: linear-gradient(135deg, #8B4513, #D2691E);
            color: white;
            padding: 10px 15px;
            margin: 20px 0 12px 0;
            border-radius: 6px;
            font-size: 15px;
            font-weight: bold;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .info-table td {
            padding: 10px 12px;
            border: 1px solid #ddd;
            font-size: 13px;
        }
        
        .info-table td:first-child {
            background-color: #f8f9fa;
            font-weight: bold;
            width: 30%;
        }
        
        .price-summary {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .price-row {
            display: flex;
            justify-content: space-between;
            padding: 7px 0;
            border-bottom: 1px solid #ddd;
            font-size: 13px;
        }
        
        .price-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 16px;
            color: #8B4513;
            margin-top: 8px;
            padding-top: 12px;
            border-top: 2px solid #8B4513;
        }
        
        .option-line, .partner-line {
            padding: 6px 0;
            border-bottom: 1px dashed #e0e0e0;
            font-size: 13px;
        }
        
        .option-line:last-child, .partner-line:last-child {
            border-bottom: none;
        }
        
        .notice-box {
            background: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
            page-break-inside: avoid;
        }
        
        .notice-box h3 {
            color: #f57c00;
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .notice-box ul {
            margin: 8px 0;
            padding-left: 20px;
        }
        
        .notice-box li {
            margin: 6px 0;
            line-height: 1.6;
            font-size: 13px;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #8B4513;
            color: #666;
            font-size: 13px;
        }
        
        .signature-area {
            margin-top: 30px;
            text-align: right;
            font-size: 13px;
        }
        
        .signature-line {
            display: inline-block;
            width: 180px;
            border-bottom: 2px solid #333;
            margin-left: 15px;
            vertical-align: bottom;
        }
        
        .content-box {
            padding: 12px;
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            margin-bottom: 15px;
            min-height: 40px;
        }
        
        @media screen and (max-width: 768px) {
            .print-container {
                padding: 20px;
            }
            
            .header-section h1 {
                font-size: 24px;
            }
            
            .info-table td {
                padding: 8px;
                font-size: 12px;
            }
            
            .section-title {
                font-size: 14px;
                padding: 8px 12px;
            }
        }
    </style>
</head>
<body>
    <div class="print-container">
        <div class="header-section">
            <h1>폴라그란데</h1>
            <p>행사 상담서</p>
            <p><strong>상담번호:</strong> ${consultation.id}</p>
        </div>
        
        <div class="section-title">1. 기본 정보</div>
        <table class="info-table">
            <tr>
                <td>고객명</td>
                <td>${consultation.customerName || '-'}</td>
            </tr>
            <tr>
                <td>연락처</td>
                <td>${consultation.customerPhone || '-'}</td>
            </tr>
        </table>
        
        <div class="section-title">2. 행사 정보</div>
        <table class="info-table">
            <tr>
                <td>행사일자</td>
                <td>${consultation.eventDate || '-'}</td>
            </tr>
            <tr>
                <td>행사시간</td>
                <td>${consultation.eventTime || '-'}</td>
            </tr>
            <tr>
                <td>예상인원</td>
                <td>${consultation.guestCount || '-'}명</td>
            </tr>
        </table>
        
        <div class="section-title">3. 행사 유형</div>
        <table class="info-table">
            <tr>
                <td>행사 카테고리</td>
                <td>${consultation.eventCategory || '-'}</td>
            </tr>
            <tr>
                <td>행사 상세유형</td>
                <td>${consultation.eventSubType || '-'}</td>
            </tr>
            ${mealTypeText ? `
            <tr>
                <td>음식 종류</td>
                <td>${mealTypeText}</td>
            </tr>
            ` : ''}
        </table>
        
        <div class="section-title">4. 선택 옵션</div>
        <div class="content-box">
            ${optionsHTML}
        </div>
        
        <div class="section-title">5. 협력업체</div>
        <div class="content-box">
            ${partnersHTML}
        </div>
        
        <div class="section-title">6. 금액 요약</div>
        <div class="price-summary">
            <div class="price-row">
                <span>기본 금액</span>
                <span>${this.formatCurrency(consultation.basePrice || 0)}</span>
            </div>
            <div class="price-row">
                <span>추가 식대</span>
                <span>${this.formatCurrency(consultation.mealPrice || 0)}</span>
            </div>
            <div class="price-row">
                <span>선택 옵션</span>
                <span>${this.formatCurrency(consultation.optionPrice || 0)}</span>
            </div>
            <div class="price-row">
                <span>프로모션 할인</span>
                <span>-${this.formatCurrency(consultation.promotionAmount || 0)}</span>
            </div>
            <div class="price-row">
                <span>총 금액</span>
                <span>${this.formatCurrency(consultation.totalPrice || 0)}</span>
            </div>
            <div class="price-row">
                <span>계약금</span>
                <span>${this.formatCurrency(consultation.depositAmount || 0)}</span>
            </div>
            <div class="price-row">
                <span>잔금</span>
                <span>${this.formatCurrency(consultation.balanceAmount || 0)}</span>
            </div>
        </div>
        
        <table class="info-table">
            <tr>
                <td>지급방식</td>
                <td>${consultation.paymentMethod || '-'}</td>
            </tr>
            <tr>
                <td>계약상태</td>
                <td>${consultation.contractStatus || '-'}</td>
            </tr>
            ${consultation.memo ? `
            <tr>
                <td>특이사항</td>
                <td>${consultation.memo}</td>
            </tr>
            ` : ''}
        </table>
        
        <div class="signature-area">
            <p>상담일자: ${new Date().toLocaleDateString('ko-KR')}</p>
            <p>고객 서명: <span class="signature-line"></span></p>
        </div>
        
        <div class="page-break"></div>
        
        <div class="header-section">
            <h1>폴라그란데</h1>
            <p>행사 최종 확인 안내</p>
        </div>
        
        <div class="section-title">7. 행사 최종 확인 안내 (필독)</div>
        
        <div class="notice-box">
            <h3>▣ 계약 및 결제 안내</h3>
            <ul>
                <li>계약금 입금 후 계약이 확정되며, 행사 7일 전까지 잔금을 납부하셔야 합니다.</li>
                <li>계약금은 환불이 불가능하며, 행사 취소 시 환불 규정에 따라 처리됩니다.</li>
                <li>행사 14일 전 취소 시 계약금의 50%, 7일 전 취소 시 전액 공제됩니다.</li>
            </ul>
        </div>
        
        <div class="notice-box">
            <h3>▣ 행사 진행 안내</h3>
            <ul>
                <li>행사 당일 최소 2시간 전까지 도착하여 준비해 주시기 바랍니다.</li>
                <li>인원 변동 사항은 행사 3일 전까지 알려주셔야 정확한 준비가 가능합니다.</li>
                <li>추가 인원에 따른 식대는 당일 현장에서 정산 가능합니다.</li>
                <li>행사 시간은 계약서에 명시된 시간을 기준으로 하며, 초과 시 추가 요금이 발생할 수 있습니다.</li>
            </ul>
        </div>
        
        <div class="notice-box">
            <h3>▣ 시설 이용 안내</h3>
            <ul>
                <li>폴라그란데 시설 내에서는 금연이며, 지정된 흡연 구역을 이용해 주시기 바랍니다.</li>
                <li>시설 파손 또는 분실 시 원상복구 비용이 청구될 수 있습니다.</li>
                <li>행사 종료 후 정리 정돈은 고객 부담이며, 추가 정리가 필요한 경우 비용이 발생합니다.</li>
                <li>외부 음식물 반입은 사전 협의가 필요하며, 케이터링 업체 이용 시 승인이 필요합니다.</li>
            </ul>
        </div>
        
        <div class="notice-box">
            <h3>▣ 협력업체 이용 안내</h3>
            <ul>
                <li>협력업체 이용은 고객과 업체 간 직접 계약이며, 폴라그란데는 중개 역할만 수행합니다.</li>
                <li>협력업체와 관련된 문제는 해당 업체와 직접 해결하셔야 합니다.</li>
                <li>협력업체 변경을 원하시는 경우 사전에 말씀해 주시기 바랍니다.</li>
            </ul>
        </div>
        
        <div class="notice-box">
            <h3>▣ 기타 유의사항</h3>
            <ul>
                <li>천재지변 및 불가항력적인 사유로 행사가 불가능한 경우, 일정 변경 또는 전액 환불이 가능합니다.</li>
                <li>행사 당일 긴급 연락처: 043-XXX-XXXX (24시간 운영)</li>
                <li>주차는 최대 50대까지 무료이며, 초과 시 인근 유료 주차장을 이용하셔야 합니다.</li>
                <li>행사 촬영본은 홍보 목적으로 사용될 수 있으며, 거부 시 사전에 말씀해 주시기 바랍니다.</li>
            </ul>
        </div>
        
        <div class="footer">
            <p><strong>폴라그란데</strong></p>
            <p>주소: 충북 청주시 서원구 1순환로 645</p>
            <p>전화: 043-XXX-XXXX | 이메일: info@pollagrande.com</p>
            <p>사업자등록번호: XXX-XX-XXXXX</p>
            <p style="margin-top: 15px; color: #999; font-size: 12px;">본 상담서는 계약서가 아니며, 정식 계약서 작성 후 효력이 발생합니다.</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px; padding: 20px;">
            <button onclick="window.print()" style="padding: 12px 30px; background: #8B4513; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin-right: 10px;">
                <i class="bi bi-printer"></i> 인쇄하기
            </button>
            <button onclick="window.close()" style="padding: 12px 30px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                <i class="bi bi-x-circle"></i> 닫기
            </button>
        </div>
    </div>
</body>
</html>
        `;
    }
}

const app = new PollagrandeApp();

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});