// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Stalcraft Calculator loaded');
    
    // Инициализация
    initNavigation();
    initCatalystCalculator();
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
            tabContents.forEach(content => {
                content.style.display = 'none';
                content.classList.remove('active');
            });
            
            // Добавляем активный класс текущему
            this.classList.add('active');
            const activeTab = document.getElementById(tabId + '-section');
            activeTab.style.display = 'block';
            activeTab.classList.add('active');
            
            console.log(`Переключил на вкладку: ${tabId}`);
        });
    });
}

// Калькулятор катализаторов
function initCatalystCalculator() {
    const slastInput = document.getElementById('catalyst-slast');
    const dustInput = document.getElementById('catalyst-dust');
    
    if (!slastInput) return;
    
    // Цены (можно потом вынести в настройки)
    const PRICES = {
        slast: 7800,      // цена сласти
        catalyst: 4135    // цена катализатора
    };
    
    // Установка начальных значений
    slastInput.value = 1000;
    dustInput.value = 10000;
    
    // Расчет при изменении
    slastInput.addEventListener('input', calculateCatalyst);
    slastInput.addEventListener('change', calculateCatalyst);
    
    // Связь сласть ↔ пыль
    slastInput.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        dustInput.value = Math.floor(value * 10);
    });
    
    // Первый расчет
    calculateCatalyst();
    
    function calculateCatalyst() {
        const slast = parseFloat(slastInput.value) || 0;
        
        // Производство: 10 сласти → 20 катализаторов
        const catalysts = Math.floor(slast / 10 * 20);
        const cost = slast * PRICES.slast;
        const revenue = catalysts * PRICES.catalyst;
        const profit = revenue - cost;
        
        // Обновление UI
        document.getElementById('result-output').textContent = catalysts;
        document.getElementById('result-cost').textContent = formatMoney(cost);
        document.getElementById('result-revenue').textContent = formatMoney(revenue);
        
        const profitElement = document.getElementById('result-profit');
        profitElement.textContent = formatMoney(profit);
        profitElement.style.color = profit >= 0 ? '#00ff9d' : '#ff4757';
        
        console.log(`Расчет: ${slast} сласти → ${catalysts} катализаторов → ${profit} ₽ прибыли`);
    }
    
    // Форматирование денег
    function formatMoney(amount) {
        return Math.round(amount).toLocaleString('ru-RU') + ' ₽';
    }
}
