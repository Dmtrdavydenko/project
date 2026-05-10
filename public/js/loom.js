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
    const button = event.target.closest("div");
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
function createButtonsInBlockFromArray(field, containerId, numbersArray, reverse = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Копируем массив и, если нужно, переворачиваем порядок
    const arr = reverse ? [...numbersArray].reverse() : numbersArray;
    console.log(arr);
    console.log(field);
    arr.forEach(item => {
        const btn = document.createElement('button');
        item.button = btn;

        btn.addEventListener("click", handleClickBtn);
        btn.textContent = item[field];
        container.appendChild(btn);
    });
}
const state = [];
class LoomsRow {
    constructor(reference, loom) {
        this.reference = reference;
        this.loom = Number(loom);
    }
}
function handleClickBtn(e) {
    const btn = e.currentTarget;
    btn.classList.toggle('active');

    const number = btn.textContent;
    const existingIndex = state.findIndex(row => row.reference === btn);

    if (btn.classList.contains('active')) {
        // добавляем
        state.push(new LoomsRow(btn, number));
    } else {
        // удаляем
        if (existingIndex !== -1) state.splice(existingIndex, 1);
    }

    // обновляем input и объект update
    inputSS.value = number;
    update.loom_number = number;

    // логика для даты и счетчика
    const localDateTime = getLocalDateTimeForMySQL();
    console.log(localDateTime);
    console.log(state.length); // теперь это фактический счетчик активных кнопок
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
async function loadAndRenderButtons(field = "loom") {
    try {
        const allNumbers = await request("getUseTape");

        const allNumbersSV = [
            {
                "cnt": 2,
                "loom": 1,
                "ppm": 970,
                "fabric_recipe_id": 35,
                "den_warp": "140",
                "den_weft": "140",
                "quan_warp": 1150,
                "quan_weft": "39.5",
                "sum_warp": 1150,
                "sum_weft": "39.5",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 2,
                "ppm": 970,
                "fabric_recipe_id": 16,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 360,
                "quan_weft": "35.0",
                "sum_warp": 360,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 3,
                "ppm": 970,
                "fabric_recipe_id": 3,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 260,
                "quan_weft": "35.0",
                "sum_warp": 260,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 4,
                "ppm": 970,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 5,
                "ppm": 970,
                "fabric_recipe_id": 7,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 312,
                "quan_weft": "36.5",
                "sum_warp": 312,
                "sum_weft": "36.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 6,
                "ppm": 970,
                "fabric_recipe_id": 11,
                "den_warp": "90",
                "den_weft": "78",
                "quan_warp": 360,
                "quan_weft": "35.5",
                "sum_warp": 360,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 7,
                "ppm": 970,
                "fabric_recipe_id": 6,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 288,
                "quan_weft": "35.0",
                "sum_warp": 288,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 8,
                "ppm": 970,
                "fabric_recipe_id": 36,
                "den_warp": "220",
                "den_weft": "220",
                "quan_warp": 1154,
                "quan_weft": "47.5",
                "sum_warp": 1154,
                "sum_weft": "47.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 9,
                "ppm": 970,
                "fabric_recipe_id": 1,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 360,
                "quan_weft": "35.5",
                "sum_warp": 360,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 10,
                "ppm": 970,
                "fabric_recipe_id": 34,
                "den_warp": "112",
                "den_weft": "112",
                "quan_warp": 1150,
                "quan_weft": "36.0",
                "sum_warp": 1150,
                "sum_weft": "36.0",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 11,
                "ppm": 970,
                "fabric_recipe_id": 17,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 378,
                "quan_weft": "38.5",
                "sum_warp": 378,
                "sum_weft": "38.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 3,
                "loom": 12,
                "ppm": 970,
                "fabric_recipe_id": 44,
                "den_warp": "90",
                "den_weft": "90,78",
                "quan_warp": 422,
                "quan_weft": "19.0",
                "sum_warp": 422,
                "sum_weft": "19.0",
                "color_warp": "белая",
                "color_weft": "белая,белая",
                "additive_warp": "нет",
                "additive_weft": "нет,нет"
            },
            {
                "cnt": 2,
                "loom": 13,
                "ppm": 970,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 14,
                "ppm": 970,
                "fabric_recipe_id": 37,
                "den_warp": "170",
                "den_weft": "220",
                "quan_warp": 1374,
                "quan_weft": "38.5",
                "sum_warp": 1374,
                "sum_weft": "38.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 15,
                "ppm": 970,
                "fabric_recipe_id": 10,
                "den_warp": "105",
                "den_weft": "105",
                "quan_warp": 338,
                "quan_weft": "35.0",
                "sum_warp": 338,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 16,
                "ppm": 970,
                "fabric_recipe_id": 43,
                "den_warp": "90",
                "den_weft": "78",
                "quan_warp": 404,
                "quan_weft": "35.5",
                "sum_warp": 404,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 17,
                "ppm": 970,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 18,
                "ppm": 970,
                "fabric_recipe_id": 1,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 360,
                "quan_weft": "35.5",
                "sum_warp": 360,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 19,
                "ppm": 1200,
                "fabric_recipe_id": 1,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 360,
                "quan_weft": "35.5",
                "sum_warp": 360,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 20,
                "ppm": 970,
                "fabric_recipe_id": 42,
                "den_warp": "90",
                "den_weft": "78",
                "quan_warp": 414,
                "quan_weft": "37.0",
                "sum_warp": 414,
                "sum_weft": "37.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 21,
                "ppm": 970,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 22,
                "ppm": 970,
                "fabric_recipe_id": 16,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 360,
                "quan_weft": "35.0",
                "sum_warp": 360,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 23,
                "ppm": 970,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 24,
                "ppm": 970,
                "fabric_recipe_id": 3,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 260,
                "quan_weft": "35.0",
                "sum_warp": 260,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 25,
                "ppm": 970,
                "fabric_recipe_id": 6,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 288,
                "quan_weft": "35.0",
                "sum_warp": 288,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 26,
                "ppm": 970,
                "fabric_recipe_id": 10,
                "den_warp": "105",
                "den_weft": "105",
                "quan_warp": 338,
                "quan_weft": "35.0",
                "sum_warp": 338,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 27,
                "ppm": 970,
                "fabric_recipe_id": 35,
                "den_warp": "140",
                "den_weft": "140",
                "quan_warp": 1150,
                "quan_weft": "39.5",
                "sum_warp": 1150,
                "sum_weft": "39.5",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 1,
                "loom": 28,
                "ppm": 1200,
                "fabric_recipe_id": 14,
                "den_warp": "78",
                "den_weft": null,
                "quan_warp": 290,
                "quan_weft": "0.0",
                "sum_warp": 290,
                "sum_weft": "0.0",
                "color_warp": "зелёная",
                "color_weft": null,
                "additive_warp": "нет",
                "additive_weft": null
            },
            {
                "cnt": 2,
                "loom": 28,
                "ppm": 1200,
                "fabric_recipe_id": 14,
                "den_warp": "78",
                "den_weft": "90",
                "quan_warp": 72,
                "quan_weft": "39.0",
                "sum_warp": 72,
                "sum_weft": "39.0",
                "color_warp": "прозрачная",
                "color_weft": "прозрачная",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 29,
                "ppm": 1200,
                "fabric_recipe_id": 1,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 360,
                "quan_weft": "35.5",
                "sum_warp": 360,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 30,
                "ppm": 1200,
                "fabric_recipe_id": 16,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 360,
                "quan_weft": "35.0",
                "sum_warp": 360,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 31,
                "ppm": 1200,
                "fabric_recipe_id": 11,
                "den_warp": "90",
                "den_weft": "78",
                "quan_warp": 360,
                "quan_weft": "35.5",
                "sum_warp": 360,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 32,
                "ppm": 1200,
                "fabric_recipe_id": 5,
                "den_warp": "90",
                "den_weft": "78",
                "quan_warp": 288,
                "quan_weft": "35.3",
                "sum_warp": 288,
                "sum_weft": "35.3",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 33,
                "ppm": 1200,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 34,
                "ppm": 1200,
                "fabric_recipe_id": 7,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 312,
                "quan_weft": "36.5",
                "sum_warp": 312,
                "sum_weft": "36.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 35,
                "ppm": 1200,
                "fabric_recipe_id": 35,
                "den_warp": "140",
                "den_weft": "140",
                "quan_warp": 1150,
                "quan_weft": "39.5",
                "sum_warp": 1150,
                "sum_weft": "39.5",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 36,
                "ppm": 1200,
                "fabric_recipe_id": 36,
                "den_warp": "220",
                "den_weft": "220",
                "quan_warp": 1154,
                "quan_weft": "47.5",
                "sum_warp": 1154,
                "sum_weft": "47.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 37,
                "ppm": 970,
                "fabric_recipe_id": 3,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 260,
                "quan_weft": "35.0",
                "sum_warp": 260,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 38,
                "ppm": 970,
                "fabric_recipe_id": 11,
                "den_warp": "90",
                "den_weft": "78",
                "quan_warp": 360,
                "quan_weft": "35.5",
                "sum_warp": 360,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 39,
                "ppm": 970,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 40,
                "ppm": 970,
                "fabric_recipe_id": 6,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 288,
                "quan_weft": "35.0",
                "sum_warp": 288,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 41,
                "ppm": 970,
                "fabric_recipe_id": 37,
                "den_warp": "170",
                "den_weft": "220",
                "quan_warp": 1374,
                "quan_weft": "38.5",
                "sum_warp": 1374,
                "sum_weft": "38.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 42,
                "ppm": 970,
                "fabric_recipe_id": 6,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 288,
                "quan_weft": "35.0",
                "sum_warp": 288,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 43,
                "ppm": 970,
                "fabric_recipe_id": 8,
                "den_warp": "78",
                "den_weft": "78",
                "quan_warp": 346,
                "quan_weft": "36.0",
                "sum_warp": 346,
                "sum_weft": "36.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 44,
                "ppm": 970,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 45,
                "ppm": 970,
                "fabric_recipe_id": 11,
                "den_warp": "90",
                "den_weft": "78",
                "quan_warp": 360,
                "quan_weft": "35.5",
                "sum_warp": 360,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 46,
                "ppm": 970,
                "fabric_recipe_id": 16,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 360,
                "quan_weft": "35.0",
                "sum_warp": 360,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 47,
                "ppm": 970,
                "fabric_recipe_id": 35,
                "den_warp": "140",
                "den_weft": "140",
                "quan_warp": 1150,
                "quan_weft": "39.5",
                "sum_warp": 1150,
                "sum_weft": "39.5",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 48,
                "ppm": 970,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 49,
                "ppm": 970,
                "fabric_recipe_id": 6,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 288,
                "quan_weft": "35.0",
                "sum_warp": 288,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 50,
                "ppm": 970,
                "fabric_recipe_id": 45,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 450,
                "quan_weft": "38.0",
                "sum_warp": 450,
                "sum_weft": "38.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 51,
                "ppm": 970,
                "fabric_recipe_id": 38,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 254,
                "quan_weft": "35.2",
                "sum_warp": 254,
                "sum_weft": "35.2",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 52,
                "ppm": 970,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 53,
                "ppm": 970,
                "fabric_recipe_id": 3,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 260,
                "quan_weft": "35.0",
                "sum_warp": 260,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 54,
                "ppm": 970,
                "fabric_recipe_id": 16,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 360,
                "quan_weft": "35.0",
                "sum_warp": 360,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 55,
                "ppm": 1200,
                "fabric_recipe_id": 3,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 260,
                "quan_weft": "35.0",
                "sum_warp": 260,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 56,
                "ppm": 1200,
                "fabric_recipe_id": 7,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 312,
                "quan_weft": "36.5",
                "sum_warp": 312,
                "sum_weft": "36.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 57,
                "ppm": 1200,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 58,
                "ppm": 1200,
                "fabric_recipe_id": 7,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 312,
                "quan_weft": "36.5",
                "sum_warp": 312,
                "sum_weft": "36.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 59,
                "ppm": 1200,
                "fabric_recipe_id": 34,
                "den_warp": "112",
                "den_weft": "112",
                "quan_warp": 1150,
                "quan_weft": "36.0",
                "sum_warp": 1150,
                "sum_weft": "36.0",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 60,
                "ppm": 1200,
                "fabric_recipe_id": 6,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 288,
                "quan_weft": "35.0",
                "sum_warp": 288,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 1,
                "loom": 61,
                "ppm": 1200,
                "fabric_recipe_id": 14,
                "den_warp": "78",
                "den_weft": null,
                "quan_warp": 290,
                "quan_weft": "0.0",
                "sum_warp": 290,
                "sum_weft": "0.0",
                "color_warp": "зелёная",
                "color_weft": null,
                "additive_warp": "нет",
                "additive_weft": null
            },
            {
                "cnt": 2,
                "loom": 61,
                "ppm": 1200,
                "fabric_recipe_id": 14,
                "den_warp": "78",
                "den_weft": "90",
                "quan_warp": 72,
                "quan_weft": "39.0",
                "sum_warp": 72,
                "sum_weft": "39.0",
                "color_warp": "прозрачная",
                "color_weft": "прозрачная",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 62,
                "ppm": 1200,
                "fabric_recipe_id": 3,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 260,
                "quan_weft": "35.0",
                "sum_warp": 260,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 63,
                "ppm": 1200,
                "fabric_recipe_id": 7,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 312,
                "quan_weft": "36.5",
                "sum_warp": 312,
                "sum_weft": "36.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 64,
                "ppm": 1200,
                "fabric_recipe_id": 21,
                "den_warp": "110",
                "den_weft": "110",
                "quan_warp": 392,
                "quan_weft": "35.0",
                "sum_warp": 392,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 65,
                "ppm": 1200,
                "fabric_recipe_id": 21,
                "den_warp": "110",
                "den_weft": "110",
                "quan_warp": 392,
                "quan_weft": "35.0",
                "sum_warp": 392,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 66,
                "ppm": 1200,
                "fabric_recipe_id": 21,
                "den_warp": "110",
                "den_weft": "110",
                "quan_warp": 392,
                "quan_weft": "35.0",
                "sum_warp": 392,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 67,
                "ppm": 1200,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 68,
                "ppm": 1200,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 69,
                "ppm": 1200,
                "fabric_recipe_id": 10,
                "den_warp": "105",
                "den_weft": "105",
                "quan_warp": 338,
                "quan_weft": "35.0",
                "sum_warp": 338,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 70,
                "ppm": 1200,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 71,
                "ppm": 1200,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 72,
                "ppm": 1200,
                "fabric_recipe_id": 4,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 282,
                "quan_weft": "35.5",
                "sum_warp": 282,
                "sum_weft": "35.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 87,
                "ppm": 700,
                "fabric_recipe_id": 22,
                "den_warp": "90",
                "den_weft": "78",
                "quan_warp": 432,
                "quan_weft": "36.5",
                "sum_warp": 432,
                "sum_weft": "36.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 88,
                "ppm": 700,
                "fabric_recipe_id": 40,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 348,
                "quan_weft": "38.0",
                "sum_warp": 348,
                "sum_weft": "38.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 89,
                "ppm": 700,
                "fabric_recipe_id": 39,
                "den_warp": "105",
                "den_weft": "105",
                "quan_warp": 280,
                "quan_weft": "34.5",
                "sum_warp": 280,
                "sum_weft": "34.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 90,
                "ppm": 700,
                "fabric_recipe_id": 39,
                "den_warp": "105",
                "den_weft": "105",
                "quan_warp": 280,
                "quan_weft": "34.5",
                "sum_warp": 280,
                "sum_weft": "34.5",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 91,
                "ppm": 700,
                "fabric_recipe_id": 26,
                "den_warp": "90",
                "den_weft": "78",
                "quan_warp": 428,
                "quan_weft": "35.0",
                "sum_warp": 428,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 92,
                "ppm": 920,
                "fabric_recipe_id": 33,
                "den_warp": "140",
                "den_weft": "140",
                "quan_warp": 1000,
                "quan_weft": "36.0",
                "sum_warp": 1000,
                "sum_weft": "36.0",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 93,
                "ppm": 920,
                "fabric_recipe_id": 24,
                "den_warp": "78",
                "den_weft": "78",
                "quan_warp": 408,
                "quan_weft": "39.0",
                "sum_warp": 408,
                "sum_weft": "39.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 94,
                "ppm": 600,
                "fabric_recipe_id": 41,
                "den_warp": "90",
                "den_weft": "90",
                "quan_warp": 378,
                "quan_weft": "38.0",
                "sum_warp": 378,
                "sum_weft": "38.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 95,
                "ppm": 850,
                "fabric_recipe_id": 26,
                "den_warp": "90",
                "den_weft": "78",
                "quan_warp": 428,
                "quan_weft": "35.0",
                "sum_warp": 428,
                "sum_weft": "35.0",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб"
            },
            {
                "cnt": 2,
                "loom": 96,
                "ppm": 850,
                "fabric_recipe_id": 30,
                "den_warp": "64",
                "den_weft": "64",
                "quan_warp": 710,
                "quan_weft": "37.0",
                "sum_warp": 710,
                "sum_weft": "37.0",
                "color_warp": "оранжевая",
                "color_weft": "оранжевая",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 97,
                "ppm": 920,
                "fabric_recipe_id": 33,
                "den_warp": "140",
                "den_weft": "140",
                "quan_warp": 1000,
                "quan_weft": "36.0",
                "sum_warp": 1000,
                "sum_weft": "36.0",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 98,
                "ppm": 920,
                "fabric_recipe_id": 33,
                "den_warp": "140",
                "den_weft": "140",
                "quan_warp": 1000,
                "quan_weft": "36.0",
                "sum_warp": 1000,
                "sum_weft": "36.0",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет"
            },
            {
                "cnt": 2,
                "loom": 99,
                "ppm": 920,
                "fabric_recipe_id": 33,
                "den_warp": "140",
                "den_weft": "140",
                "quan_warp": 1000,
                "quan_weft": "36.0",
                "sum_warp": 1000,
                "sum_weft": "36.0",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет"
            }
        ]

        for (const item of allNumbers) {
            for (const key in item) {
                item.button = document.createElement('button');
                if (!isNaN(item[key]) && item[key] !== '') {
                    item[key] = Number(item[key]);
                }
            }
        }

        console.log(allNumbers);





        const warpMap = new Map();

        for (const item of allNumbers) {

            const key = `${item.den_warp} ${item.color_warp} ${item.additive_warp}`;

            if (!warpMap.has(key)) {
                warpMap.set(key, []);
            }

            warpMap.get(key).push(item);
        }

        console.log("warp", warpMap);
        const tapeWarp = document.createElement('div');
        tapeWarp.classList.add("container-grid-warp");
        warpMap.forEach((value, key) => {

            const btn = document.createElement('button');

            btn.textContent = key;

            btn.addEventListener("click", () => {

                for (const item of allNumbers) {
                    item.button.classList.remove('active-loom');
                }

                for (const item of value) {
                    item.button.classList.add('active-loom');
                }

            });

            tapeWarp.append(btn);

        });

        document.body.append(tapeWarp);



        const weftMap = new Map();

        for (const item of allNumbers) {

            const key = `${item.den_weft} ${item.color_weft} ${item.additive_weft}`;

            if (!weftMap.has(key)) {
                weftMap.set(key, []);
            }

            weftMap.get(key).push(item);
        }


        console.log("weft", weftMap);
        const tapeWeft = document.createElement('div');
        tapeWeft.classList.add("container-grid-weft");
        weftMap.forEach((value, key) => {

            const btn = document.createElement('button');

            btn.textContent = key;

            btn.addEventListener("click", () => {

                for (const item of allNumbers) {
                    item.button.classList.remove('active-loom');
                }

                for (const item of value) {
                    item.button.classList.add('active-loom');
                }

            });

            tapeWeft.append(btn);

        });

        document.body.append(tapeWeft);




        const requiredCount = buttonsPerBlock * totalBlocks + 13;
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

        return allNumbers;

    } catch (error) {
        console.error('Ошибка загрузки номеров:', error);
    }
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
    loadAndRenderButtons(event.target.textContent);
}


const inputSS = document.createElement('input');
inputSS.type = "number";
//inputSS.classList.add("custom-select");


const update = {};



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
}
(async () => {
    // Запускаем загрузку и рендер кнопок
    const looms_fabric_recipe = await loadAndRenderButtons();
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