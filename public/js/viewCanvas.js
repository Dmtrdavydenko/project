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






(async () => {
    const Tape = new DataTape("https://worktime.up.railway.app/app");
    const [data] = await Tape.loadData("getTapeKnowledge");
    console.info({ data: data });

    const canvas = document.getElementById("chart");
    const ctx = canvas.getContext("2d");

    const paddingLeft = 70;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 80;

    const plotWidth = canvas.width - paddingLeft - paddingRight;
    const plotHeight = canvas.height - paddingTop - paddingBottom;

    const pointRadius = 1.5;
    let hoveredPoint = null;
    const colorsHEX = ["#893b3b", "#c91d1d", "#a3a133", "#e5e110", "#669732", "#7de909", "#64b996", "#00ff9", "#389ca7", "#00e6ff", "#6c81d3", "#0034ff", "#9b4e9f", "#dc0ce7"];
    const uniqueDensities = [...new Set(data.map(item => item.density))].sort((a, b) => a - b);
    console.info({ uniqueDensities: uniqueDensities });

    let colors = {};
    uniqueDensities.forEach((item,index) => {
        colors[item] = colorsHEX[index];

    });
    console.info(colors);
    //const colors = {
    //    78: "#e74c3c",
    //    90: "#3498db",
    //    105: "#27ae60",
    //    130: "#f39c12",
    //    140: "#3498db",
    //    170: "#8e44ad",
    //    220: "#2c3e50"
    //};

    const lengths = data.map(d => d.length);
    const diameters = data.map(d => parseFloat(d.diameter));

    const minX = Math.min(...lengths);
    const maxX = Math.max(...lengths);
    const minY = 0;
    const maxY = 170; // чтобы на оси были метки до 110 и выше

    function scaleX(x) {
        return paddingLeft + ((x - minX) / (maxX - minX)) * plotWidth;
    }

    function scaleY(y) {
        return paddingTop + plotHeight - ((y - minY) / (maxY - minY)) * plotHeight;
    }

    function unscaleX(px) {
        return minX + ((px - paddingLeft) / plotWidth) * (maxX - minX);
    }

    function unscaleY(py) {
        return minY + ((paddingTop + plotHeight - py) / plotHeight) * (maxY - minY);
    }

    function drawAxes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#333";
        ctx.fillStyle = "#333";
        ctx.font = "12px Arial";

        // Оси
        ctx.beginPath();
        ctx.moveTo(paddingLeft, paddingTop);
        ctx.lineTo(paddingLeft, paddingTop + plotHeight);
        ctx.lineTo(paddingLeft + plotWidth, paddingTop + plotHeight);
        ctx.stroke();

        // Метки по Y
        for (let y = 0; y <= 170; y += 10) {
            const py = scaleY(y);

            ctx.strokeStyle = "#e5e5e5";
            ctx.beginPath();
            ctx.moveTo(paddingLeft, py);
            ctx.lineTo(paddingLeft + plotWidth, py);
            ctx.stroke();

            ctx.strokeStyle = "#333";
            ctx.fillStyle = "#333";
            ctx.beginPath();
            ctx.moveTo(paddingLeft - 5, py);
            ctx.lineTo(paddingLeft, py);
            ctx.stroke();

            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillText(String(y), paddingLeft - 8, py);
        }

        // Метки по X
        const xStep = chooseStep(maxX - minX);
        const firstTick = Math.ceil(minX / xStep) * xStep;

        for (let x = firstTick; x <= maxX; x += xStep) {
            const px = scaleX(x);

            ctx.strokeStyle = "#333";
            ctx.beginPath();
            ctx.moveTo(px, paddingTop + plotHeight);
            ctx.lineTo(px, paddingTop + plotHeight + 4);
            ctx.stroke();

            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#333";
            ctx.fillText(`${x}`, px, paddingTop + plotHeight + 10);
        }

        // Подписи осей
        ctx.save();
        ctx.fillStyle = "#111";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Длина, м", paddingLeft + plotWidth / 2, canvas.height - 16);

        ctx.translate(20, paddingTop + plotHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("Диаметр", 0, 0);
        ctx.restore();
    }

    function chooseStep(range) {
        if (range <= 500) return 50;
        if (range <= 2000) return 100;
        if (range <= 5000) return 500;
        if (range <= 10000) return 1000;
        return 2000;
    }

    function drawPoints() {
        data.forEach((d, index) => {
            const x = scaleX(d.length);
            const y = scaleY(parseFloat(d.diameter));

            ctx.fillStyle = colors[d.density] || "#666";
            ctx.beginPath();
            ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
            ctx.fill();

            if (hoveredPoint && hoveredPoint.index === index) {
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, pointRadius + 4, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
    }

    function drawTooltip(point) {
        if (!point) return;

        const x = scaleX(point.length);
        const y = scaleY(parseFloat(point.diameter));

        const text = `density: ${point.density}, length: ${point.length}, diameter: ${point.diameter}`;
        ctx.font = "12px Arial";
        const textWidth = ctx.measureText(text).width;
        const boxW = textWidth + 16;
        const boxH = 28;

        let boxX = x + 12;
        let boxY = y - boxH - 12;

        if (boxX + boxW > canvas.width) boxX = x - boxW - 12;
        if (boxY < 0) boxY = y + 12;

        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(boxX, boxY, boxW, boxH);

        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(text, boxX + 8, boxY + boxH / 2);
    }
    function drawLegend() {
        const entries = Object.keys(colors);

        const boxSize = 12;
        const gap = 8;
        const itemSpacing = 70;

        const startY = canvas.height - 28;
        let startX = paddingLeft;

        ctx.font = "12px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        entries.forEach(density => {
            // цвет
            ctx.fillStyle = colors[density];
            ctx.fillRect(startX, startY - boxSize / 2, boxSize, boxSize);

            ctx.strokeStyle = "#000";
            ctx.strokeRect(startX, startY - boxSize / 2, boxSize, boxSize);

            // текст
            ctx.fillStyle = "#000";
            ctx.fillText(density, startX + boxSize + gap, startY);

            startX += itemSpacing;
        });
    }

    function render() {
        drawAxes();
        drawPoints();
        drawLegend();
        if (hoveredPoint) drawTooltip(hoveredPoint);
    }

    function getMousePos(evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) * (canvas.width / rect.width),
            y: (evt.clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    canvas.addEventListener("mousemove", (evt) => {
        const mouse = getMousePos(evt);
        hoveredPoint = null;

        for (let i = 0; i < data.length; i++) {
            const d = data[i];
            const px = scaleX(d.length);
            const py = scaleY(parseFloat(d.diameter));
            const dist = Math.hypot(mouse.x - px, mouse.y - py);

            if (dist <= 8) {
                hoveredPoint = { ...d, index: i };
                break;
            }
        }

        render();
    });

    canvas.addEventListener("mouseleave", () => {
        hoveredPoint = null;
        render();
    });

    render();

    // линия на уровне diameter = 110
    const targetY = 110;
    const py110 = scaleY(targetY);

    // рисуем линию
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 1.5;


    // подпись "110"
    ctx.fillStyle = "#ff0000";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    //ctx.fillText("110", paddingLeft - 8, py110);

    // теперь ищем точки рядом с 110 и подписываем их length
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";




    // сгруппировать по density и выбрать лучшую точку
    const bestPoints = {};

    data.forEach(d => {
        const diameter = parseFloat(d.diameter);
        const density = d.density;

        if (diameter >= 105 && diameter <= 110) {
            const diff = Math.abs(110 - diameter);

            if (
                !bestPoints[density] ||
                diff < bestPoints[density].diff
            ) {
                bestPoints[density] = {
                    ...d,
                    diff
                };
            }
        }
    });

    // рисуем только выбранные точки
    Object.values(bestPoints).forEach(d => {
        const x = scaleX(d.length);

        ctx.beginPath();
        ctx.moveTo(x, py110 - 3);
        ctx.lineTo(x, py110 + 3);
        ctx.stroke();
        ctx.fillText(d.length, x, py110);
    });
    function spoolDiameterMm(tex, lengthM) {
        const D0 = 47.0;   // диаметр втулки, мм
        const b = 0.989;   // общий показатель по длине, по твоим данным

        // Калибровка по твоей таблице:
        // tex -> коэффициент a(tex) в формуле D = sqrt(D0^2 + a(tex) * length^b)
        const coeffs = [
            [78, 0.6818082908],
            [90, 0.8040206266],
            [105, 0.9254341990],
            [130, 1.1492611173],
            [140, 1.3169122802],
            [170, 1.5959130860],
            [220, 2.0872955168],
        ];

        if (!Number.isFinite(tex) || !Number.isFinite(lengthM) || tex <= 0 || lengthM < 0) {
            return NaN;
        }

        function interpA(t) {
            if (t <= coeffs[0][0]) return coeffs[0][1];
            if (t >= coeffs[coeffs.length - 1][0]) return coeffs[coeffs.length - 1][1];

            for (let i = 0; i < coeffs.length - 1; i++) {
                const [t0, a0] = coeffs[i];
                const [t1, a1] = coeffs[i + 1];
                if (t >= t0 && t <= t1) {
                    const k = (t - t0) / (t1 - t0);
                    return a0 + k * (a1 - a0);
                }
            }
            return coeffs[coeffs.length - 1][1];
        }

        const a = interpA(tex);
        return Math.sqrt(D0 * D0 + a * Math.pow(lengthM, b));
    }
    const tex = document.createElement("input");
    tex.type = "number";
    tex.placeholder = "Текс";
    const length = document.createElement("input");
    length.type = "number";
    length.placeholder = "Длина";
    const label = document.createElement("label");
    tex.addEventListener("input", () => {
        label.textContent = spoolDiameterMm(tex.valueAsNumber, length.valueAsNumber)||0
    })
    length.addEventListener("input", () => {
        label.textContent = spoolDiameterMm(tex.valueAsNumber, length.valueAsNumber)||0
    })
    document.body.append(tex);
    document.body.append(length);
    document.body.append(label);
})();