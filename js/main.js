// js/main.js - Упрощенная версия без эффектов
document.addEventListener('DOMContentLoaded', function() {
    console.log('Stalcraft Calculator loaded');
    
    initCalculator();
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
    const sugarInput = document.getElementById('input-sugar');
    
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
    
    // ========== ПРОСТОЙ ОГРАНИЧИТЕЛЬ 8 СИМВОЛОВ ==========
    
    function setupSimpleLimits() {
        const inputs = [
            slastInput, dustInput, plasmaInput, sugarInput,
            priceSlastInput, priceDustInput, pricePlasmaInput,
            priceCatalystInput
        ];
        
        inputs.forEach(input => {
            if (!input) return;
            
            // Простое ограничение ввода
            input.addEventListener('input', function() {
                // Оставляем только цифры
                this.value = this.value.replace(/[^\d]/g, '');
                
                // Обрезаем до 8 символов
                if (this.value.length > 8) {
                    this.value = this.value.substring(0, 8);
                }
            });
        });
        
        // Особый обработчик для поля энергии
        if (priceEnergyInput) {
            priceEnergyInput.addEventListener('input', function() {
                let value = this.value.replace(',', '.');
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
            });
        }
    }
    
    // ========== СОХРАНЕНИЕ ДАННЫХ ==========
    
    function saveAllData() {
        try {
            const data = {
                slast: slastInput.value,
                dust: dustInput.value,
                plasma: plasmaInput.value,
                sugar: sugarInput.value,
                
                priceSlast: priceSlastInput.value,
                priceDust: priceDustInput.value,
                pricePlasma: pricePlasmaInput.value,
                priceEnergy: priceEnergyInput.value,
                priceCatalyst: priceCatalystInput.value,
                priceSugar: priceSugarInput.value,
                
                useTax: useTaxCheckbox.checked,
                
                results: {
                    output: resultOutput.textContent,
                    cost: resultCost.textContent,
                    revenue: resultRevenue.textContent,
                    profit: resultProfit.textContent
                },
                
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('stalcraft_calculator', JSON.stringify(data));
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    }
    
    function loadSavedData() {
        try {
            const saved = localStorage.getItem('stalcraft_calculator');
            if (saved) {
                const data = JSON.parse(saved);
                
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
                
                // Загружаем результаты
                if (data.results) {
                    resultOutput.textContent = data.results.output || '0';
                    resultCost.textContent = data.results.cost || '0 ₽';
                    resultRevenue.textContent = data.results.revenue || '0 ₽';
                    resultProfit.textContent = data.results.profit || '0 ₽';
                    
                    const profitText = data.results.profit || '0 ₽';
                    const profitValue = parseFloat(profitText.replace(/[^\d.-]/g, ''));
                    resultProfit.style.color = profitValue >= 0 ? '#00ff9d' : '#ff4757';
                }
                
                setTimeout(() => {
                    calculate();
                }, 100);
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        }
    }
    
    // ========== РАСЧЕТ РЕСУРСОВ ==========
    
    function calculateResourcesFromSugar(sugarAmount) {
        const sugar = parseFloat(sugarAmount) || 0;
        const catalystCrafts = Math.floor(sugar / CRAFT.CATALYST.SUGAR);
        const neededSugar = catalystCrafts * CRAFT.CATALYST.SUGAR;
        const neededDustForCatalyst = catalystCrafts * CRAFT.CATALYST.DUST;
        
        const sugarCrafts = Math.ceil(neededSugar / CRAFT.SUGAR.OUTPUT);
        const neededSlatsForSugar = sugarCrafts * CRAFT.SUGAR.SLATS;
        const neededPlasmaForSugar = sugarCrafts * CRAFT.SUGAR.PLASMA;
        const neededDustForSugar = sugarCrafts * CRAFT.SUGAR.DUST;
        
        return {
            sugar: neededSugar,
            slast: neededSlatsForSugar,
            plasma: neededPlasmaForSugar,
            dust: neededDustForSugar + neededDustForCatalyst,
            catalystCrafts: catalystCrafts
        };
    }
    
    function calculateSugarFromResources(slast, dust, plasma) {
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
    
    slastInput.addEventListener('input', function() {
        const slast = parseFloat(this.value) || 0;
        plasmaInput.value = Math.floor(slast / 10);
        dustInput.value = Math.floor(slast * 30);
        
        const dust = parseFloat(dustInput.value) || 0;
        const plasma = parseFloat(plasmaInput.value) || 0;
        
        const sugarData = calculateSugarFromResources(slast, dust, plasma);
        sugarInput.value = sugarData.sugar;
        
        calculate();
        saveAllData();
    });
    
    dustInput.addEventListener('input', function() {
        const dust = parseFloat(this.value) || 0;
        slastInput.value = Math.floor(dust / 30);
        plasmaInput.value = Math.floor(dust / 300);
        
        const slast = parseFloat(slastInput.value) || 0;
        const plasma = parseFloat(plasmaInput.value) || 0;
        
        const sugarData = calculateSugarFromResources(slast, dust, plasma);
        sugarInput.value = sugarData.sugar;
        
        calculate();
        saveAllData();
    });
    
    plasmaInput.addEventListener('input', function() {
        const plasma = parseFloat(this.value) || 0;
        slastInput.value = plasma * 10;
        dustInput.value = plasma * 300;
        
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
    
    useTaxCheckbox.addEventListener('change', function() {
        calculate();
        saveAllData();
    });
    
    // ========== ОСНОВНОЙ РАСЧЕТ ==========
    
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
        
        // Расчет стоимости сахара
        const costOneSugarCraft = 
            (CRAFT.SUGAR.SLATS * priceSlast + 
             CRAFT.SUGAR.PLASMA * pricePlasma + 
             CRAFT.SUGAR.DUST * priceDust + 
             CRAFT.ENERGY_PER_CRAFT * priceEnergy) / CRAFT.SUGAR.OUTPUT;
        
        priceSugarInput.value = Math.round(costOneSugarCraft);
        
        // Расчет катализаторов
        let catalystsProduced = 0;
        let totalCost = 0;
        
        if (sugar > 0) {
            const catalystCrafts = Math.floor(sugar / CRAFT.CATALYST.SUGAR);
            const neededSugar = catalystCrafts * CRAFT.CATALYST.SUGAR;
            const neededDustForCatalyst = catalystCrafts * CRAFT.CATALYST.DUST;
            
            const sugarCrafts = Math.ceil(neededSugar / CRAFT.SUGAR.OUTPUT);
            const neededSlatsForSugar = sugarCrafts * CRAFT.SUGAR.SLATS;
            const neededPlasmaForSugar = sugarCrafts * CRAFT.SUGAR.PLASMA;
            const neededDustForSugar = sugarCrafts * CRAFT.SUGAR.DUST;
            
            catalystsProduced = catalystCrafts * CRAFT.CATALYST.OUTPUT;
            
            const costSlats = neededSlatsForSugar * priceSlast;
            const costPlasma = neededPlasmaForSugar * pricePlasma;
            const costDust = (neededDustForSugar + neededDustForCatalyst) * priceDust;
            const totalEnergyUsed = (sugarCrafts + catalystCrafts) * CRAFT.ENERGY_PER_CRAFT;
            const costEnergy = totalEnergyUsed * priceEnergy;
            
            totalCost = costSlats + costPlasma + costDust + costEnergy;
        } else {
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
        
        // Выручка и прибыль
        let revenue = catalystsProduced * priceCatalyst;
        if (useTax) {
            revenue = revenue * 0.95;
        }
        
        const profit = revenue - totalCost;
        
        // Обновление интерфейса
        updateResults(catalystsProduced, totalCost, revenue, profit);
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
            return '0\xa0₽'; // Неразрывный пробел
        }
        
        // БЕЗ "млн" - всегда показываем полное число
        // Форматируем с пробелами тысяч и фиксируем знак рубля
        if (Math.abs(amount) >= 1000) {
            return Math.round(amount).toLocaleString('ru-RU') + '\xa0₽';
        }
        
        return amount.toFixed(1) + '\xa0₽';
    }
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    
    setupSimpleLimits();
    loadSavedData();
}
