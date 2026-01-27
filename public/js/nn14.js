const RU_ALPHABET = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const EN_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const COMBINED_ALPHABET = RU_ALPHABET + EN_ALPHABET + '0123456789/';
const VECTOR_SIZE = 60;
console.log(COMBINED_ALPHABET.length);

function createNormalizedArray(min, max, count) {
    const result = [];
    const step = (max - min) / (count - 1);

    for (let i = 0; i < count; i++) {
        const value = min + i * step;
        const normalizedValue = (value - min) / (max - min);
        result.push(normalizedValue);
    }

    return result;
}

// Пример использования
const normalizedArray = createNormalizedArray(0, COMBINED_ALPHABET.length, COMBINED_ALPHABET.length);
console.log(normalizedArray);
//const myText = "работа";
//const myText = "Привет я хочу найти работу удаленно";
const myText = "Привет я хочу найти работу в городе москва возраст 39 лет вес 68 кг фобий нет алергий нет html css js желательно удаленно";
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^a-zа-яё0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
function wortToVector(word) {
    let wordVector = [];
    word.split('').forEach((char, i) => {
        wordVector.push(normalizedArray[COMBINED_ALPHABET.indexOf(char)]);
    });
    return wordVector;
}
function wordTest(text) {
    const words = normalizeText(text).split(' ');
    const textVector = [];
    let vector = new Array(COMBINED_ALPHABET.length).fill(0);
    words.forEach((word, i) => {
        //console.log(word, word.length);

        let wordVector = [];
        word.split('').forEach((char, i) => {
            wordVector.push(normalizedArray[COMBINED_ALPHABET.indexOf(char)]);
            vector[i] += normalizedArray[COMBINED_ALPHABET.indexOf(char)];
        });
        textVector.push(wordVector);
    });
    return { textVector: textVector, words: words };
}
const patterns = "работа";

let patternVector = wortToVector(patterns);

let shape = {
    "город": wordTest("Москва Барнуал Новоалтайск Новосибирск Омск"),
    "график": wordTest("5/2 4/4 3/3"),
    "образование": wordTest("среднее бакалавриат специалитет магистратура подготовка кадров высшей квалификации"),
}
for (const [wordInput, words] of Object.entries(wordTest(myText))) {
    //words.forEach(vector => {
        if (wordInput.length > patterns.length) {
            let vector = new Array(wordInput.length).fill(0);
            patternVector.forEach((char, i) => {
                vector[i] = char;
            })
            patternVector = vector;
        }
        console.log(wordInput, words);
        for (const [category, patternVector] of Object.entries(shape)) {
            console.log(category, patternVector);
            for (let i = 0; i < patternVector.textVector.length; i++) {

                patternVector.textVector[i].forEach(word => {

                    console.log(category, vector, patternVector.words[i], cosineSimilarity(vector, word));

                })



            }
        }
    //})
}








//function normalize(arr) {
//    const min = Math.min(...arr);
//    const max = Math.max(...arr);

//    // Если все элементы одинаковые (min == max), вернуть массив из 0.5 или 0
//    if (min === max) {
//        return arr.map(() => 0.5); // или return arr.map(() => 0); — зависит от задачи
//    }

//    return arr.map(x => (x - min) / (max - min));
//}



//cosineSimilarity();


//const RU_ALPHABET = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
//const EN_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
//const COMBINED_ALPHABET = RU_ALPHABET + EN_ALPHABET + '0123456789 ';

//// Создаем n-gram модель для лучшего сравнения слов
//function createNGrams(word, n = 2) {
//    const ngrams = [];
//    for (let i = 0; i <= word.length - n; i++) {
//        ngrams.push(word.substring(i, i + n));
//    }
//    return ngrams;
//}

//// Создаем векторное представление слова на основе n-gram
//function wordToVector(word, alphabet = COMBINED_ALPHABET, n = 2) {
//    const vector = new Array(alphabet.length * alphabet.length).fill(0);
//    const ngrams = createNGrams(word, n);

//    ngrams.forEach(ngram => {
//        if (ngram.length === n) {
//            const index1 = alphabet.indexOf(ngram[0]);
//            const index2 = alphabet.indexOf(ngram[1]);
//            if (index1 !== -1 && index2 !== -1) {
//                const vectorIndex = index1 * alphabet.length + index2;
//                vector[vectorIndex] += 1;
//            }
//        }
//    });

//    // Нормализуем вектор
//    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
//    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
//}

// Косинусное сходство
function cosineSimilarity(vec1, vec2) {
    if (vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        magnitude1 += vec1[i] * vec1[i];
        magnitude2 += vec2[i] * vec2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    return magnitude1 > 0 && magnitude2 > 0 ? dotProduct / (magnitude1 * magnitude2) : 0;
}

//// Функция для сравнения слов
//function fuzzyWordMatch(word1, word2, threshold = 0.7) {
//    const vec1 = wordToVector(word1.toLowerCase());
//    const vec2 = wordToVector(word2.toLowerCase());
//    const similarity = cosineSimilarity(vec1, vec2);
//    return {
//        word1,
//        word2,
//        similarity: similarity.toFixed(3),
//        isMatch: similarity >= threshold
//    };
//}
//function advancedFuzzyMatch(text1, text2) {
//    const words1 = normalizeText(text1).split(' ');
//    const words2 = normalizeText(text2).split(' ');

//    let totalSimilarity = 0;
//    let comparisons = 0;

//    words1.forEach(word1 => {
//        words2.forEach(word2 => {
//            const similarity = cosineSimilarity(
//                wordToVector(word1),
//                wordToVector(word2)
//            );
//            if (similarity > 0.3) { // Фильтр слабых совпадений
//                totalSimilarity += similarity;
//                comparisons++;
//            }
//        });
//    });

//    return comparisons > 0 ? totalSimilarity / comparisons : 0;
//}

//// Сохраняем словарь слов с их векторами
//class WordDictionary {
//    constructor() {
//        this.words = new Map();
//    }

//    addWord(word) {
//        const normalizedWord = word.toLowerCase();
//        if (!this.words.has(normalizedWord)) {
//            this.words.set(normalizedWord, wordToVector(normalizedWord));
//        }
//        return this;
//    }

//    findSimilarWords(targetWord, threshold = 0.7) {
//        const targetVector = wordToVector(targetWord.toLowerCase());
//        const results = [];

//        for (const [word, vector] of this.words.entries()) {
//            const similarity = cosineSimilarity(targetVector, vector);
//            if (similarity >= threshold) {
//                results.push({
//                    word,
//                    similarity: similarity.toFixed(3)
//                });
//            }
//        }

//        return results.sort((a, b) => b.similarity - a.similarity);
//    }
//}

//// Пример использования
//const dictionary = new WordDictionary();
//const myText = "Привет я хочу найти работу в городе москва возраст 39 лет вес 68 кг фобий нет алергий нет html css js желательно удаленно";

//function normalizeText(text) {
//    return text
//        .toLowerCase()
//        .replace(/[^a-zа-яё0-9\s]/g, '')
//        .replace(/\s+/g, ' ')
//        .trim();
//}

//const words = normalizeText(myText).split(' ');

//// Добавляем слова в словарь
//words.forEach(word => dictionary.addWord(word));

//// Тестируем fuzzy сравнение
//console.log("=== Сравнение похожих слов ===");
//console.log(fuzzyWordMatch("москва", "москава")); // Опечатка
//console.log(fuzzyWordMatch("работа", "работи")); // Опечатка
//console.log(fuzzyWordMatch("html", "htm")); // Сокращение

//console.log("\n=== Поиск похожих слов в словаре ===");
//console.log(dictionary.findSimilarWords("москава", 0.6)); // Найдет "москва"
//console.log(dictionary.findSimilarWords("работи", 0.6)); // Найдет "работу"



//const RU_ALPHABET = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
//const EN_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
//const COMBINED_ALPHABET = RU_ALPHABET + EN_ALPHABET + '0123456789/';
//const VECTOR_SIZE = 60;

//console.log('Длина алфавита:', COMBINED_ALPHABET.length);

//function createNormalizedArray(min, max, count) {
//    const result = [];
//    const step = (max - min) / (count - 1);

//    for (let i = 0; i < count; i++) {
//        const value = min + i * step;
//        const normalizedValue = (value - min) / (max - min);
//        result.push(normalizedValue);
//    }

//    return result;
//}

//const normalizedArray = createNormalizedArray(0, COMBINED_ALPHABET.length, COMBINED_ALPHABET.length);

//function normalizeText(text) {
//    return text
//        .toLowerCase()
//        .replace(/[^a-zа-яё0-9\s]/g, '')
//        .replace(/\s+/g, ' ')
//        .trim();
//}

//// Функция для вычисления косинусного сходства
//function cosineSimilarity(vecA, vecB) {
//    // Приводим векторы к одинаковой длине
//    const maxLength = Math.max(vecA.length, vecB.length);
//    const a = vecA.concat(new Array(maxLength - vecA.length).fill(0));
//    const b = vecB.concat(new Array(maxLength - vecB.length).fill(0));

//    let dotProduct = 0;
//    let magnitudeA = 0;
//    let magnitudeB = 0;

//    for (let i = 0; i < maxLength; i++) {
//        dotProduct += a[i] * b[i];
//        magnitudeA += a[i] * a[i];
//        magnitudeB += b[i] * b[i];
//    }

//    magnitudeA = Math.sqrt(magnitudeA);
//    magnitudeB = Math.sqrt(magnitudeB);

//    if (magnitudeA === 0 || magnitudeB === 0) return 0;

//    return dotProduct / (magnitudeA * magnitudeB);
//}

//// Создаем вектор для слова фиксированной длины
//function wordToVector(word, targetLength = VECTOR_SIZE) {
//    const vector = new Array(targetLength).fill(0);

//    for (let i = 0; i < Math.min(word.length, targetLength); i++) {
//        const charIndex = COMBINED_ALPHABET.indexOf(word[i]);
//        if (charIndex !== -1) {
//            vector[i] = normalizedArray[charIndex];
//        }
//    }

//    return vector;
//}

//// Обрабатываем текст и создаем векторы для всех слов
//function textToVectors(text) {
//    const normalized = normalizeText(text);
//    const words = normalized.split(' ');
//    const vectors = [];

//    for (const word of words) {
//        if (word.length > 0) {
//            vectors.push(wordToVector(word));
//        }
//    }

//    return vectors;
//}

//// Данные для сравнения
//const myText = "Привет я хочу найти работу в городе москва возраст 39 лет вес 68 кг фобий нет алергий нет html css js желательно удаленно";

//const patterns = {
//    "город": ["москва", "барнаул", "новоалтайск", "новосибирск", "омск"],
//    "график": ["5/2", "4/4", "3/3"],
//    "образование": ["среднее", "бакалавриат", "специалитет", "магистратура", "подготовка", "кадров", "высшей", "квалификации"],
//    "работа": ["работа", "вакансия", "труд", "занятость"],
//    "технологии": ["html", "css", "js", "javascript", "python", "java"]
//};

//// Создаем векторы для паттернов
//const patternVectors = {};
//for (const [category, words] of Object.entries(patterns)) {
//    patternVectors[category] = words.map(word => wordToVector(word));
//}

//// Обрабатываем входной текст
//const inputVectors = textToVectors(myText);
//console.log('Слова в тексте:', normalizeText(myText).split(' '));

//// Сравниваем каждое слово входного текста с паттернами
//for (const inputVector of inputVectors) {
//    let bestMatch = { category: '', similarity: 0, word: '' };

//    for (const [category, vectors] of Object.entries(patternVectors)) {
//        for (let i = 0; i < vectors.length; i++) {
//            const similarity = cosineSimilarity(inputVector, vectors[i]);

//            if (similarity > bestMatch.similarity) {
//                bestMatch = {
//                    category: category,
//                    similarity: similarity,
//                    word: patterns[category][i]
//                };
//            }
//        }
//    }

//    // Выводим только значимые совпадения
//    if (bestMatch.similarity > 0.3) {
//        console.log(`Слово: ${normalizeText(myText).split(' ')[inputVectors.indexOf(inputVector)]}`);
//        console.log(`Категория: ${bestMatch.category}`);
//        console.log(`Сходство: ${bestMatch.similarity.toFixed(4)}`);
//        console.log(`Паттерн: ${bestMatch.word}`);
//        console.log('---');
//    }
//}

//// Альтернативный подход: поиск по ключевым словам (более простой и надежный)
//function keywordAnalysis(text) {
//    const normalized = normalizeText(text);
//    const words = normalized.split(' ');
//    const result = {};

//    for (const [category, keywords] of Object.entries(patterns)) {
//        const foundKeywords = keywords.filter(keyword =>
//            words.some(word => word.includes(keyword) || keyword.includes(word))
//        );

//        if (foundKeywords.length > 0) {
//            result[category] = foundKeywords;
//        }
//    }

//    return result;
//}

//console.log('\n=== АНАЛИЗ ПО КЛЮЧЕВЫМ СЛОВАМ ===');
//const analysis = keywordAnalysis(myText);
//console.log('Найденные категории:');
//for (const [category, keywords] of Object.entries(analysis)) {
//    console.log(`${category}: ${keywords.join(', ')}`);
//}


