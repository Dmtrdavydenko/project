//const buttonsPerBlock = 9;

//const rightBlocks = ['rightBottom', 'rightThird', 'rightSecond', 'rightTop'];
//const leftBlocks = ['leftTop', 'leftSecond', 'leftThird', 'leftBottom'];

//let currentNumber = 1;
//let blockIndex = 1; // Счётчик блоков по порядку обхода (начинается с 1)
//const totalBlocks = rightBlocks.length + leftBlocks.length; // 8

function createButtonsInBlock(containerId, count, startNum, reverse = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const btn = document.createElement('button');
        const num = reverse ? startNum + count - 1 - i : startNum + i;
        btn.textContent = num;
        container.appendChild(btn);
    }
}

// Правая колонка (снизу вверх)
//for (let i = 0; i < rightBlocks.length; i++, blockIndex++) {
//    const blockId = rightBlocks[i];
//    // Разворот для нечетных блоков
//    let reverse = (blockIndex % 2 === 1);
//    // Если это последний блок (8-й), разворачиваем в любом случае
//    if (blockIndex === totalBlocks) {
//        reverse = true;
//    }
//    createButtonsInBlock(blockId, buttonsPerBlock, currentNumber, reverse);
//    currentNumber += buttonsPerBlock;
//}

// Левая колонка (сверху вниз)
//for (let i = 0; i < leftBlocks.length; i++, blockIndex++) {
//    const blockId = leftBlocks[i];
//    let reverse = (blockIndex % 2 === 1);
//    if (blockIndex === totalBlocks) {
//        reverse = true;
//    }
//    createButtonsInBlock(blockId, buttonsPerBlock, currentNumber, reverse);
//    currentNumber += buttonsPerBlock;
//}

// Общий блок с 12 кнопками под колонками, нумерация 1..12
function createFooterButtons(containerId, count) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for (let i = 98; i > 98 - count; i--) {
        const btn = document.createElement('button');
        btn.textContent = i;
        container.appendChild(btn);
    }
}
//createFooterButtons('footerBlock', 12);





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
loadAndRenderButtons();

