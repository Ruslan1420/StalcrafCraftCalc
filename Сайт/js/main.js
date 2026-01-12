// УБРАТЬ import/export, сделать всё в одном файле
class CatalystCalculator {
    constructor() {
        this.state = {
            resources: { slast: 1000, dust: 10000 },
            prices: { slast: 7800, dust: 275 },
            sellPrice: 4135,
            useTax: true
        };
    }
    
    calculate() {
        const output = this.state.resources.slast / 10 * 20;
        const cost = this.state.resources.slast * this.state.prices.slast;
        const revenue = output * this.state.sellPrice;
        const profit = revenue - cost;
        
        return {
            output: Math.floor(output),
            cost: Math.floor(cost),
            revenue: Math.floor(revenue),
            profit: Math.floor(profit)
        };
    }
}

// ВСЯ ЛОГИКА В ОДНОМ ФАЙЛЕ
class App {
    constructor() {
        this.calculator = new CatalystCalculator();
        this.init();
    }
    
    init() {
        // Настройка полей
        document.getElementById('catalyst-slast').value = this.calculator.state.resources.slast;
        document.getElementById('catalyst-dust').value = this.calculator.state.resources.dust;
        
        // Обработчики
        document.getElementById('catalyst-slast').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) || 0;
            this.calculator.state.resources.slast = value;
            this.calculator.state.resources.dust = value * 10;
            document.getElementById('catalyst-dust').value = value * 10;
            this.updateUI();
        });
        
        this.updateUI();
    }
    
    updateUI() {
        const results = this.calculator.calculate();
        document.getElementById('catalyst-results').innerHTML = `
            <div>Катализаторов: ${results.output}</div>
            <div>Прибыль: ${results.profit.toLocaleString()} ₽</div>
        `;
    }
}

// Запуск
new App();

// Запускаем приложение

const app = new App();
