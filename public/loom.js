document.body.addEventListener("click", edit)
async function edit(event) {
    const button = event.target.closest("button");
    if (!button) return;
    console.log(button.textContent);
}
const selectColumName = document.createElement("select");
//selectColumName.addEventListener('change', showTableFn);
document.body.querySelector("nav").append(selectColumName);







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




const buttonsPerBlock = 9;
const rightBlocks = ['rightBottom', 'rightThird', 'rightSecond', 'rightTop'];
const leftBlocks = ['leftTop', 'leftSecond', 'leftThird', 'leftBottom'];
const totalBlocks = rightBlocks.length + leftBlocks.length; // 8

// Функция создания кнопок из массива номеров с учётом reverse
function createButtonsInBlockFromArray(containerId, numbersArray, reverse = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    const arr = reverse ? [...numbersArray].reverse() : numbersArray;
    arr.forEach(object => {
        const btn = document.createElement('button');
        btn.textContent = object.textile_number;
        container.appendChild(btn);
    });
}

// Предположим, что allNumbers — это массив из базы, например:
async function loadAndRenderButtons() {
    // Получаем все номера из базы (пример)
    const response = await fetch('https://worktime.up.railway.app/textile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        //body: JSON.stringify({ action: 'getAllNumbers' }) // пример запроса
                    body: JSON.stringify({
                        action: "sql", // Измените на нужное действие, если необходимо
                        query: "select textile_number from textile", // Отправляем SQL-запрос
                    }),
    });
    const allNumbers = await response.json(); // допустим, это массив чисел

    // Проверим, что у нас достаточно номеров
    if (!Array.isArray(allNumbers) || allNumbers.length < buttonsPerBlock * totalBlocks + 12) {
        console.error('Недостаточно номеров в базе');
        return;
    }

    // Распределяем номера по блокам
    // Берём первые 72 номера для 8 блоков по 9 кнопок
    const blocksNumbersArray = allNumbers.slice(0, buttonsPerBlock * totalBlocks);

    // Последние 12 номеров для футера
    const footerNumbers = allNumbers.slice(buttonsPerBlock * totalBlocks, buttonsPerBlock * totalBlocks + 12);

    // Формируем объект с массивами для каждого блока
    const blocksNumbers = {};

    // Правые блоки (4 блока)
    for (let i = 0; i < rightBlocks.length; i++) {
        const start = i * buttonsPerBlock;
        blocksNumbers[rightBlocks[i]] = blocksNumbersArray.slice(start, start + buttonsPerBlock);
    }

    // Левые блоки (4 блока)
    for (let i = 0; i < leftBlocks.length; i++) {
        const start = (rightBlocks.length + i) * buttonsPerBlock;
        blocksNumbers[leftBlocks[i]] = blocksNumbersArray.slice(start, start + buttonsPerBlock);
    }

    blocksNumbers['footerBlock'] = footerNumbers;

    // Создаём кнопки с учётом reverse, как в вашем оригинальном коде
    let blockIndex = 1;

    // Правая колонка (снизу вверх)
    for (let i = 0; i < rightBlocks.length; i++, blockIndex++) {
        const blockId = rightBlocks[i];
        let reverse = (blockIndex % 2 === 1);
        if (blockIndex === totalBlocks) reverse = true;
        createButtonsInBlockFromArray(blockId, blocksNumbers[blockId], reverse);
    }

    // Левая колонка (сверху вниз)
    for (let i = 0; i < leftBlocks.length; i++, blockIndex++) {
        const blockId = leftBlocks[i];
        let reverse = (blockIndex % 2 === 1);
        if (blockIndex === totalBlocks) reverse = true;
        createButtonsInBlockFromArray(blockId, blocksNumbers[blockId], reverse);
    }

    // Футер (развёрнутый)
    createButtonsInBlockFromArray('footerBlock', blocksNumbers['footerBlock'], true);
}

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
function createButtonsInBlockFromArray(containerId, numbersArray, reverse = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Копируем массив и, если нужно, переворачиваем порядок
    const arr = reverse ? [...numbersArray].reverse() : numbersArray;

    arr.forEach(item => {
        const btn = document.createElement('button');
        btn.textContent = item.textile_number;
        container.appendChild(btn);
    });
}

/**
 * Загружает номера из базы, распределяет по блокам и создаёт кнопки
 */
async function loadAndRenderButtons() {
    try {
        const response = await fetch('https://worktime.up.railway.app/textile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({
                action: "sql",
                query: "select textile_number from textile",
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
            createButtonsInBlockFromArray(blockId, blocksNumbers[blockId], reverse);
            blockIndex++;
        });

        // Левая колонка (сверху вниз)
        leftBlocks.forEach(blockId => {
            const reverse = (blockIndex % 2 === 1) || (blockIndex === totalBlocks);
            createButtonsInBlockFromArray(blockId, blocksNumbers[blockId], reverse);
            blockIndex++;
        });

        // Футер (развёрнутый)
        createButtonsInBlockFromArray('footerBlock', blocksNumbers['footerBlock'], true);

    } catch (error) {
        console.error('Ошибка загрузки номеров:', error);
    }
}

// Запускаем загрузку и рендер кнопок
loadAndRenderButtons();

