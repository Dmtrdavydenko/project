цель ускорить вычисления с помощью webGPU
интерфейс сети следующий
задача написать код
Входной вектор 64
architecture задается при инициализации
class NeuralNetwork {
    constructor(architecture, learningRate = 0.1) {
        this.architecture = architecture;
        this.learningRate = learningRate;
        this.weights = [];
        this.biases = [];
        this.layers = architecture.length;

        // Инициализация весов и смещений
        for (let i = 0; i < this.layers - 1; i++) {
            const rows = architecture[i + 1];
            const cols = architecture[i];

            // Инициализация весов случайными значениями
            this.weights[i] = this.randomMatrix(rows, cols, -1, 1);
            //this.weights[i] = this.randomMatrix(rows, cols, -Math.sqrt(6 / (rows + cols)), Math.sqrt(6 / (rows + cols)));
            // Инициализация смещений нулями
            this.biases[i] = this.randomMatrix(rows, 1, -0.5, 0.5);
            //this.biases[i] = this.randomMatrix(rows, 1, 0, 0);
        }
    }
    // Генерация случайной матрицы
    randomMatrix(rows, cols, min, max) {

    }
    // Перемножение матриц
    multiplyMatrices(a, b) {

    }
    // Транспонирование матрицы
    transpose(matrix) {
    }
    // Функция активации (сигмоид)
    sigmoid(x) {
    }
    // Производная сигмоиды
    sigmoidDerivative(x) {
    }
    // Прямое распространение
    forward(input) {

    }
    // Добавление векторов
    addVectors(a, b) {
    }
    // Обратное распространение ошибки
    backward(input, target, activations, zs) {

    }
    // Вычитание матриц
    subtractMatrices(a, b) {
    }
    // Обновление весов и смещений
    updateParameters(gradients) {

    }
    // Сложение матриц
    addMatrices(a, b) {
    }
    // Обучение на одном примере
    trainSingle(input, target) {

    }
    // Вычисление ошибки (среднеквадратичная)
    calculateError(target, output) {

    }
    // Предсказание
    predict(input) {

    }
    // Пакетное обучение
    trainBatch(inputs, targets, epochs, progressCallback) {

    }
    // Метод для получения состояния сети (для сохранения)
    getState() {

    }
    // Метод для загрузки состояния сети (для восстановления)
    loadState(state) {

    }
    getLayers() {
    }
    getWeights() {

    }
    detectObjectsFromGradient(ctx, w, h, data, step = 2, threshold = 20) {
    // 1. Сделаем grayscale
    const gray = new Uint8ClampedArray(w * h);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            gray[y * w + x] = (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
    }

    // 2. Градиенты (Sobel)
    const gxKernel = [
        -1, 0, 1,
        -2, 0, 2,
        -1, 0, 1
    ];
    const gyKernel = [
        -1, -2, -1,
        0, 0, 0,
        1, 2, 1
    ];
    const magnitude = new Float32Array(w * h);

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            let gx = 0, gy = 0;
            let k = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const val = gray[(y + ky) * w + (x + kx)];
                    gx += val * gxKernel[k];
                    gy += val * gyKernel[k];
                    k++;
                }
            }
            magnitude[y * w + x] = Math.sqrt(gx * gx + gy * gy);
        }
    }

    // 3. Thresholding
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < magnitude.length; i++) {
        mask[i] = magnitude[i] > threshold ? 1 : 0;
    }

    // 4. Connected Component Analysis (простая реализация)
    const visited = new Uint8Array(w * h);
    const objects = [];

    function dfs(sx, sy, obj) {
        const stack = [[sx, sy]];
        while (stack.length) {
            const [x, y] = stack.pop();
            const idx = y * w + x;
            if (x < 0 || x >= w || y < 0 || y >= h) continue;
            if (visited[idx] || mask[idx] === 0) continue;

            visited[idx] = 1;
            obj.push([x, y]);

            stack.push([x + 1, y]);
            stack.push([x - 1, y]);
            stack.push([x, y + 1]);
            stack.push([x, y - 1]);
        }
    }

    for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
            const idx = y * w + x;
            if (!visited[idx] && mask[idx]) {
                const obj = [];
                dfs(x, y, obj);
                if (obj.length > 3500) objects.push(obj); // фильтр мелких шумов
            }
        }
    }

    // 5. Рисуем bounding boxes
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;

    objects.forEach(obj => {
        // 1️⃣ Вычисляем границы bounding‑box
        let minX = w, minY = h, maxX = 0, maxY = 0;
        obj.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        });

        const rectX = minX;
        const rectY = minY;
        const rectW = maxX - minX;
        const rectH = maxY - minY;

        // 2️⃣ Рисуем сам прямоугольник
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(rectX, rectY, rectW, rectH);

        // 3️⃣ Текст, который нужно отобразить
        const label = `${obj.length} w:${rectW} h:${rectH} w/h:${rectW / rectH}`;          // например, количество точек
        // const label = "Box 1";          // или произвольная метка

        // 4️⃣ Настраиваем шрифт и цвет текста
        ctx.font = "32px Arial";
        ctx.fillStyle = "white";           // цвет текста
        ctx.textBaseline = "top";
        ctx.textAlign = "left";

        // 5️⃣ Измеряем ширину текста, чтобы центрировать
        const textMetrics = ctx.measureText(label);
        const textW = textMetrics.width;
        const textH = 18; // приближённая высота шрифта (можно уточнить)

        // 6️⃣ Вычисляем позицию текста внутри прямоугольника
        const padding = 4; // отступ от границ прямоугольника
        const textX = rectX + (rectW - textW) / 2;
        const textY = rectY + padding;

        // 7️⃣ (Опционально) рисуем фон под текстом для читаемости
        ctx.fillStyle = "rgba(0,0,0,0.6)"; // полупрозрачный чёрный фон
        ctx.fillRect(textX - padding, textY - padding, textW + 2 * padding, textH + 2 * padding);

        // 8️⃣ Рисуем сам текст
        ctx.fillStyle = "white";
        ctx.fillText(label, textX, textY);
    });

    return objects;
}
}
Параметры GPU

const gpu = {
    maxBindGroups: 4,
    maxBindGroupsPlusVertexBuffers: 24,
    maxBindingsPerBindGroup: 1000,
    maxBufferSize: 2147483648,
    maxColorAttachmentBytesPerSample:128,
    maxColorAttachments:8,
    maxComputeInvocationsPerWorkgroup:1024,
    maxComputeWorkgroupSizeX:1024,
    maxComputeWorkgroupSizeY:1024,
    maxComputeWorkgroupSizeZ:64,
    maxComputeWorkgroupStorageSize:32768,
    maxComputeWorkgroupsPerDimension:65535,
    maxDynamicStorageBuffersPerPipelineLayout:8,
    maxDynamicUniformBuffersPerPipelineLayout:10,
    maxInterStageShaderVariables:28,
    maxSampledTexturesPerShaderStage:16,
    maxSamplersPerShaderStage:16,
    maxStorageBufferBindingSize:2147483644,
    maxStorageBuffersPerShaderStage:10,
    maxStorageTexturesPerShaderStage:8,
    maxTextureArrayLayers:2048,
    maxTextureDimension1D:16384,
    maxTextureDimension2D:16384,
    maxTextureDimension3D:2048,
    maxUniformBufferBindingSize:65536,
    maxUniformBuffersPerShaderStage:12,
    maxVertexAttributes:30,
    maxVertexBufferArrayStride:2048,
    maxVertexBuffers:8,
    minStorageBufferOffsetAlignment:256,
    minUniformBufferOffsetAlignment:256
}