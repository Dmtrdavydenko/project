const lexicons = {
    timeOfYear: {
        winter: ["зимой", "зима", "снег", "лыжи", "мороз", "новый год", "ёлка"],
        summer: ["летом", "лето", "жара", "пляж", "море", "вода", "солнце", "отпуск"]
    },
    equipment: {
        mountain: ["горные лыжи", "сноуборд", "горы", "подъёмник", "трасса", "склон"],
        water: ["водный мотоцикл", "водные лыжи", "катер", "яхта", "лодка", "вода", "пляж"]
    },
    location: {
        water: ["у воды", "у моря", "у озера", "у реки", "на берегу", "у воды"],
        mountains: ["в горах", "горы", "холмы", "скалы", "подъём", "высота"],
        indifferent: ["мне всё равно", "где угодно", "неважно", "в любом месте"]
    },
    budget: {
        low: ["до 10000", "меньше 10к", "недорого", "не дорого", "дешево", "8000", "7000", "5000"],
        high: ["свыше 10000", "дорого", "15к", "20к", "12000", "10000+", "бюджет больше"]
    },
    withKids: {
        yes: ["с детьми", "с ребёнком", "с ребенком", "с семьёй", "с малышами", "с дочкой", "с сыном"],
        no: ["один", "без детей", "без ребёнка", "только я", "вдвоём", "без семьи"]
    },
    waterType: {
        lake: ["озеро", "озера", "озёрный", "озерный"],
        river: ["река", "речка", "речной", "речной берег"],
        sea: ["море", "морской", "пляж", "пляжный", "побережье"]
    }
};
const text = "Хочу зимой с детьми на лыжах, но не больше 8 тысяч";
const tokens = text.toLowerCase()
    .replace(/[.,!?;]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1); // ["хочу", "зимой", "с", "детями", "на", "лыжах", "но", "не", "больше", "8", "тысяч"]


const vocabulary = new Set();

for (const category of Object.values(lexicons)) {
    for (const words of Object.values(category)) {
        words.forEach(w => vocabulary.add(w));
    }
}

// Добавим слова из типичных фраз
["зимой", "летом", "лыжи", "вода", "горы", "озеро", "речка", "море", "до", "свыше", "с", "дети", "ребёнок", "мне", "всё", "равно", "один", "дорого", "дешево"].forEach(w => vocabulary.add(w));
const vectorizeText = (text, vocab) => {
    const tokens = text.toLowerCase()
        .replace(/[.,!?;]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1);

    const vec = new Array(vocab.size).fill(0);
    const vocabArray = [...vocab];

    for (let i = 0; i < vocabArray.length; i++) {
        if (tokens.includes(vocabArray[i])) {
            vec[i] = 1;
        }
    }
    return vec;
};
const createLexiconVector = (words, vocab) => {
    const vec = new Array(vocab.size).fill(0);
    const vocabArray = [...vocab];
    for (let i = 0; i < vocabArray.length; i++) {
        if (words.includes(vocabArray[i])) {
            vec[i] = 1;
        }
    }
    return vec;
};

// Создаём векторы для всех категорий
const lexiconVectors = {};
for (const [category, options] of Object.entries(lexicons)) {
    lexiconVectors[category] = {};
    for (const [key, words] of Object.entries(options)) {
        lexiconVectors[category][key] = createLexiconVector(words, vocabulary);
    }
}
const cosineSimilarity = (a, b) => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (normA * normB);
};
const classifyParameter = (textVector, lexiconVectorsForParam) => {
    let bestScore = -1;
    let bestLabel = null;

    for (const [label, targetVector] of Object.entries(lexiconVectorsForParam)) {
        const score = cosineSimilarity(textVector, targetVector);
        if (score > bestScore) {
            bestScore = score;
            bestLabel = label;
        }
    }

    // Если сходство < 0.1 — считаем, что не найдено
    return bestScore > 0.1 ? bestLabel : null;
};
const extractParameters = (userInput) => {
    const tokens = userInput.toLowerCase()
        .replace(/[.,!?;]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1);

    const textVector = vectorizeText(userInput, vocabulary);

    const result = {};

    // timeOfYear
    const timeKey = classifyParameter(textVector, lexiconVectors.timeOfYear);
    result.timeOfYear = timeKey === "winter" ? "Зимой" : timeKey === "summer" ? "Летом" : null;

    // equipment
    const equipKey = classifyParameter(textVector, lexiconVectors.equipment);
    result.equipment = equipKey === "mountain" ? "на горных лыжах/сноуборде" : equipKey === "water" ? "на водном мотоцикле/лыжах" : null;

    // location
    const locKey = classifyParameter(textVector, lexiconVectors.location);
    result.location = locKey === "water" ? "у воды" : locKey === "mountains" ? "в горах" : locKey === "indifferent" ? "мне всё равно" : null;

    // budget
    const budgetKey = classifyParameter(textVector, lexiconVectors.budget);
    result.budget = budgetKey === "low" ? "до 10 000 руб" : budgetKey === "high" ? "свыше 10 000 руб" : null;

    // withKids
    const kidsKey = classifyParameter(textVector, lexiconVectors.withKids);
    result.withKids = kidsKey === "yes" ? "да" : kidsKey === "no" ? "нет" : null;

    // waterType (только если location == "у воды")
    if (result.location === "у воды") {
        const waterKey = classifyParameter(textVector, lexiconVectors.waterType);
        result.waterType = waterKey === "lake" ? "озеро" : waterKey === "river" ? "речка" : waterKey === "sea" ? "море" : null;
    } else {
        result.waterType = null;
    }

    return result;
};
const corpus = [
    "Хочу зимой с детьми на лыжах, но не больше 8 тысяч",
    "Летом, с женой и ребёнком, на море, чтобы было не жарко, и чтобы было не дороже 12 тысяч",
    "Мне всё равно где, но чтобы было с ребёнком и не дорого",
    "Покататься на сноуборде, один, зимой, не дороже 7к",
    "Отдых в горах, без детей, на горных лыжах, бюджет 15к",
    "У озера, с семьёй, на лодке, недорого",
    "На водном мотоцикле, в горах, один, дорого",
    "Море, летом, с детьми, бюджет до 10к",
    "В горах, зимой, сноуборд, без детей, 20к",
    "Озеро, летом, с дочкой, не дорого"
];
const computeTFIDF = (corpus, vocabulary) => {
    const N = corpus.length;
    const tfidfVectors = [];

    // Считаем IDF для каждого слова
    const idf = {};
    for (const word of vocabulary) {
        const docCount = corpus.filter(doc => doc.includes(word)).length;
        idf[word] = Math.log(N / (docCount === 0 ? 1 : docCount)); // +1 для избежания деления на 0
    }

    // Для каждого документа — считаем TF-IDF вектор
    for (const doc of corpus) {
        const tokens = doc.toLowerCase().replace(/[.,!?;]/g, ' ').split(/\s+/).filter(w => w.length > 1);
        const totalWords = tokens.length;
        const tf = {};

        // TF: частота слова в документе
        for (const word of tokens) {
            tf[word] = (tf[word] || 0) + 1;
        }

        // TF-IDF вектор
        const vec = new Array(vocabulary.size).fill(0);
        const vocabArray = [...vocabulary];

        for (let i = 0; i < vocabArray.length; i++) {
            const word = vocabArray[i];
            const tfVal = tf[word] ? tf[word] / totalWords : 0;
            vec[i] = tfVal * idf[word];
        }

        tfidfVectors.push(vec);
    }

    return { tfidfVectors, idf };
};
const createLexiconTFIDFVector = (words, vocabulary, idf) => {
    const vec = new Array(vocabulary.size).fill(0);
    const vocabArray = [...vocabulary];

    for (let i = 0; i < vocabArray.length; i++) {
        const word = vocabArray[i];
        if (words.includes(word)) {
            vec[i] = idf[word]; // TF = 1, так как это эталон — каждое слово встречается 1 раз
        }
    }
    return vec;
};
const classifyWithTFIDF = (userInput, tfidfVectors, lexiconVectors, vocabulary, idf) => {
    // Векторизуем ввод
    const tokens = userInput.toLowerCase().replace(/[.,!?;]/g, ' ').split(/\s+/).filter(w => w.length > 1);
    const totalWords = tokens.length;
    const tf = {};
    for (const word of tokens) tf[word] = (tf[word] || 0) + 1;

    const inputVec = new Array(vocabulary.size).fill(0);
    const vocabArray = [...vocabulary];
    for (let i = 0; i < vocabArray.length; i++) {
        const word = vocabArray[i];
        const tfVal = tf[word] ? tf[word] / totalWords : 0;
        inputVec[i] = tfVal * (idf[word] || 0);
    }

    // Сравниваем с каждым эталоном
    const results = {};
    for (const [param, options] of Object.entries(lexiconVectors)) {
        let bestScore = -1;
        let bestLabel = null;
        for (const [label, targetVec] of Object.entries(options)) {
            const score = cosineSimilarity(inputVec, targetVec);
            if (score > bestScore) {
                bestScore = score;
                bestLabel = label;
            }
        }
        results[param] = bestScore > 0.05 ? bestLabel : null;
    }

    return results;
};


const tests = [
    "Хочу зимой с детьми на лыжах, но не больше 8 тысяч",
    "Летом, с женой и ребёнком, на море, чтобы было не жарко, и чтобы было не дороже 12 тысяч",
    "Мне всё равно где, но чтобы было с ребёнком и не дорого",
    "Покататься на сноуборде, один, зимой, не дороже 7к"
];

tests.forEach(test => {
    console.log(`Ввод: "${test}"`);
    console.log("Результат:", extractParameters(test));
    console.log("---");
});
