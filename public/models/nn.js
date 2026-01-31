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