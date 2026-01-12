// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Catalyst Calculator loaded');
    
    initCalculator();
    calculate();
});

function initCalculator() {
    // Элементы ввода ресурсов
    const slastInput = document.getElementById('input-slast');
    const dustInput = document.getElementById('input-dust');
    const plasmaInput = document.getElementById('input-plasma');
    
    // Элементы цен
    const priceSlastInput = document.getElementById('price-slast');
    const priceDustInput = document.getElementById('price-dust');
    const pricePlasmaInput = document.getElementById('price-plasma');
    const priceEnergyInput = document.getElementById('price-energy');
    const priceCatalystInput = document.getElementById('price-catalyst');
    const priceSugarInput = document.getElementById('price-sugar');
    const useTaxCheckbox = document.getElementById('use-tax');
    
    // Элементы вывода
    const resultOutput = document.getElementById('result-output');
    const resultCost = document.getElementById('result-cost');
    const resultRevenue = document.getElementById('result-revenue');
    const resultProfit = document.getElementById('result-profit');
    const sugarOutput = document.getElementById('sugar-output');
    const sugarCostElem = document.getElementById('sugar-cost');
    const catalystCostElem = document.getElementById('catalyst-cost');
    
    // Константы крафта
    const CRAFT = {
        SUGAR: {
            SLATS: 10,
            PLASMA: 1,
            DUST: 100,
            OUTPUT: 30
        },
        CATALYST: {
            SUGAR: 15,
            DUST: 100,
            OUTPUT: 20
        },
        ENERGY_PER_CRAFT: 1200
    };
    
    // АВТОМАТИЧЕСКАЯ СВЯЗЬ РЕСУРСОВ:
    
    // При изменении сластены
    slastInput.addEventListener('input', function() {
        const slast = parseFloat(this.value) || 0;
        // 10 сластены = 1 плазма = 300 пыли
        plasmaInput.value = Math.floor(slast / 10);
        dustInput.value = Math.floor(slast * 30);
        calculate();
    });
    
    // При изменении пыли
    dustInput.addEventListener('input', function() {
        const dust = parseFloat(this.value) || 0;
        // 300 пыли = 10 сластены = 1 плазма
        slastInput.value = Math.floor(dust / 30);
        plasmaInput.value = Math.floor(dust / 300);
        calculate();
    });
    
    // При изменении плазмы
    plasmaInput.addEventListener('input', function() {
        const plasma = parseFloat(this.value) || 0;
        // 1 плазма = 10 сластены = 300 пыли
        slastInput.value = plasma * 10;
        dustInput.value = plasma * 300;
        calculate();
    });
    
    // Реакция на все изменения цен
    const priceInputs = [
        priceSlastInput, priceDustInput, pricePlasmaInput,
        priceEnergyInput, priceCatalystInput, useTaxCheckbox
    ];
    
    priceInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', calculate);
            if (input.type === 'checkbox') {
                input.addEventListener('change', calculate);
            }
        }
    });
    
    // Расчетная функция
    function calculate() {
        // Получаем значения ресурсов
        const slast = parseFloat(slastInput.value) || 0;
        const dust = parseFloat(dustInput.value) || 0;
        const plasma = parseFloat(plasmaInput.value) || 0;
        
        // Получаем цены
        const priceSlast = parseFloat(priceSlastInput.value) || 7800;
        const priceDust = parseFloat(priceDustInput.value) || 275;
        const pricePlasma = parseFloat(pricePlasmaInput.value) || 1500;
        const priceEnergy = parseFloat(priceEnergyInput.value) || 1.2;
        const priceCatalyst = parseFloat(priceCatalystInput.value) || 4135;
        const useTax = useTaxCheckbox.checked;
        
        // 1. Рассчитываем сколько можно сделать сахара
        const sugarFromSlats = Math.floor(slast / CRAFT.SUGAR.SLATS);
        const sugarFromPlasma = Math.floor(plasma / CRAFT.SUGAR.PLASMA);
        const sugarFromDust = Math.floor(dust / CRAFT.SUGAR.DUST);
        
        // Ограничивающий ресурс для сахара
        const maxSugarCrafts = Math.min(
            sugarFromSlats,
            sugarFromPlasma,
            sugarFromDust
        );
        
        // Полученный сахар
        const sugarProduced = maxSugarCrafts * CRAFT.SUGAR.OUTPUT;
        
        // 2. Рассчитываем сколько можно сделать катализаторов из полученного сахара
        // Оставшиеся ресурсы после крафта сахара
        const remainingDust = dust - (maxSugarCrafts * CRAFT.SUGAR.DUST);
        
        const catalystFromSugar = Math.floor(sugarProduced / CRAFT.CATALYST.SUGAR);
        const catalystFromDust = Math.floor(remainingDust / CRAFT.CATALYST.DUST);
        
        // Ограничивающий ресурс для катализаторов
        const maxCatalystCrafts = Math.min(
            catalystFromSugar,
            catalystFromDust
        );
        
        // Полученные катализаторы
        const catalystsProduced = maxCatalystCrafts * CRAFT.CATALYST.OUTPUT;
        
        // 3. Рассчитываем использованные ресурсы
        // Для сахара
        const usedSlatsForSugar = maxSugarCrafts * CRAFT.SUGAR.SLATS;
        const usedPlasmaForSugar = maxSugarCrafts * CRAFT.SUGAR.PLASMA;
        const usedDustForSugar = maxSugarCrafts * CRAFT.SUGAR.DUST;
        
        // Для катализаторов
        const usedSugarForCatalyst = maxCatalystCrafts * CRAFT.CATALYST.SUGAR;
        const usedDustForCatalyst = maxCatalystCrafts * CRAFT.CATALYST.DUST;
        
        // Всего использовано
        const totalUsedSlats = usedSlatsForSugar;
        const totalUsedPlasma = usedPlasmaForSugar;
        const totalUsedDust = usedDustForSugar + usedDustForCatalyst;
        const totalEnergyUsed = (maxSugarCrafts + maxCatalystCrafts) * CRAFT.ENERGY_PER_CRAFT;
        
        // 4. Рассчитываем затраты
        const costSlats = totalUsedSlats * priceSlast;
        const costPlasma = totalUsedPlasma * pricePlasma;
        const costDust = totalUsedDust * priceDust;
        const costEnergy = totalEnergyUsed * priceEnergy;
        const totalCost = costSlats + costPlasma + costDust + costEnergy;
        
        // 5. Рассчитываем выручку
        let revenue = catalystsProduced * priceCatalyst;
        if (useTax) {
            revenue = revenue * 0.95; // -5% налог
        }
        
        // 6. Рассчитываем прибыль
        const profit = revenue - totalCost;
        
        // 7. Рассчитываем себестоимость сахара и катализатора
        const sugarCost = (CRAFT.SUGAR.SLATS * priceSlast +
                          CRAFT.SUGAR.PLASMA * pricePlasma +
                          CRAFT.SUGAR.DUST * priceDust +
                          CRAFT.ENERGY_PER_CRAFT * priceEnergy) / CRAFT.SUGAR.OUTPUT;
        
        const catalystCost = (CRAFT.CATALYST.SUGAR * sugarCost +
                             CRAFT.CATALYST.DUST * priceDust +
                             CRAFT.ENERGY_PER_CRAFT * priceEnergy) / CRAFT.CATALYST.OUTPUT;
        
        // 8. Обновляем интерфейс
        updateResults(catalystsProduced, totalCost, revenue, profit, sugarProduced, sugarCost, catalystCost);
    }
    
    function updateResults(catalysts, cost, revenue, profit, sugar, sugarCost, catalystCost) {
        // Основные результаты
        resultOutput.textContent = catalysts.toLocaleString('ru-RU');
        resultCost.textContent = formatMoney(cost);
        resultRevenue.textContent = formatMoney(revenue);
        resultProfit.textContent = formatMoney(profit);
        
        // Цвет прибыли
        resultProfit.style.color = profit >= 0 ? '#00ff9d' : '#ff4757';
        
        // Сахар
        sugarOutput.textContent = sugar.toLocaleString('ru-RU');
        priceSugarInput.value = sugarCost.toFixed(1);
        
        // Себестоимости
        sugarCostElem.textContent = formatMoney(sugarCost);
        catalystCostElem.textContent = formatMoney(catalystCost);
    }
    
    function formatMoney(amount) {
        if (amount < 1000) {
            return amount.toFixed(1) + ' ₽';
        }
        return Math.round(amount).toLocaleString('ru-RU') + ' ₽';
    }
    
    window.calculate = calculate;
}
