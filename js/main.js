// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Stalcraft Calculator loaded');
    
    initCalculator();
    calculate();
});

// Инициализация калькулятора
function initCalculator() {
    // Элементы ввода
    const slastInput = document.getElementById('catalyst-slast');
    const dustInput = document.getElementById('catalyst-dust');
    const priceCatalystInput = document.getElementById('price-catalyst');
    const priceSlastInput = document.getElementById('price-slast');
    const priceDustInput = document.getElementById('price-dust');
    const useTaxCheckbox = document.getElementById('use-tax');
    
    // Результаты
    const resultOutput = document.getElementById('result-output');
    const resultCost = document.getElementById('result-cost');
    const resultRevenue = document.getElementById('result-revenue');
    const resultProfit = document.getElementById('result-profit');
    
    // Детали
    const detailCrafts = document.getElementById('detail-crafts');
    const detailSlastUsed = document.getElementById('detail-slast-used');
    const detailDustUsed = document.getElementById('detail-dust-used');
    const detailEfficiency = document.getElementById('detail-efficiency');
    
    // Константы крафта
    const CRAFT = {
        SLATS_NEEDED: 10,    // Сласти на 1 крафт
        DUST_NEEDED: 100,    // Пыли на 1 крафт
        OUTPUT: 20           // Катализаторов на выходе
    };
    
    // Обновление пыли при изменении сласти
    slastInput.addEventListener('input', function() {
        const slastValue = parseFloat(this.value) || 0;
        dustInput.value = slastValue * 10;
        calculate();
    });
    
    // Обновление сласти при изменении пыли
    dustInput.addEventListener('input', function() {
        const dustValue = parseFloat(this.value) || 0;
        slastInput.value = dustValue / 10;
        calculate();
    });
    
    // Реакция на изменения цен
    priceCatalystInput.addEventListener('input', calculate);
    priceSlastInput.addEventListener('input', calculate);
    priceDustInput.addEventListener('input', calculate);
    useTaxCheckbox.addEventListener('change', calculate);
    
    // Функция расчета
    function calculate() {
        console.log('Calculating...');
        
        // Получаем значения
        const slast = parseFloat(slastInput.value) || 0;
        const dust = parseFloat(dustInput.value) || 0;
        const priceSlast = parseFloat(priceSlastInput.value) || 7800;
        const priceDust = parseFloat(priceDustInput.value) || 275;
        const priceCatalyst = parseFloat(priceCatalystInput.value) || 4135;
        const useTax = useTaxCheckbox.checked;
        
        // 1. Сколько можно сделать крафтов?
        const craftsFromSlast = Math.floor(slast / CRAFT.SLATS_NEEDED);
        const craftsFromDust = Math.floor(dust / CRAFT.DUST_NEEDED);
        
        // 2. Лимитирующий ресурс
        const possibleCrafts = Math.min(craftsFromSlast, craftsFromDust);
        
        // 3. Результат
        const catalysts = possibleCrafts * CRAFT.OUTPUT;
        
        // 4. Использованные ресурсы
        const usedSlast = possibleCrafts * CRAFT.SLATS_NEEDED;
        const usedDust = possibleCrafts * CRAFT.DUST_NEEDED;
        
        // 5. Затраты
        const costSlast = usedSlast * priceSlast;
        const costDust = usedDust * priceDust;
        const totalCost = costSlast + costDust;
        
        // 6. Выручка
        let revenue = catalysts * priceCatalyst;
        if (useTax) {
            revenue = revenue * 0.95; // -5% налог
        }
        
        // 7. Прибыль
        const profit = revenue - totalCost;
        
        // 8. Эффективность использования ресурсов
        let efficiency = '100%';
        if (possibleCrafts > 0) {
            const slastEfficiency = (usedSlast / slast) * 100;
            const dustEfficiency = (usedDust / dust) * 100;
            efficiency = Math.min(slastEfficiency, dustEfficiency).toFixed(0) + '%';
        }
        
        // 9. Обновляем интерфейс
        updateResults(catalysts, totalCost, revenue, profit);
        updateDetails(possibleCrafts, usedSlast, usedDust, efficiency);
    }
    
    // Обновление результатов
    function updateResults(catalysts, cost, revenue, profit) {
        resultOutput.textContent = catalysts.toLocaleString('ru-RU');
        resultCost.textContent = formatMoney(cost);
        resultRevenue.textContent = formatMoney(revenue);
        resultProfit.textContent = formatMoney(profit);
        
        // Цвет прибыли
        if (profit >= 0) {
            resultProfit.style.color = '#00ff9d';
        } else {
            resultProfit.style.color = '#ff4757';
        }
    }
    
    // Обновление деталей
    function updateDetails(crafts, usedSlast, usedDust, efficiency) {
        detailCrafts.textContent = crafts;
        detailSlastUsed.textContent = `${usedSlast}`;
        detailDustUsed.textContent = `${usedDust}`;
        detailEfficiency.textContent = efficiency;
    }
    
    // Форматирование денег
    function formatMoney(amount) {
        return Math.round(amount).toLocaleString('ru-RU') + ' ₽';
    }
    
    // Экспортируем функцию расчета
    window.calculate = calculate;
}
