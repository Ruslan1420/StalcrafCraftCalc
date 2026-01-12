// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Catalyst Calculator loaded');
    
    // Сначала инициализируем все элементы
    initCalculator();
    // Затем делаем первый расчет
    calculate();
});

function initCalculator() {
    console.log('Initializing calculator...');
    
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
    
    // Модальное окно
    const modalOverlay = document.getElementById('modal-overlay');
    const modalMessage = document.getElementById('modal-message');
    const modalClose = document.getElementById('modal-close');
    const modalOk = document.getElementById('modal-ok');
    
    // Проверяем, что все элементы найдены
    if (!slastInput || !dustInput || !plasmaInput) {
        console.error('Some input elements not found!');
        return;
    }
    
    console.log('All elements found:', {
        slastInput: !!slastInput,
        dustInput: !!dustInput,
        plasmaInput: !!plasmaInput,
        modalOverlay: !!modalOverlay
    });
    
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
    
    // Переменные для блокировки
    let blockedInput = null;
    let originalValue = null;
    
    // Показать модальное окно
    function showModal(message, inputElement) {
        console.log('Showing modal:', message);
        blockedInput = inputElement;
        originalValue = inputElement.value;
        
        modalMessage.textContent = message;
        modalOverlay.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
    
    // Закрыть модальное окно
    function closeModal() {
        console.log('Closing modal');
        modalOverlay.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        // Восстанавливаем исходное значение
        if (blockedInput && originalValue !== null) {
            blockedInput.value = originalValue;
            console.log('Restored value:', originalValue);
        }
        
        // Сбрасываем значения
        blockedInput = null;
        originalValue = null;
        
        // Пересчитываем
        calculate();
    }
    
    // Проверка значения
    function checkInputValue(value, inputElement, resourceName) {
        if (value > 10000) {
            const messages = [
                `Ты чего делаешь? ${value.toLocaleString('ru-RU')} ${resourceName}?`,
                `Ого! ${value.toLocaleString('ru-RU')} ${resourceName}? Серьезно?`
            ];
            
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            showModal(randomMessage, inputElement);
            return false;
        }
        return true;
    }
    
    // Проверка цены
    function checkPrice(value, inputElement, resourceName) {
        if (value > 100000) {
            const messages = [
                `Цена ${value.toLocaleString('ru-RU')} ₽ за ${resourceName}? Серьезно?`,
                `Дороговато! ${value.toLocaleString('ru-RU')} ₽ за ${resourceName}`
            ];
            
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            showModal(randomMessage, inputElement);
            return false;
        }
        return true;
    }
    
    // Обработчики модального окна
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modalOk) {
        modalOk.addEventListener('click', closeModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(event) {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });
    }
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modalOverlay.style.display === 'flex') {
            closeModal();
        }
    });
    
    // АВТОМАТИЧЕСКАЯ СВЯЗЬ РЕСУРСОВ:
    
    // При изменении сластены
    slastInput.addEventListener('input', function() {
        console.log('Slast input:', this.value);
        const slast = parseFloat(this.value) || 0;
        
        if (checkInputValue(slast, this, 'сластены')) {
            plasmaInput.value = Math.floor(slast / 10);
            dustInput.value = Math.floor(slast * 30);
            calculate();
        }
    });
    
    // При изменении пыли
    dustInput.addEventListener('input', function() {
        console.log('Dust input:', this.value);
        const dust = parseFloat(this.value) || 0;
        
        if (checkInputValue(dust, this, 'пыли')) {
            slastInput.value = Math.floor(dust / 30);
            plasmaInput.value = Math.floor(dust / 300);
            calculate();
        }
    });
    
    // При изменении плазмы
    plasmaInput.addEventListener('input', function() {
        console.log('Plasma input:', this.value);
        const plasma = parseFloat(this.value) || 0;
        
        if (checkInputValue(plasma, this, 'плазмы')) {
            slastInput.value = plasma * 10;
            dustInput.value = plasma * 300;
            calculate();
        }
    });
    
    // Обработчики цен
    if (priceSlastInput) {
        priceSlastInput.addEventListener('input', function() {
            const value = parseFloat(this.value) || 0;
            if (checkPrice(value, this, 'сластену')) {
                calculate();
            }
        });
    }
    
    if (priceDustInput) {
        priceDustInput.addEventListener('input', function() {
            const value = parseFloat(this.value) || 0;
            if (checkPrice(value, this, 'пыль')) {
                calculate();
            }
        });
    }
    
    if (pricePlasmaInput) {
        pricePlasmaInput.addEventListener('input', function() {
            const value = parseFloat(this.value) || 0;
            if (checkPrice(value, this, 'плазму')) {
                calculate();
            }
        });
    }
    
    if (priceEnergyInput) {
        priceEnergyInput.addEventListener('input', function() {
            const value = parseFloat(this.value) || 0;
            if (value > 100) {
                showModal(`Энергия по ${value} ₽? Дороговато!`, this);
            } else {
                calculate();
            }
        });
    }
    
    if (priceCatalystInput) {
        priceCatalystInput.addEventListener('input', function() {
            const value = parseFloat(this.value) || 0;
            if (checkPrice(value, this, 'катализатор')) {
                calculate();
            }
        });
    }
    
    if (useTaxCheckbox) {
        useTaxCheckbox.addEventListener('change', calculate);
    }
    
    // Расчетная функция
    function calculate() {
        console.log('Calculating...');
        
        // Получаем значения ресурсов
        const slast = parseFloat(slastInput.value) || 0;
        const dust = parseFloat(dustInput.value) || 0;
        const plasma = parseFloat(plasmaInput.value) || 0;
        
        // Получаем цены
        const priceSlast = priceSlastInput ? parseFloat(priceSlastInput.value) || 7800 : 7800;
        const priceDust = priceDustInput ? parseFloat(priceDustInput.value) || 275 : 275;
        const pricePlasma = pricePlasmaInput ? parseFloat(pricePlasmaInput.value) || 1500 : 1500;
        const priceEnergy = priceEnergyInput ? parseFloat(priceEnergyInput.value) || 1.2 : 1.2;
        const priceCatalyst = priceCatalystInput ? parseFloat(priceCatalystInput.value) || 4135 : 4135;
        const useTax = useTaxCheckbox ? useTaxCheckbox.checked : true;
        
        console.log('Input values:', { slast, dust, plasma });
        console.log('Prices:', { priceSlast, priceDust, pricePlasma, priceEnergy, priceCatalyst });
        
        // 1. Рассчитываем сколько можно сделать сахара
        const sugarFromSlats = Math.floor(slast / CRAFT.SUGAR.SLATS);
        const sugarFromPlasma = Math.floor(plasma / CRAFT.SUGAR.PLASMA);
        const sugarFromDust = Math.floor(dust / CRAFT.SUGAR.DUST);
        
        console.log('Sugar crafts possible:', { sugarFromSlats, sugarFromPlasma, sugarFromDust });
        
        // Ограничивающий ресурс для сахара
        const maxSugarCrafts = Math.min(
            sugarFromSlats,
            sugarFromPlasma,
            sugarFromDust
        );
        
        // Полученный сахар
        const sugarProduced = maxSugarCrafts * CRAFT.SUGAR.OUTPUT;
        
        console.log('Sugar produced:', sugarProduced, 'from', maxSugarCrafts, 'crafts');
        
        // 2. Рассчитываем сколько можно сделать катализаторов из полученного сахара
        // Оставшиеся ресурсы после крафта сахара
        const remainingDust = dust - (maxSugarCrafts * CRAFT.SUGAR.DUST);
        
        const catalystFromSugar = Math.floor(sugarProduced / CRAFT.CATALYST.SUGAR);
        const catalystFromDust = Math.floor(remainingDust / CRAFT.CATALYST.DUST);
        
        console.log('Catalyst crafts possible:', { catalystFromSugar, catalystFromDust });
        
        // Ограничивающий ресурс для катализаторов
        const maxCatalystCrafts = Math.min(
            catalystFromSugar,
            catalystFromDust
        );
        
        // Полученные катализаторы
        const catalystsProduced = maxCatalystCrafts * CRAFT.CATALYST.OUTPUT;
        
        console.log('Catalysts produced:', catalystsProduced, 'from', maxCatalystCrafts, 'crafts');
        
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
        
        console.log('Resources used:', { 
            slats: totalUsedSlats, 
            plasma: totalUsedPlasma, 
            dust: totalUsedDust,
            energy: totalEnergyUsed
        });
        
        // 4. Рассчитываем затраты
        const costSlats = totalUsedSlats * priceSlast;
        const costPlasma = totalUsedPlasma * pricePlasma;
        const costDust = totalUsedDust * priceDust;
        const costEnergy = totalEnergyUsed * priceEnergy;
        const totalCost = costSlats + costPlasma + costDust + costEnergy;
        
        console.log('Costs:', { costSlats, costPlasma, costDust, costEnergy, totalCost });
        
        // 5. Рассчитываем выручку
        let revenue = catalystsProduced * priceCatalyst;
        if (useTax) {
            revenue = revenue * 0.95; // -5% налог
        }
        
        console.log('Revenue:', revenue, 'tax:', useTax);
        
        // 6. Рассчитываем прибыль
        const profit = revenue - totalCost;
        
        console.log('Profit:', profit);
        
        // 7. Рассчитываем себестоимость сахара и катализатора
        const sugarCost = (CRAFT.SUGAR.SLATS * priceSlast +
                          CRAFT.SUGAR.PLASMA * pricePlasma +
                          CRAFT.SUGAR.DUST * priceDust +
                          CRAFT.ENERGY_PER_CRAFT * priceEnergy) / CRAFT.SUGAR.OUTPUT;
        
        const catalystCost = (CRAFT.CATALYST.SUGAR * sugarCost +
                             CRAFT.CATALYST.DUST * priceDust +
                             CRAFT.ENERGY_PER_CRAFT * priceEnergy) / CRAFT.CATALYST.OUTPUT;
        
        console.log('Unit costs:', { sugarCost, catalystCost });
        
        // 8. Обновляем интерфейс
        updateResults(catalystsProduced, totalCost, revenue, profit, sugarProduced, sugarCost, catalystCost);
    }
    
    function updateResults(catalysts, cost, revenue, profit, sugar, sugarCost, catalystCost) {
        console.log('Updating results:', { catalysts, cost, revenue, profit, sugar });
        
        // Основные результаты
        if (resultOutput) {
            resultOutput.textContent = catalysts.toLocaleString('ru-RU');
        }
        
        if (resultCost) {
            resultCost.textContent = formatMoney(cost);
        }
        
        if (resultRevenue) {
            resultRevenue.textContent = formatMoney(revenue);
        }
        
        if (resultProfit) {
            resultProfit.textContent = formatMoney(profit);
            // Цвет прибыли
            resultProfit.style.color = profit >= 0 ? '#00ff9d' : '#ff4757';
        }
        
        // Сахар
        if (sugarOutput) {
            sugarOutput.textContent = sugar.toLocaleString('ru-RU');
        }
        
        if (priceSugarInput) {
            priceSugarInput.value = sugarCost.toFixed(1);
        }
        
        // Себестоимости
        if (sugarCostElem) {
            sugarCostElem.textContent = formatMoney(sugarCost);
        }
        
        if (catalystCostElem) {
            catalystCostElem.textContent = formatMoney(catalystCost);
        }
    }
    
    function formatMoney(amount) {
        if (amount < 1000) {
            return amount.toFixed(1) + ' ₽';
        }
        return Math.round(amount).toLocaleString('ru-RU') + ' ₽';
    }
    
    // Экспортируем функцию расчета для глобального доступа
    window.calculate = calculate;
    
    console.log('Calculator initialized successfully');
}
