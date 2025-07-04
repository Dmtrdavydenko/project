const buttonsPerBlock = 9;

const rightBlocks = ['rightBottom', 'rightThird', 'rightSecond', 'rightTop'];
const leftBlocks = ['leftTop', 'leftSecond', 'leftThird', 'leftBottom'];

let currentNumber = 1;
let blockIndex = 1; // Счётчик блоков по порядку обхода (начинается с 1)
const totalBlocks = rightBlocks.length + leftBlocks.length; // 8

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
for (let i = 0; i < rightBlocks.length; i++, blockIndex++) {
    const blockId = rightBlocks[i];
    // Разворот для нечетных блоков
    let reverse = (blockIndex % 2 === 1);
    // Если это последний блок (8-й), разворачиваем в любом случае
    if (blockIndex === totalBlocks) {
        reverse = true;
    }
    createButtonsInBlock(blockId, buttonsPerBlock, currentNumber, reverse);
    currentNumber += buttonsPerBlock;
}

// Левая колонка (сверху вниз)
for (let i = 0; i < leftBlocks.length; i++, blockIndex++) {
    const blockId = leftBlocks[i];
    let reverse = (blockIndex % 2 === 1);
    if (blockIndex === totalBlocks) {
        reverse = true;
    }
    createButtonsInBlock(blockId, buttonsPerBlock, currentNumber, reverse);
    currentNumber += buttonsPerBlock;
}

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
createFooterButtons('footerBlock', 12);





document.body.addEventListener("click", edit)
async function edit(event) {
    const button = event.target.closest("button");
    if (!button) return;
    console.log(button.textContent);
}
const selectColumName = document.createElement("select");
selectColumName.addEventListener('change', showTableFn);
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


