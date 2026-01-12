// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Stalcraft Calculator loaded');
    
    // Инициализация
    initNavigation();
    initCatalystCalculator();
    initSettings();
    
    // Сохраняем настройки при закрытии
    window.addEventListener('beforeunload', function() {
        saveSettings();
    });
});

// Навигация между вкладками
function initNavigation() {
    const navButtons = document.querySelectorAll('.main-nav button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Снимаем активный класс со всех
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Добавляем активный класс текущему
            this.classList.add('active');
            document.getElementById(tabId + '-section').classList.add('active');
            
            console.log(`Переключил на вкладку: ${tabId}`);
        });
    });
}

// Калькулятор катализаторов
function initCatalystCalculator() {
    const elements = {
        slastInput: document.getElementById('catalyst-slast'),
        dustInput: document.getElementById('catalyst-dust'),
        priceCatalystInput: document.getElementById('price-catalyst'),
        useTaxCheckbox: document.getElementById('use-tax'),
        outputElement: document.getElementById('result-output'),
        costElement: document.getElementById('result-cost'),
        revenueElement: document.getElementById('result-revenue'),
        profitElement: document.getElementById('result-profit')
    };
    
    // Загрузка сохраненных цен
    loadPrices();
    
    // Установка начальных значений
    elements.slastInput.value = 1000;
    elements.dustInput.value = 10000;
    
    // События для ввода
    elements.slastInput.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        elements.dustInput.value = Math.floor(value * 10);
        calculateCatalyst();
    });
    
    elements.dustInput.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        elements.slastInput.value = Math.floor(value / 10);
        calculateCatalyst();
    });
    
    elements.priceCatalystInput.addEventListener('input', calculateCatalyst);
    elements.useTaxCheckbox.addEventListener('change', calculateCatalyst);
    
    // Первый расчет
    calculateCatalyst();
    
    function calculateCatalyst() {
        const slast = parseFloat(elements.slastInput.value) || 0;
        const catalystPrice = parseFloat(elements.priceCatalystInput.value) || 4135;
        const slastPrice = parseFloat(document.getElementById('setting-price-slast').value) || 7800;
        const useTax = elements.useTaxCheckbox.checked;
        
        // Производство: 10 сласти → 20 катализаторов
        const catalysts = Math.floor(slast / 10 * 20);
        const cost = slast * slastPrice;
        
        // Учет налога 5% если включен
        let revenue = catalysts * catalystPrice;
        if (useTax) {
            revenue = revenue * 0.95; // 5% налог
        }
        
        const profit = revenue - cost;
        
        // Обновление UI
        elements.outputElement.textContent = catalysts.toLocaleString('ru-RU');
        elements.costElement.textContent = formatMoney(cost);
        elements.revenueElement.textContent = formatMoney(revenue);
        
        elements.profitElement.textContent = formatMoney(profit);
        elements.profitElement.className = 'result-value ' + (profit >= 0 ? 'text-success' : 'text-danger');
        
        // Сохранение текущей цены
        localStorage.setItem('last_catalyst_price', catalystPrice);
    }
    
    // Форматирование денег
    function formatMoney(amount) {
        return Math.round(amount).toLocaleString('ru-RU') + ' ₽';
    }
}

// Настройки
function initSettings() {
    // Кнопки
    document.getElementById('btn-save').addEventListener('click', saveSettings);
    document.getElementById('btn-reset').addEventListener('click', resetSettings);
    
    // Инпуты цен
    const priceInputs = [
        'setting-price-slast',
        'setting-price-catalyst',
        'setting-price-dust'
    ];
    
    priceInputs.forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            calculateCatalyst();
        });
    });
    
    // Загрузка сохраненных настроек
    loadSettings();
}

function loadPrices() {
    const savedPrice = localStorage.getItem('last_catalyst_price');
    if (savedPrice) {
        document.getElementById('price-catalyst').value = savedPrice;
    }
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('stalcraft_settings')) || {};
    
    if (settings.prices) {
        document.getElementById('setting-price-slast').value = settings.prices.slast || 7800;
        document.getElementById('setting-price-catalyst').value = settings.prices.catalyst || 4135;
        document.getElementById('setting-price-dust').value = settings.prices.dust || 275;
        document.getElementById('price-catalyst').value = settings.prices.catalyst || 4135;
    }
    
    if (settings.theme) {
        document.getElementById('setting-dark-mode').checked = settings.theme.darkMode !== false;
        document.getElementById('setting-animations').checked = settings.theme.animations !== false;
    }
    
    console.log('Настройки загружены');
}

function saveSettings() {
    const settings = {
        prices: {
            slast: parseFloat(document.getElementById('setting-price-slast').value) || 7800,
            catalyst: parseFloat(document.getElementById('setting-price-catalyst').value) || 4135,
            dust: parseFloat(document.getElementById('setting-price-dust').value) || 275
        },
        theme: {
            darkMode: document.getElementById('setting-dark-mode').checked,
            animations: document.getElementById('setting-animations').checked
        },
        lastUpdate: new Date().toISOString()
    };
    
    localStorage.setItem('stalcraft_settings', JSON.stringify(settings));
    console.log('Настройки сохранены');
    
    // Показать уведомление
    showNotification('Настройки сохранены!', 'success');
}

function resetSettings() {
    if (confirm('Сбросить все настройки к стандартным?')) {
        localStorage.removeItem('stalcraft_settings');
        localStorage.removeItem('last_catalyst_price');
        
        document.getElementById('setting-price-slast').value = 7800;
        document.getElementById('setting-price-catalyst').value = 4135;
        document.getElementById('setting-price-dust').value = 275;
        document.getElementById('price-catalyst').value = 4135;
        document.getElementById('setting-dark-mode').checked = true;
        document.getElementById('setting-animations').checked = true;
        
        calculateCatalyst();
        showNotification('Настройки сброшены', 'info');
    }
}

function showNotification(message, type = 'info') {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00ff9d20' : type === 'error' ? '#ff475720' : '#00f3ff20'};
        color: ${type === 'success' ? '#00ff9d' : type === 'error' ? '#ff4757' : '#00f3ff'};
        border: 1px solid ${type === 'success' ? '#00ff9d40' : type === 'error' ? '#ff475740' : '#00f3ff40'};
        padding: 15px 20px;
        border-radius: 10px;
        backdrop-filter: blur(10px);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавьте эти анимации в CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
