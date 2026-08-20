const setVacancies = new Set();
const vectorL = new Set();
let mydata = [];
function createTable(data) {
    if (!data || data.length === 0) {
        return '<p>U</p>';
    }

    let table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    let thead = document.createElement('thead');
    let headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(key => {
        let th = document.createElement('th');
        th.textContent = key;
        th.style.border = '1px solid #ccc';
        th.style.padding = '8px';
        th.style.backgroundColor = '#222';
        th.style.color = '#fff';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    let tbody = document.createElement('tbody');
    data.forEach(row => {
        let tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            let td = document.createElement('td');
            td.textContent = value;
            td.style.border = '1px solid #ccc';
            td.style.padding = '8px';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    return table;
}
class WebGPUCV {
    constructor(canvasId) {
        //this.canvas = document.getElementById(canvasId);
        //this.ctx = this.canvas.getContext("webgpu");
    }

    async init() {
        if (!navigator.gpu) throw new Error("WebGPU не поддерживается");
        if (navigator.gpu) console.log("WebGPU поддерживается");

        const adapter = await navigator.gpu.requestAdapter();
        this.device = await adapter.requestDevice();
        this.format = navigator.gpu.getPreferredCanvasFormat();

        //this.ctx.configure({
        //    device: this.device,
        //    format: this.format,
        //    alphaMode: "opaque"
        //});
    }
}
(async () => {
    const gpuCV = new WebGPUCV("canvas");
    await gpuCV.init();
})();






const dropInput = document.createElement("input");
dropInput.type = "text";


const drop = document.createElement("button");
drop.textContent = "Delite table";

const getAllTablesName = document.createElement("button");
getAllTablesName.textContent = "Получить имена всех таблиц";


const selectTable = document.createElement("select");


const getColumnsTypes = document.createElement("button");
getColumnsTypes.textContent = "Получить колонки";
getColumnsTypes.addEventListener("click", getSelectedValue);


const app = document.createElement("div");
app.classList.add("editor");

const light = document.createElement("div");
light.classList.add("highlight");

const suggestions = document.createElement("div");
suggestions.classList.add("suggestions");

const textArea = document.createElement("textarea");
textArea.classList.add("editor-textarea");



function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
const keywordGroups = {
    keyword: [
        "select", "from", "where", "with","left","join", "on",
        "group by","order by", "having"
    ],

    function: [
        "count", "sum", "max", "round", "set"
    ],

    command: [
        "insert", "into", "values",
        "update", "delete", "create",
        "table", "show"
    ],

    logic: [
        "and", "case", "when",
        "then", "else", "end"
    ],

    sort: [
        "asc", "desc"
    ],

    alias: [
        "as"
    ],
    text: [
        "'"
    ]
};


const wordMemory = {};

function rememberWord(word) {

    word = word.toUpperCase();

    if (!word)
        return;

    if (!wordMemory[word]) {

        const points = wordToPoints(word);

        wordMemory[word] = {

            token: word,

            count: 1,

            // Координаты символов
            points,

            // Вектор изменений между символами
            vector: pointsToVectors(points),

            vec: Array.from({ length: 8 }, () => Math.random() * 2 - 1),
            // Числовые признаки всего токена
            features: points.map(point => point[0])

        };

    } else {

        wordMemory[word].count++;

    }
}
function pointsToVectors(points) {
    const vectors = [];

    let previous = [0, 0];

    for (const point of points) {
        vectors.push([
            point[0] - previous[0],
            point[1] - previous[1]
        ]);

        previous = point;
    }

    return vectors;
}
function wordToPoints(word) {
    return [...word].map((char, position) => [
        char.charCodeAt(0),
        position
    ]);
}
function pointsToVectors(points) {
    const vectors = [];

    let previous = [0, 0];

    for (const point of points) {
        vectors.push([
            point[0] - previous[0],
            point[1] - previous[1]
        ]);

        previous = point;
    }

    return vectors;
}
function testMyMet(src) {
    function getAllKeywords() {
        const result = [];

        Object.entries(keywordGroups).forEach(
            ([className, words]) => {

                if (className === 'text') {
                    return;
                }

                words.forEach(word => {
                    result.push({
                        word: word.toUpperCase(),
                        className
                    });
                });
            }
        );

        return result;
    }
    function getAllWords() {

        return Object
            .entries(wordMemory)
            .map(([word, data]) => ({

                word,

                count: data.count,

                vector: data.vector,

                className: "memory"

            }));

    }
    function getCurrentWord() {
        const text = textArea.value.toUpperCase();
        const cursor = textArea.selectionStart;

        const before = text.slice(0, cursor);

        const match = before.match(/[a-zA-Z_][a-zA-Z0-9_]*$/);

        return match ? match[0] : '';
    }
    function wordToPoints(word) {
        return [...word].map((char, position) => [
            char.charCodeAt(0),
            position
        ]);
    }
    function pointsToVectors(points) {
        const vectors = [];

        let previous = [0, 0];

        for (const point of points) {
            vectors.push([
                point[0] - previous[0],
                point[1] - previous[1]
            ]);

            previous = point;
        }

        return vectors;
    }
    function cosineSimilarity(a, b) {
        const dot =
            a[0] * b[0] +
            a[1] * b[1];

        const lengthA =
            Math.sqrt(a[0] ** 2 + a[1] ** 2);

        const lengthB =
            Math.sqrt(b[0] ** 2 + b[1] ** 2);

        if (lengthA === 0 || lengthB === 0) {
            return 0;
        }

        return dot / (lengthA * lengthB);
    }
    function euclideanDistance(a, b) {
        return Math.sqrt(
            (a[0] - b[0]) ** 2 +
            (a[1] - b[1]) ** 2
        );
    }
    function lengthDifference(a, b) {
        const lengthA = Math.sqrt(a.reduce((s, x) => s + x * x, 0));
        const lengthB = Math.sqrt(b.reduce((s, x) => s + x * x, 0));

        return Math.abs(lengthA - lengthB);
    }
    function lengthRatio(a, b) {
        const lengthA = Math.sqrt(
            a.reduce((sum, x) => sum + x ** 2, 0)
        );

        const lengthB = Math.sqrt(
            b.reduce((sum, x) => sum + x ** 2, 0)
        );

        if (lengthA === 0 || lengthB === 0) {
            return 0;
        }

        return Math.min(lengthA, lengthB) / Math.max(lengthA, lengthB);
    }
    function wordSimilarity(wordA, wordB) {
        const pointsA = wordToPoints(wordA);
        const pointsB = wordToPoints(wordB);

        const vectorsA = pointsToVectors(pointsA);
        const vectorsB = pointsToVectors(pointsB);
        //console.log("pointA",...pointsA);
        //console.log("pointB", ...pointsB);
        //console.log("vec__A",...vectorsA);
        //console.log("vec__B", ...vectorsB);

        const count = Math.min(
            vectorsA.length,
            vectorsB.length
        );

        //console.log(count);

        if (count === 0) {
            return 0;
        }

        let sum = 0;

        for (let i = 0; i < count; i++) {
            sum += cosineSimilarity(
                vectorsA[i],
                vectorsB[i]
            ) * lengthRatio(vectorsA[i], vectorsB[i]);
        }
        //console.log(sum, count);
        //console.log(sum/count);

        return sum / count;
    }
    function getSuggestions(input, limit = 10) {
        if (!input) {
            return [];
        }

        const candidates = [
            ...getAllKeywords(),
            //...getAllWords()
        ];

        return candidates
            .map(item => ({
                ...item,
                score: wordSimilarity(input, item.word)
            }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    const currentWord = getCurrentWord();
    console.log(currentWord);


    const words = src
        .toUpperCase()
        .split(/\s+/)
        .filter(Boolean);


    //words.forEach(word => {

    //    rememberWord(word);

    //});

    const words_point = words.map(i => wordToPoints(i));
    const words_vec2 = words.map(i => pointsToVectors(wordToPoints(i)));

    let model = {}
    model["input"] = src;
    model["tokens"] = words;
    model["point"] = words_point;
    model["vector"] = words_vec2;

    console.log(
        model
    );

    console.log(
        'Ввод:',
        src
    );

    console.log(
        'tokens:',
        JSON.stringify(words)
    );
    console.log(
        'Точки:',
        JSON.stringify(words_point)

    );
    console.log(
        'Вектор:',
        JSON.stringify(words_vec2)
    );


    console.log(
        "Память:",
        wordMemory
    );
    console.log(
        "Память:",
        JSON.stringify(wordMemory)
    );
    console.log(
        "SQL:",
        getAllKeywords()
    );
    if (!currentWord) {
        suggestions.style.display = 'none';
        return;
    }

    if (currentWord) {
        const suggestions = getSuggestions(currentWord, 7);

        console.log(
            'Ввод:',
            currentWord
        );



        console.log(
            'Подходящие:',
            suggestions
        );
        showSuggestions(suggestions);
    }
}
function showSuggestions(words) {

    if (!words.length) {
        suggestions.style.display = 'none';
        return;
    }

    selectedIndex = 0;

    suggestions.innerHTML = words
        .map((item, index) => `
            <div
                class="suggestion ${index === 0 ? 'active' : ''}"
                data-word="${item.word}"
            >
                ${item.word}

                <span class="suggestion-score">
                    ${item.score.toFixed(2)}
                </span>
            </div>
        `)
        .join('');

    suggestions.style.display = 'block';
}
function updateActiveSuggestion() {

    const items =
        suggestions.querySelectorAll('.suggestion');

    items.forEach((item, index) => {

        item.classList.toggle(
            'active',
            index === selectedIndex
        );

    });
}
function replaceCurrentWord(word) {

    const text = textArea.value;

    const cursor =
        textArea.selectionStart;


    const before =
        text.slice(0, cursor);

    const after =
        text.slice(cursor);


    const match =
        before.match(
            /[a-zA-Z_][a-zA-Z0-9_]*$/
        );


    if (!match) {
        return;
    }


    const start =
        cursor - match[0].length;


    textArea.value =
        text.slice(0, start)
        + word
        + after;


    const newCursor =
        start + word.length;


    textArea.setSelectionRange(
        newCursor,
        newCursor
    );


    suggestions.style.display = 'none';


    renderHighlight();
}
let selectedIndex = 0;


function renderHighlight() {

    let html = escapeHtml(textArea.value);
    const input = html.toUpperCase();

    console.log(input);

    //rememberInput(input);

    testMyMet(input);


    Object.entries(keywordGroups).forEach(([className, words]) => {

        if (className === 'text') {
            html = html.replace(
                /'[^']*'/g,
                match => `<span class="${className}">${match}</span>`
            );
            return;
        }

        const regex = new RegExp(
            `\\b(${words.join('|')})\\b`,
            'gi'
        );

        html = html.replace(
            regex,
            match => `<span class="${className}">${match.toUpperCase()}</span>`
        );
    });

    html += '\n';
    light.innerHTML = html;
}
function formatSql(text) {
    let result = text;

    Object.entries(keywordGroups).forEach(([_, words]) => {
        const regex = new RegExp(
            `\\b(${words.join('|')})\\b`,
            'gi'
        );

        result = result.replace(
            regex,
            match => match.toUpperCase()
        );
    });

    return result;
}
textArea.addEventListener('copy', e => {
    e.preventDefault();

    const selectedText =
        textArea.value.substring(
            textArea.selectionStart,
            textArea.selectionEnd
        );

    e.clipboardData.setData(
        'text/plain',
        formatSql(selectedText)
    );
});

function syncSize() {

    light.style.width = textArea.offsetWidth + 'px';

    light.style.height = textArea.offsetHeight + 'px';
}

function syncScroll() {

    light.scrollTop = textArea.scrollTop;

    light.scrollLeft = textArea.scrollLeft;
}
let lastSavedWord = "";
function getLastWord() {

    const text = textArea.value.toUpperCase();

    //const words = text.match(/[A-Z_][A-Z0-9_]*$/);

    const words = text.match(/[A-Z_*][A-Z0-9_*]*$/);
    return words ? words[0] : "";
}
function saveLastWord() {

    const word = getLastWord();


    if (
        word &&
        word !== lastSavedWord
    ) {

        rememberWord(word);

        lastSavedWord = word;

        console.log(
            "Запомнил:",
            word
        );

    }

}
textArea.addEventListener('input', renderHighlight);

textArea.addEventListener('keydown', (event) => {

    const items =
        suggestions.querySelectorAll('.suggestion');


    if (!items.length) {
        return;
    }


    if (event.key === 'ArrowDown') {

        event.preventDefault();

        selectedIndex++;

        if (selectedIndex >= items.length) {
            selectedIndex = 0;
        }

        updateActiveSuggestion();
    }


    if (event.key === 'ArrowUp') {

        event.preventDefault();

        selectedIndex--;

        if (selectedIndex < 0) {
            selectedIndex = items.length - 1;
        }

        updateActiveSuggestion();
    }


    if (event.key === 'Escape') {

        suggestions.style.display = 'none';

    }


    if (event.key === 'Enter') {

        event.preventDefault();

        const word = items[selectedIndex].dataset.word;

        replaceCurrentWord(word);
    }

    if (
        event.key === " " ||
        event.key === "Enter" ||
        event.key === ";"
    ) {

        saveLastWord();

    }

});

textArea.addEventListener('scroll', syncScroll);

const resizeObserver = new ResizeObserver(() => {
    syncSize();
    syncScroll();
});

resizeObserver.observe(textArea);

syncSize();
renderHighlight();

const list = document.createElement("div");

const table = document.createElement("table");
const tbody = document.createElement("tbody");
const thead = document.createElement("thead");
table.append(thead);
table.append(tbody);
const textAsk = document.createElement("textarea");


let rows = {};
const queryButton = document.createElement("button");
queryButton.textContent = "Сделать запрос sql";
queryButton.addEventListener("click", async () => {
    const data = await sqlQuery(textArea.value);
    rows = data;
    await render(data[0]);
});

const form = document.createElement("button");
form.textContent = "Получить форму";
form.addEventListener("click", generateForm);


// Устанавливаем атрибуты для textarea (по желанию)
textArea.rows = 10; // Количество строк
textArea.cols = 30; // Количество колонок
textArea.placeholder = "Введите ваш SQL-запрос здесь...";



const sendButton = document.createElement("button");
sendButton.textContent = "Отправить форму";
sendButton.addEventListener("click", sendForm);

const showTable = document.createElement("button");
showTable.textContent = "Показать таблицу";
showTable.addEventListener("click", showTableFn);

//main.append(dropInput);
//main.append(drop);
//main.append(getAllTablesName);
//main.append(selectTable);
//main.append(list);
//main.append(getColumnsTypes);
app.append(light);
app.append(suggestions);
app.append(textArea);
main.append(app);
main.append(queryButton);
main.append(document.createElement("hr"));
main.append(table);
main.append(document.createElement("hr"));
//main.append(textAsk);
//main.append(form);
//main.append(sendButton);
//main.append(showTable);


function Textile(inputId, inputWidth, inputDensity) {
    this.id = inputId.valueAsNumber;
    this.width = inputWidth.valueAsNumber;
    this.density = inputDensity.valueAsNumber;
}



drop.addEventListener("click", async function (e) {
    const result = await fetch("https://abworktime.up.railway.app/app", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "drop",
            table: {
                name: dropInput.value,
            }
        }),
    }).then((response) => response.json());
    console.log(result);

    //const container = document.getElementById('table-container');
});

//getAllTablesName.addEventListener("click", async function (e) {
//    const result = await fetch("https://abworktime.up.railway.app/app", {
//        method: "POST",
//        headers: {
//            "Content-Type": "application/json;charset=utf-8",
//        },
//        body: JSON.stringify({
//            action: "getAllTableNames"
//        }),
//    }).then((response) => response.json());
//    console.log(result);
//    createSelectOptions(result);
//});
//function createSelectOptions(dataArray) {
//    console.log(dataArray);
//    dataArray.forEach(value => {
//        const option = document.createElement('option');
//        option.value = value;
//        option.textContent = value;
//        selectTable.appendChild(option);
//    });
//}



getAllTablesName.addEventListener("click", async function (e) {
    try {
        const response = await fetch("https://abworktime.up.railway.app/app", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({
                action: "getAllTableNames"
            }),
        });
        const result = await response.json();
        console.log(result);  // Inspect the result

        if (Array.isArray(result)) {  // Adjust based on actual response structure
            createSelectOptions(result, "value");
        } else {
            console.log("Expected an array but got:", result);
        }
    } catch (error) {
        console.log("Error fetching table names:", error);
    }
});

function createSelectOptions(array_Of_Object, field = "value") {
    selectTable.innerHTML = '';
    array_Of_Object.forEach(object => {
        const option = document.createElement('option');
        option.value = object[field];
        option.textContent = object[field];
        selectTable.appendChild(option);
    });
}

selectTable.addEventListener("change", async () => {
    const data = await sqlQuery("select * from " + selectTable.value);
    const wrap = document.createElement("div");
    wrap.classList.add("form");
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    const thead = document.createElement("thead");
    table.id = selectTable.value;
    table.append(thead);
    table.append(tbody);
    const render = (data) => {
        if (!data || data.length === 0) return;

        const keys = Object.keys(data[0]);

        const headHtml = `
        <tr>
            ${keys.map(key => `<th>${key}</th>`).join("")}
        </tr>
    `;

        const bodyHtml = data.map(row => {

            return `
            <tr>
                ${keys.map(key => `<td>${row[key]}</td>`).join("")}
            </tr>
        `;

        }).join("");

        thead.innerHTML = headHtml;
        tbody.innerHTML = bodyHtml;

    };
    render(data[0]);
    

    for (const metaData of data[1]) {

        console.log(decodeMetadata(metaData));
    }
    wrap.append(createInsertForm(data[1], table));
    wrap.append(table);
    list.append(wrap);
})

async function getSelectedValue() {
    const result = await fetch("https://abworktime.up.railway.app/app", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "getColumnsAndTypesForTable",
            table: {
                name: selectTable.value,
            }
        }),
    }).then((response) => response.json());
    console.log(result);
    return await result;
}


async function showTableFn() {
    const result = await fetch("https://abworktime.up.railway.app/app", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "select",
            table: {
                name: selectTable.value,
            }
        }),
    }).then((response) => response.json());
    console.log(result);

    const container = document.getElementById('table-container');
    container.innerHTML = '';

    //if (true) {
    if (result.rows) {
        const array = [
            {
                textile_density: 75,
                textile_id
                    :
                    1,
                textile_number
                    :
                    1,
                textile_width
                    :
                    56,
                warp_name
                    :
                    null,
                warp_quantity
                    :
                    456,
            },
            {

                textile_density
                    :
                    68,
                textile_id
                    :
                    2,
                textile_number
                    :
                    2,
                textile_width
                    :
                    42,
                warp_name
                    :
                    null,
                warp_quantity
                    :
                    312,
            }
        ];
        //const table = createTable(array);
        const table = createTable(result.rows);
        table.addEventListener("click", queryTarget)
        container.appendChild(table);
    } else {
        container.textContent = 'U';
    }
}
async function queryTarget(event) {
    console.dir(event.target);

    const td = event.target.closest("td");
    if (!td) return;
    //console.dir(event.target.closest("td").cellIndex);


    const tr = td.closest("tr");
    //if (!event.target.closest("tr")) return;
    if (!tr) return;
    //console.dir(event.target.closest("tr").rowIndex);



    td.contentEditable = "true";

    // Поставить фокус внутрь td
    td.focus();

    // Опционально: чтобы при потере фокуса выключать редактирование
    const table = document.querySelector('table');
    const headers = Array.from(table.querySelectorAll('thead th'));
    td.addEventListener('blur', async () => {
        td.contentEditable = "false";
        td.textContent = td.textContent.trim();
        if (td.textContent.length > 0) {
            console.log(td.textContent);
            console.log(tr.sectionRowIndex);
            console.log(selectTable.value);
            console.log(headers[td.cellIndex].textContent);
            try {
                const result = await sqlWhere({
                    tableName: selectTable.value,
                    rowId: tr.sectionRowIndex,
                    columnName: headers[td.cellIndex].textContent,
                    whereColum: "textile_id",
                    value: td.textContent
                });
                console.log('Ответ сервера:', result);
            } catch (error) {
                console.error('Ошибка при отправке данных:', error);
            }
        }
    }, { once: true });
}
async function sqlWhere({ tableName, rowId, columnName, whereColum, value }) {
    const result = await fetch("https://abworktime.up.railway.app/app", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "setWhere",
            table: {
                name: tableName,
                id: rowId,
                colum_name: columnName,
                whereColum: whereColum,
                value: value
            }
        }),
    }).then((response) => response.json());
    console.log(result);
    return await result;
}

// Пример использования функции
//const sql = "SELECT * FROM your_table"; // Замените на ваш SQL-запрос
//sqlQuery(sql);

function getTableNameFromMetadata(metadata) {
    if (
        !metadata._buf ||
        !metadata._buf.data ||
        typeof metadata._orgTableStart !== 'number' ||
        typeof metadata._orgTableLength !== 'number'
    ) {
        throw new Error('Недостаточно данных для извлечения имени таблицы');
    }

    const data = metadata._buf.data;
    const start = metadata._orgTableStart;
    const length = metadata._orgTableLength;

    // Получаем срез массива байт
    const slice = data.slice(start, start + length);

    // Используем TextDecoder для преобразования байтов в строку
    const decoder = new TextDecoder('utf-8');
    const tableName = decoder.decode(new Uint8Array(slice));

    return tableName;
}
function decodeSlice(data, start, length, encoding = 'utf-8') {
    const slice = data.slice(start, start + length);
    const decoder = new TextDecoder(encoding);
    return decoder.decode(new Uint8Array(slice));
}
function decodeMetadata(metadata) {
    const data = metadata._buf.data;

    return {
        catalog: decodeSlice(data, metadata._catalogStart, metadata._catalogLength, metadata._clientEncoding),
        schema: decodeSlice(data, metadata._schemaStart, metadata._schemaLength, metadata._clientEncoding),
        table: decodeSlice(data, metadata._tableStart, metadata._tableLength, metadata._clientEncoding),
        orgTable: decodeSlice(data, metadata._orgTableStart, metadata._orgTableLength, metadata._clientEncoding),
        orgName: decodeSlice(data, metadata._orgNameStart, metadata._orgNameLength, metadata._clientEncoding),
    };
}

async function sqlQuery(sqlQueryString, values = []) {
    try {
        const response = await fetch("https://abworktime.up.railway.app/app", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({
                action: "sql",
                query: sqlQueryString,
                values: values
            }),
        });

        // Получаем тело ответа как текст (чтобы не падало на некорректном JSON)
        const responseText = await response.text();

        if (!response.ok) {
            // Если статус не 200-299, выводим полный текст ошибки
            throw new Error(`Ошибка сервера (${response.status}): ${responseText}`);
        }

        // Попытка распарсить JSON, если он корректный
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (jsonError) {
            console.warn("Не удалось распарсить JSON, выводим текст ответа:");
            console.log(responseText);
            throw new Error(`Некорректный JSON от сервера: ${responseText}`);
        }
        console.log({ response });
        console.log({ result });
        return result;
    } catch (error) {
        // Полный вывод ошибки
        console.error('Ошибка при выполнении запроса:', error);
    }
}

async function render(data) {

    if (!data || data.length === 0) return;

    const keys = Object.keys(data[0]);

    const headHtml = `
        <tr>
            ${keys.map(key => `<th>${key}</th>`).join("")}
        </tr>
    `;

    const bodyHtml = data.map(row => {

        return `
            <tr>
                ${keys.map(key => `<td>${row[key]}</td>`).join("")}
            </tr>
        `;

    }).join("");

    thead.innerHTML = headHtml;
    tbody.innerHTML = bodyHtml;
}


function createInsertForm(fields, table) {

    const form = document.createElement("form");

    const MYSQL_TYPES = {
        1: "number", // tinyint
        2: "number", // smallint
        3: "number", // int
        8: "number", // bigint
        4: "number", // float
        5: "number", // double
        10: "date", // date
        12: "datetime-local", // datetime
        7: "datetime-local", // timestamp
        253: "text", // varchar
        254: "text", // char
        252: "textarea" // text/blob
    };

    for (const field of fields) {
        // skip primary / auto fields
        const isAuto =
            (field.flags & 512) !== 0 || // AUTO_INCREMENT
            field.name === "id";

        if (isAuto) continue;

        const wrapper = document.createElement("div");

        const label = document.createElement("label");
        label.textContent = field.name;

        let inputType = MYSQL_TYPES[field.columnType] || "text";
        let input;

        if (inputType === "textarea") {

            input = document.createElement("textarea");

        } else {

            input = document.createElement("input");
            input.type = inputType;
        }

        input.name = field.name;
        input.id = field.name;

        wrapper.append(label);
        wrapper.append(document.createElement("br"));
        wrapper.append(input);

        form.append(wrapper);
    }

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Сохранить";

    form.append(document.createElement("br"));
    form.append(submit);

    form.addEventListener("submit", async e => {

        e.preventDefault();

        const data = {};

        for (const field of fields) {

            const el = form.elements.namedItem(field.name);
            console.log(el);

            if (!el) continue;

            let value = el.value;

            if (
                field.columnType === 1 ||
                field.columnType === 2 ||
                field.columnType === 3 ||
                field.columnType === 4 ||
                field.columnType === 5 ||
                field.columnType === 8
            ) {
                value = value === "" ? null : Number(value);
            }

            data[field.name] = value;
        }

        //const response = await fetch(url, {
        //    method: "POST",
        //    headers: {
        //        "Content-Type": "application/json"
        //    },
        //    body: JSON.stringify(data)
        //});
        console.log({ data });
        const cols = Object.keys(data);
        const vals = Object.values(data);
        const sql = `
        INSERT INTO ${table.id}
        (${cols.join(",")})
        VALUES
        (${cols.map(() => "?").join(",")})
    `;


        const result = await sqlQuery(sql, vals);

        console.log(result);
    });




    return form;
}


async function fetchTableStructure() {
    const response = await fetch("https://abworktime.up.railway.app/app", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "getColumnsAndTypesForTable",
            table: {
                name: selectTable.value,
            }
        }),
    })
    return await response.json();
}

function createInputElement(column) {


    const input = document.createElement('input');
    input.name = column.Field;
    input.placeholder = column.Field;


    column
    console.log(column);
    //console.log(column.Extra);
    let inputElement;
    //console.log(`Field: ${column.Field} Type: ${column.Type}`);

    switch (true) {
        case /^(auto_increment)$/.test(column.Extra):
            console.log("disabled", true);
            input.setAttribute("disabled", true);
            input.placeholder = "auto";
            break;
    }
    switch (true) {
        // Числовые типы
        case /^(tinyint|smallint|mediumint|int|bigint)$/.test(column.Type):
            //inputElement = `<input type="number" name="${column.Field}" placeholder="${column.Field}">`;
            input.type = "number";
            break;

        case /^(tinyint|smallint|mediumint|int|bigint)(\s+(unsigned))?$/.test(column.Type):
            //inputElement = `<input type="number" name="${column.Field}" placeholder="${column.Field}">`;
            input.type = "number";
            input.min = 0;
            break;

        // Числа с плавающей запятой
        case /^(float|double|decimal)$/.test(column.Type):
            inputElement = `<input type="number" step="0.01" name="${column.Field}" placeholder="${column.Field}">`;
            break;

        // Строковые типы
        case /^(varchar|char|text|tinytext|mediumtext|longtext)(\(\d+\))?$/.test(column.Type):
            //inputElement = `<input type="text" name="${column.Field}" placeholder="${column.Field}">`;
            input.type = 'text'; // Используем тип text для строк
            input.maxLength = 300; // Устанавливаем максимальную длину

            break;

        // Дата и время
        case /^(date)$/.test(column.Type):
            inputElement = `<input type="date" name="${column.Field}">`;
            break;
        case /^(datetime|timestamp)$/.test(column.Type):
            inputElement = `<input type="datetime-local" name="${column.Field}">`;
            break;

        // Логический тип
        case /^(boolean|bit)$/.test(column.Type):
            inputElement = `<input type="checkbox" name="${column.Field}">`;
            break;

        // Перечисление и набор
        case /^(enum|set)$/.test(column.Type):
            const options = column.Type.replace(/^(enum|set)\('([^']*)'\)$/, '\$2').split(',');
            inputElement = `<select name="${column.Field}">${options.map(option => `<option value="${option.trim()}">${option.trim()}</option>`).join('')}</select>`;
            break;

        // Неизвестный тип - текстовое поле по умолчанию
        default:
            inputElement = `<input type="text" name="${column.Field}" placeholder="${column.Field}">`;
    }
    return input;
}
const array = [];
async function generateForm() {
    const columns = await getSelectedValue();
    const formContainer = document.getElementById('form-container');
    columns.forEach(column => {
        const inputElement = createInputElement(column);
        formContainer.append(inputElement);
        array.push(inputElement);
    });
}
async function sendForm() {
    const arrayInput = array.filter(input => input.value.length > 0);
    const fields = arrayInput.map(input => input.name);
    const values = arrayInput.map(input => input.value);

    const response = await fetch("https://abworktime.up.railway.app/app", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "insertGenerate",
            table: {
                name: selectTable.value,
                fields: fields,
                values: values
            }
        }),
    }).then((response) => response.json());
    console.log(response);
    showTableFn();
    return await response;
}

// Генерация формы для таблицы 'your_table_name'
//generateForm('your_table_name');










(async () => {
    async function showTableFn() {
        const result = await fetch("https://abworktime.up.railway.app/app", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({
                action: "select",
                table: {
                    name: "looms",
                }
            }),
        }).then((response) => response.json());
        console.log(result);

        const container = document.getElementById('table-container');
        container.innerHTML = '';

        if (result.rows) {
            const table = createTable(result.rows);
            container.appendChild(table);
        } else {
            container.textContent = 'U';
        }
    }
    //showTableFn()
})();



const columns = [
    { name: 'thread_id', type: 'int' },
    { name: 'thread_name', type: 'varchar(300)' },
    { name: 'thread_density', type: 'smallint unsigned' },
    { name: 'thread_length', type: 'smallint unsigned' }
];

//const formContainer = document.getElementById('formContainer');

columns.forEach(column => {
    // Создаем элемент input
    const input = document.createElement('input');
    input.name = column.name;
    input.placeholder = column.name;

    // Определяем тип поля ввода в зависимости от типа данных
    switch (column.type) {
        case 'int':
        case 'smallint unsigned':
            input.type = 'number'; // Используем тип number для целых чисел
            input.min = 0; // Устанавливаем минимальное значение для unsigned
            break;
        case 'varchar(300)':
            input.type = 'text'; // Используем тип text для строк
            input.maxLength = 300; // Устанавливаем максимальную длину
            break;
        default:
            input.type = 'text'; // По умолчанию используем text
    }

    // Добавляем элемент input в контейнер формы
    //formContainer.appendChild(input);
    //formContainer.appendChild(document.createElement('br')); // Добавляем перенос строки
});