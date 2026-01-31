// Нейронная сеть с обратным распространением ошибки
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
            // Инициализация смещений нулями
            this.biases[i] = this.randomMatrix(rows, 1, -0.5, 0.5);
        }
    }
    // Генерация случайной матрицы
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
    // Перемножение матриц
    multiplyMatrices(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < b[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < a[0].length; k++) {
                    sum += a[i][k] * b[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }
    // Транспонирование матрицы
    transpose(matrix) {
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    }
    // Функция активации (сигмоид)
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    // Производная сигмоиды
    sigmoidDerivative(x) {
        return x * (1 - x);
    }
    // Прямое распространение
    forward(input) {
        const activations = [input];
        const zs = [];
        let current = input;
        for (let i = 0; i < this.layers - 1; i++) {
            // z = W * a + b
            const z = this.addVectors(
                this.multiplyMatrices(this.weights[i], current),
                this.biases[i]
            );
            zs.push(z);
            // a = σ(z)
            current = z.map(row => row.map(val => this.sigmoid(val)));
            activations.push(current);
        }
        return { activations, zs };
    }
    // Добавление векторов
    addVectors(a, b) {
        return a.map((row, i) => row.map((val, j) => val + b[i][j]));
    }
    // Обратное распространение ошибки
    backward(input, target, activations, zs) {
        // Вычисление градиентов
        const gradients = {
            weights: [],
            biases: []
        };
        // Ошибка на выходном слое
        const output = activations[activations.length - 1];
        let error = this.subtractMatrices(target, output);
        let delta = error.map((row, i) =>
            row.map((val, j) => val * this.sigmoidDerivative(output[i][j]))
        );
        // Распространение ошибки назад
        for (let i = this.layers - 2; i >= 0; i--) {
            // Градиент для смещений
            gradients.biases[i] = delta;
            // Градиент для весов
            gradients.weights[i] = this.multiplyMatrices(
                delta,
                this.transpose(activations[i])
            );
            // Ошибка на предыдущем слое
            if (i > 0) {
                error = this.multiplyMatrices(
                    this.transpose(this.weights[i]),
                    delta
                );
                delta = error.map((row, r) =>
                    row.map((val, j) =>
                        val * this.sigmoidDerivative(activations[i][r][j])
                    )
                );
            }
        }
        return gradients;
    }
    // Вычитание матриц
    subtractMatrices(a, b) {
        return a.map((row, i) => row.map((val, j) => val - b[i][j]));
    }
    // Обновление весов и смещений
    updateParameters(gradients) {
        for (let i = 0; i < this.layers - 1; i++) {
            // Обновление весов
            this.weights[i] = this.addMatrices(
                this.weights[i],
                gradients.weights[i].map(row =>
                    row.map(val => val * this.learningRate)
                )
            );
            // Обновление смещений
            this.biases[i] = this.addMatrices(
                this.biases[i],
                gradients.biases[i].map(row =>
                    row.map(val => val * this.learningRate)
                )
            );
        }
    }
    // Сложение матриц
    addMatrices(a, b) {
        return a.map((row, i) => row.map((val, j) => val + b[i][j]));
    }
    // Обучение на одном примере
    trainSingle(input, target) {
        // Прямое распространение
        const { activations, zs } = this.forward(input);
        // Обратное распространение
        const gradients = this.backward(input, target, activations, zs);
        // Обновление параметров
        this.updateParameters(gradients);
        // Вычисление ошибки
        const output = activations[activations.length - 1];
        const error = this.calculateError(target, output);
        return error;
    }
    // Вычисление ошибки (среднеквадратичная)
    calculateError(target, output) {
        let sum = 0;
        for (let i = 0; i < target.length; i++) {
            for (let j = 0; j < target[i].length; j++) {
                sum += Math.pow(target[i][j] - output[i][j], 2);
            }
        }
        return sum / (target.length * target[0].length);
    }
    // Предсказание
    predict(input) {
        const { activations } = this.forward(input);
        return activations[activations.length - 1];
    }
    // Пакетное обучение
    trainBatch(inputs, targets, epochs, progressCallback) {
        const errors = [];
        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalError = 0;
            for (let i = 0; i < inputs.length; i++) {
                const error = this.trainSingle(inputs[i], targets[i]);
                totalError += error;
            }
            const avgError = totalError / inputs.length;
            errors.push(avgError);
            // Вызов callback для обновления прогресса
            if (progressCallback && epoch % 10 === 0) {
                progressCallback(epoch, epochs, avgError);
            }
        }
        return errors;
    }
    // Метод для получения состояния сети (для сохранения)
    getState() {
        return {
            architecture: [...this.architecture], // копия массива
            learningRate: this.learningRate,
            weights: this.weights.map(weight =>
                weight.map(row => [...row]) // глубокая копия 2D массива
            ),
            biases: this.biases.map(bias =>
                bias.map(row => [...row]) // глубокая копия 2D массива
            )
        };
    }
    // Метод для загрузки состояния сети (для восстановления)
    loadState(state) {
        // Убедимся, что мы не пересоздаём сеть — просто обновляем параметры
        this.architecture = [...state.architecture];
        this.learningRate = state.learningRate;
        this.layers = this.architecture.length;

        // Копируем веса и смещения
        this.weights = state.weights.map(weight =>
            weight.map(row => [...row])
        );
        this.biases = state.biases.map(bias =>
            bias.map(row => [...row])
        );
    }
    getLayers() {
        return [...this.architecture];
    }
    getWeights() {
        return this.weights.map(weightMatrix =>
            weightMatrix.map(row => [...row])
        );
    }
}