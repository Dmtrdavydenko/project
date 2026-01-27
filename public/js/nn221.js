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

    // Функция активации (сигмоид для скрытых слоев)
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    // Производная сигмоиды
    sigmoidDerivative(x) {
        return x * (1 - x);
    }

    // Softmax функция
    softmax(x) {
        const max = Math.max(...x.flat()); // для численной устойчивости
        const exps = x.map(row => row.map(val => Math.exp(val - max)));
        const sum = exps.reduce((acc, row) => acc + row.reduce((s, v) => s + v, 0), 0);
        return exps.map(row => row.map(val => val / sum));
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

            // a = σ(z) для скрытых слоев, softmax для выходного
            if (i === this.layers - 2) {
                current = this.softmax(z); // Softmax на выходе
            } else {
                current = z.map(row => row.map(val => this.sigmoid(val)));
            }
            activations.push(current);
        }

        return { activations, zs };
    }

    // Добавление векторов
    addVectors(a, b) {
        return a.map((row, i) => row.map((val, j) => val + b[i][j]));
    }

    // Обратное распространение ошибки (для Softmax + Cross-Entropy)
    backward(input, target, activations, zs) {
        // Вычисление градиентов
        const gradients = {
            weights: [],
            biases: []
        };

        // Выходной слой
        const output = activations[activations.length - 1];

        // Для Softmax + CrossEntropy: dL/dz = output - target (просто!)
        let delta = this.subtractMatrices(output, target);

        // Распространение ошибки назад
        for (let i = this.layers - 2; i >= 0; i--) {
            // Градиент для смещений: dL/db = delta
            gradients.biases[i] = delta;

            // Градиент для весов: dL/dW = delta * a^(l-1)^T
            gradients.weights[i] = this.multiplyMatrices(
                delta,
                this.transpose(activations[i])
            );

            // Ошибка на предыдущем слое (если не входной)
            if (i > 0) {
                // delta_prev = W^T * delta * σ'(z)
                const error = this.multiplyMatrices(
                    this.transpose(this.weights[i]),
                    delta
                );

                // Применяем производную сигмоиды к z предыдущего слоя
                delta = error.map((row, r) =>
                    row.map((val, j) =>
                        val * this.sigmoidDerivative(activations[i + 1][r][j]) // ← ИСПРАВЛЕНО: activations[i+1] — это a(i), z(i) = zs[i]
                    )
                );

                // Но wait! Мы используем z для вычисления производной, а не a!
                // Пересчитаем: z[i] = zs[i], a[i] = activations[i+1]
                // Поэтому нужно взять z[i] = zs[i] → но activations[i+1] = σ(zs[i])
                // Значит, производная = σ'(z[i]) = σ(zs[i]) * (1 - σ(zs[i])) = activations[i+1] * (1 - activations[i+1])
                // Но в коде выше мы уже используем activations[i+1] — это правильно!
                // Однако: в цикле i — это слой, для которого мы вычисляем delta.
                // В этот момент activations[i+1] — это выход i-го слоя (т.е. a_i), а zs[i] — его z.
                // Но в `delta` мы уже применяем σ'(a_i) = a_i * (1 - a_i) — это корректно!
                // Значит, код выше — **правильный**.
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

        // Вычисление ошибки (Cross-Entropy)
        const output = activations[activations.length - 1];
        const error = this.calculateError(target, output);

        return error;
    }

    // Вычисление ошибки (Cross-Entropy для Softmax)
    calculateError(target, output) {
        let sum = 0;
        for (let i = 0; i < target.length; i++) {
            for (let j = 0; j < target[i].length; j++) {
                // Избегаем log(0) — добавляем малую величину
                const prob = Math.max(output[i][j], 1e-15);
                sum -= target[i][j] * Math.log(prob);
            }
        }
        return sum;
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
