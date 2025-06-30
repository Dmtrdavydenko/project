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






const dropInput = document.createElement("input");
dropInput.type = "text";


const drop = document.createElement("button");
drop.textContent = "Delite table";

const getAllTablesName = document.createElement("button");
getAllTablesName.textContent = "Получить имена всех таблиц";


const selectElement = document.createElement("select");


const getColumnsTypes = document.createElement("button");
getColumnsTypes.textContent = "Получить колонки";
getColumnsTypes.addEventListener("click", getSelectedValue);

const textArea = document.createElement("textarea");
const textAsk = document.createElement("textarea");

const queryButton = document.createElement("button");
queryButton.textContent = "Сделать запрос sql";
queryButton.addEventListener("click", () => {
    sqlQuery(textArea.value); // Передаем текст из textarea в функцию sqlQuery
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

main.append(dropInput);
main.append(drop);
main.append(getAllTablesName);
main.append(selectElement);
main.append(getColumnsTypes);
main.append(textArea);
main.append(queryButton);
main.append(textAsk);
main.append(form);
main.append(sendButton);
main.append(showTable);


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
//        selectElement.appendChild(option);
//    });
//}



getAllTablesName.addEventListener("click", async function (e) {
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
});

function createSelectOptions(dataArray) {
    selectElement.innerHTML = '';
    dataArray.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
    });
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
                name: selectElement.value,
            }
        }),
    }).then((response) => response.json());
    console.log(result);
    return await result;
}


async function showTableFn() {
    const result = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "select",
            table: {
                name: selectElement.value,
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
    td.addEventListener('blur', async  () => {
        td.contentEditable = "false";
        td.textContent = td.textContent.trim();
        if (td.textContent.length > 0) {
            console.log(td.textContent);
            console.log(tr.sectionRowIndex);
            console.log(selectElement.value);
            console.log(headers[td.cellIndex].textContent);
            try {
                const result = await sqlWhere({
                    tableName: selectElement.value,
                    rowId: tr.sectionRowIndex,
                    columnName: headers[td.cellIndex].textContent,
                    whereColum:"textile_id",
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

async function sqlQuery(sqlQueryString) {
    try {
        const response = await fetch("https://worktime.up.railway.app/textile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({
                action: "sql", // Измените на нужное действие, если необходимо
                query: sqlQueryString, // Отправляем SQL-запрос
            }),
        });

        // Проверка на успешный ответ
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }

        const result = await response.json(); // Получаем JSON-ответ
        console.log(result); // Выводим результат в консоль
        //textAsk.value = response;
        textAsk.value = JSON.stringify(result);
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error); // Обработка ошибок
    }
}







async function fetchTableStructure() {
    const response = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "getColumnsAndTypesForTable",
            table: {
                name: selectElement.value,
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

    const response = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "insertGenerate",
            table: {
                name: selectElement.value,
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