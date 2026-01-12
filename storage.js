// js/storage.js - Модуль для сохранения данных

class DataStorage {
    constructor() {
        this.STORAGE_KEY = 'stalcraft_calculator_data';
        this.defaultData = {
            version: '1.0',
            resources: {
                slast: 10,
                dust: 300,
                plasma: 1
            },
            prices: {
                slast: 9000,
                dust: 300,
                plasma: 3000,
                energy: 0.6,
                catalyst: 6000
            },
            settings: {
                useTax: true
            },
            lastSave: null
        };
        
        // Инициализируем данные
        this.data = this.loadData();
    }
    
    // Загрузка данных из LocalStorage
    loadData() {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                
                // Проверяем версию и структуру данных
                if (parsed.version === this.defaultData.version) {
                    // Объединяем с дефолтными значениями на случай, если структура изменилась
                    return {
                        ...this.defaultData,
                        ...parsed,
                        resources: { ...this.defaultData.resources, ...parsed.resources },
                        prices: { ...this.defaultData.prices, ...parsed.prices },
                        settings: { ...this.defaultData.settings, ...parsed.settings }
                    };
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
        
        // Возвращаем данные по умолчанию
        return { ...this.defaultData };
    }
    
    // Сохранение данных в LocalStorage
    saveData() {
        try {
            this.data.lastSave = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            console.log('Данные сохранены:', this.data);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
            return false;
        }
    }
    
    // Получение всех данных
    getAllData() {
        return { ...this.data };
    }
    
    // Сохранение ресурсов
    saveResources(slast, dust, plasma) {
        this.data.resources = {
            slast: Number(slast) || 10,
            dust: Number(dust) || 300,
            plasma: Number(plasma) || 1
        };
        return this.saveData();
    }
    
    // Сохранение цен
    savePrices(slastPrice, dustPrice, plasmaPrice, energyPrice, catalystPrice) {
        this.data.prices = {
            slast: Number(slastPrice) || 7800,
            dust: Number(dustPrice) || 275,
            plasma: Number(plasmaPrice) || 1500,
            energy: Number(energyPrice) || 1.2,
            catalyst: Number(catalystPrice) || 4135
        };
        return this.saveData();
    }
    
    // Сохранение настроек
    saveSettings(useTax) {
        this.data.settings = {
            useTax: Boolean(useTax)
        };
        return this.saveData();
    }
    
    // Получение ресурсов
    getResources() {
        return { ...this.data.resources };
    }
    
    // Получение цен
    getPrices() {
        return { ...this.data.prices };
    }
    
    // Получение настроек
    getSettings() {
        return { ...this.data.settings };
    }
    
    // Сброс к значениям по умолчанию
    resetToDefaults() {
        this.data = { ...this.defaultData };
        return this.saveData();
    }
    
    // Экспорт данных (для скачивания)
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `stalcraft_calculator_backup_${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        return true;
    }
    
    // Импорт данных из файла
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // Проверяем структуру
                    if (importedData.version && importedData.resources && importedData.prices) {
                        this.data = {
                            ...this.defaultData,
                            ...importedData
                        };
                        this.saveData();
                        resolve(true);
                    } else {
                        reject('Неверный формат файла');
                    }
                } catch (error) {
                    reject('Ошибка чтения файла');
                }
            };
            
            reader.onerror = () => reject('Ошибка чтения файла');
            reader.readAsText(file);
        });
    }
    
    // Получение информации о сохранении
    getSaveInfo() {
        if (this.data.lastSave) {
            const date = new Date(this.data.lastSave);
            return {
                date: date.toLocaleDateString('ru-RU'),
                time: date.toLocaleTimeString('ru-RU'),
                fullDate: date.toLocaleString('ru-RU')
            };
        }
        return null;
    }
}

// Создаем глобальный экземпляр
const storageManager = new DataStorage();

// Экспортируем для использования в других файлах
if (typeof window !== 'undefined') {
    window.storageManager = storageManager;
}

console.log('Storage Manager загружен');
