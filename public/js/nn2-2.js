class WebGPUNeuralNetwork {
    constructor(architecture, learningRate = 0.1) {
        this.architecture = architecture;
        this.learningRate = learningRate;
        this.layers = architecture.length - 1; // число слоёв между нейронами

        if (!navigator.gpu) throw new Error("WebGPU not supported");

        this.device = null;
        this.pipelines = {}; // { forward: {}, backward: {}, update: {} }
        this.buffers = {};
        this.bindGroups = {};

        this.initGPU(); 
    }

    async initGPU() {
        //this.device = await navigator.gpu.requestDevice();
        //this.prepareBuffers();
        //await this.createPipelines();
        //this.createBindGroups();

        if (!navigator.gpu) {
            throw new Error('WebGPU не поддерживается в этом браузере');
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('Не удалось получить GPU адаптер');
        }

        this.device = await adapter.requestDevice();
        this.queue = this.device.queue;
        console.log(this.device);
        console.log(this.device.queue);
        return this;
    }

    prepareBuffers() {
        const { architecture } = this;
        let totalWeights = 0;
        let totalBiases = 0;
        let totalActivations = 0;

        for (let i = 0; i < architecture.length - 1; i++) {
            totalWeights += architecture[i] * architecture[i + 1];
            totalBiases += architecture[i + 1];
            totalActivations += architecture[i];
        }
        totalActivations += architecture[architecture.length - 1]; // + выход

        const weightSize = totalWeights * 4;
        const biasSize = totalBiases * 4;
        const activationSize = totalActivations * 4;
        const gradientSize = (totalWeights + totalBiases) * 4;

        // Инициализация случайными весами
        const weights = new Float32Array(totalWeights);
        const biases = new Float32Array(totalBiases);

        let idx = 0;
        for (let i = 0; i < architecture.length - 1; i++) {
            const rows = architecture[i + 1];
            const cols = architecture[i];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    weights[idx++] = (Math.random() - 0.5) * 0.2; // маленькие веса
                }
            }
        }

        idx = 0;
        for (let i = 1; i < architecture.length; i++) {
            for (let j = 0; j < architecture[i]; j++) {
                biases[idx++] = (Math.random() - 0.5) * 0.1;
            }
        }

        // Создание буферов
        this.buffers.weights = this.createBuffer(weightSize, weights);
        this.buffers.biases = this.createBuffer(biasSize, biases);
        this.buffers.activations = this.createBuffer(activationSize);
        this.buffers.deltas = this.createBuffer(activationSize); // для backward
        this.buffers.weightGradients = this.createBuffer(totalWeights * 4);
        this.buffers.biasGradients = this.createBuffer(totalBiases * 4);
        this.buffers.input = this.createBuffer(architecture[0] * 4);
        this.buffers.target = this.createBuffer(architecture[architecture.length - 1] * 4);

        // Буферы для промежуточных результатов (на каждом слое)
        this.layerOffsets = [0];
        for (let i = 0; i < architecture.length - 1; i++) {
            this.layerOffsets.push(this.layerOffsets[i] + architecture[i]);
        }
        this.layerOffsets.push(this.layerOffsets[this.layerOffsets.length - 1] + architecture[architecture.length - 1]);

        // Размеры слоёв для передачи в шейдер
        this.layerSizes = architecture;
    }

    createBuffer(size, data = null) {
        return this.device.createBuffer({
            size,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: data !== null,
        });
    }

    async createPipelines() {
        // Создаем шейдеры для каждого слоя
        for (let layer = 0; layer < this.layers; layer++) {
            const prevSize = this.architecture[layer];
            const currSize = this.architecture[layer + 1];

            // Создаем шейдер для forward одного слоя
            const forwardWGSL = this.createForwardLayerWGSL(layer, prevSize, currSize);
            const backwardWGSL = this.createBackwardLayerWGSL(layer, prevSize, currSize);
            const updateWGSL = this.createUpdateLayerWGSL(layer, prevSize, currSize);

            const forwardModule = this.device.createShaderModule({ code: forwardWGSL });
            const backwardModule = this.device.createShaderModule({ code: backwardWGSL });
            const updateModule = this.device.createShaderModule({ code: updateWGSL });

            this.pipelines[`forward_${layer}`] = this.device.createComputePipeline({
                layout: "auto",
                compute: { module: forwardModule, entryPoint: "main" },
            });

            this.pipelines[`backward_${layer}`] = this.device.createComputePipeline({
                layout: "auto",
                compute: { module: backwardModule, entryPoint: "main" },
            });

            this.pipelines[`update_${layer}`] = this.device.createComputePipeline({
                layout: "auto",
                compute: { module: updateModule, entryPoint: "main" },
            });
        }
    }

    createForwardLayerWGSL(layer, prevSize, currSize) {
        const layerIdx = layer;
        const prev = prevSize;
        const curr = currSize;

        return `
            const LAYER: u32 = ${layerIdx};
            const PREV_SIZE: u32 = ${prev};
            const CURR_SIZE: u32 = ${curr};

            @group(0) @binding(0) var<storage, read> weights: array<f32>;
            @group(0) @binding(1) var<storage, read> biases: array<f32>;
            @group(0) @binding(2) var<storage, read_write> activations: array<f32>;
            @group(0) @binding(3) var<storage, read> input: array<f32>;
            @group(0) @binding(4) var<storage, read> target: array<f32>;

            fn sigmoid(x: f32) -> f32 {
                return 1.0 / (1.0 + exp(-x));
            }

            @compute @workgroup_size(64)
            fn main() {
                let offset_prev = 0;
                let offset_curr = 0;
                for (var i: u32 = 0; i < LAYER; i = i + 1) {
                    offset_prev = offset_prev + ${this.architecture[i]};
                    offset_curr = offset_curr + ${this.architecture[i + 1]};
                }

                // Вычисляем для каждого нейрона в текущем слое
                let global_id = workgroupID.x * workgroupSize.x + localInvocationID.x;
                if (global_id >= CURR_SIZE) return;

                var sum: f32 = biases[offset_curr + global_id];

                for (var i: u32 = 0; i < PREV_SIZE; i = i + 1) {
                    let w_idx: u32 = (LAYER * PREV_SIZE * CURR_SIZE) + (global_id * PREV_SIZE + i);
                    let a_idx: u32 = offset_prev + i;
                    sum = sum + weights[w_idx] * activations[a_idx];
                }

                activations[offset_curr + global_id] = sigmoid(sum);
            }
        `;
    }

    createBackwardLayerWGSL(layer, prevSize, currSize) {
        const layerIdx = layer;
        const prev = prevSize;
        const curr = currSize;

        return `
            const LAYER: u32 = ${layerIdx};
            const PREV_SIZE: u32 = ${prev};
            const CURR_SIZE: u32 = ${curr};

            @group(0) @binding(0) var<storage, read> weights: array<f32>;
            @group(0) @binding(1) var<storage, read> biases: array<f32>;
            @group(0) @binding(2) var<storage, read_write> activations: array<f32>;
            @group(0) @binding(3) var<storage, read_write> deltas: array<f32>;
            @group(0) @binding(4) var<storage, read_write> weightGradients: array<f32>;
            @group(0) @binding(5) var<storage, read_write> biasGradients: array<f32>;
            @group(0) @binding(6) var<storage, read> input: array<f32>;
            @group(0) @binding(7) var<storage, read> target: array<f32>;

            fn sigmoidDerivative(x: f32) -> f32 {
                return x * (1.0 - x);
            }

            @compute @workgroup_size(64)
            fn main() {
                let offset_prev = 0;
                let offset_curr = 0;
                for (var i: u32 = 0; i < LAYER; i = i + 1) {
                    offset_prev = offset_prev + ${this.architecture[i]};
                    offset_curr = offset_curr + ${this.architecture[i + 1]};
                }

                let global_id = workgroupID.x * workgroupSize.x + localInvocationID.x;

                if (LAYER == ${this.layers - 1}) { // последний слой
                    if (global_id >= CURR_SIZE) return;
                    let a_idx = offset_curr + global_id;
                    let t = target[global_id];
                    let a = activations[a_idx];
                    let delta = (t - a) * sigmoidDerivative(a);
                    deltas[a_idx] = delta;
                    biasGradients[offset_curr + global_id] = delta;

                    for (var i: u32 = 0; i < PREV_SIZE; i = i + 1) {
                        let w_idx = (LAYER * PREV_SIZE * CURR_SIZE) + (global_id * PREV_SIZE + i);
                        let a_prev_idx = offset_prev + i;
                        weightGradients[w_idx] = delta * activations[a_prev_idx];
                    }
                } else { // скрытый слой
                    if (global_id >= CURR_SIZE) return;
                    let a_idx = offset_curr + global_id;
                    let delta = deltas[a_idx];
                    biasGradients[offset_curr + global_id] = delta;

                    // Градиенты весов
                    for (var i: u32 = 0; i < PREV_SIZE; i = i + 1) {
                        let w_idx = (LAYER * PREV_SIZE * CURR_SIZE) + (global_id * PREV_SIZE + i);
                        let a_prev_idx = offset_prev + i;
                        weightGradients[w_idx] = delta * activations[a_prev_idx];
                    }

                    // Градиент для предыдущего слоя
                    for (var i: u32 = 0; i < PREV_SIZE; i = i + 1) {
                        let a_prev_idx = offset_prev + i;
                        var sum: f32 = 0.0;
                        for (var j: u32 = 0; j < CURR_SIZE; j = j + 1) {
                            let w_idx = (LAYER * PREV_SIZE * CURR_SIZE) + (j * PREV_SIZE + i);
                            sum += deltas[offset_curr + j] * weights[w_idx];
                        }
                        deltas[a_prev_idx] = sum * sigmoidDerivative(activations[a_prev_idx]);
                    }
                }
            }
        `;
    }

    createUpdateLayerWGSL(layer, prevSize, currSize) {
        const layerIdx = layer;
        const prev = prevSize;
        const curr = currSize;

        return `
            const LAYER: u32 = ${layerIdx};
            const PREV_SIZE: u32 = ${prev};
            const CURR_SIZE: u32 = ${curr};
            const LR: f32 = ${this.learningRate};

            @group(0) @binding(0) var<storage, read_write> weights: array<f32>;
            @group(0) @binding(1) var<storage, read_write> biases: array<f32>;
            @group(0) @binding(2) var<storage, read> weightGradients: array<f32>;
            @group(0) @binding(3) var<storage, read> biasGradients: array<f32>;

            @compute @workgroup_size(64)
            fn main() {
                let global_id = workgroupID.x * workgroupSize.x + localInvocationID.x;

                // Обновление весов
                let weightCount = PREV_SIZE * CURR_SIZE;
                if (global_id < weightCount) {
                    weights[LAYER * PREV_SIZE * CURR_SIZE + global_id] += LR * weightGradients[LAYER * PREV_SIZE * CURR_SIZE + global_id];
                }

                // Обновление смещений
                if (global_id < CURR_SIZE) {
                    biases[LAYER * CURR_SIZE + global_id] += LR * biasGradients[LAYER * CURR_SIZE + global_id];
                }
            }
        `;
    }

    createBindGroups() {
        // Бинд-группа для всех слоёв — одинаковая структура
        const bindings = [
            { binding: 0, resource: { buffer: this.buffers.weights } },
            { binding: 1, resource: { buffer: this.buffers.biases } },
            { binding: 2, resource: { buffer: this.buffers.activations } },
            { binding: 3, resource: { buffer: this.buffers.deltas } },
            { binding: 4, resource: { buffer: this.buffers.weightGradients } },
            { binding: 5, resource: { buffer: this.buffers.biasGradients } },
            { binding: 6, resource: { buffer: this.buffers.input } },
            { binding: 7, resource: { buffer: this.buffers.target } },
        ];

        this.bindGroup = this.device.createBindGroup({
            layout: this.pipelines[`forward_0`].getBindGroupLayout(0),
            entries: bindings,
        });
    }

    async forward(input) {
        await this.device.queue.writeBuffer(this.buffers.input, 0, input);
        for (let i = 0; i < this.layers; i++) {
            const pipeline = this.pipelines[`forward_${i}`];
            const commandEncoder = this.device.createCommandEncoder();
            const passEncoder = commandEncoder.beginComputePass();
            passEncoder.setPipeline(pipeline);
            passEncoder.setBindGroup(0, this.bindGroup);
            passEncoder.dispatchWorkgroups(Math.ceil(this.architecture[i + 1] / 64));
            passEncoder.end();
            this.device.queue.submit([commandEncoder.finish()]);
        }
    }

    async backward(target) {
        await this.device.queue.writeBuffer(this.buffers.target, 0, target);
        // Сначала вычисляем ошибку на выходе
        const lastLayer = this.layers - 1;
        const pipeline = this.pipelines[`backward_${lastLayer}`];
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, this.bindGroup);
        passEncoder.dispatchWorkgroups(Math.ceil(this.architecture[lastLayer + 1] / 64));
        passEncoder.end();
        this.device.queue.submit([commandEncoder.finish()]);

        // Обратное распространение по остальным слоям
        for (let i = this.layers - 2; i >= 0; i--) {
            const pipeline = this.pipelines[`backward_${i}`];
            const commandEncoder = this.device.createCommandEncoder();
            const passEncoder = commandEncoder.beginComputePass();
            passEncoder.setPipeline(pipeline);
            passEncoder.setBindGroup(0, this.bindGroup);
            passEncoder.dispatchWorkgroups(Math.ceil(this.architecture[i + 1] / 64));
            passEncoder.end();
            this.device.queue.submit([commandEncoder.finish()]);
        }
    }

    async update() {
        for (let i = 0; i < this.layers; i++) {
            const pipeline = this.pipelines[`update_${i}`];
            const commandEncoder = this.device.createCommandEncoder();
            const passEncoder = commandEncoder.beginComputePass();
            passEncoder.setPipeline(pipeline);
            passEncoder.setBindGroup(0, this.bindGroup);
            passEncoder.dispatchWorkgroups(Math.ceil(Math.max(this.architecture[i], this.architecture[i + 1]) / 64));
            passEncoder.end();
            this.device.queue.submit([commandEncoder.finish()]);
        }
    }

    async trainSingle(input, target) {
        await this.forward(input);
        await this.backward(target);
        await this.update();

        const activations = new Float32Array(this.architecture.reduce((a, b) => a + b, 0));
        await this.device.queue.readBuffer(this.buffers.activations, 0, activations);
        const outputSize = this.architecture[this.architecture.length - 1];
        const start = this.layerOffsets[this.layerOffsets.length - 2];
        const output = activations.slice(start, start + outputSize);

        let error = 0;
        for (let i = 0; i < output.length; i++) {
            error += Math.pow(target[i] - output[i], 2);
        }
        return error / output.length;
    }

    async predict(input) {
        await this.forward(input);
        const activations = new Float32Array(this.architecture.reduce((a, b) => a + b, 0));
        await this.device.queue.readBuffer(this.buffers.activations, 0, activations);
        const outputSize = this.architecture[this.architecture.length - 1];
        const start = this.layerOffsets[this.layerOffsets.length - 2];
        return activations.slice(start, start + outputSize);
    }
}
