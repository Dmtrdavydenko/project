// === 1. Алфавит с позициями ===
const alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split('');
const alphabetMap = {};
alphabet.forEach((letter, idx) => {
    alphabetMap[letter] = idx;
});

// === 2. Векторизация слова с учётом позиции ===
function wordToVector(word) {
    const vecSize = alphabet.length;
    let vector = new Array(vecSize).fill(0);

    for (let i = 0; i < word.length; i++) {
        const letter = word[i].toLowerCase();
        if (!alphabetMap[letter]) continue;

        const letterIdx = alphabetMap[letter];
        const positionWeight = i + 1; // позиция в слове: 1, 2, 3...

        // Увеличиваем вес вектора по позиции
        vector[letterIdx] += positionWeight;
    }

    return vector;
}

// === 3. Преобразование текста в вектор ===
function textToVector(text) {
    // Извлекаем только русские слова (кириллица + ё)
    const words = text.toLowerCase().match(/[а-яё]+/g) || [];
    const vecSize = alphabet.length;
    let finalVector = new Array(vecSize).fill(0);
    const activationLog = [];

    for (const word of words) {
        const wordVec = wordToVector(word);
        for (let i = 0; i < vecSize; i++) {
            finalVector[i] += wordVec[i];
        }
        activationLog.push({ word, vector: wordVec });
    }

    return { vector: finalVector, activationLog };
}

// === 4. Простая нейронная сеть (1 скрытый слой) ===
class SimpleNN {
    constructor(inputSize, hiddenSize, outputSize) {
        this.W1 = this.randomMatrix(inputSize, hiddenSize);
        this.b1 = this.randomVector(hiddenSize);
        this.W2 = this.randomMatrix(hiddenSize, outputSize);
        this.b2 = this.randomVector(outputSize);
    }

    randomMatrix(rows, cols) {
        const m = [];
        for (let i = 0; i < rows; i++) {
            m[i] = [];
            for (let j = 0; j < cols; j++) {
                m[i][j] = (Math.random() - 0.5) * 0.1; // маленькие веса
            }
        }
        return m;
    }

    randomVector(size) {
        return Array(size).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    forward(input) {
        // Слой 1: вход → скрытый
        const hidden = Array(this.W1[0].length).fill(0);
        for (let j = 0; j < this.W1[0].length; j++) {
            let sum = this.b1[j];
            for (let i = 0; i < input.length; i++) {
                sum += input[i] * this.W1[i][j];
            }
            hidden[j] = this.sigmoid(sum);
        }

        // Слой 2: скрытый → выход
        const output = Array(this.W2[0].length).fill(0);
        for (let j = 0; j < this.W2[0].length; j++) {
            let sum = this.b2[j];
            for (let i = 0; i < hidden.length; i++) {
                sum += hidden[i] * this.W2[i][j];
            }
            output[j] = this.sigmoid(sum);
        }

        return { output, hidden };
    }
}

// === 5. Обученная сеть (предварительно обученная "вручную") ===
// В реальности обучаем на данных, но здесь — эвристика
const nn = new SimpleNN(alphabet.length, 10, 5); // 5 профессий

// Примерные профессии (кодируем как индексы)
const jobTitles = [
    "Data Scientist",
    "ML-инженер",
    "Data Engineer",
    "Веб-разработчик",
    "Бухгалтер"
];

// === 6. Обработка текста ===
function processText() {
    const text = document.getElementById('inputText').value;
    const { vector, activationLog } = textToVector(text);

    // Нормализуем вектор (для стабильности)
    const max = Math.max(...vector);
    const normalizedVector = vector.map(v => max > 0 ? v / max : 0);

    // Прогоняем через нейросеть
    const { output, hidden } = nn.forward(normalizedVector);

    // Находим лучшую профессию
    const bestIdx = output.indexOf(Math.max(...output));
    const job = jobTitles[bestIdx] || "Неизвестная профессия";

    document.getElementById('result').textContent = `🎯 Рекомендуемая вакансия: ${job}`;

    // Визуализируем тепловую карту
    drawHeatmap(activationLog);
}

// === 7. Тепловая карта на Canvas ===

function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [r, g, b];
}

function drawHeatmap(activationLog) {
    const canvas = document.getElementById('heatmapCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Собираем все буквы из всех слов в один список с активацией
    const letterActivations = [];

    activationLog.forEach(item => {
        const word = item.word;
        const wordVec = item.vector; // вектор длиной 31

        for (let i = 0; i < word.length; i++) {
            const letter = word[i].toLowerCase();
            if (!alphabetMap[letter]) continue;

            const letterIdx = alphabetMap[letter];
            const activation = wordVec[letterIdx]; // вклад именно этой буквы в слове

            letterActivations.push({ letter, activation });
        }
    });

    if (letterActivations.length === 0) return;

    // Нормализуем активации: от 0 до 1
    const maxActivation = Math.max(...letterActivations.map(l => l.activation));
    const minActivation = Math.min(...letterActivations.map(l => l.activation));
    const range = maxActivation - minActivation;

    const cellWidth = width / letterActivations.length;

    letterActivations.forEach((item, index) => {
        let normActivation = 0;
        if (range > 0) {
            normActivation = (item.activation - minActivation) / range;
        } else {
            normActivation = 1; // если все нули — сделаем серый
        }

        // Цвет: синий (слабо) → красный (сильно)
        const hue = 120 - 120 * normActivation; // от красного (0°) до синего (120°)
        const rgb = hslToRgb(hue / 360, 1, 0.7);
        const r = Math.floor(rgb[0] * 255);
        const g = Math.floor(rgb[1] * 255);
        const b = Math.floor(rgb[2] * 255);

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(index * cellWidth, 0, cellWidth, height);

        // Надпись буквы
        ctx.fillStyle = normActivation > 0.7 ? 'white' : 'black';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.letter, index * cellWidth + cellWidth / 2, height / 2);
    });
}
    
