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
function createButtonsInBlockFromArray(field, containerId, numbersArray, reverse = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Копируем массив и, если нужно, переворачиваем порядок
    const arr = reverse ? [...numbersArray].reverse() : numbersArray;
    console.log(arr);
    console.log(field);
    arr.forEach(item => {
        const btn = document.createElement('button');
        btn.addEventListener("click", toggle);
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
    inputSS.value = this.textContent;
    update.loom_number = this.textContent;
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
async function loadAndRenderButtons(field = "loom_number") {
    try {
        const response = await fetch('https://worktime.up.railway.app/textile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({
                action: "sql",
                //query: "SELECT " + field + " " +
                //    "FROM textile t " +
                //    "JOIN sleeve_width_density swd ON t.wd_id = swd.sleeve_width_density_id " +
                //    "JOIN sleeve_width sw ON swd.sleeve_width_id = sw.sleeve_width_id " +
                //    "JOIN sleeve_density d ON swd.sleeve_density_id = d.sleeve_density_id;",
                query: "SELECT " + field + " " +
                    "FROM looms " +
                    "LEFT JOIN sleeve_width_density swd ON looms.type_id = swd.sleeve_width_density_id " +
                    "LEFT JOIN sleeve_width sw ON swd.sleeve_width_id = sw.sleeve_width_id " +
                    "LEFT JOIN sleeve_density sd ON swd.sleeve_density_id = sd.sleeve_density_id;",
            }),
        });
        console.log(response);
        const [allNumbers] = await response.json();
        console.log(allNumbers);

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
            createButtonsInBlockFromArray(field, blockId, blocksNumbers[blockId], reverse);
            blockIndex++;
        });

        // Левая колонка (сверху вниз)
        leftBlocks.forEach(blockId => {
            const reverse = (blockIndex % 2 === 1) || (blockIndex === totalBlocks);
            createButtonsInBlockFromArray(field, blockId, blocksNumbers[blockId], reverse);
            blockIndex++;
        });

        // Футер (развёрнутый)
        createButtonsInBlockFromArray(field, 'footerBlock', blocksNumbers['footerBlock'], true);

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
            table: {
                name: "looms",
            }
        }),
    }).then((response) => response.json());
    console.log(result);
    return await result;
    //return await [{ "Field": "textile_id", "Type": "smallint unsigned", "Null": "NO", "Key": "PRI", "Default": null, "Extra": "auto_increment" }, { "Field": "textile_width", "Type": "tinyint unsigned", "Null": "YES", "Key": "", "Default": null, "Extra": "" }, { "Field": "textile_density", "Type": "tinyint unsigned", "Null": "YES", "Key": "", "Default": null, "Extra": "" }, { "Field": "warp_quantity", "Type": "smallint unsigned", "Null": "YES", "Key": "", "Default": null, "Extra": "" }, { "Field": "warp_name", "Type": "varchar(100)", "Null": "YES", "Key": "", "Default": null, "Extra": "" }, { "Field": "textile_number", "Type": "tinyint unsigned", "Null": "YES", "Key": "", "Default": null, "Extra": "" }]
}
async function getSelectedValueT() {
    const result = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "select",
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


const inputSS = document.createElement('input');
inputSS.type = "number";
const update = {};



async function sendUpdateTextileId(update) {
    try {
        const response = await fetch('https://worktime.up.railway.app/textile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({
                action: "sql",
                query: `UPDATE looms set type_id = ${update.type_id} where loom_number = ${update.loom_number}`
            }),
        });
    } catch (error) {

    }
}
(async () => {
    //console.log((await getSelectedValueT()));

    const field = ["type_id", "density","sleeve_width"];
    //const field = (await getSelectedValue()).F.map(item => {
    //    const parts = item.split('.');
    //    return parts[parts.length - 1];
    //});;
    //console.log(field);
    field.forEach(item => nav.append(createA(item)));
    const div = document.createElement('div');
    div.classList.add("custom-select");
    {
        const input = document.createElement('input');
        input.classList.add("select-input");
        //input.type = "text";
        input.type = "number";
        input.placeholder = "Search and select an item...";
        input.readOnly = true;


        const ul = document.createElement('ul');
        ul.classList.add("select-options");
        //ul.addEventListener('change', showSelect);
        ul.name = "sleeve_width_density";
        //ul.appendChild(svoid());
        (await slect("sleeve_width_density")).rows.forEach(obj => {
            const li = document.createElement('li');
            const sleeveWidthDensityInfo = new SleeveWidthDensityInfo(obj);
            li.value = sleeveWidthDensityInfo.id;
            li.textContent = sleeveWidthDensityInfo.sleeve_width_id + "/" + sleeveWidthDensityInfo.sleeve_density_id;
            ul.appendChild(li);
        });
        div.append(input, ul);
    }
    const buttonSend = document.createElement('button');
    buttonSend.textContent = "send";
    buttonSend.addEventListener("click", async () => {
        console.log(update);
        const logme = await sendUpdateTextileId(update);
        console.log(logme);

    });
    document.body.append(inputSS);
    document.body.append(div);
    document.body.append(buttonSend);






    const selectContainer = document.querySelector('.custom-select');
    const selectInput = document.querySelector('.select-input');
    const optionsList = document.querySelector('.select-options');
    const options = Array.from(optionsList.children);

    // Toggle dropdown on input click
    selectInput.addEventListener('click', () => {
        selectInput.type = "number";
        selectContainer.classList.toggle('active');
        if (selectContainer.classList.contains('active')) {
            selectInput.removeAttribute('readonly'); // Allow typing when open
            selectInput.focus();
        } else {
            selectInput.setAttribute('readonly', ''); // Lock when closed
        }
    });

    // Filter options as user types
    selectInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        options.forEach(option => {
            const text = option.textContent.toLowerCase();


            const normalizedText = text.replace(/\//g, '');
            //option.style.display = text.includes(query) ? 'block' : 'none';
            option.style.display = normalizedText.startsWith(query) ? 'block' : 'none';
        });
    });

    // Select an option
    options.forEach(option => {
        option.addEventListener('click', () => {
            selectInput.type = "text";
            update.type_id = option.value;
            selectInput.value = option.textContent;
            selectContainer.classList.remove('active');
            selectInput.setAttribute('readonly', ''); // Lock after selection
        });
    });

    // Close dropdown if clicked outside
    document.addEventListener('click', (e) => {
        if (!selectContainer.contains(e.target)) {
            selectContainer.classList.remove('active');
            selectInput.setAttribute('readonly', '');
        }
    });
})();



async function slect(table) {
    return await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "getTable",
            table: {
                name: table,
            }
        }),
    }).then((response) => response.json());
}
class SleeveWidthDensityInfo {
    constructor(table) {
        this.table = table;
    }
    get id() { return this.table.sleeve_width_density_id; }
    get sleeve_width_id() { return this.table.sleeve_width; }
    get sleeve_density_id() { return this.table.density; }
}