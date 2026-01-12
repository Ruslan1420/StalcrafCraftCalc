// js/main.js - с сахаром как вводимым ресурсом
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
    const sugarInput = document.getElementById('input-sugar'); // Новое поле
    
    const priceSlastInput = document.getElementById('price-slast');
    const priceDustInput = document.getElementById('price-dust');
    const pricePlasmaInput = document.getElementById('price-plasma');
    const priceEnergyInput = document.getElementById('price-energy');
    const priceCatalystInput = document.getElementById('price-catalyst');
    const priceSugarInput = document.getElementById('price-sugar'); // Поле стоимости сахара (только для отображения)
    const useTaxCheckbox = document.getElementById('use-tax');
    
    // Элементы вывода
    const resultOutput = document.getElementById('result-output');
    const resultCost = document.getElementById('result-cost');
    const resultRevenue = document.getElementById('result-revenue');
    const resultProfit = document.getElementById('result-profit');
    
    // ========== СОХРАНЕНИЕ В LOCALSTORAGE ==========
    
    // Сохранить все данные
    function saveAllData() {
        try {
            const data = {
                // Ресурсы
                slast: slastInput.value,
                dust: dustInput.value,
                plasma: plasmaInput.value,
                sugar: sugarInput.value,
                
                // Цены
                priceSlast: priceSlastInput.value,
                priceDust: priceDustInput.value,
                pricePlasma: pricePlasmaInput.value,
                priceEnergy: priceEnergyInput.value,
                priceCatalyst: priceCatalystInput.value,
                priceSugar: priceSugarInput.value, // Сохраняем стоимость сахара
                
                // Настройки
                useTax: useTaxCheckbox.checked,
                
                // Результаты
                results: {
                    output: resultOutput.textContent,
                    cost: resultCost.textContent,
                    revenue: resultRevenue.textContent,
                    profit: resultProfit.textContent
                },
                
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
                if (data.slast !== undefined) slastInput.value = data.slast;
                if (data.dust !== undefined) dustInput.value = data.dust;
                if (data.plasma !== undefined) plasmaInput.value = data.plasma;
                if (data.sugar !== undefined) sugarInput.value = data.sugar;
                
                // Загружаем цены
                if (data.priceSlast !== undefined) priceSlastInput.value = data.priceSlast;
                if (data.priceDust !== undefined) priceDustInput.value = data.priceDust;
                if (data.pricePlasma !== undefined) pricePlasmaInput.value = data.pricePlasma;
                if (data.priceEnergy !== undefined) priceEnergyInput.value = data.priceEnergy;
                if (data.priceCatalyst !== undefined) priceCatalystInput.value = data.priceCatalyst;
                if (data.priceSugar !== undefined) priceSugarInput.value = data.priceSugar;
                
                // Загружаем настройки
                if (data.useTax !== undefined) useTaxCheckbox.checked = data.useTax;
                
                // Загружаем результаты если они есть
                if (data.results) {
                    resultOutput.textContent = data.results.output || '0';
                    resultCost.textContent = data.results.cost || '0 ₽';
                    resultRevenue.textContent = data.results.revenue || '0 ₽';
                    resultProfit.textContent = data.results.profit || '0 ₽';
                    
                    // Восстанавливаем цвет прибыли
                    const profitText = data.results.profit || '0 ₽';
                    const profitValue = parseFloat(profitText.replace(/[^\d.-]/g, ''));
                    resultProfit.style.color = profitValue >= 0 ? '#00ff9d' : '#ff4757';
                }
                
                console.log('Данные загружены успешно');
                
                // Даем время DOM обновиться и пересчитываем
                setTimeout(() => {
                    calculate();
                }, 100);
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        }
    }
    
    // ========== ОБРАБОТКА ДЕСЯТИЧНЫХ ЗНАЧЕНИЙ ==========
    
    // Обработчик для поля энергии
    function setupEnergyInput() {
        priceEnergyInput.addEventListener('input', function() {
            // Заменяем запятую на точку
            let value = this.value.replace(',', '.');
            
            // Удаляем все символы кроме цифр и точки
            value = value.replace(/[^\d.]/g, '');
            
            // Удаляем лишние точки
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            // Ограничиваем 2 знаками после запятой
            if (parts.length === 2) {
                parts[1] = parts[1].slice(0, 2);
                value = parts[0] + '.' + parts[1];
            }
            
            this.value = value;
            
            // Обновляем расчет
            calculate();
            saveAllData();
        });
    }
    
    // ========== АВТОМАТИЧЕСКИЙ РАСЧЕТ РЕСУРСОВ ИЗ САХАРА ==========
    
    // Рассчитать ресурсы из сахара
    function calculateResourcesFromSugar(sugarAmount) {
        const sugar = parseFloat(sugarAmount) || 0;
        
        // Сколько можно сделать катализаторов из этого сахара?
        const catalystCrafts = Math.floor(sugar / CRAFT.CATALYST.SUGAR);
        
        // Для этого количества катализаторов нужно:
        const neededSugar = catalystCrafts * CRAFT.CATALYST.SUGAR;
        const neededDustForCatalyst = catalystCrafts * CRAFT.CATALYST.DUST;
        
        // Для производства этого сахара нужно:
        const sugarCrafts = Math.ceil(neededSugar / CRAFT.SUGAR.OUTPUT);
        const neededSlatsForSugar = sugarCrafts * CRAFT.SUGAR.SLATS;
        const neededPlasmaForSugar = sugarCrafts * CRAFT.SUGAR.PLASMA;
        const neededDustForSugar = sugarCrafts * CRAFT.SUGAR.DUST;
        
        return {
            sugar: neededSugar,
            slast: neededSlatsForSugar,
            plasma: neededPlasmaForSugar,
            dust: neededDustForSugar + neededDustForCatalyst,
            totalDust: neededDustForSugar + neededDustForCatalyst,
            catalystCrafts: catalystCrafts
        };
    }
    
    // Рассчитать сахар из ресурсов
    function calculateSugarFromResources(slast, dust, plasma) {
        // Сколько можно сделать сахара из ресурсов?
        const sugarFromSlats = Math.floor(slast / CRAFT.SUGAR.SLATS);
        const sugarFromPlasma = Math.floor(plasma / CRAFT.SUGAR.PLASMA);
        const sugarFromDust = Math.floor(dust / CRAFT.SUGAR.DUST);
        
        const maxSugarCrafts = Math.min(sugarFromSlats, sugarFromPlasma, sugarFromDust);
        const sugarProduced = maxSugarCrafts * CRAFT.SUGAR.OUTPUT;
        
        return {
            sugar: sugarProduced,
            usedSlats: maxSugarCrafts * CRAFT.SUGAR.SLATS,
            usedPlasma: maxSugarCrafts * CRAFT.SUGAR.PLASMA,
            usedDust: maxSugarCrafts * CRAFT.SUGAR.DUST
        };
    }
    
    // ========== ОБРАБОТЧИКИ ВВОДА ==========
    
    // Общая функция обработки ввода ресурсов
    function handleResourceInput(inputElement, updateFunction) {
        const value = parseFloat(inputElement.value) || 0;
        
        if (updateFunction) {
            updateFunction(value);
        }
        
        calculate();
        saveAllData();
    }
    
    // При изменении сахара
    sugarInput.addEventListener('input', function() {
        const sugarAmount = parseFloat(this.value) || 0;
        
        if (sugarAmount > 0) {
            const resources = calculateResourcesFromSugar(sugarAmount);
            
            slastInput.value = resources.slast;
            plasmaInput.value = resources.plasma;
            dustInput.value = resources.dust;
        }
        
        calculate();
        saveAllData();
    });
    
    // При изменении сластены
    slastInput.addEventListener('input', function() {
        const slast = parseFloat(this.value) || 0;
        
        // Автоматическая связь
        plasmaInput.value = Math.floor(slast / 10);
        dustInput.value = Math.floor(slast * 30);
        
        // Рассчитываем сколько сахара получится
        const dust = parseFloat(dustInput.value) || 0;
        const plasma = parseFloat(plasmaInput.value) || 0;
        
        const sugarData = calculateSugarFromResources(slast, dust, plasma);
        sugarInput.value = sugarData.sugar;
        
        calculate();
        saveAllData();
    });
    
    // При изменении пыли
    dustInput.addEventListener('input', function() {
        const dust = parseFloat(this.value) || 0;
        
        // Автоматическая связь
        slastInput.value = Math.floor(dust / 30);
        plasmaInput.value = Math.floor(dust / 300);
        
        // Рассчитываем сколько сахара получится
        const slast = parseFloat(slastInput.value) || 0;
        const plasma = parseFloat(plasmaInput.value) || 0;
        
        const sugarData = calculateSugarFromResources(slast, dust, plasma);
        sugarInput.value = sugarData.sugar;
        
        calculate();
        saveAllData();
    });
    
    // При изменении плазмы
    plasmaInput.addEventListener('input', function() {
        const plasma = parseFloat(this.value) || 0;
        
        // Автоматическая связь
        slastInput.value = plasma * 10;
        dustInput.value = plasma * 300;
        
        // Рассчитываем сколько сахара получится
        const slast = parseFloat(slastInput.value) || 0;
        const dust = parseFloat(dustInput.value) || 0;
        
        const sugarData = calculateSugarFromResources(slast, dust, plasma);
        sugarInput.value = sugarData.sugar;
        
        calculate();
        saveAllData();
    });
    
    // Обработчики цен
    priceSlastInput.addEventListener('input', function() {
        calculate();
        saveAllData();
    });
    
    priceDustInput.addEventListener('input', function() {
        calculate();
        saveAllData();
    });
    
    pricePlasmaInput.addEventListener('input', function() {
        calculate();
        saveAllData();
    });
    
    priceCatalystInput.addEventListener('input', function() {
        calculate();
        saveAllData();
    });
    
    // Обработчик налога
    useTaxCheckbox.addEventListener('change', function() {
        calculate();
        saveAllData();
    });
    
    // Настраиваем поле энергии
    setupEnergyInput();
    
    // Загружаем сохраненные данные при запуске
    loadSavedData();
    
    // Расчетная функция
    function calculate() {
        const slast = parseFloat(slastInput.value) || 0;
        const dust = parseFloat(dustInput.value) || 0;
        const plasma = parseFloat(plasmaInput.value) || 0;
        const sugar = parseFloat(sugarInput.value) || 0;
        
        const priceSlast = parseFloat(priceSlastInput.value) || 7800;
        const priceDust = parseFloat(priceDustInput.value) || 275;
        const pricePlasma = parseFloat(pricePlasmaInput.value) || 1500;
        const priceEnergy = parseFloat(priceEnergyInput.value.replace(',', '.')) || 1.2;
        const priceCatalyst = parseFloat(priceCatalystInput.value) || 4135;
        const useTax = useTaxCheckbox.checked;
        
        // РАСЧЕТ СТОИМОСТИ САХАРА
        // Рассчитываем стоимость одного сахара на основе его компонентов
        // 10 сластены + 1 плазма + 100 пыли = 30 сахара
        const costOneSugarCraft = 
            (CRAFT.SUGAR.SLATS * priceSlast + 
             CRAFT.SUGAR.PLASMA * pricePlasma + 
             CRAFT.SUGAR.DUST * priceDust + 
             CRAFT.ENERGY_PER_CRAFT * priceEnergy) / CRAFT.SUGAR.OUTPUT;
        
        // Отображаем стоимость сахара (округляем до целых)
        const sugarPrice = Math.round(costOneSugarCraft);
        priceSugarInput.value = sugarPrice;
        
        // Рассчитываем что можно сделать
        let catalystsProduced = 0;
        let totalCost = 0;
        
        // Если указан сахар - используем логику "от сахара"
        if (sugar > 0) {
            // Сколько можно сделать катализаторов из этого сахара?
            const catalystCrafts = Math.floor(sugar / CRAFT.CATALYST.SUGAR);
            
            // Нужные ресурсы для этого количества катализаторов
            const neededSugar = catalystCrafts * CRAFT.CATALYST.SUGAR;
            const neededDustForCatalyst = catalystCrafts * CRAFT.CATALYST.DUST;
            
            // Для производства этого сахара нужно:
            const sugarCrafts = Math.ceil(neededSugar / CRAFT.SUGAR.OUTPUT);
            const neededSlatsForSugar = sugarCrafts * CRAFT.SUGAR.SLATS;
            const neededPlasmaForSugar = sugarCrafts * CRAFT.SUGAR.PLASMA;
            const neededDustForSugar = sugarCrafts * CRAFT.SUGAR.DUST;
            
            catalystsProduced = catalystCrafts * CRAFT.CATALYST.OUTPUT;
            
            // Затраты
            const costSlats = neededSlatsForSugar * priceSlast;
            const costPlasma = neededPlasmaForSugar * pricePlasma;
            const costDust = (neededDustForSugar + neededDustForCatalyst) * priceDust;
            const totalEnergyUsed = (sugarCrafts + catalystCrafts) * CRAFT.ENERGY_PER_CRAFT;
            const costEnergy = totalEnergyUsed * priceEnergy;
            
            totalCost = costSlats + costPlasma + costDust + costEnergy;
        } else {
            // Старая логика - от ресурсов
            const sugarFromSlats = Math.floor(slast / CRAFT.SUGAR.SLATS);
            const sugarFromPlasma = Math.floor(plasma / CRAFT.SUGAR.PLASMA);
            const sugarFromDust = Math.floor(dust / CRAFT.SUGAR.DUST);
            
            const maxSugarCrafts = Math.min(sugarFromSlats, sugarFromPlasma, sugarFromDust);
            const sugarProduced = maxSugarCrafts * CRAFT.SUGAR.OUTPUT;
            
            const remainingDust = dust - (maxSugarCrafts * CRAFT.SUGAR.DUST);
            
            const catalystFromSugar = Math.floor(sugarProduced / CRAFT.CATALYST.SUGAR);
            const catalystFromDust = Math.floor(remainingDust / CRAFT.CATALYST.DUST);
            
            const maxCatalystCrafts = Math.min(catalystFromSugar, catalystFromDust);
            catalystsProduced = maxCatalystCrafts * CRAFT.CATALYST.OUTPUT;
            
            const usedSlatsForSugar = maxSugarCrafts * CRAFT.SUGAR.SLATS;
            const usedPlasmaForSugar = maxSugarCrafts * CRAFT.SUGAR.PLASMA;
            const usedDustForSugar = maxSugarCrafts * CRAFT.SUGAR.DUST;
            const usedDustForCatalyst = maxCatalystCrafts * CRAFT.CATALYST.DUST;
            
            const totalUsedSlats = usedSlatsForSugar;
            const totalUsedPlasma = usedPlasmaForSugar;
            const totalUsedDust = usedDustForSugar + usedDustForCatalyst;
            const totalEnergyUsed = (maxSugarCrafts + maxCatalystCrafts) * CRAFT.ENERGY_PER_CRAFT;
            
            const costSlats = totalUsedSlats * priceSlast;
            const costPlasma = totalUsedPlasma * pricePlasma;
            const costDust = totalUsedDust * priceDust;
            const costEnergy = totalEnergyUsed * priceEnergy;
            
            totalCost = costSlats + costPlasma + costDust + costEnergy;
        }
        
        // Выручка
        let revenue = catalystsProduced * priceCatalyst;
        if (useTax) {
            revenue = revenue * 0.95;
        }
        
        // Прибыль
        const profit = revenue - totalCost;
        
        // Обновление интерфейса
        updateResults(catalystsProduced, totalCost, revenue, profit);
        
        // Сохраняем результаты
        saveAllData();
    }
    
    function updateResults(catalysts, cost, revenue, profit) {
        resultOutput.textContent = catalysts.toLocaleString('ru-RU');
        resultCost.textContent = formatMoney(cost);
        resultRevenue.textContent = formatMoney(revenue);
        resultProfit.textContent = formatMoney(profit);
        
        resultProfit.style.color = profit >= 0 ? '#00ff9d' : '#ff4757';
    }
    
    function formatMoney(amount) {
        if (isNaN(amount)) {
            return '0 ₽';
        }
        if (Math.abs(amount) < 1000) {
            return amount.toFixed(1) + ' ₽';
        }
        return Math.round(amount).toLocaleString('ru-RU') + ' ₽';
    }
}
