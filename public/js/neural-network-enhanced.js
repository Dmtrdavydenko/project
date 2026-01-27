// neural-network-enhanced.js
class NeuralNetwork {
    constructor(architecture, learningRate = 0.1, options = {}) {
        const { useWebGPU = false } = options;
        this.architecture = architecture;
        this.learningRate = learningRate;
        this.useWebGPU = useWebGPU;
        this.webgpu = null;
        this.webGPUReady = false;

        // Инициализация весов и смещений
        this.weights = [];
        this.biases = [];

        for (let i = 0; i < architecture.length - 1; i++) {
            this.weights[i] = this.randomMatrix(architecture[i + 1], architecture[i], -1, 1);
            this.biases[i] = this.randomMatrix(architecture[i + 1], 1, -1, 1);
        }

        // Асинхронная инициализация WebGPU
        if (useWebGPU) {
            this.initWebGPU().then(success => {
                this.webGPUReady = success;
                console.log('WebGPU ready:', success);
            });
        } else {
            this.webGPUReady = true; // CPU всегда готов
        }
    }

    async initWebGPU() {
        try {
            this.webgpu = await getWebGPU();
            console.log('WebGPU инициализирован');
            return true;
        } catch (error) {
            console.warn('WebGPU недоступен:', error);
            this.useWebGPU = false;
            return false;
        }
    }

    // Универсальный метод прямого распространения
    async forward(input) {
        // Ждем инициализации WebGPU если используется
        if (this.useWebGPU && !this.webGPUReady) {
            await new Promise(resolve => {
                const checkReady = () => {
                    if (this.webGPUReady) resolve();
                    else setTimeout(checkReady, 10);
                };
                checkReady();
            });
        }

        if (this.useWebGPU && this.webgpu) {
            return await this.forwardWebGPU(input);
        } else {
            return this.forwardCPU(input);
        }
    }

    // CPU реализация (оригинальный код)
    forwardCPU(input) {
        let activations = [input];
        let zs = [];

        for (let i = 0; i < this.architecture.length - 1; i++) {
            let z = this.matrixMultiply(this.weights[i], activations[i]);
            z = this.matrixAdd(z, this.biases[i]);
            zs.push(z);

            let activation = this.applySigmoid(z);
            activations.push(activation);
        }

        return { activations, zs };
    }

    // WebGPU реализация
    async forwardWebGPU(input) {
        const activations = [input];
        const zs = [];

        let currentActivation = input;

        for (let i = 0; i < this.architecture.length - 1; i++) {
            try {
                // Преобразуем матрицы в плоские массивы
                const weightsFlat = this.webgpu.flattenMatrix(this.weights[i]);
                const activationFlat = this.webgpu.flattenMatrix(currentActivation);

                // Матричное умножение на GPU
                const zFlat = await this.webgpu.matrixMultiply(
                    weightsFlat,
                    activationFlat,
                    this.weights[i].length, // rows
                    this.weights[i][0].length, // cols
                    currentActivation[0].length // bCols
                );

                // Добавляем смещения
                const biasesFlat = this.webgpu.flattenMatrix(this.biases[i]);
                const zWithBiases = new Float32Array(zFlat.length);
                for (let j = 0; j < zFlat.length; j++) {
                    zWithBiases[j] = zFlat[j] + biasesFlat[j];
                }

                // Применяем сигмоиду на GPU
                const activationFlat = await this.webgpu.sigmoid(zWithBiases);

                // Преобразуем обратно в матричную форму
                const activation = this.webgpu.unflattenMatrix(
                    activationFlat,
                    this.architecture[i + 1],
                    1
                );

                zs.push(this.webgpu.unflattenMatrix(zWithBiases, this.architecture[i + 1], 1));
                activations.push(activation);
                currentActivation = activation;

            } catch (error) {
                console.error('WebGPU forward pass failed, falling back to CPU:', error);
                this.useWebGPU = false;
                return this.forwardCPU(input);
            }
        }

        return { activations, zs };
    }

    // Обратное распространение (используем CPU для простоты)
    backward(input, target, activations, zs) {
        const gradients = {
            weights: [],
            biases: []
        };

        // Вычисляем градиенты для выходного слоя
        let error = this.matrixSubtract(activations[activations.length - 1], target);
        let delta = this.elementWiseMultiply(error, this.sigmoidDerivative(zs[zs.length - 1]));

        gradients.weights[this.architecture.length - 2] = this.matrixMultiply(delta, this.matrixTranspose(activations[activations.length - 2]));
        gradients.biases[this.architecture.length - 2] = delta;

        // Распространяем ошибку назад
        for (let i = this.architecture.length - 3; i >= 0; i--) {
            error = this.matrixMultiply(this.matrixTranspose(this.weights[i + 1]), delta);
            delta = this.elementWiseMultiply(error, this.sigmoidDerivative(zs[i]));

            gradients.weights[i] = this.matrixMultiply(delta, this.matrixTranspose(activations[i]));
            gradients.biases[i] = delta;
        }

        return gradients;
    }

    // Обучение с автоматическим выбором реализации
    async trainSingle(input, target) {
        const { activations, zs } = await this.forward(input);
        const gradients = this.backward(input, target, activations, zs);
        this.updateParameters(gradients);

        const output = activations[activations.length - 1];
        return this.calculateError(target, output);
    }

    async trainBatch(inputs, targets, epochs, progressCallback) {
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

    // Предсказание
    async predict(input) {
        const result = await this.forward(input);
        return result.activations[result.activations.length - 1];
    }

    // Метод для проверки готовности WebGPU
    async waitForGPU() {
        if (this.useWebGPU && !this.webGPUReady) {
            await this.initWebGPU();
        }
    }

    // Метод для переключения между CPU и GPU
    async setUseWebGPU(useWebGPU) {
        this.useWebGPU = useWebGPU;
        if (useWebGPU && !this.webgpu) {
            await this.initWebGPU();
        }
        this.webGPUReady = !useWebGPU || this.webgpu !== null;
    }

    // Оригинальные методы матричных операций (остаются без изменений)
    matrixMultiply(a, b) {
        const rowsA = a.length, colsA = a[0].length;
        const rowsB = b.length, colsB = b[0].length;

        if (colsA !== rowsB) {
            throw new Error('Несовместимые размеры матриц для умножения');
        }

        const result = [];
        for (let i = 0; i < rowsA; i++) {
            result[i] = [];
            for (let j = 0; j < colsB; j++) {
                let sum = 0;
                for (let k = 0; k < colsA; k++) {
                    sum += a[i][k] * b[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }

    matrixAdd(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < a[i].length; j++) {
                result[i][j] = a[i][j] + b[i][j];
            }
        }
        return result;
    }

    applySigmoid(matrix) {
        const result = [];
        for (let i = 0; i < matrix.length; i++) {
            result[i] = [];
            for (let j = 0; j < matrix[i].length; j++) {
                result[i][j] = 1 / (1 + Math.exp(-matrix[i][j]));
            }
        }
        return result;
    }

    sigmoidDerivative(matrix) {
        const result = [];
        for (let i = 0; i < matrix.length; i++) {
            result[i] = [];
            for (let j = 0; j < matrix[i].length; j++) {
                const sig = 1 / (1 + Math.exp(-matrix[i][j]));
                result[i][j] = sig * (1 - sig);
            }
        }
        return result;
    }

    randomMatrix(rows, cols, min, max) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = Math.random() * (max - min) + min;
            }
        }
        return matrix;
    }

    calculateError(target, output) {
        let error = 0;
        for (let i = 0; i < target.length; i++) {
            for (let j = 0; j < target[i].length; j++) {
                error += Math.pow(target[i][j] - output[i][j], 2);
            }
        }
        return error / 2;
    }

    updateParameters(gradients) {
        for (let i = 0; i < this.weights.length; i++) {
            for (let j = 0; j < this.weights[i].length; j++) {
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    this.weights[i][j][k] -= this.learningRate * gradients.weights[i][j][k];
                }
            }

            for (let j = 0; j < this.biases[i].length; j++) {
                for (let k = 0; k < this.biases[i][j].length; k++) {
                    this.biases[i][j][k] -= this.learningRate * gradients.biases[i][j][k];
                }
            }
        }
    }

    matrixSubtract(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < a[i].length; j++) {
                result[i][j] = a[i][j] - b[i][j];
            }
        }
        return result;
    }

    elementWiseMultiply(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < a[i].length; j++) {
                result[i][j] = a[i][j] * b[i][j];
            }
        }
        return result;
    }

    matrixTranspose(matrix) {
        const result = [];
        for (let i = 0; i < matrix[0].length; i++) {
            result[i] = [];
            for (let j = 0; j < matrix.length; j++) {
                result[i][j] = matrix[j][i];
            }
        }
        return result;
    }

    // Методы для сохранения/загрузки состояния
    getState() {
        return {
            architecture: this.architecture,
            learningRate: this.learningRate,
            weights: this.weights,
            biases: this.biases,
            useWebGPU: this.useWebGPU
        };
    }

    loadState(state) {
        this.architecture = state.architecture;
        this.learningRate = state.learningRate;
        this.weights = state.weights;
        this.biases = state.biases;
        this.useWebGPU = state.useWebGPU || false;
    }
}