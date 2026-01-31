// webgpu-math.js
class WebGPUMath {
    constructor() {
        this.device = null;
        this.queue = null;
        this.shaderModule = null;
    }

    async initialize() {
        if (!   ) {
            throw new Error('WebGPU не поддерживается в этом браузере');
        }

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('Не удалось получить GPU адаптер');
        }

        this.device = await adapter.requestDevice();
        this.queue = this.device.queue;

        return this;
    }

    // Преобразование матрицы в плоский массив
    flattenMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const flat = new Float32Array(rows * cols);

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                flat[i * cols + j] = matrix[i][j];
            }
        }

        return flat;
    }

    // Преобразование плоского массива обратно в матрицу
    unflattenMatrix(flatArray, rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = flatArray[i * cols + j];
            }
        }
        return matrix;
    }

    async matrixMultiply(aFlat, bFlat, rowsA, colsA, colsB) {
        const resultSize = rowsA * colsB;
        const result = new Float32Array(resultSize);

        // Создаем буферы
        const aBuffer = this.device.createBuffer({
            size: aFlat.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const bBuffer = this.device.createBuffer({
            size: bFlat.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const resultBuffer = this.device.createBuffer({
            size: result.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });

        // Копируем данные в буферы
        this.device.queue.writeBuffer(aBuffer, 0, aFlat);
        this.device.queue.writeBuffer(bBuffer, 0, bFlat);

        // Динамически генерируем шейдер с правильными размерами
        const shaderCode = `
            @group(0) @binding(0) var<storage, read> a : array<f32>;
            @group(0) @binding(1) var<storage, read> b : array<f32>;
            @group(0) @binding(2) var<storage, read_write> result : array<f32>;

            @compute @workgroup_size(64)
            fn matrix_multiply(@builtin(global_invocation_id) global_id : vec3<u32>) {
                let rowsA = ${rowsA}u;
                let colsA = ${colsA}u;
                let colsB = ${colsB}u;
                
                let i = global_id.x;
                let j = global_id.y;
                
                if (i >= rowsA || j >= colsB) {
                    return;
                }
                
                var sum = 0.0;
                for (var k = 0u; k < colsA; k = k + 1u) {
                    sum = sum + a[i * colsA + k] * b[k * colsB + j];
                }
                result[i * colsB + j] = sum;
            }
        `;

        const shaderModule = this.device.createShaderModule({ code: shaderCode });

        // Создаем pipeline
        const computePipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: 'matrix_multiply'
            }
        });

        // Создаем bind group
        const bindGroup = this.device.createBindGroup({
            layout: computePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: aBuffer } },
                { binding: 1, resource: { buffer: bBuffer } },
                { binding: 2, resource: { buffer: resultBuffer } }
            ]
        });

        // Выполняем вычисления
        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(computePipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.dispatchWorkgroups(Math.ceil(rowsA / 8), Math.ceil(colsB / 8));
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);

        // Читаем результат
        await this.readBuffer(resultBuffer, result);
        return result;
    }

    async sigmoid(aFlat) {
        const length = aFlat.length;
        const result = new Float32Array(length);

        const aBuffer = this.device.createBuffer({
            size: aFlat.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const resultBuffer = this.device.createBuffer({
            size: result.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });

        this.device.queue.writeBuffer(aBuffer, 0, aFlat);

        const shaderCode = `
            @group(0) @binding(0) var<storage, read> a : array<f32>;
            @group(0) @binding(1) var<storage, read_write> result : array<f32>;

            @compute @workgroup_size(64)
            fn sigmoid_activation(@builtin(global_invocation_id) global_id : vec3<u32>) {
                let index = global_id.x;
                if (index >= ${length}u) {
                    return;
                }
                result[index] = 1.0 / (1.0 + exp(-a[index]));
            }
        `;

        const shaderModule = this.device.createShaderModule({ code: shaderCode });
        const computePipeline = this.device.createComputePipeline({
            layout: 'auto',
            compute: {
                module: shaderModule,
                entryPoint: 'sigmoid_activation'
            }
        });

        const bindGroup = this.device.createBindGroup({
            layout: computePipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: aBuffer } },
                { binding: 1, resource: { buffer: resultBuffer } }
            ]
        });

        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(computePipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.dispatchWorkgroups(Math.ceil(length / 64));
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
        await this.readBuffer(resultBuffer, result);
        return result;
    }

    async readBuffer(buffer, result) {
        const size = result.byteLength;
        const readBuffer = this.device.createBuffer({
            size: size,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });

        const commandEncoder = this.device.createCommandEncoder();
        commandEncoder.copyBufferToBuffer(buffer, 0, readBuffer, 0, size);
        this.device.queue.submit([commandEncoder.finish()]);

        await readBuffer.mapAsync(GPUMapMode.READ);
        const copyArrayBuffer = readBuffer.getMappedRange();
        result.set(new Float32Array(copyArrayBuffer));
        readBuffer.unmap();

        return result;
    }
}

// Singleton для WebGPU
let webGPUInstance = null;

async function getWebGPU() {
    if (!webGPUInstance) {
        webGPUInstance = new WebGPUMath();
        await webGPUInstance.initialize();
    }
    return webGPUInstance;
}