// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Stalcraft Catalyst Calculator loaded');
    
    initCalculator();
    calculate();
});

function initCalculator() {
    // Элементы ввода ресурсов
    const slastInput = document.getElementById('input-slast');
    const dustInput = document.getElementById('input-dust');
    const plasmaInput = document.getElementById('input-plasma');
    const energyInput = document.getElementById('input-energy');
    
    // Элементы цен
    const priceSlastInput = document.getElementById('price-slast');
    const priceDustInput = document.getElementById('price-dust');
    const pricePlasmaInput = document.getElementById('price-plasma');
    const priceEnergyInput = document.getElementById('price-energy');
    const priceCatalystInput = document.getElementById('price-catalyst');
    const priceSugarInput = document.getElementById('price-sugar');
    const useTaxCheckbox = document.getElementById('use-tax');
    
    // Результаты
    const resultOutput = document.getElementById('result-output');
    const resultCost = document.getElementById('result-cost');
    const resultRevenue = document.getElementById('result-revenue');
    const resultProfit = document.getElementById('result-profit');
    const sugarOutput = document.getElementById('sugar-output');
    
    // Детали
    const detailSugarCrafted = document.getElementById('detail-sugar-crafted');
    const detailCatalystsCrafted = document.getElementById('detail-catalysts-crafted');
    const detailEnergyUsed = document.getElementById('detail-energy-used');
    const detailEfficiency = document.getElementById('detail-efficiency');
    
    // Константы крафта
    const CRAFT = {
        // Крафт сахара: 10 сластены + 1 плазма + 100 пыли + 1200 энергии = 30 сахара
        SUGAR: {
            SLATS_NEEDED: 10,
            PLASMA_NEEDED: 1,
            DUST_NEEDED: 100,
            ENERGY_NEEDED: 1200,
            OUTPUT: 30
        },
        // Крафт катализаторов: 15 сахара + 100 пыли + 1200 энергии = 20 катализаторов
        CATALYST: {
            SUGAR_NEEDED: 15,
            DUST_NEEDED: 100,
            ENERGY_NEEDED: 1200,
            OUTPUT: 20
        }
    };
    
    // Автоматическая связь сластены ↔ пыль (1:10)
    slastInput.addEventListener('input', function() {
        const slastValue = parseFloat(this.value) || 0;
        dustInput.value = slastValue * 10;
        calculate();
    });
    
    dustInput.addEventListener('input', function() {
        const dustValue = parseFloat(this.value) || 0;
        slastInput.value = dustValue / 10;
        calculate();
    });
    
    // Реакция на все изменения
    const allInputs = [
        slastInput, dustInput, plasmaInput, energyInput,
        priceSlastInput, priceDustInput, pricePlasmaInput,
        priceEnergyInput, priceCatalystInput, useTaxCheckbox
    ];
    
    allInputs.forEach(input => {
        if (input) input.addEventListener('input', calculate);
        if (input && input.type === 'checkbox') input.addEventListener('change', calculate);
    });
    
    // Расчетная функция
    function calculate() {
        // Получаем значения ресурсов
        const slast = parseFloat(slastInput.value) || 0;
        const dust = parseFloat(dustInput.value) || 0;
        const plasma = parseFloat(plasmaInput.value) || 0;
        const energy = parseFloat(energyInput.value) || 0;
        
        // Получаем цены
        const priceSlast = parseFloat(priceSlastInput.value) || 7800;
        const priceDust = parseFloat(priceDustInput.value) || 275;
        const pricePlasma = parseFloat(pricePlasmaInput.value) || 1500;
        const priceEnergy = parseFloat(priceEnergyInput.value) || 1.2;
        const priceCatalyst = parseFloat(priceCatalystInput.value) || 4135;
        const useTax = useTaxCheckbox.checked;
        
        // 1. Рассчитываем сколько можно сделать сахара
        const sugarFromSlats = Math.floor(slast / CRAFT.SUGAR.SLATS_NEEDED);
        const sugarFromPlasma = Math.floor(plasma / CRAFT.SUGAR.PLASMA_NEEDED);
        const sugarFromDust = Math.floor(dust / CRAFT.SUGAR.DUST_NEEDED);
        const sugarFromEnergy = Math.floor(energy / CRAFT.SUGAR.ENERGY_NEEDED);
        
        // Ограничивающий ресурс для сахара
        const maxSugarCrafts = Math.min(
            sugarFromSlats,
            sugarFromPlasma,
            sugarFromDust,
            sugarFromEnergy
        );
        
        // Полученный сахар
        const sugarProduced = maxSugarCrafts * CRAFT.SUGAR.OUTPUT;
        
        // 2. Рассчитываем сколько можно сделать катализаторов из полученного сахара
        // Оставшиеся ресурсы после крафта сахара
        const remainingDust = dust - (maxSugarCrafts * CRAFT.SUGAR.DUST_NEEDED);
        const remainingEnergy = energy - (maxSugarCrafts * CRAFT.SUGAR.ENERGY_NEEDED);
        
        const catalystFromSugar = Math.floor(sugarProduced / CRAFT.CATALYST.SUGAR_NEEDED);
        const catalystFromDust = Math.floor(remainingDust / CRAFT.CATALYST.DUST_NEEDED);
        const catalystFromEnergy = Math.floor(remainingEnergy / CRAFT.CATALYST.ENERGY_NEEDED);
        
        // Ограничивающий ресурс для катализаторов
        const maxCatalystCrafts = Math.min(
            catalystFromSugar,
            catalystFromDust,
            catalystFromEnergy
        );
        
        // Полученные катализаторы
        const catalystsProduced = maxCatalystCrafts * CRAFT.CATALYST.OUTPUT;
        
        // 3. Рассчитываем использованные ресурсы
        // Для сахара
        const usedSlatsForSugar = maxSugarCrafts * CRAFT.SUGAR.SLATS_NEEDED;
        const usedPlasmaForSugar = maxSugarCrafts * CRAFT.SUGAR.PLASMA_NEEDED;
        const usedDustForSugar = maxSugarCrafts * CRAFT.SUGAR.DUST_NEEDED;
        const usedEnergyForSugar = maxSugarCrafts * CRAFT.SUGAR.ENERGY_NEEDED;
        
        // Для катализаторов
        const usedSugarForCatalyst = maxCatalystCrafts * CRAFT.CATALYST.SUGAR_NEEDED;
        const usedDustForCatalyst = maxCatalystCrafts * CRAFT.CATALYST.DUST_NEEDED;
        const usedEnergyForCatalyst = maxCatalystCrafts * CRAFT.CATALYST.ENERGY_NEEDED;
        
        // Всего использовано
        const totalUsedSlats = usedSlatsForSugar;
        const totalUsedPlasma = usedPlasmaForSugar;
        const totalUsedDust = usedDustForSugar + usedDustForCatalyst;
        const totalUsedEnergy = usedEnergyForSugar + usedEnergyForCatalyst;
        const totalUsedSugar = usedSugarForCatalyst;
        
        // 4. Рассчитываем затраты
        const costSlats = totalUsedSlats * priceSlast;
        const costPlasma = totalUsedPlasma * pricePlasma;
        const costDust = totalUsedDust * priceDust;
        const costEnergy = totalUsedEnergy * priceEnergy;
        const totalCost = costSlats + costPlasma + costDust + costEnergy;
        
        // 5. Рассчитываем выручку
        let revenue = catalystsProduced * priceCatalyst;
        if (useTax) {
            revenue = revenue * 0.95; // -5% налог
        }
        
        // 6. Рассчитываем прибыль
        const profit = revenue - totalCost;
        
        // 7. Рассчитываем цену сахара (автоматически)
        // Стоимость производства 1 сахара = стоимость ингредиентов / 30
        const sugarCost = (CRAFT.SUGAR.SLATS_NEEDED * priceSlast +
                          CRAFT.SUGAR.PLASMA_NEEDED * pricePlasma +
                          CRAFT.SUGAR.DUST_NEEDED * priceDust +
                          CRAFT.SUGAR.ENERGY_NEEDED * priceEnergy) / CRAFT.SUGAR.OUTPUT;
        
        // 8. Обновляем интерфейс
        updateResults(catalystsProduced, totalCost, revenue, profit, sugarProduced, sugarCost);
        updateDetails(sugarProduced, catalystsProduced, totalUsedEnergy);
    }
    
    function updateResults(catalysts, cost, revenue, profit, sugar, sugarCost) {
        // Основные результаты
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
        
        // Сахар
        sugarOutput.textContent = sugar.toLocaleString('ru-RU');
        document.getElementById('price-sugar').value = sugarCost.toFixed(1);
    }
    
    function updateDetails(sugar, catalysts, energyUsed) {
        detailSugarCrafted.textContent = sugar;
        detailCatalystsCrafted.textContent = catalysts;
        detailEnergyUsed.textContent = energyUsed;
        
        // Простая эффективность
        const efficiency = catalysts > 0 ? '100%' : '0%';
        detailEfficiency.textContent = efficiency;
    }
    
    function formatMoney(amount) {
        return Math.round(amount).toLocaleString('ru-RU') + ' ₽';
    }
    
    // Экспортируем функцию расчета
    window.calculate = calculate;
}
