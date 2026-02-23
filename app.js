// Main Application Class
class PollagrandeApp {
    constructor() {
        this.consultations = [];
        this.currentConsultation = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.setupPartnerToggles();
        this.loadOptions('');
        this.loadPartners();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Form submission
        document.getElementById('consultationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveConsultation();
        });

        // Event category change
        document.getElementById('eventCategory').addEventListener('change', (e) => {
            this.updateEventTypes(e.target.value);
        });

        // Event type change
        document.getElementById('eventType').addEventListener('change', () => {
            const category = document.getElementById('eventCategory').value;
            this.loadOptions(category);
            this.calculatePrice();
        });

        // Guest count change
        document.getElementById('guestCount').addEventListener('input', () => {
            this.calculatePrice();
        });

        // Meal type change
        document.getElementById('mealType').addEventListener('change', (e) => {
            const customMealGroup = document.getElementById('customMealGroup');
            const customMealPriceGroup = document.getElementById('customMealPriceGroup');
            
            if (e.target.value === '자체입력') {
                customMealGroup.style.display = 'block';
                customMealPriceGroup.style.display = 'block';
                document.getElementById('customMealType').required = true;
                document.getElementById('customMealPrice').required = true;
            } else {
                customMealGroup.style.display = 'none';
                customMealPriceGroup.style.display = 'none';
                document.getElementById('customMealType').required = false;
                document.getElementById('customMealPrice').required = false;
            }
            
            this.calculatePrice();
        });

        // Custom meal price
        document.getElementById('customMealPrice').addEventListener('input', () => {
            this.calculatePrice();
        });

        // Promotion and deposit input
        document.getElementById('promotionAmount').addEventListener('input', () => {
            this.calculatePrice();
        });

        document.getElementById('depositAmount').addEventListener('input', () => {
            this.calculatePrice();
        });

        // Options change
        this.setupOptionListeners();
    }

    setupPartnerToggles() {
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('partner-checkbox')) {
                const inputId = e.target.id + '_input';
                const inputDiv = document.getElementById(inputId);
                if (inputDiv) {
                    if (e.target.checked) {
                        inputDiv.classList.add('active');
                    } else {
                        inputDiv.classList.remove('active');
                        const textarea = inputDiv.querySelector('textarea');
                        if (textarea) textarea.value = '';
                    }
                }
            }
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');

        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    updateEventTypes(category) {
        const eventTypeSelect = document.getElementById('eventType');
        const mealTypeGroup = document.getElementById('mealTypeGroup');
        
        eventTypeSelect.innerHTML = '<option value="">선택하세요</option>';
        
        if (!category) {
            eventTypeSelect.disabled = true;
            mealTypeGroup.style.display = 'none';
            return;
        }

        eventTypeSelect.disabled = false;
        const types = CONFIG.EVENT_TYPES[category] || [];
        
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            eventTypeSelect.appendChild(option);
        });

        // Show/hide meal type based on category
        if (category === '행사') {
            mealTypeGroup.style.display = 'block';
            document.getElementById('mealType').required = true;
        } else {
            mealTypeGroup.style.display = 'none';
            document.getElementById('mealType').required = false;
            document.getElementById('customMealGroup').style.display = 'none';
            document.getElementById('customMealPriceGroup').style.display = 'none';
        }

        // Load options based on category
        this.loadOptions(category);
        
        // Recalculate price
        this.calculatePrice();
    }

    loadOptions(category) {
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';

        let availableOptions = [];

        if (category === '웨딩') {
            availableOptions = [
                { key: '공간대여패키지', label: '공간대여 패키지', price: CONFIG.OPTIONS['공간대여패키지'] },
                { key: '음향마이크', label: '음향·마이크', price: CONFIG.OPTIONS['음향마이크'] },
                { key: '애프터파티패키지', label: '애프터파티 패키지', price: CONFIG.OPTIONS['애프터파티패키지'] }
            ];
        } else if (category === '행사') {
            const eventType = document.getElementById('eventType').value;
            
            if (!eventType) {
                availableOptions = [
                    { key: '공간대여패키지', label: '공간대여 패키지', price: CONFIG.OPTIONS['공간대여패키지'] },
                    { key: '음향마이크', label: '음향·마이크', price: CONFIG.OPTIONS['음향마이크'] }
                ];
            } else if (eventType === '돌잔치') {
                availableOptions = [
                    { key: '공간대여패키지', label: '공간대여 패키지', price: CONFIG.OPTIONS['공간대여패키지'] },
                    { key: '폴라돌상패키지', label: '폴라돌상 패키지', price: CONFIG.OPTIONS['폴라돌상패키지'] },
                    { key: '그란데돌상패키지', label: '그란데돌상 패키지', price: CONFIG.OPTIONS['그란데돌상패키지'] },
                    { key: '음향마이크', label: '음향·마이크', price: CONFIG.OPTIONS['음향마이크'] }
                ];
            } else if (eventType === '가족행사') {
                availableOptions = [
                    { key: '공간대여패키지', label: '공간대여 패키지', price: CONFIG.OPTIONS['공간대여패키지'] },
                    { key: '생신상패키지', label: '생신상 패키지', price: CONFIG.OPTIONS['생신상패키지'] },
                    { key: '음향마이크', label: '음향·마이크', price: CONFIG.OPTIONS['음향마이크'] }
                ];
            } else {
                // 기업행사, 대관
                availableOptions = [
                    { key: '공간대여패키지', label: '공간대여 패키지', price: CONFIG.OPTIONS['공간대여패키지'] },
                    { key: '음향마이크', label: '음향·마이크', price: CONFIG.OPTIONS['음향마이크'] }
                ];
            }
        }

        availableOptions.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-item';
            optionDiv.innerHTML = `
                <input type="checkbox" id="option_${option.key}" class="option-checkbox" data-price="${option.price}">
                <label for="option_${option.key}">${option.label}<br><small style="color: var(--medium-text);">${this.formatPrice(option.price)}</small></label>
            `;
            container.appendChild(optionDiv);
        });

        this.setupOptionListeners();
    }

    loadPartners() {
        const container = document.getElementById('partnersContainer');
        container.innerHTML = '';

        CONFIG.PARTNERS.forEach(partner => {
            const partnerDiv = document.createElement('div');
            partnerDiv.className = 'partner-item';
            const partnerId = partner.replace(/\s/g, '_').toLowerCase();
            partnerDiv.innerHTML = `
                <div class="partner-header">
                    <input type="checkbox" id="partner_${partnerId}" class="partner-checkbox">
                    <label for="partner_${partnerId}">${partner}</label>
                </div>
                <div class="partner-input" id="partner_${partnerId}_input">
                    <textarea placeholder="예: 김OO, 010-1234-5678, 상세내용"></textarea>
                </div>
            `;
            container.appendChild(partnerDiv);
        });
    }

    setupOptionListeners() {
        document.querySelectorAll('.option-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.calculatePrice();
            });
        });
    }

    calculatePrice() {
        const category = document.getElementById('eventCategory').value;
        const eventType = document.getElementById('eventType').value;
        const guestCount = parseInt(document.getElementById('guestCount').value) || 0;
        const mealType = document.getElementById('mealType').value;
        const customMealPrice = parseInt(document.getElementById('customMealPrice').value) || 0;
        const customOptionPrice = parseInt(document.getElementById('customOptionPrice').value) || 0;
        const promotionAmount = parseInt(document.getElementById('promotionAmount').value) || 0;
        const depositAmount = parseInt(document.getElementById('depositAmount').value) || 0;

        let basePrice = 0;
        let mealPrice = 0;
        let optionPrice = 0;

        // Calculate base price and meal
        if (category === '웨딩' && eventType) {
            const weddingConfig = CONFIG.WEDDING_PRICES[eventType];
            if (weddingConfig) {
                basePrice = weddingConfig.base;
                
                // 25인부터 추가 식대 (24인까지 포함)
                if (guestCount > weddingConfig.includedGuests) {
                    const extraGuests = guestCount - weddingConfig.includedGuests;
                    mealPrice = extraGuests * weddingConfig.perPerson;
                }
            }
        } else if (category === '행사') {
            // 행사는 전체 인원 × 식대
            if (mealType === '자체입력' && customMealPrice > 0) {
                mealPrice = guestCount * customMealPrice;
            } else if (mealType && mealType !== '자체입력') {
                const pricePerPerson = CONFIG.MEAL_PRICES[mealType] || 0;
                mealPrice = guestCount * pricePerPerson;
            }
        }

        // Calculate option prices
        document.querySelectorAll('.option-checkbox:checked').forEach(checkbox => {
            optionPrice += parseInt(checkbox.dataset.price) || 0;
        });

        // Add custom option
        if (customOptionPrice > 0) {
            optionPrice += customOptionPrice;
        }

        // Calculate totals
        const subtotal = basePrice + mealPrice + optionPrice;
        const totalPrice = subtotal - promotionAmount;
        const balancePrice = totalPrice - depositAmount;

        // Update display
        document.getElementById('basePrice').textContent = this.formatPrice(basePrice);
        document.getElementById('mealPrice').textContent = this.formatPrice(mealPrice);
        document.getElementById('optionPrice').textContent = this.formatPrice(optionPrice);
        document.getElementById('promotionPrice').textContent = '-' + this.formatPrice(promotionAmount);
        document.getElementById('totalPrice').textContent = this.formatPrice(totalPrice);
        document.getElementById('depositPrice').textContent = this.formatPrice(depositAmount);
        document.getElementById('balancePrice').textContent = this.formatPrice(balancePrice);
    }

    formatPrice(price) {
        return '₩' + price.toLocaleString('ko-KR');
    }

    openModal(consultation = null) {
        this.currentConsultation = consultation;
        const modal = document.getElementById('consultationModal');
        modal.classList.add('active');

        if (consultation) {
            this.populateForm(consultation);
        } else {
            document.getElementById('consultationForm').reset();
            this.loadOptions('');
            this.calculatePrice();
        }
    }

    closeModal() {
        const modal = document.getElementById('consultationModal');
        modal.classList.remove('active');
        this.currentConsultation = null;
        document.getElementById('consultationForm').reset();
    }

    populateForm(data) {
        // Implement form population for edit mode
        // Similar to previous version but adapted to new structure
    }

    async saveConsultation() {
        const formData = this.getFormData();
        
        try {
            if (!CONFIG.API_URL || CONFIG.API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' || CONFIG.API_URL === '') {
                alert('Google Sheets API가 설정되지 않았습니다.\n\nconfig.js 파일에서 API_URL을 설정해주세요.');
                return;
            }

            let result;
            if (this.currentConsultation) {
                result = await sheetsAPI.update(this.currentConsultation.id, formData);
            } else {
                result = await sheetsAPI.create(formData);
            }

            if (result.success) {
                alert('저장되었습니다.');
                this.closeModal();
                this.loadData();
            } else {
                alert('저장 실패: ' + (result.error || '알 수 없는 오류'));
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    }

    getFormData() {
        const selectedOptions = [];
        document.querySelectorAll('.option-checkbox:checked').forEach(checkbox => {
            const key = checkbox.id.replace('option_', '');
            selectedOptions.push(key);
        });

        const customOptionName = document.getElementById('customOptionName').value;
        const customOptionPrice = document.getElementById('customOptionPrice').value;
        if (customOptionName && customOptionPrice) {
            selectedOptions.push(`기타_${customOptionName}_${customOptionPrice}`);
        }

        const partners = {};
        document.querySelectorAll('.partner-checkbox').forEach(checkbox => {
            if (checkbox.checked) {
                const key = checkbox.id.replace('partner_', '');
                const inputDiv = document.getElementById(checkbox.id + '_input');
                const textarea = inputDiv ? inputDiv.querySelector('textarea') : null;
                if (textarea && textarea.value.trim()) {
                    partners[key] = textarea.value.trim();
                }
            }
        });

        const basePrice = parseInt(document.getElementById('basePrice').textContent.replace(/[₩,]/g, '')) || 0;
        const mealPrice = parseInt(document.getElementById('mealPrice').textContent.replace(/[₩,]/g, '')) || 0;
        const optionPrice = parseInt(document.getElementById('optionPrice').textContent.replace(/[₩,]/g, '')) || 0;
        const totalPrice = parseInt(document.getElementById('totalPrice').textContent.replace(/[₩,]/g, '')) || 0;
        const depositAmount = parseInt(document.getElementById('depositAmount').value) || 0;
        const balancePrice = totalPrice - depositAmount;

        const mealType = document.getElementById('mealType').value;
        const customMealType = document.getElementById('customMealType').value;
        const customMealPrice = document.getElementById('customMealPrice').value;

        return {
            customerName: document.getElementById('customerName').value,
            phone: document.getElementById('phone').value,
            eventDate: document.getElementById('eventDate').value,
            eventTime: document.getElementById('eventTime').value,
            eventCategory: document.getElementById('eventCategory').value,
            eventType: document.getElementById('eventType').value,
            guestCount: parseInt(document.getElementById('guestCount').value) || 0,
            mealType: mealType === '자체입력' ? customMealType : mealType,
            customMealPrice: mealType === '자체입력' ? customMealPrice : '',
            selectedOptions: selectedOptions,
            partners: partners,
            promotionAmount: parseInt(document.getElementById('promotionAmount').value) || 0,
            depositAmount: depositAmount,
            basePrice: basePrice,
            mealPrice: mealPrice,
            optionPrice: optionPrice,
            totalPrice: totalPrice,
            balancePrice: balancePrice,
            notes: document.getElementById('notes').value,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
    }

    async loadData() {
        try {
            if (!CONFIG.API_URL || CONFIG.API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' || CONFIG.API_URL === '') {
                console.warn('Google Sheets API not configured');
                this.showEmptyState();
                return;
            }

            const result = await sheetsAPI.fetchAll();
            
            if (result.success || Array.isArray(result)) {
                this.consultations = Array.isArray(result) ? result : (result.data || []);
                this.renderConsultations();
                this.updateStatistics();
            } else {
                console.error('Load error:', result.error);
                this.showEmptyState();
            }
        } catch (error) {
            console.error('Load data error:', error);
            this.showEmptyState();
        }
    }

    renderConsultations() {
        const tbody = document.querySelector('#consultationTable tbody');
        tbody.innerHTML = '';

        if (this.consultations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--medium-text);">등록된 상담이 없습니다.</td></tr>';
            return;
        }

        this.consultations.forEach(consultation => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(consultation.createdAt)}</td>
                <td>${consultation.customerName}</td>
                <td>${consultation.phone}</td>
                <td>${consultation.eventCategory} - ${consultation.eventType}</td>
                <td>${consultation.eventDate} ${consultation.eventTime || ''}</td>
                <td><span class="status-badge ${consultation.status}">${this.getStatusLabel(consultation.status)}</span></td>
                <td>
                    <button class="btn btn-secondary" style="padding: 0.6rem 1rem; font-size: 0.9rem;" onclick="app.editConsultation('${consultation.id}')">수정</button>
                    <button class="btn btn-primary" style="padding: 0.6rem 1rem; font-size: 0.9rem; margin-left: 0.5rem;" onclick="app.printContract('${consultation.id}')">인쇄</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    showEmptyState() {
        const tbody = document.querySelector('#consultationTable tbody');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--medium-text);"><strong>Google Sheets API가 설정되지 않았습니다.</strong><br><br>config.js 파일에서 API_URL을 설정해주세요.<br><br><small style="color: var(--light-text);">현재는 UI 테스트만 가능합니다.</small></td></tr>';
        
        document.getElementById('totalBookings').textContent = '0';
        document.getElementById('monthlyBookings').textContent = '0';
        document.getElementById('pendingBookings').textContent = '0';
        document.getElementById('confirmedBookings').textContent = '0';
    }

    updateStatistics() {
        const total = this.consultations.length;
        const thisMonth = this.consultations.filter(c => {
            const createdDate = new Date(c.createdAt);
            const now = new Date();
            return createdDate.getMonth() === now.getMonth() && 
                   createdDate.getFullYear() === now.getFullYear();
        }).length;
        const pending = this.consultations.filter(c => c.status === 'pending').length;
        const confirmed = this.consultations.filter(c => c.status === 'confirmed').length;

        document.getElementById('totalBookings').textContent = total;
        document.getElementById('monthlyBookings').textContent = thisMonth;
        document.getElementById('pendingBookings').textContent = pending;
        document.getElementById('confirmedBookings').textContent = confirmed;
    }

    editConsultation(id) {
        const consultation = this.consultations.find(c => c.id === id);
        if (consultation) {
            this.openModal(consultation);
        }
    }

    printContract(id) {
        const consultation = this.consultations.find(c => c.id === id);
        if (consultation) {
            const printWindow = window.open('print.html', '_blank');
            printWindow.addEventListener('load', () => {
                printWindow.populateContract(consultation);
            });
        }
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR');
    }

    getStatusLabel(status) {
        const labels = {
            'pending': '대기중',
            'confirmed': '확정',
            'completed': '완료',
            'cancelled': '취소'
        };
        return labels[status] || status;
    }
}

// Initialize app
const app = new PollagrandeApp();
