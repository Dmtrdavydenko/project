// === Параметры GPU (ваша конфигурация) ===
const gpu = {
    maxBindGroups: 4,
    maxBindGroupsPlusVertexBuffers: 24,
    maxBindingsPerBindGroup: 1000,
    maxBufferSize: 2147483648,
    maxColorAttachmentBytesPerSample: 128,
    maxColorAttachments: 8,
    maxComputeInvocationsPerWorkgroup: 1024,
    maxComputeWorkgroupSizeX: 1024,
    maxComputeWorkgroupSizeY: 1024,
    maxComputeWorkgroupSizeZ: 64,
    maxComputeWorkgroupStorageSize: 32768,
    maxComputeWorkgroupsPerDimension: 65535,
    maxDynamicStorageBuffersPerPipelineLayout: 8,
    maxDynamicUniformBuffersPerPipelineLayout: 10,
    maxInterStageShaderVariables: 28,
    maxSampledTexturesPerShaderStage: 16,
    maxSamplersPerShaderStage: 16,
    maxStorageBufferBindingSize: 2147483644,
    maxStorageBuffersPerShaderStage: 10,
    maxStorageTexturesPerShaderStage: 8,
    maxTextureArrayLayers: 2048,
    maxTextureDimension1D: 16384,
    maxTextureDimension2D: 16384,
    maxTextureDimension3D: 2048,
    maxUniformBufferBindingSize: 65536,
    maxUniformBuffersPerShaderStage: 12,
    maxVertexAttributes: 30,
    maxVertexBufferArrayStride: 2048,
    maxVertexBuffers: 8,
    minStorageBufferOffsetAlignment: 256,
    minUniformBufferOffsetAlignment: 256
};

// === LLM WebGPU Model ===
class LLMWebGPU {
    constructor(device, architecture = [768, 3072, 768]) {
        this.device = device;
        this.architecture = architecture; // [input, hidden, output]

        // Заглушки: все веса = 0
        this.weights = {
            w1: new Float32Array(architecture[0] * architecture[1]).fill(0), // input -> hidden
            w2: new Float32Array(architecture[1] * architecture[2]).fill(0), // hidden -> output
            b1: new Float32Array(architecture[1]).fill(0),                   // bias hidden
            b2: new Float32Array(architecture[2]).fill(0)                    // bias output
        };

        // Буферы для данных
        this.gpuBuffers = {};
        this.bindGroup = null;
        this.pipeline = null;
        this.readBuffer = null;

        this.init();
    }

    async init() {
        const { device, architecture, weights } = this;

        // --- 1. Создание буферов ---
        const inputSize = architecture[0] * Float32Array.BYTES_PER_ELEMENT;
        const hiddenSize = architecture[1] * Float32Array.BYTES_PER_ELEMENT;
        const outputSize = architecture[2] * Float32Array.BYTES_PER_ELEMENT;

        // Входной буфер
        this.gpuBuffers.input = device.createBuffer({
            size: inputSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        // Скрытый слой (промежуточный)
        this.gpuBuffers.hidden = device.createBuffer({
            size: hiddenSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });

        // Выходной буфер
        this.gpuBuffers.output = device.createBuffer({
            size: outputSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });

        // Веса
        this.gpuBuffers.w1 = device.createBuffer({
            size: weights.w1.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(this.gpuBuffers.w1.getMappedRange()).set(weights.w1);
        this.gpuBuffers.w1.unmap();

        this.gpuBuffers.w2 = device.createBuffer({
            size: weights.w2.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(this.gpuBuffers.w2.getMappedRange()).set(weights.w2);
        this.gpuBuffers.w2.unmap();

        this.gpuBuffers.b1 = device.createBuffer({
            size: weights.b1.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(this.gpuBuffers.b1.getMappedRange()).set(weights.b1);
        this.gpuBuffers.b1.unmap();

        this.gpuBuffers.b2 = device.createBuffer({
            size: weights.b2.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Float32Array(this.gpuBuffers.b2.getMappedRange()).set(weights.b2);
        this.gpuBuffers.b2.unmap();

        // Буфер для чтения результата
        this.readBuffer = device.createBuffer({
            size: outputSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        // --- 2. Создание шейдера (вычисление FFN: x * w1 + b1 → GELU → * w2 + b2) ---
        const computeShader = `
            @group(0) @binding(0) var<storage, read> input: array<f32>;
            @group(0) @binding(1) var<storage, read> w1: array<f32>;
            @group(0) @binding(2) var<storage, read> b1: array<f32>;
            @group(0) @binding(3) var<storage, read> w2: array<f32>;
            @group(0) @binding(4) var<storage, read> b2: array<f32>;
            @group(0) @binding(5) var<storage, read_write> hidden: array<f32>;
            @group(0) @binding(6) var<storage, read_write> output: array<f32>;

            @group(0) @binding(7) var<uniform> config: Config;

            struct Config {
                inputSize: u32,
                hiddenSize: u32,
                outputSize: u32
            };

            @compute @workgroup_size(64)
            fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
                let idx = global_id.x;
                let inputSize = config.inputSize;
                let hiddenSize = config.hiddenSize;
                let outputSize = config.outputSize;

                // Вычисляем скрытый слой: hidden[i] = gelu( sum(input[j] * w1[i * inputSize + j]) + b1[i] )
                if (idx < hiddenSize) {
                    var sum: f32 = 0.0;
                    for (var j: u32 = 0; j < inputSize; j = j + 1) {
                        sum = sum + input[j] * w1[idx * inputSize + j];
                    }
                    sum = sum + b1[idx];

                    // GELU approximation: x * 0.5 * (1 + tanh(sqrt(2/pi) * (x + 0.044715 * x^3)))
                    let x = sum;
                    let sqrt2pi = 0.7978845608028654; // sqrt(2/pi)
                    let tanhInput = sqrt2pi * (x + 0.044715 * x * x * x);
                    let gelu = x * 0.5 * (1.0 + tanh(tanhInput));
                    hidden[idx] = gelu;
                }

                // Вычисляем выход: output[i] = sum(hidden[j] * w2[i * hiddenSize + j]) + b2[i]
                if (idx < outputSize) {
                    var sum: f32 = 0.0;
                    for (var j: u32 = 0; j < hiddenSize; j = j + 1) {
                        sum = sum + hidden[j] * w2[idx * hiddenSize + j];
                    }
                    sum = sum + b2[idx];
                    output[idx] = sum;
                }
            }
        `;

        // --- 3. Создание пайплайна ---
        const computeModule = device.createShaderModule({
            code: computeShader,
        });

        this.pipeline = device.createComputePipeline({
            layout: "auto",
            compute: {
                module: computeModule,
                entryPoint: "main",
            },
        });

        // --- 4. Создание конфигурационного буфера (uniform) ---
        const configBuffer = device.createBuffer({
            size: 12, // 3 * u32 = 12 байт
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        });
        new Uint32Array(configBuffer.getMappedRange()).set([
            architecture[0],
            architecture[1],
            architecture[2]
        ]);
        configBuffer.unmap();

        // --- 5. Создание BindGroup ---
        this.bindGroup = device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.gpuBuffers.input } },
                { binding: 1, resource: { buffer: this.gpuBuffers.w1 } },
                { binding: 2, resource: { buffer: this.gpuBuffers.b1 } },
                { binding: 3, resource: { buffer: this.gpuBuffers.w2 } },
                { binding: 4, resource: { buffer: this.gpuBuffers.b2 } },
                { binding: 5, resource: { buffer: this.gpuBuffers.hidden } },
                { binding: 6, resource: { buffer: this.gpuBuffers.output } },
                { binding: 7, resource: { buffer: configBuffer } },
            ],
        });
    }

    async forward(input) {
        const { device, architecture, gpuBuffers, bindGroup, readBuffer, pipeline, queue } = this;

        // Убедимся, что очередь доступна
        if (!this.queue) this.queue = device.queue;

        // 1. Записываем вход
        this.queue.writeBuffer(gpuBuffers.input, 0, new Float32Array(input));

        // 2. Создаём командный энкодер — один для всего
        const commandEncoder = device.createCommandEncoder();

        // 3. Запускаем вычислительный пасс
        const computePass = commandEncoder.beginComputePass();
        computePass.setPipeline(pipeline);
        computePass.setBindGroup(0, bindGroup);

        // Рассчитываем количество рабочих групп
        const hiddenWorkgroups = Math.ceil(architecture[1] / 64);
        const outputWorkgroups = Math.ceil(architecture[2] / 64);

        // Выполняем оба этапа в одном пассе (внутри одного шейдера)
        computePass.dispatchWorkgroups(Math.max(hiddenWorkgroups, outputWorkgroups));
        computePass.end();

        // 4. Копируем результат в буфер для чтения
        commandEncoder.copyBufferToBuffer(
            gpuBuffers.output, 0,
            readBuffer, 0,
            architecture[2] * Float32Array.BYTES_PER_ELEMENT
        );

        // 5. Отправляем команды
        this.queue.submit([commandEncoder.finish()]);

        // 6. Ждём, пока буфер будет готов
        await readBuffer.mapAsync(GPUMapMode.READ);

        // 7. Читаем результат
        const result = new Float32Array(readBuffer.getMappedRange());
        const output = new Float32Array(result); // копируем

        readBuffer.unmap();

        return output;
    }
}

// === Инициализация (пример использования) ===
async function initLLM() {
    if (!navigator.gpu) {
        throw new Error("WebGPU not supported");
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("No WebGPU adapter found");
    }

    const device = await adapter.requestDevice();

    // Создаём LLM с архитектурой: 768 → 3072 → 768 (как в TinyLLaMA)
    const llm = new LLMWebGPU(device, [768, 3072, 768]);

    // Тестовый ввод (заглушка)
    const input = new Float32Array(768).fill(0.1); // 768-мерный вектор

    console.log("Forwarding input...");
    const output = await llm.forward(input);

    console.log("Output shape:", output.length);
    console.log("First 10 values:", output.slice(0, 10));

    return llm;
}

// Запуск
initLLM().catch(console.error);
