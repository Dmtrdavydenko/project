document.body.addEventListener("click", edit)
async function edit(event) {
    const button = event.target.closest("div");
    if (!button) return;
    console.log(button.textContent);
}
const selectColumName = document.createElement("select");
//selectColumName.addEventListener('change', showTableFn);
//document.body.querySelector("nav").append(selectColumName);







async function getTableName() {
    try {
        const response = await fetch("https://worktime.up.railway.app/textile", {
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
        // Make sure the result is an array
        if (Array.isArray(result)) {  // Adjust based on actual response structure
            createSelectOptions(result);
        } else {
            console.log("Expected an array but got:", result);
        }
    } catch (error) {
        console.log("Error fetching table names:", error);
    }

}
function createSelectOptions(dataArray) {
    selectTableName.innerHTML = '';
    dataArray.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectTableName.appendChild(option);
    });
}




//const buttonsPerBlock = 9;
//const rightBlocks = ['rightBottom', 'rightThird', 'rightSecond', 'rightTop'];
//const leftBlocks = ['leftTop', 'leftSecond', 'leftThird', 'leftBottom'];
//const totalBlocks = rightBlocks.length + leftBlocks.length; // 8

//// Функция создания кнопок из массива номеров с учётом reverse
//function createButtonsInBlockFromArray(containerId, numbersArray, reverse = false) {
//    const container = document.getElementById(containerId);
//    container.innerHTML = '';
//    const arr = reverse ? [...numbersArray].reverse() : numbersArray;
//    arr.forEach(object => {
//        const btn = document.createElement('button');
//        btn.textContent = object.textile_number;
//        container.appendChild(btn);
//    });
//}

//// Предположим, что allNumbers — это массив из базы, например:
//async function loadAndRenderButtons() {
//    // Получаем все номера из базы (пример)
//    const response = await fetch('https://worktime.up.railway.app/textile', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json;charset=utf-8' },
//        //body: JSON.stringify({ action: 'getAllNumbers' }) // пример запроса
//        body: JSON.stringify({
//            action: "sql", // Измените на нужное действие, если необходимо
//            query: "select textile_number from textile", // Отправляем SQL-запрос
//        }),
//    });
//    const allNumbers = await response.json(); // допустим, это массив чисел

//    // Проверим, что у нас достаточно номеров
//    if (!Array.isArray(allNumbers) || allNumbers.length < buttonsPerBlock * totalBlocks + 12) {
//        console.error('Недостаточно номеров в базе');
//        return;
//    }

//    // Распределяем номера по блокам
//    // Берём первые 72 номера для 8 блоков по 9 кнопок
//    const blocksNumbersArray = allNumbers.slice(0, buttonsPerBlock * totalBlocks);

//    // Последние 12 номеров для футера
//    const footerNumbers = allNumbers.slice(buttonsPerBlock * totalBlocks, buttonsPerBlock * totalBlocks + 12);

//    // Формируем объект с массивами для каждого блока
//    const blocksNumbers = {};

//    // Правые блоки (4 блока)
//    for (let i = 0; i < rightBlocks.length; i++) {
//        const start = i * buttonsPerBlock;
//        blocksNumbers[rightBlocks[i]] = blocksNumbersArray.slice(start, start + buttonsPerBlock);
//    }

//    // Левые блоки (4 блока)
//    for (let i = 0; i < leftBlocks.length; i++) {
//        const start = (rightBlocks.length + i) * buttonsPerBlock;
//        blocksNumbers[leftBlocks[i]] = blocksNumbersArray.slice(start, start + buttonsPerBlock);
//    }

//    blocksNumbers['footerBlock'] = footerNumbers;

//    // Создаём кнопки с учётом reverse, как в вашем оригинальном коде
//    let blockIndex = 1;

//    // Правая колонка (снизу вверх)
//    for (let i = 0; i < rightBlocks.length; i++, blockIndex++) {
//        const blockId = rightBlocks[i];
//        let reverse = (blockIndex % 2 === 1);
//        if (blockIndex === totalBlocks) reverse = true;
//        createButtonsInBlockFromArray(blockId, blocksNumbers[blockId], reverse);
//    }

//    // Левая колонка (сверху вниз)
//    for (let i = 0; i < leftBlocks.length; i++, blockIndex++) {
//        const blockId = leftBlocks[i];
//        let reverse = (blockIndex % 2 === 1);
//        if (blockIndex === totalBlocks) reverse = true;
//        createButtonsInBlockFromArray(blockId, blocksNumbers[blockId], reverse);
//    }

//    // Футер (развёрнутый)
//    createButtonsInBlockFromArray('footerBlock', blocksNumbers['footerBlock'], true);
//}

// Запускаем загрузку и рендер
//loadAndRenderButtons();













const buttonsPerBlock = 9;
const rightBlocks = ['rightBottom', 'rightThird', 'rightSecond', 'rightTop'];
const leftBlocks = ['leftTop', 'leftSecond', 'leftThird', 'leftBottom'];
const totalBlocks = rightBlocks.length + leftBlocks.length; // 8

/**
 * Создаёт кнопки в контейнере из массива объектов с учётом реверса
 * @param {string} containerId - ID контейнера для кнопок
 * @param {Array} numbersArray - Массив объектов с полем textile_number
 * @param {boolean} reverse - Нужно ли реверсировать порядок кнопок
 */
function createButtonsInBlockFromArray(field,containerId, numbersArray, reverse = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Копируем массив и, если нужно, переворачиваем порядок
    const arr = reverse ? [...numbersArray].reverse() : numbersArray;

    arr.forEach(item => {
        const btn = document.createElement('button');
        btn.addEventListener("click",toggle);
        btn.textContent = item[field];
        container.appendChild(btn);
    });
}
function toggle() {
    this.classList.toggle('active');
    const localDateTime = getLocalDateTimeForMySQL();
    toggle.sum += 1;
    console.log(localDateTime);
    console.log(toggle.sum);
}
function getLocalDateTimeForMySQL() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Месяцы с 0
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Загружает номера из базы, распределяет по блокам и создаёт кнопки
 */
async function loadAndRenderButtons(field = "textile_number") {
    try {
        const response = await fetch('https://worktime.up.railway.app/textile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({
                action: "sql",
                query: "select " + field + " from textile",
            }),
        });

        const allNumbers = await response.json();

        const requiredCount = buttonsPerBlock * totalBlocks + 12;
        if (!Array.isArray(allNumbers) || allNumbers.length < requiredCount) {
            console.error(`Недостаточно номеров в базе. Требуется минимум ${requiredCount}.`);
            return;
        }

        // Разбиваем массив на части для блоков
        const blocksNumbersArray = allNumbers.slice(0, buttonsPerBlock * totalBlocks);
        const footerNumbers = allNumbers.slice(buttonsPerBlock * totalBlocks, requiredCount);

        // Формируем объект с массивами для каждого блока
        const blocksNumbers = {};

        // Правые блоки
        rightBlocks.forEach((blockId, i) => {
            const start = i * buttonsPerBlock;
            blocksNumbers[blockId] = blocksNumbersArray.slice(start, start + buttonsPerBlock);
        });

        // Левые блоки
        leftBlocks.forEach((blockId, i) => {
            const start = (rightBlocks.length + i) * buttonsPerBlock;
            blocksNumbers[blockId] = blocksNumbersArray.slice(start, start + buttonsPerBlock);
        });

        blocksNumbers['footerBlock'] = footerNumbers;

        // Создаём кнопки с учётом реверса
        let blockIndex = 1;

        // Правая колонка (снизу вверх)
        rightBlocks.forEach(blockId => {
            const reverse = (blockIndex % 2 === 1) || (blockIndex === totalBlocks);
            createButtonsInBlockFromArray(field,blockId, blocksNumbers[blockId], reverse);
            blockIndex++;
        });

        // Левая колонка (сверху вниз)
        leftBlocks.forEach(blockId => {
            const reverse = (blockIndex % 2 === 1) || (blockIndex === totalBlocks);
            createButtonsInBlockFromArray(field,blockId, blocksNumbers[blockId], reverse);
            blockIndex++;
        });

        // Футер (развёрнутый)
        createButtonsInBlockFromArray(field,'footerBlock', blocksNumbers['footerBlock'], true);

    } catch (error) {
        console.error('Ошибка загрузки номеров:', error);
    }
}

// Запускаем загрузку и рендер кнопок
loadAndRenderButtons();

async function getSelectedValue() {
    const result = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "select",
            //action: "getColumnsAndTypesForTable",
            table: {
                name: "textile",
            }
        }),
    }).then((response) => response.json());
    console.log(result);
    return await result;
    //return await [{ "Field": "textile_id", "Type": "smallint unsigned", "Null": "NO", "Key": "PRI", "Default": null, "Extra": "auto_increment" }, { "Field": "textile_width", "Type": "tinyint unsigned", "Null": "YES", "Key": "", "Default": null, "Extra": "" }, { "Field": "textile_density", "Type": "tinyint unsigned", "Null": "YES", "Key": "", "Default": null, "Extra": "" }, { "Field": "warp_quantity", "Type": "smallint unsigned", "Null": "YES", "Key": "", "Default": null, "Extra": "" }, { "Field": "warp_name", "Type": "varchar(100)", "Null": "YES", "Key": "", "Default": null, "Extra": "" }, { "Field": "textile_number", "Type": "tinyint unsigned", "Null": "YES", "Key": "", "Default": null, "Extra": "" }]
}


function createA(item) {
    const a = document.createElement("button");
    //a.href = "/api/";         // задаём адрес ссылки
    //a.href += item     // задаём адрес ссылки
    a.textContent = item;  // задаём текст ссылки
    return a;
}

const nav = document.body.querySelector("nav");
nav.addEventListener("click", select)
async function select(event) {
    const nav = event.target.closest("nav");
    if (!nav) return;
    console.log(event.target.textContent);
    loadAndRenderButtons(event.target.textContent);
}



(async () => {
    //const field = (await getSelectedValue()).map(item => item.Field);
    const field = (await getSelectedValue()).Field;
    console.log(field);
    field.forEach(item => nav.append(createA(item)));
})();

