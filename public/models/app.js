//// Класс для управления приложением
class WordClassificationApp {
    constructor() {
        this.network = null;
        this.categories = {};
        this.categoryColors = {};
        this.trainingData = [];
        this.isTraining = false;


        this.heatmaps = [];
        this.ctxHeatmap = [];

        this.globalCharEmbeddings = null;

        this.dataset = [];
        this.initializeUI();


    }

    // Инициализация интерфейса
    async initializeUI() {
        // Элементы интерфейса
        this.architectureInput = document.getElementById('architectureInput');
        this.learningRateInput = document.getElementById('learningRateInput');
        this.epochsInput = document.getElementById('epochsInput');
        this.initNetworkBtn = document.getElementById('initNetworkBtn');
        this.networkStatus = document.getElementById('networkStatus');

        this.categoryInput = document.getElementById('categoryInput');
        this.wordInput = document.getElementById('wordInput');
        this.addWordBtn = document.getElementById('addWordBtn');
        this.categoriesContainer = document.getElementById('categoriesContainer');

        this.trainBtn = document.getElementById('trainBtn');
        this.trainingProgress = document.getElementById('trainingProgress');
        this.newWordsInput = document.getElementById('newWordsInput');
        this.classifyBtn = document.getElementById('classifyBtn');
        this.classificationResults = document.getElementById('classificationResults');

        this.canvas = document.getElementById('visualization');
        this.ctx = this.canvas.getContext('2d');
        this.legend = document.getElementById('legend');

        this.heatmap = document.getElementById('heatmap');
        this.spaceOS = document.getElementById('fileInput');
        //this.ctxHeatmap = this.canvasHeatmap.getContext('2d');




        // Обработчики событий
        this.initNetworkBtn.addEventListener('click', () => this.initializeNetwork());
        this.addWordBtn.addEventListener('click', () => this.addWordToCategory());
        this.trainBtn.addEventListener('click', () => this.trainNetwork());
        this.classifyBtn.addEventListener('click', () => this.classifyWords());
        //this.spaceOS.addEventListener('change', (e) => this.loadDataSet(e));

        //this.checkWebGPUSupport();
        //await this.getDataHH();
        await this.initializeWithExamples();

    }
    checkWebGPUSupport() {
        const webgpuStatus = document.getElementById('webgpu-status');
        const webgpuToggle = document.getElementById('webgpu-toggle');

        if (!navigator.gpu) {
            webgpuStatus.innerHTML = 'WebGPU не поддерживается в вашем браузере';
            webgpuStatus.className = 'status-info gpu-unavailable';
            webgpuToggle.disabled = true;
            return;
        }

        // Проверяем доступность
        navigator.gpu.requestAdapter().then(adapter => {
            if (adapter) {
                webgpuStatus.innerHTML = 'WebGPU доступен! Можно включить ускорение';
                webgpuStatus.className = 'status-info gpu-available';
            } else {
                webgpuStatus.innerHTML = 'WebGPU адаптер недоступен';
                webgpuStatus.className = 'status-info gpu-unavailable';
                webgpuToggle.disabled = true;
            }
        }).catch(error => {
            webgpuStatus.innerHTML = `Ошибка WebGPU: ${error.message}`;
            webgpuStatus.className = 'status-info gpu-unavailable';
            webgpuToggle.disabled = true;
        });
    }

    // Инициализация нейронной сети
    initializeNetwork() {
        const architecture = this.architectureInput.value
            .split(',')
            .map(layer => parseInt(layer.trim()));

        const learningRate = parseFloat(this.learningRateInput.value);

        if (architecture.some(isNaN) || isNaN(learningRate)) {
            alert('Пожалуйста, введите корректные параметры сети');
            return;
        }

        // Добавляем размер входного слоя (64 - размер вектора слова)
        architecture.unshift(64);

        // Добавляем размер выходного слоя (количество категорий)
        const numCategories = Object.keys(this.categories).length;
        architecture.push(numCategories > 0 ? numCategories : 2);

        this.network = new NeuralNetwork(architecture, learningRate);
        this.networkStatus.innerHTML = `<p>Сеть инициализирована: ${architecture.join(' → ')}</p>`;




        for (let i = 0; i < architecture.length; i++) {
            this.heatmaps[i] = document.createElement("canvas");
            //this.heatmaps[i].classLicst.style = "imageRendering: pixelated";
            this.heatmaps[i].style.imageRendering = 'pixelated';

            this.ctxHeatmap[i] = this.heatmaps[i].getContext('2d');
            this.heatmap.appendChild(this.heatmaps[i]);
        }

    }

    async loadDataSet(e) {
        const file = e.target.files[0];

        if (!file) return; // если файл не выбран

        if (!file.name.endsWith('.json')) {
            document.getElementById('output').textContent = 'Пожалуйста, выберите JSON-файл.';
            return;
        }

        const reader = new FileReader();

        //Use arrow function to preserve 'this' context
        reader.onload = async (event) => {
            try {
                const content = event.target.result;
                const items = JSON.parse(content); // Парсим JSON

                // ✅ Initialize dataset if not already done
                if (!this.dataset) this.dataset = [];

                for (let i = 0; i < items.length; i++) {
                    const obj = {
                        name: items[i].name,
                        working_hours: items[i].working_hours?.[0]?.name || "",
                        work_schedule_by_days: items[i].work_schedule_by_days?.[0]?.name || "",
                        requirement: items[i].snippet?.requirement || "",
                        responsibility: items[i].snippet?.responsibility || "",
                        schedule: items[i].schedule?.name || "",
                        salary_from: items[i].salary_range?.from || "",
                        salary_to: items[i].salary_range?.to || items[i].salary_range?.from || "",
                        frequency: items[i].salary_range?.frequency?.name || "",
                        currency: items[i].salary_range?.currency || "",
                        experience: items[i].salary_range?.experience?.name || "",
                    };
                    this.dataset.push(obj);
                }

                console.log('Loaded items:', items);
                console.log('Dataset size:', this.dataset.length);

                // Await initialization
                await this.initializeWithExamples();

            } catch (err) {
                document.getElementById('output').textContent = 'Ошибка при парсинге JSON: ' + err.message;
                console.error('JSON parsing error:', err);
            }
        };

        //Read as text
        reader.readAsText(file);
    }
    async getDataHH() {
        try {
            const response = await fetch('/hh.json'); // Путь к файлу
            console.log(response);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const items = await response.json(); // Парсим JSON
            console.log(items);
            //let grafic = new Set();
            for (let i = 0; i < items.length; i++) {
                const obj = {
                    name: items[i].name,
                    working_hours: items[i].working_hours[0]?.name,
                    work_schedule_by_days: items[i].work_schedule_by_days[0]?.name,
                    requirement: items[i].snippet.requirement,
                    responsibility: items[i].snippet.responsibility,
                    schedule: items[i].schedule.name,
                    salary_from: items[i].salary_range?.from || "",
                    salary_to: items[i].salary_range?.to || items[i].salary_range?.from || "",
                    frequency: items[i].salary_range?.frequency?.name || "",
                    currency: items[i].salary_range?.currency || "",
                    experience: items[i].salary_range?.experience?.name || "",
                }
                //vectorL.add(JSON.stringify(obj).length);
                this.dataset.push(obj);
            }
            // Выводим красиво отформатированный JSON
            //resultDiv.textContent = JSON.stringify(items, null, 2);
            //console.log(setVacancies);
            //console.log(grafic);
        } catch (error) {
            //resultDiv.textContent = `Ошибка: ${error.message}`;
            console.error('Ошибка загрузки JSON:', error);
        }
    };

    // Создание вектора для слова
    //createWordVector(word) {
    //    const vector = new Array(64).fill(0);
    //    const normalizedWord = word.toLowerCase().replace(/[^a-z]/g, '');

    //    // Используем хэширование для создания более богатого вектора
    //    for (let i = 0; i < normalizedWord.length; i++) {
    //        const charCode = normalizedWord.charCodeAt(i) - 97; // 'a' = 0
    //        if (charCode >= 0 && charCode < 26) {
    //            // Распределяем влияние символа по нескольким измерениям
    //            const index1 = charCode;
    //            const index2 = (charCode + i) % 64;
    //            const index3 = (charCode * i) % 64;

    //            vector[index1] += 0.5 / normalizedWord.length;
    //            vector[index2] += 0.3 / normalizedWord.length;
    //            vector[index3] += 0.2 / normalizedWord.length;
    //        }
    //    }
    //    console.log(vector);
    //    return vector;
    //}

    //createWordVector(word) {
    //    const alphabet = 'abcdefghijklmnopqrstuvwxyzабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
    //    const charToIndex = {};
    //    for (let i = 0; i < alphabet.length; i++) {
    //        charToIndex[alphabet[i]] = i;
    //    }

    //    const vector = new Array(64).fill(0);
    //    const normalizedWord = word.toLowerCase().replace(/[^a-zа-яё]/g, '');

    //    if (normalizedWord.length === 0) return vector;

    //    for (let i = 0; i < normalizedWord.length; i++) {
    //        const char = normalizedWord[i];
    //        const charCode = charToIndex[char];
    //        if (charCode === undefined) continue;

    //        const index1 = charCode % 64;
    //        const index2 = (charCode + i) % 64;
    //        const index3 = (charCode * (i + 1)) % 64; // +1 для избежания 0 при i=0

    //        const weight = 1 / normalizedWord.length;

    //        vector[index1] += 0.5 * weight;
    //        vector[index2] += 0.3 * weight;
    //        vector[index3] += 0.2 * weight;
    //    }
    //    const sumOfSquares = vector.reduce((sum, val) => sum + val * val, 0);
    //    const norm = Math.sqrt(sumOfSquares);

    //    if (norm > 1e-10) { // Избегаем деления на ноль (с учётом погрешности)
    //        for (let i = 0; i < vector.length; i++) {
    //            vector[i] /= norm;
    //        }
    //    }

    //    return vector;
    //}
    initializeCharEmbeddings() {
        const russian = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
        const english = "abcdefghijklmnopqrstuvwxyz";
        const number = "0123456789+-'";
        const alphabet = russian + english + number;
        const embeddingDim = 64;

        // Инициализируем только один раз
        if (!this.globalCharEmbeddings) {
            this.globalCharEmbeddings = {};
            alphabet.split('').forEach(char => {
                this.globalCharEmbeddings[char] = Array(embeddingDim).fill().map(() =>
                    (Math.random() - 0.5) * 0.1
                );
            });
        }

        return { alphabet, embeddingDim };
    }
    createWordVector(word) {
        //console.log(word);
        const { embeddingDim } = this.initializeCharEmbeddings();
        //this.Embeddings = embeddingDim;
        //console.log(embeddingDim);
        const vector = Array(embeddingDim).fill(0);
        word += "";
        const normalizedWord = word.toLowerCase().replace(/[^a-zа-яё0-9+'-]/g, ' ');

        if (normalizedWord.length === 0) return vector;
        //console.log(normalizedWord);
        //console.log(normalizedWord.length);
        for (let char of normalizedWord) {
            if (this.globalCharEmbeddings[char]) {
                for (let i = 0; i < embeddingDim; i++) {
                    vector[i] += this.globalCharEmbeddings[char][i];
                }
            }
        }

        // Усреднение
        //for (let i = 0; i < embeddingDim; i++) {
        //    vector[i] /= normalizedWord.length;
        //}

        // L2 нормализация
        const norm = Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0));
        if (norm > 1e-10) {
            for (let i = 0; i < embeddingDim; i++) {
                vector[i] /= norm;
            }
        }
        //console.log(vector);
        return vector;
    }

    // Добавление слова в категорию
    addWordToCategory() {
        const category = this.categoryInput.value.trim();
        const word = this.wordInput.value.trim();

        if (!category || !word) {
            alert('Пожалуйста, введите категорию и слово');
            return;
        }

        if (!this.categories[category]) {
            this.categories[category] = [];
            this.categoryColors[category] = this.getRandomColor();
        }

        this.categories[category].push(word);
        this.updateCategoriesDisplay();
        this.wordInput.value = '';

        // Если сеть уже инициализирована, нужно обновить архитектуру
        if (this.network) {
            this.initializeNetwork();
        }
    }

    // Обновление отображения категорий
    updateCategoriesDisplay() {
        this.categoriesContainer.innerHTML = '';

        for (const category in this.categories) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-item';
            categoryDiv.innerHTML = `
                <strong>${category}</strong>: ${this.categories[category]}
                <button data-category="${category}">×</button>
            `;
            //<strong>${category}</strong>: ${[...this.categories[category]]} слов
            //<strong>${category}</strong>: ${ this.categories[category].length }

            this.categoriesContainer.appendChild(categoryDiv);

            // Удаление категории
            categoryDiv.querySelector('button').addEventListener('click', (e) => {
                delete this.categories[category];
                this.updateCategoriesDisplay();
                this.updateVisualization();

                // Переинициализация сети
                if (this.network) {
                    this.initializeNetwork();
                }
            });
        }
    }

    // Обучение сети
    async trainNetwork() {
        if (!this.network) {
            alert('Сначала инициализируйте нейронную сеть');
            return;
        }

        const categories = Object.keys(this.categories);
        if (categories.length < 2) {
            alert('Добавьте как минимум 2 категории для обучения');
            return;
        }

        this.isTraining = true;
        this.trainBtn.disabled = true;
        this.trainingProgress.innerHTML = '<p>Обучение начато...</p>';

        // Подготовка данных для обучения
        const { inputs, targets } = this.prepareTrainingData();
        //console.log(inputs, targets);
        const epochs = parseInt(this.epochsInput.value);

        try {
            const errors = await this.trainNetworkAsync(inputs, targets, epochs);
            this.trainingProgress.innerHTML = `
                <p>Обучение завершено!</p>
                <p>Финальная ошибка: ${errors[errors.length - 1]}</p>
            `;
            //console.log(this.network.getWeights()[0]);
        } catch (error) {
            console.log(error);
            this.trainingProgress.innerHTML = `<p>Ошибка при обучении: ${error.message}</p>`;
        } finally {
            this.isTraining = false;
            this.trainBtn.disabled = false;
            this.updateVisualization();
            this.updateVisualizationHeatmap();
        }
    }

    // Асинхронное обучение сети
    trainNetworkAsync(inputs, targets, epochs) {
        return new Promise((resolve) => {
            // Используем requestAnimationFrame для неблокирующего обучения
            const errors = [];
            let epoch = 0;

            const trainStep = () => {
                if (epoch < epochs) {
                    let totalError = 0;

                    for (let i = 0; i < inputs.length; i++) {
                        const error = this.network.trainSingle(inputs[i], targets[i]);
                        //const error = this.network.train(inputs, targets);
                        totalError += error;
                    }

                    const avgError = totalError / inputs.length;
                    errors.push(avgError);

                    // Обновление прогресса каждые 10 эпох
                    if (epoch % 10 === 0) {
                        this.updateVisualizationHeatmap();
                        this.trainingProgress.innerHTML = `
                            <p>Эпоха ${epoch}/${epochs}</p>
                            <p>Текущая ошибка: ${avgError}</p>
                        `;
                    }

                    epoch++;
                    requestAnimationFrame(trainStep);
                } else {
                    resolve(errors);
                }
            };

            trainStep();
        });
    }

    // Подготовка данных для обучения
    prepareTrainingData() {
        const inputs = [];
        const targets = [];
        const categories = Object.keys(this.categories);

        for (const category of categories) {
            for (const word of this.categories[category]) {
                // Входной вектор
                console.log({ category, word });
                const vector = this.createWordVector(word);
                const input = vector.map(val => [val]); // Преобразуем в матрицу
                inputs.push(input);

                // Целевой вектор (one-hot encoding)
                const target = new Array(categories.length).fill(0);
                const categoryIndex = categories.indexOf(category);
                target[categoryIndex] = 1;
                targets.push(target.map(val => [val])); // Преобразуем в матрицу
            }
        }

        return { inputs, targets };
    }

    // Классификация слов
    classifyWords() {
        if (!this.network || this.isTraining) {
            alert('Сначала обучите нейронную сеть');
            return;
        }

        const wordsText = this.newWordsInput.value.trim();
        if (!wordsText) {
            alert('Пожалуйста, введите слова для классификации');
            return;
        }

        const words = wordsText.split(' ').map(word => word.trim()).filter(word => word);
        const categories = Object.keys(this.categories);
        let resultsHTML = '<h3>Результаты классификации:</h3><ul>';

        words.forEach(word => {
            const vector = this.createWordVector(word);
            console.log(vector);
            console.log(this.isUnitVector(vector));

            const unitVector = vector.map(x => x / Math.sqrt(vector.reduce((s, v) => s + v * v, 0)));
            console.log(unitVector);
            console.log(this.isUnitVector(unitVector));

            const input = vector.map(val => [val]);
            const output = this.network.predict(input);
            console.log(output);

            // Находим категорию с максимальной вероятностью
            const probabilities = output.flat();
            const maxIndex = probabilities.indexOf(Math.max(...probabilities));
            const category = categories[maxIndex] || 'Не удалось классифицировать';

            // Форматируем вероятности
            const probText = probabilities.map((p, i) =>
                `${categories[i]}: ${(p * 100).toFixed(2)}%`
            ).join(', ');

            resultsHTML += `<li><strong>${word}</strong> → ${category} (${probText})</li>`;
        });

        resultsHTML += '</ul>';
        this.classificationResults.innerHTML = resultsHTML;

        // Обновляем визуализацию с новыми словами
        this.updateVisualization(words);
    }
    isUnitVector(vector) {
        // Проверка: массив должен быть непустым и содержать только числа
        if (!Array.isArray(vector) || vector.length === 0) {
            return false;
        }

        const sumOfSquares = vector.reduce((sum, component) => {
            if (typeof component !== 'number' || isNaN(component)) {
                throw new Error('Вектор должен содержать только числа');
            }
            return sum + component * component;
        }, 0);

        const length = Math.sqrt(sumOfSquares);

        // Используем небольшую погрешность для сравнения с плавающей точкой
        const epsilon = 1e-10;
        //return Math.abs(length - 1) < epsilon;
        return length
    }
    updateVisualizationHeatmap() {
        //console.log(this.network.getWeights()[0]);
        for (var i = 0; i < this.network.getWeights().length; i++) {
            this.drawWeightHeatmap(this.network.getWeights()[i], this.heatmaps[i], this.ctxHeatmap[i]);

        }
    }
    weightToColor(weight) {
        if (weight < 0) {
            // От -1 (синий) до 0 (белый)
            const t = (weight + 1) / 1; // t ∈ [0, 1]
            const r = 255 * (1 - t);    // от 255 до 0
            const g = 255 * (1 - t);    // от 255 до 0
            const b = 255;              // всегда 255 (синий)
            return [r, g, b];
        } else {
            // От 0 (белый) до 1 (красный)
            const t = weight / 1;       // t ∈ [0, 1]
            const r = 255;              // всегда 255 (красный)
            const g = 255 * (1 - t);    // от 255 до 0
            const b = 255 * (1 - t);    // от 255 до 0
            return [r, g, b];
        }
    }
    drawWeightHeatmap(weights, canvas, ctxHeatmap) {
        //const canvas = document.getElementById(canvasId);
        //const ctx = canvas.getContext('2d');
        const height = weights.length;
        const width = weights[0].length;

        canvas.width = width;
        canvas.height = height;

        canvas.style.width = width * 8 + "px";
        canvas.style.height = height * 8 + "px";

        const imageData = ctxHeatmap.createImageData(width, height);
        const data = imageData.data;

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const weight = weights[i][j];
                const [r, g, b] = this.weightToColor(weight);

                const pixelIndex = (i * width + j) * 4;
                data[pixelIndex] = Math.round(r);
                data[pixelIndex + 1] = Math.round(g);
                data[pixelIndex + 2] = Math.round(b);
                data[pixelIndex + 3] = 255;
            }
        }

        ctxHeatmap.putImageData(imageData, 0, 0);
    }

    // Использование:

    // Обновление визуализации
    updateVisualization(newWords = []) {
        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Получаем данные для визуализации
        const data = this.getVisualizationData();

        // Рисуем обучающие слова
        data.forEach(item => {
            this.ctx.fillStyle = item.color;
            this.ctx.beginPath();
            this.ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#000';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(item.word, item.x + 10, item.y + 5);
        });

        // Рисуем новые слова для классификации (если есть)
        if (this.network && newWords.length > 0) {
            newWords.forEach(word => {
                const vector = this.createWordVector(word);
                const input = vector.map(val => [val]);
                const output = this.network.predict(input);

                const categories = Object.keys(this.categories);
                const probabilities = output.flat();
                const maxIndex = probabilities.indexOf(Math.max(...probabilities));
                const category = categories[maxIndex];
                const color = this.categoryColors[category] || '#888';

                // Упрощенная проекция на 2D
                const x = (vector[0] + vector[1]) * 200 + 400;
                const y = (vector[2] + vector[3]) * 200 + 300;

                // Рисуем новый пунктирный круг
                this.ctx.strokeStyle = color;
                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.arc(x, y, 12, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);

                // Подпись нового слова
                this.ctx.fillStyle = '#000';
                this.ctx.font = '14px Arial';
                this.ctx.fillText(`${word} (${category})`, x + 15, y + 5);
            });
        }

        // Рисуем легенду
        this.drawLegend();
    }

    // Получение данных для визуализации
    getVisualizationData() {
        const data = [];
        const categories = Object.keys(this.categories);

        for (const category of categories) {
            for (const word of this.categories[category]) {
                const vector = this.createWordVector(word);
                // Упрощенная проекция на 2D для визуализации
                const x = (vector[0] + vector[1]) * 200 + 400;
                const y = (vector[2] + vector[3]) * 200 + 300;

                data.push({
                    x, y,
                    color: this.categoryColors[category] || '#888',
                    word: word,
                    category: category
                });
            }
        }

        return data;
    }

    // Рисование легенды категорий
    drawLegend() {
        this.legend.innerHTML = '<h4>Легенда категорий:</h4>';
        const categories = Object.keys(this.categoryColors);

        categories.forEach(category => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'legend-item';
            colorDiv.innerHTML = `
                <span class="color-box" style="background-color: ${this.categoryColors[category]}"></span>
                <span>${category}</span>
            `;
            this.legend.appendChild(colorDiv);
        });
    }

    // Генерация случайного цвета
    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Инициализация примерами
    async initializeWithExamples() {
        // Добавляем примеры категорий и слов

        //const obj = {
        //    name: items[i].name,
        //    working_hours: items[i].working_hours[0]?.name,
        //    work_schedule_by_days: items[i].work_schedule_by_days[0]?.name,
        //    requirement: items[i].snippet.requirement,
        //    responsibility: items[i].snippet.responsibility,
        //    schedule: items[i].schedule.name,
        //    salary_from: items[i].salary_range?.from || "",
        //    salary_to: items[i].salary_range?.to || items[i].salary_range?.from || "",
        //    frequency: items[i].salary_range?.frequency?.name || "",
        //    currency: items[i].salary_range?.currency || "",
        //    experience: items[i].salary_range?.experience?.name || "",
        //}
        //'Стажёр-разработчик': [
        //    'Образование: Бакалавр по направлению «Информатика», «Программная инженерия» или смежным (можно без диплома, но с портфолио)',
        //    'Опыт работы: 0–1 год (стажировки, проекты на GitHub, хакатоны)',
        //    "Навыки: Основы Python/JavaScript Работа с Git Базовые знания HTML/CSS Понимание принципов ООП Умение работать в команде",
        //    "Зарплата: 40 000 – 70 000 ₽/мес (Россия, Москва/Санкт-Петербург)",
        //    "График работы: 5/2, 9:00–18:00, гибридный (2–3 дня в офисе)"
        //],
        //"Разработчик": [
        //    'Образование: Бакалавр или магистр в ИТ - сфере',
        //    "Опыт работы: 2–4 года в разработке ПО",
        //    "Навыки: Глубокое знание одного языка(Java, Python, C#) Работа с базами данных(PostgreSQL, MongoDB) REST API, Docker, CI / CD Тестирование(unit / integration) Работа в Agile / Scrum",
        //    "Зарплата: 90 000 – 150 000 ₽/мес",
        //    "График работы: 5 / 2, гибкий график(возможен удалённый формат)",

        //],
        //"Старший разработчик": [
        //    "Образование: Высшее техническое образование (бакалавр/магистр)",
        //    "Опыт работы: 5+ лет, ведущая роль в проектах",
        //    "Навыки: Архитектура систем(микросервисы, event - driven) Оптимизация производительности Наставничество младших разработчиков Работа с облачными платформами(AWS, Azure) Участие в техническом дизайне",
        //    "Зарплата: 160 000 – 280 000 ₽/мес",
        //    "График работы: Гибкий (4–5 дней в неделю), возможен полностью удалённый формат",
        //],
        //"Руководитель группы разработки": [
        //    "Образование: Высшее техническое образование, желательно MBA или дополнительное образование в управлении",
        //    "Опыт работы: 7+ лет в разработке, 2+ года в управлении командой (5–10 человек)",
        //    "Навыки: Управление проектами(Jira, Confluence) Планирование ресурсов и сроков Рекрутинг и оценка персонала Взаимодействие с продуктом и бизнесом Формирование корпоративной культуры",
        //    "Зарплата: 250 000 – 450 000 ₽/мес",
        //    "График работы: 5/2, гибкий, но с обязательными встречами в офисе (1–2 раза в неделю)",
        //],
        //"Технический директор": [
        //    "Образование: Магистр или PhD в области компьютерных наук/инженерии (желательно)",
        //    "Опыт работы: 10+ лет в ИТ, 5+ лет на позиции руководителя технической команды в масштабных компаниях",
        //    "Навыки: Стратегическое планирование ИТ - инфраструктуры Выбор технологических стеков на уровне компании Управление R & D, инновациями Взаимодействие с инвесторами, акционерами Понимание бизнес - моделей и рынка",
        //    "Зарплата: 500 000 – 1 200 000+ ₽/мес (включая бонусы и опционы)",
        //    "График работы: Гибкий, 6 дней в неделю (по необходимости), часто удалённо, но с частыми встречами и поездками",
        //]

        //'exemple': ['exemple', 'exemple', 'exemple', 'exemple', 'exemple'],

        const examples = [
            { "Стажёр-разработчик": ["Образование",": Бакалавр по направлению «Информатика», «Программная инженерия» или смежным (можно без диплома, но с портфолио)"] },
            { "Стажёр-разработчик": ["Образование: Бакалавр по направлению «Информатика», «Программная инженерия» или смежным (можно без диплома, но с портфолио)"] },
            { "Стажёр-разработчик": ["Опыт работы: 0–1 год (стажировки, проекты на GitHub, хакатоны)"] },
            { "Стажёр-разработчик": ["Навыки: Основы Python/JavaScript Работа с Git Базовые знания HTML/CSS Понимание принципов ООП Умение работать в команде"] },
            { "Стажёр-разработчик": ["Зарплата: 40 000 – 70 000 ₽/мес (Россия, Москва/Санкт-Петербург)"] },
            { "Стажёр-разработчик": ["График работы: 5/2 9:00–18:00 гибридный (2–3 дня в офисе)"] },

            { "Разработчик": ["Образование: Бакалавр", " или магистр в ИТ - сфере"] },
            { "Разработчик": ["Образование", ": Бакалавр", " или магистр в ИТ - сфере"] },
            { "Разработчик": ["Опыт работы: 2–4 года в разработке ПО"] },
            { "Разработчик": ["Навыки: Глубокое знание одного языка(Java, Python, C#) Работа с базами данных(PostgreSQL, MongoDB) REST API, Docker, CI / CD Тестирование(unit / integration) Работа в Agile / Scrum"] },
            { "Разработчик": ["Зарплата: 90 000 – 150 000 ₽/мес"] },
            { "Разработчик": ["График работы: 5 / 2, гибкий график(возможен удалённый формат)"] },

            { "Старший разработчик": ["Образование", ": Высшее техническое образование (бакалавр/магистр)"] },
            { "Старший разработчик": ["Опыт работы: 5+ лет, ведущая роль в проектах"] },
            { "Старший разработчик": ["Навыки: Архитектура систем(микросервисы, event - driven) Оптимизация производительности Наставничество младших разработчиков Работа с облачными платформами(AWS, Azure) Участие в техническом дизайне"] },
            { "Старший разработчик": ["Зарплата: 160 000 – 280 000 ₽/мес"] },
            { "Старший разработчик": ["График работы: Гибкий (4–5 дней в неделю), возможен полностью удалённый формат"] },

            { "Руководитель группы разработки": ["Образование: Высшее техническое образование, желательно MBA или дополнительное образование в управлении"] },
            { "Руководитель группы разработки": ["Образование", " Высшее техническое образование, желательно MBA или дополнительное образование в управлении"] },
            { "Руководитель группы разработки": ["Опыт работы: 7+ лет в разработке, 2+ года в управлении командой (5–10 человек)"] },
            { "Руководитель группы разработки": ["Навыки: Управление проектами(Jira, Confluence) Планирование ресурсов и сроков Рекрутинг и оценка персонала Взаимодействие с продуктом и бизнесом Формирование корпоративной культуры"] },
            { "Руководитель группы разработки": ["Зарплата: 250 000 – 450 000 ₽/мес"] },
            { "Руководитель группы разработки": ["График работы: 5/2, гибкий, но с обязательными встречами в офисе (1–2 раза в неделю)"] },

            { "Технический директор": ["Образование: Магистр или PhD в области компьютерных наук/инженерии (желательно)"] },
            { "Технический директор": ["Образование", ": Магистр или PhD в области компьютерных наук/инженерии (желательно)"] },
            { "Технический директор": ["Опыт работы: 10+ лет в ИТ, 5+ лет на позиции руководителя технической команды в масштабных компаниях"] },
            { "Технический директор": ["Навыки: Стратегическое планирование ИТ - инфраструктуры Выбор технологических стеков на уровне компании Управление R & D, инновациями Взаимодействие с инвесторами, акционерами Понимание бизнес - моделей и рынка"] },
            { "Технический директор": ["Зарплата: 500 000 – 1 200 000+ ₽/мес (включая бонусы и опционы)"] },
            { "Технический директор": ["График работы: Гибкий, 6 дней в неделю (по необходимости), часто удалённо, но с частыми встречами и поездками"] },

            //{ "Образование": ["Бакалавр по направлению «Информатика», «Программная инженерия» или смежным (можно без диплома, но с портфолио)"] },
            //{ "Опыт работы": ["Опыт работы 0–1 год (стажировки, проекты на GitHub, хакатоны)"] },
            //{ "Навыки": ["Навыки Основы Python/JavaScript Работа с Git Базовые знания HTML/CSS Понимание принципов ООП Умение работать в команде"] },
            //{ "Зарплата": ["Зарплата  40 000 – 70 000 ₽/мес (Россия, Москва/Санкт-Петербург)"] },
            //{ "График работы": ["График работы  5/2, 9:00–18:00, гибридный (2–3 дня в офисе)"] },





            //{ "Образование": ["Образование: Бакалавр или магистр в ИТ - сфере"] },
            //{ "Опыт работы": ["Опыт работы: 2–4 года в разработке ПО"] },
            //{ "Навыки": ["Навыки: Глубокое знание одного языка(Java, Python, C#) Работа с базами данных(PostgreSQL, MongoDB) REST API, Docker, CI / CD Тестирование(unit / integration) Работа в Agile / Scrum"] },
            //{ "Зарплата": ["Зарплата: 90 000 – 150 000 ₽/мес"] },
            //{ "График работы": ["График работы: 5 / 2, гибкий график(возможен удалённый формат)"] },

           

            //{ "Образование": ["Образование  Высшее техническое образование (бакалавр/магистр)"] },
            //{ "Опыт работы": ["Опыт работы: 5+ лет, ведущая роль в проектах"] },
            //{ "Навыки": ["Навыки: Архитектура систем(микросервисы, event - driven) Оптимизация производительности Наставничество младших разработчиков Работа с облачными платформами(AWS, Azure) Участие в техническом дизайне"] },
            //{ "Зарплата": ["Зарплата: 160 000 – 280 000 ₽/мес"] },
            //{ "График работы": ["График работы: Гибкий (4–5 дней в неделю), возможен полностью удалённый формат"] },



            //{ "Образование": ["Образование: Высшее техническое образование, желательно MBA или дополнительное образование в управлении"] },
            //{ "Опыт работы": ["Опыт работы: 7+ лет в разработке, 2+ года в управлении командой (5–10 человек)"] },
            //{ "Навыки": ["Навыки: Управление проектами(Jira, Confluence) Планирование ресурсов и сроков Рекрутинг и оценка персонала Взаимодействие с продуктом и бизнесом Формирование корпоративной культуры"] },
            //{ "Зарплата": ["Зарплата: 250 000 – 450 000 ₽/мес"] },
            //{ "График работы": ["График работы: 5/2, гибкий, но с обязательными встречами в офисе (1–2 раза в неделю)"] },




            //{ "Образование": ["Образование: Магистр или PhD в области компьютерных наук/инженерии (желательно)"] },
            //{ "Опыт работы": ["Опыт работы: 10+ лет в ИТ, 5+ лет на позиции руководителя технической команды в масштабных компаниях"] },
            //{ "Навыки": ["Навыки: Стратегическое планирование ИТ - инфраструктуры Выбор технологических стеков на уровне компании Управление R & D, инновациями Взаимодействие с инвесторами, акционерами Понимание бизнес - моделей и рынка"] },
            //{ "Зарплата": ["Зарплата: 500 000 – 1 200 000+ ₽/мес (включая бонусы и опционы)"] },
            //{ "График работы": ["График работы: Гибкий, 6 дней в неделю (по необходимости), часто удалённо, но с частыми встречами и поездками"] },
        ];
        examples.forEach(row => {
            for (const [category, words] of Object.entries(row)) {
                words.forEach(word => {
                    if (!this.categories[category]) {
                        this.categories[category] = [];
                        this.categoryColors[category] = this.getRandomColor();
                    }
                    this.categories[category].push(word);
                });
                //this.categories[category].push(words);
            }
        })

        this.updateCategoriesDisplay();

        // Инициализируем сеть с примером архитектуры
        this.architectureInput.value = '16, 8';
        this.learningRateInput.value = '0.1';
        this.epochsInput.value = '2500';

        this.initializeNetwork();

        //this.dataset.length / 4;
        //for (let i = 0; i < 5; i++) {
        //    const obj = this.dataset[i];
        //    //examples[obj.name] = [obj.working_hours, obj.work_schedule_by_days, obj.requirement, obj.responsibility, obj.schedule, obj.salary_from, obj.salary_to, obj.frequency, obj.currency, obj.experience].join(" ");
        //    examples[obj.name] = [obj.working_hours, obj.work_schedule_by_days, obj.requirement, obj.responsibility, obj.schedule, obj.salary_from, obj.salary_to, obj.frequency, obj.currency, obj.experience];
        //}
        //for (const obj of this.dataset) {
        //    examples[obj.name] = [obj.working_hours, obj.work_schedule_by_days, obj.requirement, obj.responsibility, obj.schedule, obj.salary_from, obj.salary_to, obj.frequency, obj.currency, obj.experience];
        //}
        //.join(" ");
    }

    // Метод для получения текущего состояния
    getState() {
        return {
            network: this.network ? this.network.getState() : null,
            categories: this.categories,
            categoryColors: this.categoryColors,
            trainingData: this.trainingData
        };
    }
    getWord() {
        return {

        }
    }

    // Метод для загрузки состояния
    loadState(state) {
        if (state.network) {
            this.network = new NeuralNetwork(state.network.architecture, state.network.learningRate);
            this.network.loadState(state.network);
        }

        this.categories = state.categories;
        this.categoryColors = state.categoryColors;
        this.trainingData = state.trainingData;

        this.updateCategoriesDisplay();
        this.updateVisualization();
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    window.app = new WordClassificationApp();

    // Добавляем обработчики для сохранения/загрузки состояния
    document.getElementById('saveStateBtn').addEventListener('click', () => {
        const state = window.app.getState();
        localStorage.setItem('wordClassificationState', JSON.stringify(state));
        alert('Состояние сохранено!');
        const stateWord = window.app.getWord();
        localStorage.setItem('word', JSON.stringify(stateWord));
        alert('Состояние сохранено!');
    });

    document.getElementById('loadStateBtn').addEventListener('click', () => {
        const savedState = localStorage.getItem('wordClassificationState');
        if (savedState) {
            window.app.loadState(JSON.parse(savedState));
            alert('Состояние загружено!');
        } else {
            alert('Нет сохраненного состояния');
        }
        const savedWord = localStorage.getItem('word');
        if (savedState) {
            window.app.loadState(JSON.parse(savedWord));
            alert('Состояние загружено!');
        } else {
            alert('Нет сохраненного состояния');
        }
    });

    // Обработка изменения размера окна
    window.addEventListener('resize', () => {
        window.app.updateVisualization();
    });
});

