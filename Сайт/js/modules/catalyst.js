// js/modules/catalyst.js
export class CatalystCalculator {
    constructor() {
        this.state = {
            resources: { slast: 1000, dust: 10000 },
            prices: { slast: 7800, dust: 275 },
            sellPrice: 4135,
            useTax: true
        };
    }
    
    calculate() {
        // Логика расчета катализаторов
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
    
    updateResource(resource, value) {
        this.state.resources[resource] = value;
        
        // Автоматическая связь сласть ↔ пыль
        if (resource === 'slast') {
            this.state.resources.dust = value * 10;
        } else if (resource === 'dust') {
            this.state.resources.slast = value / 10;
        }
    }
    
    saveToStorage() {
        localStorage.setItem('catalyst_calc', JSON.stringify(this.state));
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('catalyst_calc');
        if (saved) {
            this.state = JSON.parse(saved);
        }
    }
}