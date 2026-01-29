class NeuralNetworkWebGPU {
    constructor(inputSize, hiddenSizes, outputSize, learningRate = 0.01) {
        this.inputSize = inputSize;
        this.hiddenSizes = hiddenSizes || [64];
        this.outputSize = outputSize;
        this.learningRate = learningRate;

        this.layers = [inputSize, ...this.hiddenSizes, outputSize];
        this.numLayers = this.layers.length - 1;

        this.weights = [];
        this.biases = [];
        this.weightBuffers = [];
        this.biasBuffers = [];
        this.gradientWeights = [];
        this.gradientBiases = [];
        this.gradientWeightBuffers = [];
        this.gradientBiasBuffers = [];

        this.device = null;
        this.pipeline = null;
        this.computePipeline = null;
        this.bindGroupLayout = null;
        this.bindGroup = null;

        this.initGPU();
    }

    async initGPU() {
        if (!navigator.gpu) throw new Error("WebGPU not supported");

        this.device = await navigator.gpu.requestAdapter().then(adapter => adapter.requestDevice());

        // Создаем буферы для весов и градиентов
        this.layers.forEach((_, i) => {
            if (i < this.layers.length - 1) {
                const weightSize = this.layers[i] * this.layers[i + 1];
                const biasSize = this.layers[i + 1];

                // Инициализация весов (Xavier)
                const weights = new Float32Array(weightSize);
                const biases = new Float32Array(biasSize);
                const gradWeights = new Float32Array(weightSize);
                const gradBiases = new Float32Array(biasSize);

                const scale = Math.sqrt(2 / this.layers[i]);
                for (let j = 0; j < weightSize; j++) {
                    weights[j] = (Math.random() - 0.5) * 2 * scale;
                }
                for (let j = 0; j < biasSize; j++) {
                    biases[j] = 0;
                }

                this.weights.push(weights);
                this.biases.push(biases);
                this.gradientWeights.push(gradWeights);
                this.gradientBiases.push(gradBiases);

                // Буферы WebGPU
                this.weightBuffers.push(this.device.createBuffer({
                    size: weights.byteLength,
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
                }));
                this.biasBuffers.push(this.device.createBuffer({
                    size: biases.byteLength,
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
                }));
                this.gradientWeightBuffers.push(this.device.createBuffer({
                    size: gradWeights.byteLength,
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
                }));
                this.gradientBiasBuffers.push(this.device.createBuffer({
                    size: gradBiases.byteLength,
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
                }));

                // Записываем начальные веса
                this.device.queue.writeBuffer(this.weightBuffers[i], 0, weights);
                this.device.queue.writeBuffer(this.biasBuffers[i], 0, biases);
            }
        });

        // Создаем шейдеры и пайплайны
        this.createComputePipeline();
        this.createBindGroup();
    }

    createComputePipeline() {
        const shaderCode = `
      @group(0) @binding(0) var<storage, read_write> weights: array<f32>;
      @group(0) @binding(1) var<storage, read_write> biases: array<f32>;
      @group(0) @binding(2) var<storage, read_write> gradients_w: array<f32>;
      @group(0) @binding(3) var<storage, read_write> gradients_b: array<f32>;
      @group(0) @binding(4) var<storage, read> inputs: array<f32>;
      @group(0) @binding(5) var<storage, read> targets: array<f32>;
      @group(0) @binding(6) var<storage, read_write> outputs: array<f32>;
      @group(0) @binding(7) var<storage, read_write> hidden: array<f32>;

      @compute @workgroup_size(64)
      fn forward(@builtin(global_invocation_id) id: vec3<u32>) {
        let layerIdx = id.x;
        let neuronIdx = id.y;

        if (layerIdx == 0) {
          // Input layer
          if (neuronIdx < ${this.inputSize}) {
            outputs[neuronIdx] = inputs[neuronIdx];
          }
          return;
        }

        let prevLayerSize = ${this.layers[0]}; // input size
        let currentLayerSize = ${this.layers[1]}; // first hidden

        // Просто для одного слоя, но можно расширить
        // Здесь мы реализуем только один скрытый слой + выходной для простоты

        // Вычисляем выходы для текущего слоя
        if (layerIdx == 1) {
          // Скрытый слой
          if (neuronIdx < currentLayerSize) {
            var sum = 0.0;
            for (var i = 0u; i < ${this.inputSize}; i = i + 1u) {
              let weightIdx = i * currentLayerSize + neuronIdx;
              sum = sum + inputs[i] * weights[weightIdx];
            }
            sum = sum + biases[neuronIdx];
            // ReLU
            hidden[neuronIdx] = max(0.0, sum);
          }
        } else if (layerIdx == 2) {
          // Выходной слой
          if (neuronIdx < ${this.outputSize}) {
            var sum = 0.0;
            for (var i = 0u; i < ${this.hiddenSizes[0]}; i = i + 1u) {
              let weightIdx = i * ${this.outputSize} + neuronIdx;
              sum = sum + hidden[i] * weights[weightIdx];
            }
            sum = sum + biases[neuronIdx];
            // Softmax (вручную)
            outputs[neuronIdx] = exp(sum);
          }
        }
      }

      @compute @workgroup_size(64)
      fn backward(@builtin(global_invocation_id) id: vec3<u32>) {
        let layerIdx = id.x;
        let neuronIdx = id.y;

        if (layerIdx == 2) { // выходной слой
          if (neuronIdx < ${this.outputSize}) {
            let output = outputs[neuronIdx];
            let target = targets[neuronIdx];
            let error = output - target;

            // Градиенты по весам: dL/dw = dL/dy * dy/dw = error * input
            for (var i = 0u; i < ${this.hiddenSizes[0]}; i = i + 1u) {
              let weightIdx = i * ${this.outputSize} + neuronIdx;
              let gradient = error * hidden[i];
              atomicAdd(&gradients_w[weightIdx], gradient);
            }
            atomicAdd(&gradients_b[neuronIdx], error);
          }
        } else if (layerIdx == 1) { // скрытый слой
          if (neuronIdx < ${this.hiddenSizes[0]}) {
            var gradient = 0.0;
            // dL/dh = sum(dL/dy * w)
            for (var out = 0u; out < ${this.outputSize}; out = out + 1u) {
              let weightIdx = neuronIdx * ${this.outputSize} + out;
              let error = outputs[out] - targets[out];
              gradient = gradient + error * weights[weightIdx];
            }
            // Умножаем на производную ReLU
            if (hidden[neuronIdx] <= 0.0) {
              gradient = 0.0;
            } else {
              // gradient не меняется
            }

            // dL/dw = dL/dh * dh/dw = gradient * input
            for (var i = 0u; i < ${this.inputSize}; i = i + 1u) {
              let weightIdx = i * ${this.hiddenSizes[0]} + neuronIdx;
              atomicAdd(&gradients_w[weightIdx], gradient * inputs[i]);
            }
            atomicAdd(&gradients_b[neuronIdx], gradient);
          }
        }
      }

      @compute @workgroup_size(64)
      fn updateWeights(@builtin(global_invocation_id) id: vec3<u32>) {
        let layerIdx = id.x;
        let neuronIdx = id.y;

        if (layerIdx == 0) { // weights of layer 0
          if (neuronIdx < ${this.inputSize * this.hiddenSizes[0]}) {
            let w = weights[neuronIdx];
            let grad = gradients_w[neuronIdx];
            weights[neuronIdx] = w - ${this.learningRate} * grad;
            gradients_w[neuronIdx] = 0.0; // обнуляем градиент
          }
        } else if (layerIdx == 1) { // weights of layer 1
          if (neuronIdx < ${this.hiddenSizes[0] * this.outputSize}) {
            let w = weights[${this.inputSize * this.hiddenSizes[0]} + neuronIdx];
            let grad = gradients_w[${this.inputSize * this.hiddenSizes[0]} + neuronIdx];
            weights[${this.inputSize * this.hiddenSizes[0]} + neuronIdx] = w - ${this.learningRate} * grad;
            gradients_w[${this.inputSize * this.hiddenSizes[0]} + neuronIdx] = 0.0;
          }
        } else if (layerIdx == 2) { // biases of layer 0
          if (neuronIdx < ${this.hiddenSizes[0]}) {
            let b = biases[neuronIdx];
            let grad = gradients_b[neuronIdx];
            biases[neuronIdx] = b - ${this.learningRate} * grad;
            gradients_b[neuronIdx] = 0.0;
          }
        } else if (layerIdx == 3) { // biases of layer 1
          if (neuronIdx < ${this.outputSize}) {
            let b = biases[${this.hiddenSizes[0]} + neuronIdx];
            let grad = gradients_b[${this.hiddenSizes[0]} + neuronIdx];
            biases[${this.hiddenSizes[0]} + neuronIdx] = b - ${this.learningRate} * grad;
            gradients_b[${this.hiddenSizes[0]} + neuronIdx] = 0.0;
          }
        }
      }
    `;

        const shaderModule = this.device.createShaderModule({ code: shaderCode });

        // Forward
        this.computePipeline = this.device.createComputePipeline({
            layout: "auto",
            compute: {
                module: shaderModule,
                entryPoint: "forward",
            },
        });

        // Backward
        this.backwardPipeline = this.device.createComputePipeline({
            layout: "auto",
            compute: {
                module: shaderModule,
                entryPoint: "backward",
            },
        });

        // Update
        this.updatePipeline = this.device.createComputePipeline({
            layout: "auto",
            compute: {
                module: shaderModule,
                entryPoint: "updateWeights",
            },
        });
    }

    createBindGroup() {
        const entries = [];

        for (let i = 0; i < this.weightBuffers.length; i++) {
            entries.push({
                binding: i * 4 + 0,
                resource: { buffer: this.weightBuffers[i] },
            });
            entries.push({
                binding: i * 4 + 1,
                resource: { buffer: this.biasBuffers[i] },
            });
            entries.push({
                binding: i * 4 + 2,
                resource: { buffer: this.gradientWeightBuffers[i] },
            });
            entries.push({
                binding: i * 4 + 3,
                resource: { buffer: this.gradientBiasBuffers[i] },
            });
        }

        // Дополнительные буферы: inputs, targets, outputs, hidden
        const inputSize = this.inputSize;
        const hiddenSize = this.hiddenSizes[0] || 0;
        const outputSize = this.outputSize;

        this.inputBuffer = this.device.createBuffer({
            size: inputSize * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        this.targetBuffer = this.device.createBuffer({
            size: outputSize * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        this.outputBuffer = this.device.createBuffer({
            size: outputSize * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });
        this.hiddenBuffer = this.device.createBuffer({
            size: hiddenSize * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });

        entries.push({ binding: this.weightBuffers.length * 4 + 0, resource: { buffer: this.inputBuffer } });
        entries.push({ binding: this.weightBuffers.length * 4 + 1, resource: { buffer: this.targetBuffer } });
        entries.push({ binding: this.weightBuffers.length * 4 + 2, resource: { buffer: this.outputBuffer } });
        entries.push({ binding: this.weightBuffers.length * 4 + 3, resource: { buffer: this.hiddenBuffer } });

        this.bindGroupLayout = this.device.createBindGroupLayout({ entries });
        this.bindGroup = this.device.createBindGroup({
            layout: this.bindGroupLayout,
            entries,
        });
    }

    async forward(inputs) {
        // Записываем входы
        this.device.queue.writeBuffer(this.inputBuffer, 0, inputs);

        // Обнуляем выходы и скрытые слои
        this.device.queue.writeBuffer(this.outputBuffer, 0, new Float32Array(this.outputSize));
        if (this.hiddenBuffer) {
            this.device.queue.writeBuffer(this.hiddenBuffer, 0, new Float32Array(this.hiddenSizes[0]));
        }

        const commandEncoder = this.device.createCommandEncoder();
        const computePass = commandEncoder.beginComputePass();
        computePass.setPipeline(this.computePipeline);
        computePass.setBindGroup(0, this.bindGroup);

        // Запускаем forward для каждого слоя
        // Здесь упрощённо: только один скрытый слой
        computePass.dispatchWorkgroups(1, this.hiddenSizes[0], 1); // hidden layer
        computePass.dispatchWorkgroups(2, this.outputSize, 1);    // output layer
        computePass.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }

    async backward(targets) {
        this.device.queue.writeBuffer(this.targetBuffer, 0, targets);

        const commandEncoder = this.device.createCommandEncoder();
        const computePass = commandEncoder.beginComputePass();
        computePass.setPipeline(this.backwardPipeline);
        computePass.setBindGroup(0, this.bindGroup);

        // Запускаем backward для выходного и скрытого слоя
        computePass.dispatchWorkgroups(2, this.outputSize, 1); // output layer
        computePass.dispatchWorkgroups(1, this.hiddenSizes[0], 1); // hidden layer
        computePass.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }

    async updateWeights() {
        const commandEncoder = this.device.createCommandEncoder();
        const computePass = commandEncoder.beginComputePass();
        computePass.setPipeline(this.updatePipeline);
        computePass.setBindGroup(0, this.bindGroup);

        // Обновляем веса и смещения
        computePass.dispatchWorkgroups(0, this.inputSize * this.hiddenSizes[0], 1); // weights layer0
        computePass.dispatchWorkgroups(1, this.hiddenSizes[0] * this.outputSize, 1); // weights layer1
        computePass.dispatchWorkgroups(2, this.hiddenSizes[0], 1); // biases layer0
        computePass.dispatchWorkgroups(3, this.outputSize, 1); // biases layer1

        computePass.end();
        this.device.queue.submit([commandEncoder.finish()]);
    }

    async train(inputs, targets, epochs = 100) {
        for (let epoch = 0; epoch < epochs; epoch++) {
            await this.forward(inputs);
            await this.backward(targets);
            await this.updateWeights();

            if (epoch % 10 === 0) {
                const outputs = new Float32Array(this.outputSize);
                this.device.queue.readBuffer(this.outputBuffer, 0, outputs);
                const loss = this.computeLoss(outputs, targets);
                console.log(`Epoch ${epoch}, Loss: ${loss.toFixed(6)}`);
            }
        }
    }

    computeLoss(outputs, targets) {
        let sum = 0;
        for (let i = 0; i < outputs.length; i++) {
            sum += (outputs[i] - targets[i]) ** 2;
        }
        return sum / outputs.length;
    }

    predict(inputs) {
        return new Promise(async (resolve) => {
            await this.forward(inputs);
            const outputs = new Float32Array(this.outputSize);
            await this.device.queue.readBuffer(this.outputBuffer, 0, outputs);
            resolve(outputs);
        });
    }

    destroy() {
        this.weightBuffers.forEach(b => b.destroy());
        this.biasBuffers.forEach(b => b.destroy());
        this.gradientWeightBuffers.forEach(b => b.destroy());
        this.gradientBiasBuffers.forEach(b => b.destroy());
        this.inputBuffer?.destroy();
        this.targetBuffer?.destroy();
        this.outputBuffer?.destroy();
        this.hiddenBuffer?.destroy();
        this.device.destroy();
    }
}

async function main() {
    const nn = new NeuralNetworkWebGPU(784, [128], 10, 0.005);

    // Пример: случайные данные (в реальности — загрузите MNIST)
    const inputs = new Float32Array(784).map(() => Math.random());
    const targets = new Float32Array(10).fill(0);
    targets[3] = 1; // цифра 3

    await nn.train([inputs], [targets], 50);

    const prediction = await nn.predict(inputs);
    console.log("Prediction:", prediction);

    nn.destroy();
}

main();
