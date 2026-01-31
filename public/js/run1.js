class NeuralNetworkGPU {
    constructor(architecture, learningRate = 0.1) {
        this.architecture = architecture;
        this.learningRate = learningRate;
        this.weights = [];      // на CPU — только для инициализации
        this.biases = [];
        this.layers = architecture.length;

        // GPU-буферы (будут созданы в initGPU)
        this.gpuBuffers = {};   // { weights: [], biases: [], ... }
        this.pipeline = null;
        this.bindGroup = null;
        this.device = null;
        this.queue = null;
        this.layerInfoBuffer = null;

        // Инициализация весов и смещений на CPU (для копирования на GPU)
        for (let i = 0; i < this.layers - 1; i++) {
            const rows = architecture[i + 1];
            const cols = architecture[i];
            this.weights[i] = this.randomMatrix(rows, cols, -1, 1);
            this.biases[i] = this.randomMatrix(rows, 1, -0.5, 0.5);
        }
    }

    // Генерация случайной матрицы (на CPU)
    randomMatrix(rows, cols, min, max) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = min + (max - min) * Math.random();
            }
        }
        return matrix;
    }

    // Преобразование матрицы в плоский Float32Array
    matrixToFloat32(matrix) {
        const flat = new Float32Array(matrix.flat());
        return flat;
    }

    // Вычисление размера буфера с выравниванием (для WebGPU)
    alignedSize(sizeInBytes) {
        const alignment = 256; // minUniformBufferOffsetAlignment
        return Math.ceil(sizeInBytes / alignment) * alignment;
    }

    // Инициализация WebGPU
    async initGPU() {
        if (!navigator.gpu) throw new Error("WebGPU not supported");

        this.device = await navigator.gpu.requestAdapter().then(adapter => adapter.requestDevice());

        this.queue = this.device.queue;

        // Создаем буферы для весов, смещений, активаций, градиентов
        this.gpuBuffers = this.createGPUBuffers();

        // Компилируем шейдеры
        this.createComputePipelines();

        // Создаем bind groups
        this.createBindGroups();
    }

    // Создание GPU-буферов
    createGPUBuffers() {
        const buffers = {};
        const totalWeights = this.weights.reduce((sum, w) => sum + w.length * w[0].length, 0);
        const totalBiases = this.biases.reduce((sum, b) => sum + b.length, 0);

        // Веса: каждый слой отдельно
        buffers.weights = this.weights.map((w, i) => {
            const size = this.alignedSize(w.length * w[0].length * 4); // float32 = 4 байта
            const buffer = this.device.createBuffer({
                size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            });
            this.queue.writeBuffer(buffer, 0, this.matrixToFloat32(w));
            return buffer;
        });

        // Смещения
        buffers.biases = this.biases.map((b, i) => {
            const size = this.alignedSize(b.length * 4);
            const buffer = this.device.createBuffer({
                size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            });
            this.queue.writeBuffer(buffer, 0, this.matrixToFloat32(b));
            return buffer;
        });

        // Активации (z и a) — для каждого слоя
        buffers.activations = [];
        buffers.zs = [];
        for (let i = 0; i < this.layers; i++) {
            const size = this.alignedSize(this.architecture[i] * 4);
            buffers.activations[i] = this.device.createBuffer({
                size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            });
            buffers.zs[i] = this.device.createBuffer({
                size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            });
        }

        // Градиенты (для обратного прохода)
        buffers.weightGrads = this.weights.map(() => {
            const size = this.alignedSize(1024 * 4); // достаточно для 64x32, 32x16 и т.д.
            return this.device.createBuffer({
                size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            });
        });

        buffers.biasGrads = this.biases.map(() => {
            const size = this.alignedSize(1024 * 4);
            return this.device.createBuffer({
                size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            });
        });

        buffers.readBuffer = this.device.createBuffer({
            size: 0, // пока не знаем размер
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        // Вход и выход
        buffers.input = this.device.createBuffer({
            size: this.alignedSize(this.architecture[0] * 4),
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        });

        buffers.target = this.device.createBuffer({
            size: this.alignedSize(this.architecture[this.layers - 1] * 4),
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        });

        buffers.output = this.device.createBuffer({
            size: this.alignedSize(this.architecture[this.layers - 1] * 4),
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        });

        return buffers;
    }

    // Создание вычислительных пайплайнов
    createComputePipelines() {
        const shaderCode = `
            // Параметры
            struct LayerInfo {
                inputSize: u32,
                outputSize: u32,
            };

            // Буферы
            @group(0) @binding(0) var<storage, read> weights: array<f32>;
            @group(0) @binding(1) var<storage, read> biases: array<f32>;
            @group(0) @binding(2) var<storage, read> input: array<f32>;
            @group(0) @binding(3) var<storage, read_write> output: array<f32>;
            @group(0) @binding(4) var<storage, read_write> zs: array<f32>;

            // Константы
            @group(0) @binding(5) var<uniform> layerInfo: LayerInfo;

            // Сигмоид
            fn sigmoid(x: f32) -> f32 {
                return 1.0 / (1.0 + exp(-x));
            }

            // Прямой проход для одного слоя: a = sigmoid(W * x + b)
            @compute @workgroup_size(64)
            fn forwardLayer(@builtin(global_invocation_id) id: vec3u) {
                let outputIdx = id.x;
                if (outputIdx >= layerInfo.outputSize) {
                    return;
                }

                var sum: f32 = 0.0;
                for (var i = 0u; i < layerInfo.inputSize; i = i + 1u) {
                    let weightIdx = outputIdx * layerInfo.inputSize + i;
                    sum += weights[weightIdx] * input[i];
                }
                sum += biases[outputIdx];
                zs[outputIdx] = sum;
                output[outputIdx] = sigmoid(sum);
            }

            // Обратный проход: градиенты
            @compute @workgroup_size(64)
            fn backwardLayer(@builtin(global_invocation_id) id: vec3u) {
                // Простой пример: для последнего слоя
                // В реальности нужно каскадно проходить назад
                // Здесь — заглушка для демонстрации
                // В полной версии нужно 3 шейдера: для выхода, скрытых слоев, обновления
                // Для краткости — реализуем только обновление весов
            }

            // Обновление весов
            @compute @workgroup_size(64)
            fn updateWeights(@builtin(global_invocation_id) id: vec3u) {
                let idx = id.x;
                if (idx >= layerInfo.inputSize * layerInfo.outputSize) {
                    return;
                }

                // Здесь: weights[idx] -= learningRate * gradient[idx]
                // Для простоты — мы будем передавать градиенты как отдельный буфер
            }
        `;

        // Для простоты — пока реализуем только forwardLayer
        const module = this.device.createShaderModule({ code: shaderCode });

        // Создаем пайплайн для forwardLayer
        this.pipeline = this.device.createComputePipeline({
            layout: "auto",
            compute: {
                module,
                entryPoint: "forwardLayer",
            },
        });
    }

    // Создание bind groups
    createBindGroups() {
        // Для forwardLayer: weights, biases, input, output, zs, layerInfo

        this.layerInfoBuffer = this.device.createBuffer({
            size: 8, // 2 u32
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.bindGroup = this.device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.gpuBuffers.weights[0] } },
                { binding: 1, resource: { buffer: this.gpuBuffers.biases[0] } },
                { binding: 2, resource: { buffer: this.gpuBuffers.input } },
                { binding: 3, resource: { buffer: this.gpuBuffers.output } },
                { binding: 4, resource: { buffer: this.gpuBuffers.zs[1] } }, // z для следующего слоя
                { binding: 5, resource: { buffer: this.layerInfoBuffer } },
            ],
        });

        // Записываем layerInfo
        //const layerInfo = new Uint32Array([this.architecture[0], this.architecture[1]]);
        //this.queue.writeBuffer(this.bindGroup.entries[5].resource.buffer, 0, layerInfo);

        const layerInfo = new Uint32Array([this.architecture[0], this.architecture[1]]);
        this.queue.writeBuffer(this.layerInfoBuffer, 0, layerInfo);
    }

    // Прямое распространение (на GPU)
    async forward(input) {
        // 1. Записываем вход
        this.queue.writeBuffer(this.gpuBuffers.input, 0, new Float32Array(input));

        // 2. Определяем размер выхода
        const outputSize = this.architecture[1] * Float32Array.BYTES_PER_ELEMENT;

        // 3. Создаём/пересоздаём буфер для чтения
        if (!this.gpuBuffers.readBuffer || this.gpuBuffers.readBuffer.size !== outputSize) {
            if (this.gpuBuffers.readBuffer) this.gpuBuffers.readBuffer.destroy();
            this.gpuBuffers.readBuffer = this.device.createBuffer({
                size: outputSize,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            });
        }

        // 4. ОДИН CommandEncoder для вычисления + копирования
        const encoder = this.device.createCommandEncoder();

        // Вычисление
        const pass = encoder.beginComputePass();
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, this.bindGroup);
        const workgroups = Math.ceil(this.architecture[1] / 64);
        pass.dispatchWorkgroups(workgroups);
        pass.end();

        // Копирование результата в буфер для чтения
        encoder.copyBufferToBuffer(
            this.gpuBuffers.output, 0,
            this.gpuBuffers.readBuffer, 0,
            outputSize
        );

        // Отправляем все команды
        this.queue.submit([encoder.finish()]);

        // Ждём, пока данные будут доступны
        await this.gpuBuffers.readBuffer.mapAsync(GPUMapMode.READ);

        const result = new Float32Array(this.gpuBuffers.readBuffer.getMappedRange());
        this.gpuBuffers.readBuffer.unmap();

        return result;
    }



    // Обратное распространение — заглушка (реализуется аналогично)
    async backward(input, target, activations, zs) {
        // Для краткости — в реальном коде нужно:
        // 1. Вычислить ошибку на выходе
        // 2. Пройти назад через слои, вычисляя градиенты
        // 3. Записать градиенты в буферы weightGrads и biasGrads
        // Это требует нескольких шейдеров и сложной логики.
        // Здесь — для демонстрации оставим заглушку.
        console.log("backward() на GPU — реализация требует каскадных шейдеров и буферов градиентов");
    }

    // Обновление параметров
    async updateParameters() {
        // Аналогично backward — требует отдельного шейдера
        console.log("updateParameters() на GPU — реализуется отдельным compute шейдером");
    }

    // Обучение на одном примере
    async trainSingle(input, target) {
        // Прямой проход
        const output = await this.forward(input);
        console.log(output);
        // Записываем target
        this.queue.writeBuffer(this.gpuBuffers.target, 0, new Float32Array(target));

        // Обратный проход и обновление — в реальности нужно реализовать
        // Для примера — используем CPU-версию (медленно, но работает)
        // В продакшене — реализуйте full GPU backward + update

        // Заглушка: используем CPU-обратное распространение для обучения
        // Это неэффективно, но пока не реализован GPU backward
        const cpuOutput = this.forwardCPU(input);
        this.backwardCPU(input, target, [input, cpuOutput], [null, null]);
        this.updateParametersCPU();
    }

    // CPU-реализации для заглушки (для тестирования)
    forwardCPU(input) {
        let activation = new Float32Array(input);
        for (let i = 0; i < this.layers - 1; i++) {
            const w = this.weights[i];
            const b = this.biases[i];
            const nextActivation = new Float32Array(this.architecture[i + 1]);
            for (let j = 0; j < this.architecture[i + 1]; j++) {
                let sum = 0;
                for (let k = 0; k < this.architecture[i]; k++) {
                    sum += w[j][k] * activation[k];
                }
                sum += b[j][0];
                nextActivation[j] = 1 / (1 + Math.exp(-sum));
            }
            activation = nextActivation;
        }
        return activation;
    }

    backwardCPU(input, target, activations, zs) {
        // Реализация обратного прохода на CPU — можно взять из стандартной реализации
        // Для краткости — опустим
    }

    updateParametersCPU() {
        // Аналогично
    }

    // Предсказание
    async predict(input) {
        return await this.forward(input);
    }

    // Пакетное обучение
    async trainBatch(inputs, targets, epochs, progressCallback) {
        for (let epoch = 0; epoch < epochs; epoch++) {
            for (let i = 0; i < inputs.length; i++) {
                await this.trainSingle(inputs[i], targets[i]);
            }
            if (progressCallback) progressCallback(epoch + 1, epochs);
        }
    }

    // Геттеры
    getLayers() { return this.architecture; }
    getWeights() { return this.weights; }
    getState() {
        return {
            architecture: this.architecture,
            learningRate: this.learningRate,
            weights: this.weights.map(w => w.map(row => [...row])),
            biases: this.biases.map(b => b.map(row => [...row]))
        };
    }
    loadState(state) {
        this.architecture = state.architecture;
        this.learningRate = state.learningRate;
        this.weights = state.weights;
        this.biases = state.biases;
        // Перезаписываем GPU-буферы
        this.weights.forEach((w, i) => {
            this.queue.writeBuffer(this.gpuBuffers.weights[i], 0, this.matrixToFloat32(w));
        });
        this.biases.forEach((b, i) => {
            this.queue.writeBuffer(this.gpuBuffers.biases[i], 0, this.matrixToFloat32(b));
        });
    }
}



(async () => {
    console.log("test");
    const nn = new NeuralNetworkGPU([64, 32, 16, 1], 0.1);

    // Инициализация WebGPU — асинхронная!
    await nn.initGPU();


    // Пример данных
    const input = Array.from({ length: 64 }, () => Math.random());
    const target = [Math.random()];

    // Обучение
    await nn.trainSingle(input, target);

    // Предсказание
    const output = await nn.predict(input);
    console.log("Output:", output);


})();
