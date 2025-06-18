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

const query = document.createElement("button");
query.textContent = "Сделать запрос sql";
query.addEventListener("click", () => {
    sqlQuery(textArea.value); // Передаем текст из textarea в функцию sqlQuery
});

const form = document.createElement("button");
form.textContent = "Получить колонки";
form.addEventListener("click", generateForm);


// Устанавливаем атрибуты для textarea (по желанию)
textArea.rows = 10; // Количество строк
textArea.cols = 30; // Количество колонок
textArea.placeholder = "Введите ваш SQL-запрос здесь...";



main.append(dropInput);
main.append(drop);
main.append(getAllTablesName);
main.append(selectElement);
main.append(getColumnsTypes);
main.append(textArea);
main.append(query);
main.append(form);


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


async function getAllTablesEvent() {
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

    if (result.rows) {
        const table = createTable(result.rows);
        container.appendChild(table);
    } else {
        container.textContent = 'U';
    }
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
    let inputElement;
    switch (column.Type) {
        case 'int':
        case 'tinyint':
        case 'smallint':
        case 'mediumint':
        case 'bigint':
            inputElement = `<input type="number" name="${column.Field}" placeholder="${column.Field}">`;
            break;
        case 'varchar':
        case 'char':
        case 'text':
            inputElement = `<input type="text" name="${column.Field}" placeholder="${column.Field}">`;
            break;
        case 'date':
            inputElement = `<input type="date" name="${column.Field}">`;
            break;
        case 'datetime':
        case 'timestamp':
            inputElement = `<input type="datetime-local" name="${column.Field}">`;
            break;
        case 'float':
        case 'double':
            inputElement = `<input type="number" step="0.01" name="${column.Field}" placeholder="${column.Field}">`;
            break;
        // Добавьте дополнительные типы по мере необходимости
        default:
            inputElement = `<input type="text" name="${column.Field}" placeholder="${column.Field}">`;
    }
    return inputElement;
}
async function generateForm() {
    const columns = await getSelectedValue();
    const formContainer = document.getElementById('form-container');

    columns.forEach(column => {
        const inputElement = createInputElement(column);
        formContainer.innerHTML += `<div>${inputElement}</div>`;
    });
}

// Генерация формы для таблицы 'your_table_name'
//generateForm('your_table_name');










//(async () => {


//})();
