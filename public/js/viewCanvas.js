class DataTape {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.data = [];
    }
    async loadData(action, params = {}) {
        try {
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({
                    action: action, // Например, "getThreads", "getTasks"
                    ...params
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            this.data = await response.json(); // Предполагаем, что API возвращает массив объектов
            return this.data;
        } catch (error) {
            console.error("Ошибка при загрузке данных:", error);
            throw error;
        }
    }
    getAll() {
        return [...this.data];
    }
    getByIndex(index) {
        if (index < 0 || index >= this.data.length) {
            throw new Error("Индекс вне диапазона");
        }
        return { ...this.data[index] }; // Возвращаем копию объекта
    }
    getById(id) {
        const item = this.data.find(item => item.id === id);
        if (!item) {
            throw new Error(`Элемент с ID ${id} не найден`);
        }
        return { ...item }; // Возвращаем копию
    }
    filter(callback) {
        return this.data.filter(callback);
    }
    add(item) {
        if (!item || typeof item !== 'object') {
            throw new Error("Неверный элемент для добавления");
        }
        this.data.push({ ...item }); // Добавляем копию
        return this.data.length - 1; // Возвращаем индекс нового элемента
    }
    updateById(id, updates) {
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error(`Элемент с ID ${id} не найден`);
        }
        this.data[index] = { ...this.data[index], ...updates }; // Обновляем объект
        return { ...this.data[index] }; // Возвращаем обновленный элемент
    }
    removeById(id) {
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error(`Элемент с ID ${id} не найден`);
        }
        const removed = this.data.splice(index, 1)[0];
        return removed; // Возвращаем удаленный элемент
    }
    async syncInsert(action, item) {
        try {
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({
                    action: action, // Например, "insertTask"
                    data: item
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            const result = await response.json();
            // После успешной синхронизации можно обновить локальные данные, если сервер вернул новый ID и т.д.
            return result;
        } catch (error) {
            console.error("Ошибка при синхронизации вставки:", error);
            throw error;
        }
    }
    getCount() {
        return this.data.length;
    }
    sort(compareFunction) {
        return [...this.data].sort(compareFunction);
    }
}





const Tape = new DataTape("https://worktime.up.railway.app/app");

(async () => {
    const [data] = await Tape.loadData("getTapeKnowledge");

    const canvas = document.getElementById('chart');
    const ctx = canvas.getContext('2d');

    // цвета для разных density
    const colors = {
        78: 'red',
        90: 'blue',
        105: 'green',
        130: 'orange',
        170: 'purple',
        220: 'black'
    };

    // находим границы
    const lengths = data.map(d => d.length);
    const diameters = data.map(d => parseFloat(d.diameter));

    const minX = Math.min(...lengths);
    const maxX = Math.max(...lengths);
    const minY = Math.min(...diameters);
    const maxY = Math.max(...diameters);


    // отступы
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // функция масштабирования
    function scaleX(x) {
        return padding + (x - minX) / (maxX - minX) * width;
    }

    function scaleY(y) {
        return canvas.height - padding - (y - minY) / (maxY - minY) * height;
    }

    // оси
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // точки
    data.forEach(d => {
        const x = scaleX(d.length);
        const y = scaleY(parseFloat(d.diameter));

        ctx.fillStyle = colors[d.density] || 'gray';

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
})();