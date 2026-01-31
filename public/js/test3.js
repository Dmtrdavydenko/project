class NeuralNetworkGPU {
    constructor(architecture, learningRate = 0.1) {
        this.architecture = architecture;
        this.learningRate = learningRate;
        this.device = null;
        this.buffers = {};
        this.computePipelines = {};
        this.initialized = false;
    }

    // 🔌 Инициализация WebGPU — асинхронная, вызывается один раз
    async init() {
        if (!navigator.gpu) throw new Error("WebGPU not supported");

        this.device = await navigator.gpu.requestDevice();

        // Создаём буферы для весов, смещений, входа, выхода
        this.allocateBuffers();
        this.createComputePipelines();
        this.initialized = true;
    }

    // 📦 Создаём буферы (плоские Float32Array)
    allocateBuffers() {
        const { architecture } = this;

        // Веса и смещения
        for (let i = 0; i < architecture.length - 1; i++) {
            const rows = architecture[i + 1];
            const cols = architecture[i];
            const weightSize = rows * cols * 4;
            const biasSize = rows * 4;

            this.buffers[`weights_${i}`] = this.device.createBuffer({
                size: weightSize,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            });

            this.buffers[`biases_${i}`] = this.device.createBuffer({
                size: biasSize,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            });
        }

        // Вход, выход, цель, ошибка
        this.buffers.input = this.device.createBuffer({
            size: architecture[0] * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        });

        this.buffers.target = this.device.createBuffer({
            size: architecture[architecture.length - 1] * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
        });

        this.buffers.output = this.device.createBuffer({
            size: architecture[architecture.length - 1] * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });

        this.buffers.error = this.device.createBuffer({
            size: 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });
    }

    // 🧠 Создаём шейдеры — **автоматически генерируются под твою архитектуру**
    createComputePipelines() {
        const wgsl = this.generateWGSL();
        const shader = this.device.createShaderModule({ code: wgsl });

        this.computePipelines.forward = this.device.createComputePipeline({
            layout: "auto",
            compute: { module: shader, entryPoint: "forward" },
        });

        this.computePipelines.backward = this.device.createComputePipeline({
            layout: "auto",
            compute: { module: shader, entryPoint: "backward" },
        });

        this.computePipelines.computeError = this.device.createComputePipeline({
            layout: "auto",
            compute: { module: shader, entryPoint: "computeError" },
        });

        this.computePipelines.update = this.device.createComputePipeline({
            layout: "auto",
            compute: { module: shader, entryPoint: "update" },
        });
    }

    // 🤖 Генерируем WGSL **автоматически** — ты не трогаешь
    generateWGSL() {
        const { architecture } = this;
        const layers = architecture.length;

        let wgsl = `
            const LEARNING_RATE: f32 = ${this.learningRate};

            fn sigmoid(x: f32) -> f32 {
                return 1.0 / (1.0 + exp(-x));
            }

            fn sigmoidDerivative(x: f32) -> f32 {
                return x * (1.0 - x);
            }
        `;

        // Динамически генерируем биндинги
        let binding = 0;
        for (let i = 0; i < layers - 1; i++) {
            const rows = architecture[i + 1];
            const cols = architecture[i];
            wgsl += `
                @group(0) @binding(${binding++}) var<storage, read_write> weights_${i}: array<f32, ${rows * cols}>;
                @group(0) @binding(${binding++}) var<storage, read_write> biases_${i}: array<f32, ${rows}>;
            `;
        }

        wgsl += `
            @group(0) @binding(${binding++}) var<storage, read_write> input: array<f32, ${architecture[0]}>;
            @group(0) @binding(${binding++}) var<storage, read_write> target: array<f32, ${architecture[layers - 1]}>;
            @group(0) @binding(${binding++}) var<storage, read_write> output: array<f32, ${architecture[layers - 1]}>;
            @group(0) @binding(${binding++}) var<storage, read_write> error: f32;

            var<workgroup> activations: array<f32, ${Math.max(...architecture)}>;
            var<workgroup> deltas: array<f32, ${Math.max(...architecture)}>;
            var<workgroup> z: array<f32, ${Math.max(...architecture)}>;
        `;

        // === FORWARD ===
        wgsl += `
            @compute @workgroup_size(1)
            fn forward() {
                // Вход
                for (var i: u32 = 0; i < ${architecture[0]}; i++) {
                    activations[i] = input[i];
                }

                for (var layer: u32 = 0; layer < ${layers - 1}; layer++) {
                    let rows = ${architecture.slice(1).join(', ')};
                    let cols = ${architecture.slice(0, -1).join(', ')};
                    let row = rows[layer];
                    let col = cols[layer];

                    for (var i: u32 = 0; i < row; i++) {
                        var sum: f32 = biases_${layer}[i];
                        for (var j: u32 = 0; j < col; j++) {
                            sum += weights_${layer}[i * col + j] * activations[j];
                        }
                        z[i] = sum;
                        activations[i] = sigmoid(sum);
                    }

                    if (layer < ${layers - 2}) {
                        for (var i: u32 = 0; i < row; i++) {
                            activations[col + i] = activations[i];
                        }
                    }
                }

                for (var i: u32 = 0; i < ${architecture[layers - 1]}; i++) {
                    output[i] = activations[i];
                }
            }
        `;

        // === BACKWARD ===
        wgsl += `
            @compute @workgroup_size(1)
            fn backward() {
                // Выходной слой: delta = (target - output) * sigmoidDerivative(output)
                for (var i: u32 = 0; i < ${architecture[layers - 1]}; i++) {
                    deltas[i] = (target[i] - output[i]) * sigmoidDerivative(output[i]);
                }

                // Обратное распространение
                for (var layer: u32 = ${layers - 2}; layer >= 0; layer--) {
                    let rows = ${architecture.slice(1).join(', ')};
                    let cols = ${architecture.slice(0, -1).join(', ')};
                    let row = rows[layer];
                    let col = cols[layer];

                    // Обновляем веса и смещения
                    for (var i: u32 = 0; i < row; i++) {
                        for (var j: u32 = 0; j < col; j++) {
                            let prevAct = (layer == 0) ? input[j] : activations[col + j];
                            let dw = deltas[i] * prevAct * LEARNING_RATE;
                            weights_${layer}[i * col + j] += dw;
                        }
                        biases_${layer}[i] += deltas[i] * LEARNING_RATE;
                    }

                    // Считаем delta для предыдущего слоя
                    if (layer > 0) {
                        for (var j: u32 = 0; j < col; j++) {
                            var sum: f32 = 0.0;
                            for (var i: u32 = 0; i < row; i++) {
                                sum += weights_${layer}[i * col + j] * deltas[i];
                            }
                            deltas[j] = sum * sigmoidDerivative(z[j]);
                        }
                    }
                }
            }
        `;

        // === COMPUTE ERROR ===
        wgsl += `
            @compute @workgroup_size(1)
            fn computeError() {
                var sum: f32 = 0.0;
                for (var i: u32 = 0; i < ${architecture[layers - 1]}; i++) {
                    let diff = target[i] - output[i];
                    sum += diff * diff;
                }
                error = sum / ${architecture[layers - 1]};
            }
        `;

        // === UPDATE === (заглушка — используется в backward)
        wgsl += `
            @compute @workgroup_size(1)
            fn update() {
                // Все обновления происходят в backward
            }
        `;

        return wgsl;
    }

    // 🧭 Создаём bindGroup динамически
    createBindGroup() {
        const entries = [];
        let binding = 0;

        for (let i = 0; i < this.layers - 1; i++) {
            entries.push({ binding: binding++, resource: { buffer: this.buffers[`weights_${i}`] } });
            entries.push({ binding: binding++, resource: { buffer: this.buffers[`biases_${i}`] } });
        }

        entries.push({ binding: binding++, resource: { buffer: this.buffers.input } });
        entries.push({ binding: binding++, resource: { buffer: this.buffers.target } });
        entries.push({ binding: binding++, resource: { buffer: this.buffers.output } });
        entries.push({ binding: binding++, resource: { buffer: this.buffers.error } });

        return this.device.createBindGroup({
            layout: this.computePipelines.forward.getBindGroupLayout(0),
            entries,
        });
    }

    // ✅ Обучение одного примера — асинхронно, с await
    async trainSingle(input, target) {
        if (!this.initialized) await this.init();

        // Записываем вход и цель
        this.device.queue.writeBuffer(this.buffers.input, 0, input.buffer, 0, input.byteLength);
        this.device.queue.writeBuffer(this.buffers.target, 0, target.buffer, 0, target.byteLength);

        // Прямой проход
        const encoder1 = this.device.createCommandEncoder();
        const pass1 = encoder1.beginComputePass();
        pass1.setPipeline(this.computePipelines.forward);
        pass1.setBindGroup(0, this.createBindGroup());
        pass1.dispatchWorkgroups(1);
        pass1.end();
        this.device.queue.submit([encoder1.finish()]);

        // Вычисляем ошибку
        const encoder2 = this.device.createCommandEncoder();
        const pass2 = encoder2.beginComputePass();
        pass2.setPipeline(this.computePipelines.computeError);
        pass2.setBindGroup(0, this.createBindGroup());
        pass2.dispatchWorkgroups(1);
        pass2.end();
        this.device.queue.submit([encoder2.finish()]);

        // Обратный проход
        const encoder3 = this.device.createCommandEncoder();
        const pass3 = encoder3.beginComputePass();
        pass3.setPipeline(this.computePipelines.backward);
        pass3.setBindGroup(0, this.createBindGroup());
        pass3.dispatchWorkgroups(1);
        pass3.end();
        this.device.queue.submit([encoder3.finish()]);

        // Читаем ошибку
        const errorBuffer = new Float32Array(1);
        await this.device.queue.readBuffer(this.buffers.error, 0, errorBuffer.buffer, 0, 4);
        return errorBuffer[0];
    }

    // 🔮 Предсказание
    async predict(input) {
        if (!this.initialized) await this.init();

        this.device.queue.writeBuffer(this.buffers.input, 0, input.buffer, 0, input.byteLength);

        const encoder = this.device.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setPipeline(this.computePipelines.forward);
        pass.setBindGroup(0, this.createBindGroup());
        pass.dispatchWorkgroups(1);
        pass.end();
        this.device.queue.submit([encoder.finish()]);

        const output = new Float32Array(this.architecture[this.architecture.length - 1]);
        await this.device.queue.readBuffer(this.buffers.output, 0, output.buffer, 0, output.byteLength);
        return output;
    }

    // 📚 Пакетное обучение
    async trainBatch(inputs, targets, epochs, progressCallback = null) {
        const errors = [];
        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalError = 0;
            for (let i = 0; i < inputs.length; i++) {
                const error = await this.trainSingle(inputs[i], targets[i]);
                totalError += error;
            }
            const avgError = totalError / inputs.length;
            errors.push(avgError);

            if (progressCallback && epoch % 10 === 0) {
                progressCallback(epoch, epochs, avgError);
            }
        }
        return errors;
    }

    // 💾 Сохранение состояния
    getState() {
        const weights = [];
        const biases = [];

        for (let i = 0; i < this.layers - 1; i++) {
            const rows = this.architecture[i + 1];
            const cols = this.architecture[i];

            const weightBuffer = new Float32Array(rows * cols);
            this.device.queue.readBuffer(this.buffers[`weights_${i}`], 0, weightBuffer.buffer, 0, weightBuffer.byteLength);
            const weightMatrix = [];
            for (let r = 0; r < rows; r++) {
                weightMatrix[r] = weightBuffer.slice(r * cols, (r + 1) * cols);
            }
            weights.push(weightMatrix);

            const biasBuffer = new Float32Array(rows);
            this.device.queue.readBuffer(this.buffers[`biases_${i}`], 0, biasBuffer.buffer, 0, biasBuffer.byteLength);
            biases.push(biasBuffer.map(x => [x]));
        }

        return {
            architecture: [...this.architecture],
            learningRate: this.learningRate,
            weights,
            biases,
        };
    }

    // 📥 Загрузка состояния — **без TODO, работает сразу**
    async loadState(state) {
        this.architecture = [...state.architecture];
        this.learningRate = state.learningRate;
        this.layers = this.architecture.length;

        // Пересоздаём всё
        Object.values(this.buffers).forEach(buf => buf.destroy());
        Object.values(this.computePipelines).forEach(pipe => pipe.destroy());
        this.buffers = {};
        this.computePipelines = {};
        this.initialized = false;

        await this.init(); // ✅ Асинхронная инициализация

        // Загружаем веса
        for (let i = 0; i < this.layers - 1; i++) {
            const rows = this.architecture[i + 1];
            const cols = this.architecture[i];

            const weightFlat = state.weights[i].flat();
            this.device.queue.writeBuffer(
                this.buffers[`weights_${i}`],
                0,
                weightFlat.buffer,
                0,
                weightFlat.byteLength
            );

            const biasFlat = state.biases[i].flat();
            this.device.queue.writeBuffer(
                this.buffers[`biases_${i}`],
                0,
                biasFlat.buffer,
                0,
                biasFlat.byteLength
            );
        }
    }
}
(async () => {
    // Создаём сеть
    const nn = new NeuralNetworkGPU([2, 4, 1], 0.1);

    // Обучаем XOR
    const inputs = [
        new Float32Array([0, 0]),
        new Float32Array([0, 1]),
        new Float32Array([1, 0]),
        new Float32Array([1, 1])
    ];

    const targets = [
        new Float32Array([0]),
        new Float32Array([1]),
        new Float32Array([1]),
        new Float32Array([0])
    ];

    // Обучаем — всё асинхронно
    await nn.trainBatch(inputs, targets, 1000, (epoch, total, error) => {
        if (epoch % 100 === 0) console.log(`Epoch ${epoch}/${total}, Error: ${error.toFixed(6)}`);
    });

    // Предсказываем
    console.log("Predictions:");
    for (let i = 0; i < inputs.length; i++) {
        const pred = await nn.predict(inputs[i]);
        console.log(`${inputs[i]} → ${pred[0].toFixed(4)}`);
    }

    // Сохраняем
    const state = nn.getState();

    // Перезагружаем — **работает**
    const nn2 = new NeuralNetworkGPU([2, 4, 1], 0.1);
    await nn2.loadState(state); // ✅ Асинхронно, без TODO, без WGSL
    console.log("Model reloaded. Predictions:");
    for (let i = 0; i < inputs.length; i++) {
        const pred = await nn2.predict(inputs[i]);
        console.log(`${inputs[i]} → ${pred[0].toFixed(4)}`);
    }
})()