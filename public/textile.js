console.log("textile");
console.log(document.location.href);

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
    data.forEach((row, i) => {
        let tr = document.createElement('tr');
        tr.id = i + 1;
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




//let tbody = document.querySelector('tbody');
//let firstRow = tbody.rows[0]; // первая строка

//for (let i = 0; i < firstRow.cells.length; i++) {
//    console.log(firstRow.cells[i].textContent);
//}

//const thElements = document.querySelectorAll('thead th');
//thElements.forEach((th,i) => {
//    const num = Number(firstRow.cells[i].textContent);
//    th.dataset.type = !isNaN(num) ? 'number' : 'string';
//});


async function getTypeTableHeder() {
    const container = document.getElementById('table-container');
    const tbody = container.querySelector('tbody');
    const thElements = container.querySelectorAll('thead th');
    const firstRow = tbody.rows[0]; // первая строка
    thElements.forEach((th, i) => {
        const num = Number(firstRow.cells[i].textContent);
        th.dataset.type = !isNaN(num) ? 'number' : 'string';
    });
    container.onclick = function (e) {
        if (e.target.tagName != 'TH') return;

        let th = e.target;
        // если ячейка TH, тогда сортировать
        // cellIndex - это номер ячейки th:
        //   0 для первого столбца
        //   1 для второго и т.д.
        sortGrid(th.cellIndex, th.dataset.type);
    };
}
function sortGrid(colNum, type) {
    const container = document.getElementById('table-container');
    let tbody = container.querySelector('tbody');
    let rowsArray = Array.from(tbody.rows);
    // compare(a, b) сравнивает две строки, нужен для сортировки
    let compare;
    switch (type) {
        case 'number':
            compare = function (rowA, rowB) {
                return rowA.cells[colNum].innerHTML - rowB.cells[colNum].innerHTML;
            };
            break;
        case 'string':
            compare = function (rowA, rowB) {
                return rowA.cells[colNum].innerHTML > rowB.cells[colNum].innerHTML ? 1 : -1;
            };
            break;
    }
    // сортировка
    rowsArray.sort(compare);
    tbody.append(...rowsArray);
}




const dropInput = document.createElement("input");
dropInput.type = "text";


const drop = document.createElement("button");
drop.textContent = "Delite table";

const getTablesNameButton = document.createElement("button");
getTablesNameButton.textContent = "Получить имена всех таблиц";
getTablesNameButton.addEventListener("click", getTableName);


const label = document.createElement('label');
label.setAttribute('for', 'name');
label.textContent = 'Выберите таблицу';

const selectTableName = document.createElement("select");
selectTableName.name = "name";
selectTableName.id = "name";
selectTableName.autocomplete = 'off';
selectTableName.addEventListener('change', showTableFn);




const getColumnsTypes = document.createElement("button");
getColumnsTypes.textContent = "Получить колонки";
getColumnsTypes.addEventListener("click", getTypeKey);
//getColumnsTypes.addEventListener("click", getSelectedValue);


const textArea = document.createElement("textarea");
const textAsk = document.createElement("textarea");

const queryButton = document.createElement("button");
queryButton.textContent = "Сделать запрос sql";
queryButton.addEventListener("click", () => {
    sqlQuery(textArea.value); // Передаем текст из textarea в функцию sqlQuery
});

const form = document.createElement("button");
form.textContent = "Создать форму";
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
//main.append(getAllTablesNameButton);
main.append(label);
main.append(selectTableName);
//main.append(getColumnsTypes);
//main.append(textArea);
//main.append(queryButton);
//main.append(textAsk);
//main.append(form);
main.append(sendButton);
//main.append(showTable);


function Textile(inputId, inputWidth, inputDensity) {
    this.id = inputId.valueAsNumber;
    this.width = inputWidth.valueAsNumber;
    this.density = inputDensity.valueAsNumber;
}



drop.addEventListener("click", async function (e) {
    const result = await fetch("https://worktime.up.railway.app/textile", {
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
//    const result = await fetch("https://worktime.up.railway.app/textile", {
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
//        selectTableName.appendChild(option);
//    });
//}


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
        // Make sure the result is an array
        if (Array.isArray(result)) {  // Adjust based on actual response structure
            createSelectOptions(result);
        } else {
            console.log("Expected an array but got:", result);
        }
        return result;
    } catch (error) {
        console.log("Error fetching table names:", error);
    }

}
function createSelectOptions(dataArray) {
    selectTableName.innerHTML = '';
    dataArray.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.value;
        option.dataset.isParent = item.isParent;
        selectTableName.appendChild(option);
    });
}



async function getSelected() {
    const result = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "getColumnsJoin",
            table: {
                name: selectTableName.value,
            }
        }),
    }).then((response) => response.json());
    console.log(result);
    return await result;
}
async function getSelectedValue() {
    const result = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "getColumnsAndTypesForTable",
            table: {
                name: selectTableName.value,
            }
        }),
    }).then((response) => response.json());
    console.log({ colons: result });
    return await result;
}
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
//inputs.forEach(input => {
//    data[input.name] = input.value;
//});

async function showTableFn(query) {
    const result = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "select",
            table: {
                name: selectTableName.value,
            }
            //,
            //wd: {
            //    id: query.id
            //}
        }),
    }).then((response) => response.json());
    console.log(result);
    //console.log(event.target.value);

    const container = document.getElementById('table-container');
    container.innerHTML = '';
    if (result.rows) {
        const table = createTable(result.rows);
        table.addEventListener("click", queryTarget);
        table.addEventListener("click", selectTable);
        //table.removeEventListener()
        container.appendChild(table);
        await getTypeTableHeder();
        //await generateForm();
        await getTypeKey()
    } else {
        container.textContent = 'U';
    }
}
async function loadTableFn(query) {
    const result = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "select",
            table: {
                name: selectTableName.value,
            }
        }),
    }).then((response) => response.json());
    console.log(result);
    //console.log(event.target.value);

    const container = document.getElementById('table-container');
    container.innerHTML = '';

    //if (true) {
    if (result.rows) {
        const table = createTable(result.rows);
        //selectTableName.value === "manual" && table.addEventListener("click", selectTable);
        if (selectTableName.value === "manual")
            table.addEventListener("click", selectTable);
        else
            table.addEventListener("click", queryTarget);
        container.appendChild(table);
        await getTypeTableHeder();
        //if (selectTableName.value === "manual") {
            //await generateForm();
        //}




    } else {
        container.textContent = 'U';
    }
}
async function selectTable(event) {
    console.dir(event.target);
    const td = event.target.closest("td");
    const ts = event.target.closest("select");
    console.log(ts);
    if (ts) return;
    if (!td) return;
    //console.dir(event.target.closest("td").cellIndex);


    const tr = td.closest("tr");
    //if (!event.target.closest("tr")) return;
    if (!tr) return;
    //console.dir(event.target.closest("tr").rowIndex);



    //td.contentEditable = "true";

    // Поставить фокус внутрь td
    //td.focus();

    const table = document.querySelector('table');
    const headers = Array.from(table.querySelectorAll('thead th'));
    const headersText = headers.map(th => th.textContent);
    const found = headersText.find(text => text.includes('id'));
    const index = headersText.findIndex(text => text.includes('id'));
    console.log(headersText);



    // Получить все ячейки в строке (tr)
    const cells = Array.from(tr.children);  // td или th в строке

    // Создать объект с данными строки: заголовок -> значение
    const rowData = {};
    headersText.forEach((header, i) => {
        if (cells[i]) {
            rowData[header] = cells[i].textContent.trim();
        }
    });

    console.info('Данные строки:', rowData);


    //const rowValues = cells.map(cell => cell.textContent.trim());
    //console.log('Массив значений строки:', rowValues);


    const tdIndex = cells.indexOf(td);
    //if (tdIndex === -1) return;

    //// Получить заголовки из thead
    ////const headers = Array.from(table.querySelectorAll('thead th'));

    //if (!correspondingHeader) {
    //    console.log('Заголовок не найден');
    //    return;
    //}

    //console.log('Кликнутая td:', td.textContent.trim());
    //console.log('Индекс столбца:', tdIndex);
    //console.log('Соответствующий thead (заголовок):', correspondingHeader);
    //console.log({ target: correspondingHeader, value: rowData[correspondingHeader] });
    const correspondingHeader = headers[tdIndex]?.textContent.trim();
    const update = {
        table: selectTableName.value,
        target: "color_id",
        value: 0
    };


    let saveTd = td.innerHTML;
    let savechange = 0;
    td.innerHTML = ''
    const colors = new Color("color");
    colors.select.addEventListener('change', async function () {
        const selectedValue = this.value;
        const selectedText = this.options[this.selectedIndex].text;
        savechange = selectedValue;
        update.value = selectedValue;
    });
    colors.select.addEventListener('click', async function () {
        const selectedValue = this.value;
        const selectedText = this.options[this.selectedIndex].text;
        update.value = selectedValue;
    });
    colors.select.addEventListener('blur', async function () {
        const selectedValue = this.value;
        const selectedText = this.options[this.selectedIndex].text;
        update.value = selectedValue;
        const result = generateUpdateSQL(rowData, update);
        await sqlQuery(result.sql, result.values);
        await loadTableFn();
    });
    td.append(colors.select);
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



    //td.contentEditable = "true";

    // Поставить фокус внутрь td
    //td.focus();

    const table = document.querySelector('table');
    const headers = Array.from(table.querySelectorAll('thead th'));
    const headersText = headers.map(th => th.textContent);
    const found = headersText.find(text => text.includes('id'));
    const index = headersText.findIndex(text => text.includes('id'));
    console.log(headersText);



    //// Получить все ячейки в строке (tr)
    //const cells = Array.from(tr.children);  // td или th в строке

    //// Создать объект с данными строки: заголовок -> значение
    //const rowData = {};
    //headersText.forEach((header, i) => {
    //    if (cells[i]) {
    //        rowData[header] = cells[i].textContent.trim();
    //    }
    //});

    //console.log('Данные строки:', rowData);


    //const rowValues = cells.map(cell => cell.textContent.trim());
    //console.log('Массив значений строки:', rowValues);


    //const tdIndex = cells.indexOf(td);
    //if (tdIndex === -1) return;

    //// Получить заголовки из thead
    ////const headers = Array.from(table.querySelectorAll('thead th'));
    //const correspondingHeader = headers[tdIndex]?.textContent.trim();

    //if (!correspondingHeader) {
    //    console.log('Заголовок не найден');
    //    return;
    //}

    //console.log('Кликнутая td:', td.textContent.trim());
    //console.log('Индекс столбца:', tdIndex);
    //console.log('Соответствующий thead (заголовок):', correspondingHeader);
    //console.log({ target: correspondingHeader, value: rowData[correspondingHeader] });



    //td.addEventListener('blur', async () => {
    //    td.contentEditable = "false";
    //    td.textContent = td.textContent.trim();
    //    if (td.textContent.length > 0) {
    //        console.log(td.textContent);
    //        console.log(tr.sectionRowIndex);
    //        console.log(selectTableName.value);
    //        console.log(headers[td.cellIndex].textContent);
    //        console.log("rowId: " + tr.cells[0].textContent);
    //        console.log({
    //            tableName: selectTableName.value,
    //            rowId: tr.cells[index].textContent,
    //            columnName: headers[td.cellIndex].textContent,
    //            whereColum: found,
    //            value: td.textContent
    //        });
    //        try {
    //            const result = await sqlWhere({
    //                tableName: selectTableName.value,
    //                rowId: tr.cells[index].textContent,
    //                columnName: headers[td.cellIndex].textContent,
    //                whereColum: found,
    //                value: td.textContent
    //            });
    //            console.log('Ответ сервера:', result);
    //        } catch (error) {
    //            console.error('Ошибка при отправке данных:', error);
    //        }
    //    }
    //}, { once: true });
}
async function sqlWhere({ tableName, rowId, columnName, whereColum, value }) {
    const result = await fetch("https://worktime.up.railway.app/textile", {
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

//async function sqlQuery(sqlQueryString, values = null) {
//    try {
//        const response = await fetch("https://worktime.up.railway.app/textile", {
//            method: "POST",
//            headers: {
//                "Content-Type": "application/json;charset=utf-8",
//            },
//            body: JSON.stringify({
//                action: "sql", // Измените на нужное действие, если необходимо
//                query: sqlQueryString, // Отправляем SQL-запрос
//                values: values
//            }),
//        });

//        // Проверка на успешный ответ
//        if (!response.ok) {
//            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
//        }

//        const result = await response.json(); // Получаем JSON-ответ
//        console.log(result); // Выводим результат в консоль
//        //textAsk.value = response;
//        textAsk.value = JSON.stringify(result);
//    } catch (error) {
//        console.error('Ошибка при выполнении запроса:', error); // Обработка ошибок
//    }
//}







async function fetchTableStructure() {
    const response = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "getColumnsAndTypesForTable",
            table: {
                name: selectTableName.value,
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
let array = [];
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


async function switchYarn(select) {
    let o = {
        value: this.value,
        target: event.target,
        text: this.selectedOptions[0].textContent,
        name: this.name,
    }
    console.log(o);
    console.log([+this.value, event.target, this.selectedOptions[0].textContent, this.name]);
    // Очищаем текущее содержимое select
    select.innerHTML = '';

    // Получаем выбранный тип пряжи
    let threads;
    if (+this.value === 2) {
        threads = (await slect("weft_quantity")).rows;
        select.name = "weft_quantity";
    } else if (+this.value === 1) {
        threads = (await slect("warp_quantity")).rows;
        select.name = "warp_quantity";
    }

    // Заполняем select новыми опциями
    threads.forEach(thread => {
        const quantityInfo = new QuantityInfo(thread, +this.value === 2 ? 'weft_id' : 'warp_id', +this.value === 2 ? 'weft_quantity' : 'warp_quantity');
        //const quantityInfo = new QuantityInfo(thread, o.text === 'weft' ? 'welf_id' : 'warp_id', o.text === 'weft' ? 'weft_quantity' : 'warp_quantity');
        const option = document.createElement('option');
        option.value = quantityInfo.id;
        option.textContent = quantityInfo.quantity;
        select.appendChild(option);
    });
    console.log(threads);
}



async function sendData(url, dataToSend) {
    try {
        const response = await fetch(url, {
            method: 'POST', // Метод отправки
            headers: {
                'Content-Type': 'application/json' // Указываем, что отправляем JSON
            },
            body: JSON.stringify(dataToSend) // Преобразуем объект в строку JSON
        });
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const responseData = await response.json(); // Получаем ответ от сервера
        console.log('client success:', responseData);
        return responseData;
    } catch (error) {
        console.error('Error:', error);
    }
}
async function find(url, dataToSend) {
    try {
        const response = await fetch(url, {
            method: 'POST', // Метод отправки
            headers: {
                'Content-Type': 'application/json' // Указываем, что отправляем JSON
            },
            body: JSON.stringify(dataToSend) // Преобразуем объект в строку JSON
        });
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const responseData = await response.json(); // Получаем ответ от сервера
        console.log('client success:', responseData);
        return responseData;
    } catch (error) {
        console.error('Error:', error);
    }
}

const serverUrl = "https://worktime.up.railway.app/textile";
async function getTypeKey() {
    const form = document.getElementById('form');
    if (selectTableName.options[selectTableName.selectedIndex].dataset.isParent === "true") {
        form.innerHTML = '';
        const columns = await getSelectedValue();
        columns.forEach(column => {
            const inputElement = createInputElement(column);
            form.append(inputElement);
            array.push(inputElement);
        });
        console.log(array);
        console.log(selectTableName.options[selectTableName.selectedIndex].dataset.isParent);
        return columns;
    } else {
        console.log(selectTableName.options[selectTableName.selectedIndex].dataset.isParent);
        //form.textContent = 'не удалось получить';
        form.innerHTML = '';
    }
}
class ThreadInfo {
    constructor(thread) {
        this.thread = thread;
    }

    get density() { return this.thread.thread_density; }
    get color() { return this.thread.color; }
    get id() { return this.thread.thread_id; }
    get length() { return `длина: ${this.thread.thread_length}`; }
}
class YarnInfo {
    constructor(yarn) {
        this.yarn = yarn;
    }
    get id() { return this.yarn.yarn_id; }
    get name() { return this.yarn.yarn_name; }
}
class Color {
    constructor(name) {
        this.select = document.createElement('select');
        this.select.name = name;
        this.fet(name);
    }
    async fet(name) {
        (await slect(name)).rows.forEach(color => {
            const option = document.createElement('option');
            option.value = color.color_id;
            option.textContent = color.color;
            this.select.appendChild(option);
        });
    }
}
class AdditiveInfo {
    constructor(yarn) {
        this.yarn = yarn;
    }
    get id() { return this.yarn.id; }
    get name() { return this.yarn.additive_name; }

}
class SleeveWidthDensityInfo {
    constructor(table) {
        this.table = table;
    }
    get id() { return this.table.sleeve_width_density_id; }
    get sleeve_width_id() { return this.table.sleeve_width; }
    get sleeve_density_id() { return this.table.density; }
}
class WarpQuantityInfo {
    constructor(table) {
        this.table = table;
    }
    get id() { return this.table.warp_id; }
    get warp_quantity() { return this.table.warp_quantity; }
}
class WelfQuantityInfo {
    constructor(table) {
        this.table = table;
    }
    get id() { return this.table.welf_id; }
    get warp_quantity() { return this.table.welf_quantity; }
}
class QuantityInfo {
    constructor(table, idKey, quantityKey) {
        this.table = table;
        this.idKey = idKey;
        this.quantityKey = quantityKey;
    }
    get id() { return this.table[this.idKey]; }
    get quantity() { return this.table[this.quantityKey]; }
}
let manual = new Object();
async function showSelect(event) {
    console.log({
        value: this.value,
        target: event.target,
        //text: this.selectedOptions[0].textContent ?? this.textContent,
        text: this.selectedOptions ? this.selectedOptions[0].textContent : this.textContent,
    });
    const o = {
        [this.name]: +this.value,
        key: this.name,
    }
    manual[this.name] = +this.value;
    console.log(o);
    console.log(manual);
    //await showTableFn({ id: this.value });
}
async function generateForm() {
    const formContainer = document.getElementById('form-container');
    formContainer.innerHTML = '';
    const join = await getSelected();
    let decodedMetadata = join.map(meta => (decodeMetadata(meta)));
    //let data = {};
    console.log(decodedMetadata);

    const selectMap = [];
    {
        const select = document.createElement('input');
        //const select = document.createElement('select');
        select.addEventListener('change', showSelect);
        select.name = "type";
        select.type = "number";
        select.min = 1;

        console.log(select.valueAsNumber);
        formContainer.append(select);
        selectMap.push(select);
    }
    {
        const select = document.createElement('select');
        select.addEventListener('change', showSelect);
        select.name = "sleeve_width_density";
        (await slect("sleeve_width_density")).rows.forEach(obj => {
            const option = document.createElement('option');
            const sleeveWidthDensityInfo = new SleeveWidthDensityInfo(obj);
            option.value = sleeveWidthDensityInfo.id;
            option.textContent = sleeveWidthDensityInfo.sleeve_width_id + "/" + sleeveWidthDensityInfo.sleeve_density_id;
            select.appendChild(option);
        });
        formContainer.append(select);
        selectMap.push(select);
    }
    {
        const select = document.createElement('select');
        select.addEventListener('change', showSelect);
        select.addEventListener('change', function () {
            switchYarn.call(this, selectType);
        });
        select.name = "yarn_type";
        (await slect("yarn_type")).rows.forEach(thread => {
            const option = document.createElement('option');
            const yarnInfo = new YarnInfo(thread);
            option.value = yarnInfo.id;
            option.textContent = yarnInfo.name;
            select.appendChild(option);
        });
        formContainer.append(select);

        const selectType = document.createElement('select');
        selectType.addEventListener('change', showSelect);
        selectType.name = "warp_quantity";
        (await slect("warp_quantity")).rows.forEach(thread => {
            const option = document.createElement('option');
            const warpQuantityInfo = new WarpQuantityInfo(thread);
            option.value = warpQuantityInfo.id;
            option.textContent = warpQuantityInfo.warp_quantity;
            selectType.appendChild(option);
        });
        formContainer.append(selectType);
        selectMap.push(select);
        selectMap.push(selectType);

    }
    {
        const select = document.createElement('select');
        select.addEventListener('change', showSelect);
        select.name = "Thread_Parameters";
        (await slect("Thread_Parameters")).rows.forEach(thread => {
            const option = document.createElement('option');
            const threadInfo = new ThreadInfo(thread);
            option.value = threadInfo.id;
            option.textContent = threadInfo.density;
            select.appendChild(option);
        });
        formContainer.append(select);
        selectMap.push(select);

    }
    {
        const colors = new Color("color");
        colors.select.addEventListener('change', showSelect);
        formContainer.append(colors.select);
        selectMap.push(colors.select);
    }
    {
        const select = document.createElement('select');
        select.addEventListener('change', showSelect);
        select.name = "additive";
        (await slect("additive")).rows.forEach(color => {
            const option = document.createElement('option');
            const additiveInfo = new AdditiveInfo(color);
            option.value = additiveInfo.id;
            option.textContent = additiveInfo.name;
            select.appendChild(option);
        });
        formContainer.append(select);
        selectMap.push(select);

    }
    {
        const button = document.createElement('button');
        button.addEventListener('click', showButton);
        button.name = "send";
        button.textContent = "send";
        formContainer.append(button);
    }
    selectMap.forEach(select => {
        console.log(select.name, select.value, select.id)
    })

    const createKeyValue = ({ name, valueAsNumber, value }) => ({
        key: name,
        value: valueAsNumber ?? +value
    });

    async function showButton() {
        let v = selectMap.map(createKeyValue);
        let o = {};
        selectMap.forEach(function (item) {
            o[item.name] = item.valueAsNumber ?? +item.value;
        });
        console.log(o, v);
        //let resp = await sendData(serverUrl, v);
        manual.action = "processData";
        let result = await find(serverUrl, manual);
        console.log(result);

        console.log(manual);
        const container = document.getElementById('table-container');
        container.innerHTML = '';
        if (result.rows) {
            const table = createTable(result.rows);
            table.addEventListener("click", queryTarget);
            table.addEventListener("click", selectTable);
            container.appendChild(table);
            await getTypeTableHeder();
            //await generateForm();
            await getTypeKey()
        } else {
            container.textContent = 'U';
        }
    }
}


async function sqlQuery(sqlQueryString,values=null) {
    try {
        const response = await fetch("https://worktime.up.railway.app/textile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({
                action: "sql", // Измените на нужное действие, если необходимо
                query: sqlQueryString, // Отправляем SQL-запрос
                values:values
            }),
        });

        // Проверка на успешный ответ
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }

        return await response.json(); // Получаем JSON-ответ
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error); // Обработка ошибок
    }
}
async function sendForm() {
    const arrayInput = array.filter(input => input.value.length > 0);
    const fields = arrayInput.map(input => input.name);
    const values = arrayInput.map(input => input.value);
    let p = {
        name: selectTableName.value,
        fields: fields,
        values: values
    }
    console.log(p);

    const response = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "insertGenerate",
            table: {
                name: selectTableName.value,
                fields: fields,
                values: values
            }
        }),
    }).then((response) => response.json());
    console.log(response);
    await showTableFn();
    return await response;
}

// Генерация формы для таблицы 'your_table_name'
//generateForm('your_table_name');










(async () => {
    const tableName = await getTableName();
    console.log(tableName);
    await loadTableFn();
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






function generateUpdateSQL(data, update) {
    const { table, target, value } = update;

    // SET clause with placeholder
    const setClause = `${target} = ?`;

    // WHERE clause: all fields from data except target, with placeholders
    let whereKeys = Object.keys(data).filter(key => key !== target && key !== "quantity");
    const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');

    // Full SQL

    const sql = `
            UPDATE \`${table}\` m 
            JOIN sleeve_width_density swd       ON m.sleeve_w_d_id =         swd.sleeve_width_density_id
            JOIN sleeve_width         sw        ON swd.sleeve_width_id =     sw.sleeve_width_id
            JOIN sleeve_density       d         ON swd.sleeve_density_id =   d.sleeve_density_id

            JOIN Thread_Parameters    tp        ON m.thread_densiti_id =     tp.thread_id
            JOIN color                c         ON m.color_id =              c.color_id
            JOIN additive             a         ON m.additive_id =           a.id

            JOIN warp_quantity        waq       ON m.quantity_id =           waq.warp_id
            JOIN weft_quantity        weq       ON m.quantity_id =           weq.weft_id

            JOIN yarn_type            yt        ON m.yarn_id =               yt.yarn_id

            set m.${setClause}
            where ${whereClause};
            `

    //const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause};`;

    // Values array: first value for SET, then values for WHERE in order of whereKeys
    const values = [value, ...whereKeys.map(key => data[key])];

    return { sql, values };
}

// Пример использования с вашими объектами
const data = {
    additive_id: "2",
    color_id: "4",
    created_at: "2025-08-29T23:08:02.000Z",
    quantity: "14",
    sleeve_w_d_id: "12",
    thread_densiti_id: "2",
    type_id: "14",
    updated_at: "2025-09-02T22:13:53.000Z",
    yarn_id: "1"
};

const update = {
    target: "quantity",
    value: "14"
};

//const result = generateUpdateSQL(data, update);
//console.log(result.sql);
//console.log(result.values);
