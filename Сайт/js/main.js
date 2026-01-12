// js/main.js
import { CatalystCalculator } from './modules/catalyst.js';
import { GasTankCalculator } from './modules/gastank.js';
import { formatMoney } from './utils/formatters.js';

class App {
    constructor() {
        this.calculators = {
            catalyst: new CatalystCalculator(),
            gastank: new GasTankCalculator()
        };
        
        this.currentTab = 'catalyst';
        this.init();
    }
    
    init() {
        // Загрузка сохраненных данных
        this.calculators.catalyst.loadFromStorage();
        
        // Навешиваем обработчики
        this.bindEvents();
        
        // Первый расчет
        this.updateUI();
    }
    
    bindEvents() {
        // Переключение вкладок
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Изменение значений
        document.getElementById('catalyst-slast').addEventListener('input', (e) => {
            this.calculators.catalyst.updateResource('slast', parseFloat(e.target.value));
            this.updateUI();
            this.calculators.catalyst.saveToStorage();
        });
    }
    
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Показываем/скрываем секции
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${tabName}-section`).classList.add('active');
        
        // Обновляем UI
        this.updateUI();
    }
    
    updateUI() {
        const results = this.calculators[this.currentTab].calculate();
        
        // Обновляем DOM
        if (this.currentTab === 'catalyst') {
            document.getElementById('catalyst-results').innerHTML = `
                <div>Катализаторов: ${results.output}</div>
                <div>Прибыль: ${formatMoney(results.profit)}</div>
            `;
        }
    }
}

// Запускаем приложение
const app = new App();