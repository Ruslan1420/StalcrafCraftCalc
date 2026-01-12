// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Stalcraft Calculator loaded');
    
    // Инициализация
    initCalculator();
    
    // Первый расчет
    calculate();
});

function initCalculator() {
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
    
    // Получение элементов
    const slastInput = document.getElementById('input-slast');
    const dustInput = document.getElementById('input-dust');
    const plasmaInput = document.getElementById('input-plasma');
    
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
    
    // Переменные
    let blockedInput = null;
    let originalValue = null;
    let isProcessing = false;
    
    // ========== ПРОСТОЕ СОХРАНЕНИЕ В LOCALSTORAGE ==========
    
    // Сохранить все данные
    function saveAllData() {
        try {
            const data = {
                // Ресурсы
                slast: slastInput.value,
                dust: dustInput.value,
                plasma: plasmaInput.value,
                
                // Цены
                priceSlast: priceSlastInput.value,
                priceDust: priceDustInput.value,
                pricePlasma: pricePlasmaInput.value,
                priceEnergy: priceEnergyInput.value,
                priceCatalyst: priceCatalystInput.value,
                
                // Настройки
                useTax: useTaxCheckbox.checked,
                
                // Временная метка
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('stalcraft_calculator', JSON.stringify(data));
            console.log('Данные сохранены');
            
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    }
    
    // Загрузить сохраненные данные
    function loadSavedData() {
        try {
            const saved = localStorage.getItem('stalcraft_calculator');
            if (saved) {
                const data = JSON.parse(saved);
                
                console.log('Загружаем сохраненные данные:', data);
                
                // Загружаем ресурсы
                slastInput.value = data.slast || 10;
                dustInput.value = data.dust || 300;
                plasmaInput.value = data.plasma || 1;
                
                // Загружаем цены
                priceSlastInput.value = data.priceSlast || 7800;
                priceDustInput.value = data.priceDust || 275;
                pricePlasmaInput.value = data.pricePlasma || 1500;
                priceEnergyInput.value = data.priceEnergy || 1.2;
                priceCatalystInput.value = data.priceCatalyst || 4135;
                
                // Загружаем настройки
                useTaxCheckbox.checked = data.useTax !== false;
                
                console.log('Данные загружены успешно');
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        }
    }
    
    // ========== ОСНОВНАЯ ЛОГИКА ==========
    
    // Показать модальное окно
    function showModal(message, inputElement) {
        modalMessage.textContent = message;
        modalOverlay.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        blockedInput = inputElement;
        originalValue = inputElement.value;
    }
    
    // Закрыть модальное окно
    function closeModal() {
        modalOverlay.style.display = 'none';
        document.body.classList.remove('modal-open');
        
        if (blockedInput && originalValue !== null) {
            blockedInput.value = originalValue;
        }
        
        blockedInput = null;
        originalValue = null;
        isProcessing = false;
        
        calculate();
    }
    
    // Настройка модального окна
    modalClose.addEventListener('click', closeModal);
    modalOk.addEventListener('click', closeModal);
    
    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modalOverlay.style.display === 'flex') {
            closeModal();
        }
    });
    
    // Проверка на 10+ символов
    function checkLength(value, input, resourceName) {
        const strValue = String(value);
        
        if (strValue.length >= 10) {
            showModal(`Осторожно! Вы ввели ${strValue.length} символов. Проверьте правильность ввода.`, input);
            return false;
        }
        
        if (value > 1000000) {
            showModal(`Слишком большое значение: ${value.toLocaleString('ru-RU')} ${resourceName}`, input);
            return false;
        }
        
        return true;
    }
    
    // Общая функция обработки ввода
    function handleInput(inputElement, resourceName, updateOtherInputs) {
        if (isProcessing) return;
        
        isProcessing = true;
        
        const value = parseFloat(inputElement.value) || 0;
        const strValue = inputElement.value;
        
        // Проверка на 10+ символов
        if (strValue.length >= 10) {
            showModal(`Внимание! Вы ввели ${strValue.length} символов. Проверьте правильность ввода.`, inputElement);
            isProcessing = false;
            return;
        }
        
        // Проверка на большие числа
        if (value > 1000000) {
            showModal(`Слишком большое количество: ${value.toLocaleString('ru-RU')}`, inputElement);
            isProcessing = false;
            return;
        }
        
        // Обновляем другие инпуты если нужно
        if (updateOtherInputs) {
            updateOtherInputs(value);
        }
        
        // Считаем и сохраняем
        calculate();
        saveAllData();
        
        isProcessing = false;
    }
    
    // Обработчики ресурсов
    slastInput.addEventListener('input', function() {
        handleInput(this, 'сластены', function(value) {
            plasmaInput.value = Math.floor(value / 10);
            dustInput.value = Math.floor(value * 30);
        });
    });
    
    dustInput.addEventListener('input', function() {
        handleInput(this, 'пыли', function(value) {
            slastInput.value = Math.floor(value / 30);
            plasmaInput.value = Math.floor(value / 300);
        });
    });
    
    plasmaInput.addEventListener('input', function() {
        handleInput(this, 'плазмы', function(value) {
            slastInput.value = value * 10;
            dustInput.value = value * 300;
        });
    });
    
    // Обработчики цен
    priceSlastInput.addEventListener('input', function() {
        handleInput(this, 'цены сластены');
    });
    
    priceDustInput.addEventListener('input', function() {
        handleInput(this, 'цены пыли');
    });
    
    pricePlasmaInput.addEventListener('input', function() {
        handleInput(this, 'цены плазмы');
    });
    
    priceEnergyInput.addEventListener('input', function() {
        handleInput(this, 'цены энергии');
    });
    
    priceCatalystInput.addEventListener('input', function() {
        handleInput(this, 'цены катализатора');
    });
    
    // Обработчик налога
    useTaxCheckbox.addEventListener('change', function() {
        calculate();
        saveAllData();
    });
    
    // Загружаем сохраненные данные при запуске
    loadSavedData();
    
    // Расчетная функция
    function calculate() {
        const slast = parseFloat(slastInput.value) || 0;
        const dust = parseFloat(dustInput.value) || 0;
        const plasma = parseFloat(plasmaInput.value) || 0;
        
        const priceSlast = parseFloat(priceSlastInput.value) || 7800;
        const priceDust = parseFloat(priceDustInput.value) || 275;
        const pricePlasma = parseFloat(pricePlasmaInput.value) || 1500;
        const priceEnergy = parseFloat(priceEnergyInput.value) || 1.2;
        const priceCatalyst = parseFloat(priceCatalystInput.value) || 4135;
        const useTax = useTaxCheckbox.checked;
        
        // 1. Рассчитываем сахар
        const sugarFromSlats = Math.floor(slast / CRAFT.SUGAR.SLATS);
        const sugarFromPlasma = Math.floor(plasma / CRAFT.SUGAR.PLASMA);
        const sugarFromDust = Math.floor(dust / CRAFT.SUGAR.DUST);
        
        const maxSugarCrafts = Math.min(sugarFromSlats, sugarFromPlasma, sugarFromDust);
        const sugarProduced = maxSugarCrafts * CRAFT.SUGAR.OUTPUT;
        
        // 2. Рассчитываем катализаторы
        const remainingDust = dust - (maxSugarCrafts * CRAFT.SUGAR.DUST);
        
        const catalystFromSugar = Math.floor(sugarProduced / CRAFT.CATALYST.SUGAR);
        const catalystFromDust = Math.floor(remainingDust / CRAFT.CATALYST.DUST);
        
        const maxCatalystCrafts = Math.min(catalystFromSugar, catalystFromDust);
        const catalystsProduced = maxCatalystCrafts * CRAFT.CATALYST.OUTPUT;
        
        // 3. Использованные ресурсы
        const usedSlatsForSugar = maxSugarCrafts * CRAFT.SUGAR.SLATS;
        const usedPlasmaForSugar = maxSugarCrafts * CRAFT.SUGAR.PLASMA;
        const usedDustForSugar = maxSugarCrafts * CRAFT.SUGAR.DUST;
        const usedSugarForCatalyst = maxCatalystCrafts * CRAFT.CATALYST.SUGAR;
        const usedDustForCatalyst = maxCatalystCrafts * CRAFT.CATALYST.DUST;
        
        const totalUsedSlats = usedSlatsForSugar;
        const totalUsedPlasma = usedPlasmaForSugar;
        const totalUsedDust = usedDustForSugar + usedDustForCatalyst;
        const totalEnergyUsed = (maxSugarCrafts + maxCatalystCrafts) * CRAFT.ENERGY_PER_CRAFT;
        
        // 4. Затраты
        const costSlats = totalUsedSlats * priceSlast;
        const costPlasma = totalUsedPlasma * pricePlasma;
        const costDust = totalUsedDust * priceDust;
        const costEnergy = totalEnergyUsed * priceEnergy;
        const totalCost = costSlats + costPlasma + costDust + costEnergy;
        
        // 5. Выручка
        let revenue = catalystsProduced * priceCatalyst;
        if (useTax) {
            revenue = revenue * 0.95;
        }
        
        // 6. Прибыль
        const profit = revenue - totalCost;
        
        // 7. Себестоимость
        const sugarCost = (CRAFT.SUGAR.SLATS * priceSlast +
                          CRAFT.SUGAR.PLASMA * pricePlasma +
                          CRAFT.SUGAR.DUST * priceDust +
                          CRAFT.ENERGY_PER_CRAFT * priceEnergy) / CRAFT.SUGAR.OUTPUT;
        
        const catalystCost = (CRAFT.CATALYST.SUGAR * sugarCost +
                             CRAFT.CATALYST.DUST * priceDust +
                             CRAFT.ENERGY_PER_CRAFT * priceEnergy) / CRAFT.CATALYST.OUTPUT;
        
        // 8. Обновление интерфейса
        updateResults(catalystsProduced, totalCost, revenue, profit, sugarProduced, sugarCost, catalystCost);
    }
    
    function updateResults(catalysts, cost, revenue, profit, sugar, sugarCost, catalystCost) {
        resultOutput.textContent = catalysts.toLocaleString('ru-RU');
        resultCost.textContent = formatMoney(cost);
        resultRevenue.textContent = formatMoney(revenue);
        resultProfit.textContent = formatMoney(profit);
        
        resultProfit.style.color = profit >= 0 ? '#00ff9d' : '#ff4757';
        
        sugarOutput.textContent = sugar.toLocaleString('ru-RU');
        priceSugarInput.value = sugarCost.toFixed(1);
        
        sugarCostElem.textContent = formatMoney(sugarCost);
        catalystCostElem.textContent = formatMoney(catalystCost);
    }
    
    function formatMoney(amount) {
        if (amount < 1000) {
            return amount.toFixed(1) + ' ₽';
        }
        return Math.round(amount).toLocaleString('ru-RU') + ' ₽';
    }
}
