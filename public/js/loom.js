async function request(action, params = {}) {
    const response = await fetch("https://worktime.up.railway.app/app", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: action, // Например, "getThreads", "getTasks"
            ...params
        }),
    });
    for (const [key, value] of response.headers.entries()) {
        console.log("\x1b[34m [" + key + "][" + value + "]");
    }
    const contentType = response.headers.get('content-type');
    console.log("\x1b[33m [" + contentType + "]");

    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    const text = await response.text();

    try {
        const data = JSON.parse(text);
        console.info("Load server sql", data);
        return data;
    } catch (error) {
        console.log("\x1b[33m [" + text + "]");
        console.dir(error);
        if (error.message.includes("is not valid JSON")) {
            throw new Error("is not valid JSON");
        }
        if (error.message === "Unexpected end of JSON input") {
            throw error;
        }
    }
}


document.body.addEventListener("click", edit)
async function edit(event) {
    const button = event.target.closest("button");
    if (!button) return;
    console.log(button.textContent);
}
const selectColumName = document.createElement("select");
//selectColumName.addEventListener('change', showTableFn);
//document.body.querySelector("nav").append(selectColumName);







async function getTableName() {
    try {
        const response = await fetch("https://worktime.up.railway.app/app", {
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

const state = [];
class LoomsRow {
    constructor(reference, loom) {
        this.reference = reference;
        this.loom = Number(loom);
    }
}
function handleClickBtn(e) {
    //const btn = e.currentTarget;
    //btn.classList.toggle('active');

    //const number = btn.textContent;
    //const existingIndex = state.findIndex(row => row.reference === btn);

    //if (btn.classList.contains('active')) {
    //    // добавляем
    //    state.push(new LoomsRow(btn, number));
    //} else {
    //    // удаляем
    //    if (existingIndex !== -1) state.splice(existingIndex, 1);
    //}

    //// обновляем input и объект update
    //inputSS.value = number;
    //update.loom_number = number;

    //// логика для даты и счетчика
    //const localDateTime = getLocalDateTimeForMySQL();
    //console.log(localDateTime);
    //console.log(state.length); // теперь это фактический счетчик активных кнопок
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
function getDataT() {
    return [
        {
            "cnt": 1,
            "loom": 1,
            "yarn_type": "warp",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "1150.0"
        },
        {
            "cnt": 1,
            "loom": 1,
            "yarn_type": "weft",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "39.5"
        },
        {
            "cnt": 1,
            "loom": 2,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 2,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 3,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "260.0"
        },
        {
            "cnt": 1,
            "loom": 3,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 4,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 4,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 5,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "312.0"
        },
        {
            "cnt": 1,
            "loom": 5,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "36.5"
        },
        {
            "cnt": 1,
            "loom": 6,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 6,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 7,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "288.0"
        },
        {
            "cnt": 1,
            "loom": 7,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 8,
            "yarn_type": "warp",
            "tape_density": "220",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "1154.0"
        },
        {
            "cnt": 1,
            "loom": 8,
            "yarn_type": "weft",
            "tape_density": "220",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "47.5"
        },
        {
            "cnt": 1,
            "loom": 9,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 9,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 10,
            "yarn_type": "warp",
            "tape_density": "112",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "1150.0"
        },
        {
            "cnt": 1,
            "loom": 10,
            "yarn_type": "weft",
            "tape_density": "112",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "36.0"
        },
        {
            "cnt": 1,
            "loom": 11,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "378.0"
        },
        {
            "cnt": 1,
            "loom": 11,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "38.5"
        },
        {
            "cnt": 1,
            "loom": 12,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "422.0"
        },
        {
            "cnt": 1,
            "loom": 12,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "19.0"
        },
        {
            "cnt": 1,
            "loom": 12,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "19.0"
        },
        {
            "cnt": 1,
            "loom": 13,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 13,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 14,
            "yarn_type": "warp",
            "tape_density": "170",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "1374.0"
        },
        {
            "cnt": 1,
            "loom": 14,
            "yarn_type": "weft",
            "tape_density": "220",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "38.5"
        },
        {
            "cnt": 1,
            "loom": 15,
            "yarn_type": "warp",
            "tape_density": "105",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "338.0"
        },
        {
            "cnt": 1,
            "loom": 15,
            "yarn_type": "weft",
            "tape_density": "105",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 16,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "404.0"
        },
        {
            "cnt": 1,
            "loom": 16,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 17,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 17,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 18,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 18,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 19,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 19,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 20,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "414.0"
        },
        {
            "cnt": 1,
            "loom": 20,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "37.0"
        },
        {
            "cnt": 1,
            "loom": 21,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 21,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 22,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 22,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 23,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 23,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 24,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "260.0"
        },
        {
            "cnt": 1,
            "loom": 24,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 25,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "288.0"
        },
        {
            "cnt": 1,
            "loom": 25,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 26,
            "yarn_type": "warp",
            "tape_density": "105",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "338.0"
        },
        {
            "cnt": 1,
            "loom": 26,
            "yarn_type": "weft",
            "tape_density": "105",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 27,
            "yarn_type": "warp",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "1150.0"
        },
        {
            "cnt": 1,
            "loom": 27,
            "yarn_type": "weft",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "39.5"
        },
        {
            "cnt": 1,
            "loom": 28,
            "yarn_type": "warp",
            "tape_density": "78",
            "tape_color": "зелёная",
            "tape_additive": "нет",
            "quantity": "290.0"
        },
        {
            "cnt": 1,
            "loom": 28,
            "yarn_type": "warp",
            "tape_density": "78",
            "tape_color": "прозрачная",
            "tape_additive": "нет",
            "quantity": "72.0"
        },
        {
            "cnt": 1,
            "loom": 28,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "прозрачная",
            "tape_additive": "нет",
            "quantity": "39.0"
        },
        {
            "cnt": 1,
            "loom": 29,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 29,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 30,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 30,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 31,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 31,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 32,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "288.0"
        },
        {
            "cnt": 1,
            "loom": 32,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "35.3"
        },
        {
            "cnt": 1,
            "loom": 33,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 33,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 34,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "312.0"
        },
        {
            "cnt": 1,
            "loom": 34,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "36.5"
        },
        {
            "cnt": 1,
            "loom": 35,
            "yarn_type": "warp",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "1150.0"
        },
        {
            "cnt": 1,
            "loom": 35,
            "yarn_type": "weft",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "39.5"
        },
        {
            "cnt": 1,
            "loom": 36,
            "yarn_type": "warp",
            "tape_density": "220",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "1154.0"
        },
        {
            "cnt": 1,
            "loom": 36,
            "yarn_type": "weft",
            "tape_density": "220",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "47.5"
        },
        {
            "cnt": 1,
            "loom": 37,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "260.0"
        },
        {
            "cnt": 1,
            "loom": 37,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 38,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 38,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 39,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 39,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 40,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "288.0"
        },
        {
            "cnt": 1,
            "loom": 40,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 41,
            "yarn_type": "warp",
            "tape_density": "170",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "1374.0"
        },
        {
            "cnt": 1,
            "loom": 41,
            "yarn_type": "weft",
            "tape_density": "220",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "38.5"
        },
        {
            "cnt": 1,
            "loom": 42,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "288.0"
        },
        {
            "cnt": 1,
            "loom": 42,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 43,
            "yarn_type": "warp",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "346.0"
        },
        {
            "cnt": 1,
            "loom": 43,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "36.0"
        },
        {
            "cnt": 1,
            "loom": 44,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 44,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 45,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 45,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 46,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 46,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 47,
            "yarn_type": "warp",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "1150.0"
        },
        {
            "cnt": 1,
            "loom": 47,
            "yarn_type": "weft",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "39.5"
        },
        {
            "cnt": 1,
            "loom": 48,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 48,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 49,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "288.0"
        },
        {
            "cnt": 1,
            "loom": 49,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 50,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "450.0"
        },
        {
            "cnt": 1,
            "loom": 50,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "38.0"
        },
        {
            "cnt": 1,
            "loom": 51,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "254.0"
        },
        {
            "cnt": 1,
            "loom": 51,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "35.2"
        },
        {
            "cnt": 1,
            "loom": 52,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 52,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 53,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "260.0"
        },
        {
            "cnt": 1,
            "loom": 53,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 54,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "360.0"
        },
        {
            "cnt": 1,
            "loom": 54,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 55,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "260.0"
        },
        {
            "cnt": 1,
            "loom": 55,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 56,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "312.0"
        },
        {
            "cnt": 1,
            "loom": 56,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "36.5"
        },
        {
            "cnt": 1,
            "loom": 57,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 57,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 58,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "312.0"
        },
        {
            "cnt": 1,
            "loom": 58,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "36.5"
        },
        {
            "cnt": 1,
            "loom": 59,
            "yarn_type": "warp",
            "tape_density": "112",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "1150.0"
        },
        {
            "cnt": 1,
            "loom": 59,
            "yarn_type": "weft",
            "tape_density": "112",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "36.0"
        },
        {
            "cnt": 1,
            "loom": 60,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "288.0"
        },
        {
            "cnt": 1,
            "loom": 60,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 61,
            "yarn_type": "warp",
            "tape_density": "78",
            "tape_color": "зелёная",
            "tape_additive": "нет",
            "quantity": "290.0"
        },
        {
            "cnt": 1,
            "loom": 61,
            "yarn_type": "warp",
            "tape_density": "78",
            "tape_color": "прозрачная",
            "tape_additive": "нет",
            "quantity": "72.0"
        },
        {
            "cnt": 1,
            "loom": 61,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "прозрачная",
            "tape_additive": "нет",
            "quantity": "39.0"
        },
        {
            "cnt": 1,
            "loom": 62,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "260.0"
        },
        {
            "cnt": 1,
            "loom": 62,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 63,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "312.0"
        },
        {
            "cnt": 1,
            "loom": 63,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "36.5"
        },
        {
            "cnt": 1,
            "loom": 64,
            "yarn_type": "warp",
            "tape_density": "110",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "392.0"
        },
        {
            "cnt": 1,
            "loom": 64,
            "yarn_type": "weft",
            "tape_density": "110",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 65,
            "yarn_type": "warp",
            "tape_density": "110",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "392.0"
        },
        {
            "cnt": 1,
            "loom": 65,
            "yarn_type": "weft",
            "tape_density": "110",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 66,
            "yarn_type": "warp",
            "tape_density": "110",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "392.0"
        },
        {
            "cnt": 1,
            "loom": 66,
            "yarn_type": "weft",
            "tape_density": "110",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 67,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 67,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 68,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 68,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 69,
            "yarn_type": "warp",
            "tape_density": "105",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "338.0"
        },
        {
            "cnt": 1,
            "loom": 69,
            "yarn_type": "weft",
            "tape_density": "105",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 70,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 70,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 71,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 71,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 72,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "282.0"
        },
        {
            "cnt": 1,
            "loom": 72,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "35.5"
        },
        {
            "cnt": 1,
            "loom": 87,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "432.0"
        },
        {
            "cnt": 1,
            "loom": 87,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "36.5"
        },
        {
            "cnt": 1,
            "loom": 88,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "348.0"
        },
        {
            "cnt": 1,
            "loom": 88,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "38.0"
        },
        {
            "cnt": 1,
            "loom": 89,
            "yarn_type": "warp",
            "tape_density": "105",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "280.0"
        },
        {
            "cnt": 1,
            "loom": 89,
            "yarn_type": "weft",
            "tape_density": "105",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "34.5"
        },
        {
            "cnt": 1,
            "loom": 90,
            "yarn_type": "warp",
            "tape_density": "105",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "280.0"
        },
        {
            "cnt": 1,
            "loom": 90,
            "yarn_type": "weft",
            "tape_density": "105",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "34.5"
        },
        {
            "cnt": 1,
            "loom": 91,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "428.0"
        },
        {
            "cnt": 1,
            "loom": 91,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 92,
            "yarn_type": "warp",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "1000.0"
        },
        {
            "cnt": 1,
            "loom": 92,
            "yarn_type": "weft",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "36.0"
        },
        {
            "cnt": 1,
            "loom": 93,
            "yarn_type": "warp",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "408.0"
        },
        {
            "cnt": 1,
            "loom": 93,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "39.0"
        },
        {
            "cnt": 1,
            "loom": 94,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "378.0"
        },
        {
            "cnt": 1,
            "loom": 94,
            "yarn_type": "weft",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "нет",
            "quantity": "38.0"
        },
        {
            "cnt": 1,
            "loom": 95,
            "yarn_type": "warp",
            "tape_density": "90",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "428.0"
        },
        {
            "cnt": 1,
            "loom": 95,
            "yarn_type": "weft",
            "tape_density": "78",
            "tape_color": "белая",
            "tape_additive": "светостаб",
            "quantity": "35.0"
        },
        {
            "cnt": 1,
            "loom": 96,
            "yarn_type": "warp",
            "tape_density": "64",
            "tape_color": "оранжевая",
            "tape_additive": "нет",
            "quantity": "710.0"
        },
        {
            "cnt": 1,
            "loom": 96,
            "yarn_type": "weft",
            "tape_density": "64",
            "tape_color": "оранжевая",
            "tape_additive": "нет",
            "quantity": "37.0"
        },
        {
            "cnt": 1,
            "loom": 97,
            "yarn_type": "warp",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "1000.0"
        },
        {
            "cnt": 1,
            "loom": 97,
            "yarn_type": "weft",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "36.0"
        },
        {
            "cnt": 1,
            "loom": 98,
            "yarn_type": "warp",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "1000.0"
        },
        {
            "cnt": 1,
            "loom": 98,
            "yarn_type": "weft",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "36.0"
        },
        {
            "cnt": 1,
            "loom": 99,
            "yarn_type": "warp",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "1000.0"
        },
        {
            "cnt": 1,
            "loom": 99,
            "yarn_type": "weft",
            "tape_density": "140",
            "tape_color": "цветная",
            "tape_additive": "нет",
            "quantity": "36.0"
        }
    ];
}


function createButtonsInBlockFromArray(field, containerId, numbersArray, reverse = false) {
    const container = document.getElementById(containerId);
    //container.innerHTML = '';
    // Копируем массив и, если нужно, переворачиваем порядок
    const arr = reverse ? [...numbersArray].reverse() : numbersArray;
    arr.forEach(item => {
        item.button.textContent = item[field];
        item.button.addEventListener("click", handleClickBtn);
        container.appendChild(item.button);
    });
}
let allNumbers
async function loadAndRenderButtons(field = "loom") {
    try {
        allNumbers = getDataT();

        for (const item of allNumbers) {
            for (const key in item) {
                if (!isNaN(item[key]) && item[key] !== '') {
                    item[key] = Number(item[key]);
                }
            }
        }

        // Функция для группировки по ключу
        const groupBy = (arr, keyFn) => {
            const map = new Map();
            arr.forEach(item => {
                const key = keyFn(item);
                if (!map.has(key)) map.set(key, []);
                map.get(key).push(item);
            });
            return map;
        };

        // Группировка warp/weft
        const warpMap = groupBy(allNumbers.filter(i => i.yarn_type === 'warp'), i => `${i.tape_density} ${i.tape_color} ${i.tape_additive}`);
        const weftMap = groupBy(allNumbers.filter(i => i.yarn_type === 'weft'), i => `${i.tape_density} ${i.tape_color} ${i.tape_additive}`);

        const createSection = (map, containerClass) => {
            const container = document.querySelector("." + containerClass) || document.createElement('div');
            //container.innerHTML = '';

            container.classList.add(containerClass);

            [...map.keys()].sort((a, b) => parseFloat(a.split(' ')[0]) - parseFloat(b.split(' ')[0]))
                .forEach(key => {
                    const items = map.get(key);
                    const btn = document.createElement('button');
                    btn.textContent = key;
                    btn.addEventListener('click', () => {
                        allNumbers.forEach(i => i.button?.classList.remove('active-loom'));
                        items.forEach(i => i.button.classList.add('active-loom'));
                    });
                    container.appendChild(btn);
                    // Привязываем кнопку ко всем элементам группы
                    items.forEach(i => i.button = btn);
                    items.forEach(i => i.buttonWarpWeft = btn);
                });
            document.body.appendChild(container);
        };

        document.querySelector(".container-grid-warp") || createSection(warpMap, 'container-grid-warp');
        document.querySelector(".container-grid-weft") || createSection(weftMap, 'container-grid-weft');

        // Группировка по loom
        const loomGroups = groupBy(allNumbers, i => i.loom);

        // Создаём уникальные кнопки для loom и присваиваем их элементам
        const allNumbersLoom = [];

        loomGroups.forEach((items, loom) => {
            const btn = document.createElement('button');
            btn.textContent = loom;

            // Привязываем кнопку ко всем объектам группы
            items.forEach(i => i.button = btn);

            // --- Добавляем обработчик для обратной логики ---
            btn.addEventListener('click', () => {
                // Сначала снимаем выделение со всех warp/weft кнопок через объекты
                allNumbers.forEach(i => i.buttonWarpWeft?.classList.remove('active-loom'));

                // Находим все warp/weft кнопки, используемые в этих loom
                const relatedWarpWeftButtons = new Set();
                items.forEach(item => {
                    if (item.buttonWarpWeft) {
                        relatedWarpWeftButtons.add(item.buttonWarpWeft);
                    }
                });

                // Добавляем класс выделения
                relatedWarpWeftButtons.forEach(b => b.classList.add('active-loom'));
            });

            allNumbersLoom.push(items[0]);
        });
        const requiredCount = buttonsPerBlock * totalBlocks + 13;
        if (allNumbersLoom.length < requiredCount) {
            console.error(`Недостаточно номеров в базе. Требуется минимум ${requiredCount}.`);
            return;
        }

        const blocksNumbersArray = allNumbersLoom.slice(0, buttonsPerBlock * totalBlocks);
        const footerNumbers = allNumbersLoom.slice(buttonsPerBlock * totalBlocks, requiredCount);

        const blocksNumbers = {};
        [...rightBlocks, ...leftBlocks].forEach((blockId, i) => {
            const start = i * buttonsPerBlock;
            blocksNumbers[blockId] = blocksNumbersArray.slice(start, start + buttonsPerBlock);
        });
        blocksNumbers['footerBlock'] = footerNumbers;

        // Создаём кнопки с реверсом
        let blockIndex = 1;
        rightBlocks.forEach(blockId => {
            createButtonsInBlockFromArray(field, blockId, blocksNumbers[blockId], blockIndex % 2 === 1 || blockIndex === totalBlocks);
            blockIndex++;
        });
        leftBlocks.forEach(blockId => {
            createButtonsInBlockFromArray(field, blockId, blocksNumbers[blockId], blockIndex % 2 === 1 || blockIndex === totalBlocks);
            blockIndex++;
        });
        createButtonsInBlockFromArray(field, 'footerBlock', blocksNumbers['footerBlock'], true);





        return allNumbersLoom;

    } catch (error) {
        console.error('Ошибка загрузки номеров:', error);
    }
}
let allNumbersLoom;
function update(field = "loom") {

    const requiredCount = buttonsPerBlock * totalBlocks + 13;
    if (allNumbersLoom.length < requiredCount) {
        console.error(`Недостаточно номеров в базе. Требуется минимум ${requiredCount}.`);
        return;
    }

    const blocksNumbersArray = allNumbersLoom.slice(0, buttonsPerBlock * totalBlocks);
    const footerNumbers = allNumbersLoom.slice(buttonsPerBlock * totalBlocks, requiredCount);

    const blocksNumbers = {};
    [...rightBlocks, ...leftBlocks].forEach((blockId, i) => {
        const start = i * buttonsPerBlock;
        blocksNumbers[blockId] = blocksNumbersArray.slice(start, start + buttonsPerBlock);
    });
    blocksNumbers['footerBlock'] = footerNumbers;

    // Создаём кнопки с реверсом
    let blockIndex = 1;
    rightBlocks.forEach(blockId => {
        createButtonsInBlockFromArray(field, blockId, blocksNumbers[blockId], blockIndex % 2 === 1 || blockIndex === totalBlocks);
        blockIndex++;
    });
    leftBlocks.forEach(blockId => {
        createButtonsInBlockFromArray(field, blockId, blocksNumbers[blockId], blockIndex % 2 === 1 || blockIndex === totalBlocks);
        blockIndex++;
    });
    createButtonsInBlockFromArray(field, 'footerBlock', blocksNumbers['footerBlock'], true);


}




async function getSelectedValue() {
    const result = await fetch("https://worktime.up.railway.app/app", {
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
    const result = await fetch("https://worktime.up.railway.app/app", {
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
nav.addEventListener("click", nv)
async function nv(event) {
    const nav = event.target.closest("nav");
    if (!nav) return;
    console.log(event.target.textContent);
    update(event.target.textContent);
}


const inputSS = document.createElement('input');
inputSS.type = "number";
//inputSS.classList.add("custom-select");


//const update = {};



async function sendUpdateTextileId(update) {
    try {
        const response = await fetch('https://worktime.up.railway.app/app', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            body: JSON.stringify({
                action: "sql",
                query: `UPDATE looms set type_id = ${update.type_id} where loom_number = ${update.loom_number}`
            }),
        });
    } catch (error) {

    }
};

(async () => {
    const dataTape = await request("getUseTape");
    const statWarpCountData = dataTape.filter(i => i.yarn_type === "warp").map(i => ({ label: i.density + " " + i.color + " " + i.additive, value: i.total_threads_width }));
    const statWeftCountData = dataTape.filter(i => i.yarn_type === "weft").map(i => ({ label: i.density + " " + i.color + " " + i.additive, value: i.total_threads_width }));
    const statWarpLengthData = dataTape.filter(i => i.yarn_type === "warp").map(i => ({ label: i.density + " " + i.color + " " + i.additive, value: i.total_consumption_shift }));
    const statWeftLengthData = dataTape.filter(i => i.yarn_type === "weft").map(i => ({ label: i.density + " " + i.color + " " + i.additive, value: i.total_consumption_shift }));

    const warpCount = document.createElement("div");
    const weftCount = document.createElement("div");
    const warpLength = document.createElement("div");
    const weftLength = document.createElement("div");
    new CircularChart({
        container: warpCount,

        centerText: 'Warp Qty',

        data: statWarpCountData
    }).render();


    new CircularChart({
        container: weftCount,

        centerText: 'Weft Qty',

        data: statWeftCountData
    }).render();


    new CircularChart({
        container: warpLength,

        centerText: 'Warp M',

        data: statWarpLengthData
    }).render();


    new CircularChart({
        container: weftLength,

        centerText: 'Weft M',

        data: statWeftLengthData
    }).render();

    // Запускаем загрузку и рендер кнопок
    const looms_fabric_recipe = await loadAndRenderButtons();
    allNumbersLoom = looms_fabric_recipe;
    console.log(looms_fabric_recipe);
    const keys = Object.keys(looms_fabric_recipe[0]);
    keys.forEach(item => nav.append(createA(item)));


    const div = document.createElement('div');
    div.classList.add("custom-select");
    {
        const input = document.createElement('input');
        input.classList.add("select-input");
        //input.type = "text";
        input.type = "number";
        //input.placeholder = "Search and select an item...";
        input.readOnly = true;


        const ul = document.createElement('ul');
        ul.classList.add("select-options");
        //ul.addEventListener('change', showSelect);
        ul.name = "sleeve_width_density";
        //ul.appendChild(svoid());
        //const dataRow = (await select("sleeve_width_density")).rows;
        const dataRow = [
            {
                "sleeve_width_density_id": 17,
                "sleeve_width_id": 1,
                "sleeve_density_id": 6,
                "sleeve_width": 36,
                "sleeve_density": 65
            },
            {
                "sleeve_width_density_id": 34,
                "sleeve_width_id": 21,
                "sleeve_density_id": 11,
                "sleeve_width": 38,
                "sleeve_density": 75
            },
            {
                "sleeve_width_density_id": 18,
                "sleeve_width_id": 2,
                "sleeve_density_id": 8,
                "sleeve_width": 39,
                "sleeve_density": 68
            },
            {
                "sleeve_width_density_id": 10,
                "sleeve_width_id": 3,
                "sleeve_density_id": 2,
                "sleeve_width": 40,
                "sleeve_density": 60
            },
            {
                "sleeve_width_density_id": 9,
                "sleeve_width_id": 3,
                "sleeve_density_id": 6,
                "sleeve_width": 40,
                "sleeve_density": 65
            },
            {
                "sleeve_width_density_id": 2,
                "sleeve_width_id": 4,
                "sleeve_density_id": 8,
                "sleeve_width": 42,
                "sleeve_density": 68
            },
            {
                "sleeve_width_density_id": 16,
                "sleeve_width_id": 5,
                "sleeve_density_id": 2,
                "sleeve_width": 45,
                "sleeve_density": 60
            },
            {
                "sleeve_width_density_id": 15,
                "sleeve_width_id": 6,
                "sleeve_density_id": 2,
                "sleeve_width": 47,
                "sleeve_density": 60
            },
            {
                "sleeve_width_density_id": 14,
                "sleeve_width_id": 6,
                "sleeve_density_id": 11,
                "sleeve_width": 47,
                "sleeve_density": 75
            },
            {
                "sleeve_width_density_id": 38,
                "sleeve_width_id": 22,
                "sleeve_density_id": 18,
                "sleeve_width": 48,
                "sleeve_density": 67
            },
            {
                "sleeve_width_density_id": 8,
                "sleeve_width_id": 7,
                "sleeve_density_id": 2,
                "sleeve_width": 50,
                "sleeve_density": 60
            },
            {
                "sleeve_width_density_id": 12,
                "sleeve_width_id": 7,
                "sleeve_density_id": 4,
                "sleeve_width": 50,
                "sleeve_density": 63
            },
            {
                "sleeve_width_density_id": 3,
                "sleeve_width_id": 7,
                "sleeve_density_id": 5,
                "sleeve_width": 50,
                "sleeve_density": 64
            },
            {
                "sleeve_width_density_id": 5,
                "sleeve_width_id": 7,
                "sleeve_density_id": 6,
                "sleeve_width": 50,
                "sleeve_density": 65
            },
            {
                "sleeve_width_density_id": 42,
                "sleeve_width_id": 7,
                "sleeve_density_id": 9,
                "sleeve_width": 50,
                "sleeve_density": 70
            },
            {
                "sleeve_width_density_id": 7,
                "sleeve_width_id": 7,
                "sleeve_density_id": 10,
                "sleeve_width": 50,
                "sleeve_density": 72
            },
            {
                "sleeve_width_density_id": 4,
                "sleeve_width_id": 7,
                "sleeve_density_id": 11,
                "sleeve_width": 50,
                "sleeve_density": 75
            },
            {
                "sleeve_width_density_id": 20,
                "sleeve_width_id": 8,
                "sleeve_density_id": 10,
                "sleeve_width": 52,
                "sleeve_density": 72
            },
            {
                "sleeve_width_density_id": 13,
                "sleeve_width_id": 9,
                "sleeve_density_id": 12,
                "sleeve_width": 54,
                "sleeve_density": 80
            },
            {
                "sleeve_width_density_id": 43,
                "sleeve_width_id": 10,
                "sleeve_density_id": 5,
                "sleeve_width": 55,
                "sleeve_density": 64
            },
            {
                "sleeve_width_density_id": 11,
                "sleeve_width_id": 10,
                "sleeve_density_id": 7,
                "sleeve_width": 55,
                "sleeve_density": 66
            },
            {
                "sleeve_width_density_id": 6,
                "sleeve_width_id": 10,
                "sleeve_density_id": 9,
                "sleeve_width": 55,
                "sleeve_density": 70
            },
            {
                "sleeve_width_density_id": 35,
                "sleeve_width_id": 11,
                "sleeve_density_id": 2,
                "sleeve_width": 56,
                "sleeve_density": 60
            },
            {
                "sleeve_width_density_id": 21,
                "sleeve_width_id": 11,
                "sleeve_density_id": 3,
                "sleeve_width": 56,
                "sleeve_density": 62
            },
            {
                "sleeve_width_density_id": 36,
                "sleeve_width_id": 11,
                "sleeve_density_id": 18,
                "sleeve_width": 56,
                "sleeve_density": 67
            },
            {
                "sleeve_width_density_id": 1,
                "sleeve_width_id": 11,
                "sleeve_density_id": 11,
                "sleeve_width": 56,
                "sleeve_density": 75
            },
            {
                "sleeve_width_density_id": 19,
                "sleeve_width_id": 12,
                "sleeve_density_id": 2,
                "sleeve_width": 60,
                "sleeve_density": 60
            },
            {
                "sleeve_width_density_id": 45,
                "sleeve_width_id": 12,
                "sleeve_density_id": 9,
                "sleeve_width": 60,
                "sleeve_density": 70
            },
            {
                "sleeve_width_density_id": 44,
                "sleeve_width_id": 12,
                "sleeve_density_id": 10,
                "sleeve_width": 60,
                "sleeve_density": 72
            },
            {
                "sleeve_width_density_id": 37,
                "sleeve_width_id": 13,
                "sleeve_density_id": 3,
                "sleeve_width": 80,
                "sleeve_density": 62
            },
            {
                "sleeve_width_density_id": 24,
                "sleeve_width_id": 13,
                "sleeve_density_id": 14,
                "sleeve_width": 80,
                "sleeve_density": 95
            },
            {
                "sleeve_width_density_id": 28,
                "sleeve_width_id": 14,
                "sleeve_density_id": 1,
                "sleeve_width": 85,
                "sleeve_density": 58
            },
            {
                "sleeve_width_density_id": 32,
                "sleeve_width_id": 15,
                "sleeve_density_id": 11,
                "sleeve_width": 90,
                "sleeve_density": 75
            },
            {
                "sleeve_width_density_id": 39,
                "sleeve_width_id": 23,
                "sleeve_density_id": 12,
                "sleeve_width": 95,
                "sleeve_density": 80
            },
            {
                "sleeve_width_density_id": 33,
                "sleeve_width_id": 16,
                "sleeve_density_id": 3,
                "sleeve_width": 100,
                "sleeve_density": 62
            },
            {
                "sleeve_width_density_id": 27,
                "sleeve_width_id": 16,
                "sleeve_density_id": 11,
                "sleeve_width": 100,
                "sleeve_density": 75
            },
            {
                "sleeve_width_density_id": 25,
                "sleeve_width_id": 17,
                "sleeve_density_id": 11,
                "sleeve_width": 128,
                "sleeve_density": 75
            },
            {
                "sleeve_width_density_id": 31,
                "sleeve_width_id": 17,
                "sleeve_density_id": 13,
                "sleeve_width": 128,
                "sleeve_density": 85
            },
            {
                "sleeve_width_density_id": 26,
                "sleeve_width_id": 17,
                "sleeve_density_id": 15,
                "sleeve_width": 128,
                "sleeve_density": 110
            },
            {
                "sleeve_width_density_id": 40,
                "sleeve_width_id": 18,
                "sleeve_density_id": 11,
                "sleeve_width": 150,
                "sleeve_density": 75
            },
            {
                "sleeve_width_density_id": 22,
                "sleeve_width_id": 18,
                "sleeve_density_id": 13,
                "sleeve_width": 150,
                "sleeve_density": 85
            },
            {
                "sleeve_width_density_id": 23,
                "sleeve_width_id": 18,
                "sleeve_density_id": 15,
                "sleeve_width": 150,
                "sleeve_density": 110
            },
            {
                "sleeve_width_density_id": 30,
                "sleeve_width_id": 19,
                "sleeve_density_id": 17,
                "sleeve_width": 160,
                "sleeve_density": 180
            },
            {
                "sleeve_width_density_id": 41,
                "sleeve_width_id": 24,
                "sleeve_density_id": 16,
                "sleeve_width": 180,
                "sleeve_density": 160
            },
            {
                "sleeve_width_density_id": 29,
                "sleeve_width_id": 20,
                "sleeve_density_id": 16,
                "sleeve_width": 190,
                "sleeve_density": 160
            }
        ]
        console.log(dataRow);

        dataRow.forEach(obj => {
            const li = document.createElement('li');
            const sleeve = new SleeveWidthDensityInfo(obj);
            li.value = sleeve.id;
            li.textContent = sleeve.width + "/" + sleeve.density;
            ul.appendChild(li);
        });
        div.append(input, ul);


        const grid = document.createElement('div');
        grid.classList.add("container-grid");

        const uniqueSleeveWidths = [];
        const seen = new Set();
        for (const item of dataRow) {
            if (!seen.has(item.sleeve_width)) {
                seen.add(item.sleeve_width);
                uniqueSleeveWidths.push(item);
            }
        }
        console.log(uniqueSleeveWidths);

        uniqueSleeveWidths.forEach(obj => {
            const btn = document.createElement("button");
            btn.classList.add("select-button");

            const sleeve = new SleeveWidthDensityInfo(obj);
            btn.id = sleeve.id;
            btn.textContent = sleeve.width;

            btn.addEventListener("click", () => {
                const filteredByWidth = dataRow.filter(item => item.sleeve_width === +btn.textContent);
                console.log(filteredByWidth);
                grid.innerHTML = "";

                filteredByWidth.forEach(obj => {


                    const density = document.createElement("button");
                    density.classList.add("select-button");

                    const sleeve = new SleeveWidthDensityInfo(obj);
                    density.id = sleeve.id;
                    density.textContent = sleeve.density;




                    grid.append(density);
                })

            })
            grid.append(btn);
        });




        document.body.append(grid);
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


    document.body.append(warpCount);
    document.body.append(weftCount);
    document.body.append(warpLength);
    document.body.append(weftLength);






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



async function select(tableNmae) {
    return await fetch("https://worktime.up.railway.app/app", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "select",
            table: {
                name: tableNmae
            }
        }),
    }).then((response) => response.json());
}
async function selectWidth(tableNmae) {
    return await fetch("https://worktime.up.railway.app/app", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "select",
            table: {
                name: tableNmae,
                where: "sleeve_width",
            }
        }),
    }).then((response) => response.json());
}
class SleeveWidthDensityInfo {
    constructor(table) {
        this.table = table;
    }
    get id() { return this.table.sleeve_width_density_id; }
    get sleeve_width_id() { return this.table.sleeve_width_id; }
    get sleeve_density_id() { return this.table.sleeve_density_id; }
    get width() { return this.table.sleeve_width; }
    get density() { return this.table.sleeve_density; }
}