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
        btn.addEventListener("click", handleClickBtn);
        btn.textContent = item[field];
        container.appendChild(btn);
    });
}
const state = [];
class LoomsRow {
    constructor(reference, loom) {
        this.reference = reference;
        this.loom = +loom;
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
async function loadAndRenderButtons(field = "loom_number") {
    try {
        //const response = await fetch('https://worktime.up.railway.app/app', {
        //    method: 'POST',
        //    headers: { 'Content-Type': 'application/json;charset=utf-8' },
        //    body: JSON.stringify({
        //        action: "sql",
        //        //query: "SELECT " + field + " " +
        //        //    "FROM textile t " +
        //        //    "JOIN sleeve_width_density swd ON t.wd_id = swd.sleeve_width_density_id " +
        //        //    "JOIN sleeve_width sw ON swd.sleeve_width_id = sw.sleeve_width_id " +
        //        //    "JOIN sleeve_density d ON swd.sleeve_density_id = d.sleeve_density_id;",
        //        query: "SELECT " + field + " FROM " +
        //            "(SELECT looms.*, CONCAT(sw.sleeve_width, '/', sd.sleeve_density) AS sleeve_width_density " +
        //            "FROM looms " +
        //            "LEFT JOIN sleeve_width_density swd ON looms.type_id = swd.sleeve_width_density_id " +
        //            "LEFT JOIN sleeve_width sw ON swd.sleeve_width_id = sw.sleeve_width_id " +
        //            "LEFT JOIN sleeve_density sd ON swd.sleeve_density_id = sd.sleeve_density_id) AS combo;",
        //    }),
        //});
        //console.log(response);
        //const [allNumbers] = await response.json();
        const allNumbers = [
            {
                "loom_number": 1,
                "sleeve_width": 150,
                "sleeve_density": 110,
                "w_d": "150/110",
                "fabric_recipe_id": 35,
                "model_of_the_loom_id": 7,
                "q_warp": "1150",
                "q_weft": "39.5",
                "d_warp": "140",
                "d_weft": "140",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 2,
                "sleeve_width": 50,
                "sleeve_density": 65,
                "w_d": "50/65",
                "fabric_recipe_id": 16,
                "model_of_the_loom_id": 7,
                "q_warp": "360",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 3,
                "sleeve_width": 36,
                "sleeve_density": 65,
                "w_d": "36/65",
                "fabric_recipe_id": 3,
                "model_of_the_loom_id": 7,
                "q_warp": "260",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 4,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 7,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 5,
                "sleeve_width": 42,
                "sleeve_density": 68,
                "w_d": "42/68",
                "fabric_recipe_id": 7,
                "model_of_the_loom_id": 7,
                "q_warp": "312",
                "q_weft": "36.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 6,
                "sleeve_width": 50,
                "sleeve_density": 60,
                "w_d": "50/60",
                "fabric_recipe_id": 11,
                "model_of_the_loom_id": 7,
                "q_warp": "360",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "78",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 7,
                "sleeve_width": 40,
                "sleeve_density": 65,
                "w_d": "40/65",
                "fabric_recipe_id": 6,
                "model_of_the_loom_id": 7,
                "q_warp": "288",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 8,
                "sleeve_width": 160,
                "sleeve_density": 180,
                "w_d": "160/180",
                "fabric_recipe_id": 36,
                "model_of_the_loom_id": 7,
                "q_warp": "1154",
                "q_weft": "47.5",
                "d_warp": "220",
                "d_weft": "220",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 9,
                "sleeve_width": 50,
                "sleeve_density": 65,
                "w_d": "50/65",
                "fabric_recipe_id": 1,
                "model_of_the_loom_id": 7,
                "q_warp": "360",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 10,
                "sleeve_width": 150,
                "sleeve_density": 85,
                "w_d": "150/85",
                "fabric_recipe_id": 34,
                "model_of_the_loom_id": 7,
                "q_warp": "1150",
                "q_weft": "36.0",
                "d_warp": "112",
                "d_weft": "112",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 11,
                "sleeve_width": 50,
                "sleeve_density": 72,
                "w_d": "50/72",
                "fabric_recipe_id": 17,
                "model_of_the_loom_id": 7,
                "q_warp": "378",
                "q_weft": "38.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 12,
                "sleeve_width": 56,
                "sleeve_density": 67,
                "w_d": "56/67",
                "fabric_recipe_id": 44,
                "model_of_the_loom_id": 7,
                "q_warp": "422",
                "q_weft": "19.0,19.0",
                "d_warp": "90",
                "d_weft": "90,78",
                "color_warp": "белая",
                "color_weft": "белая,белая",
                "additive_warp": "нет",
                "additive_weft": "нет,нет",
                "warp": "нет",
                "weft": "нет,нет"
            },
            {
                "loom_number": 13,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 7,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 14,
                "sleeve_width": 190,
                "sleeve_density": 160,
                "w_d": "190/160",
                "fabric_recipe_id": 37,
                "model_of_the_loom_id": 7,
                "q_warp": "1374",
                "q_weft": "38.5",
                "d_warp": "170",
                "d_weft": "220",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 15,
                "sleeve_width": 47,
                "sleeve_density": 75,
                "w_d": "47/75",
                "fabric_recipe_id": 10,
                "model_of_the_loom_id": 7,
                "q_warp": "338",
                "q_weft": "35.0",
                "d_warp": "105",
                "d_weft": "105",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 16,
                "sleeve_width": 56,
                "sleeve_density": 60,
                "w_d": "56/60",
                "fabric_recipe_id": 43,
                "model_of_the_loom_id": 7,
                "q_warp": "404",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "78",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 17,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 7,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 18,
                "sleeve_width": 50,
                "sleeve_density": 65,
                "w_d": "50/65",
                "fabric_recipe_id": 1,
                "model_of_the_loom_id": 7,
                "q_warp": "360",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 19,
                "sleeve_width": 50,
                "sleeve_density": 65,
                "w_d": "50/65",
                "fabric_recipe_id": 1,
                "model_of_the_loom_id": 5,
                "q_warp": "360",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 20,
                "sleeve_width": 55,
                "sleeve_density": 64,
                "w_d": "55/64",
                "fabric_recipe_id": 42,
                "model_of_the_loom_id": 7,
                "q_warp": "414",
                "q_weft": "37.0",
                "d_warp": "90",
                "d_weft": "78",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 21,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 7,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 22,
                "sleeve_width": 50,
                "sleeve_density": 65,
                "w_d": "50/65",
                "fabric_recipe_id": 16,
                "model_of_the_loom_id": 7,
                "q_warp": "360",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 23,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 7,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 24,
                "sleeve_width": 36,
                "sleeve_density": 65,
                "w_d": "36/65",
                "fabric_recipe_id": 3,
                "model_of_the_loom_id": 7,
                "q_warp": "260",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 25,
                "sleeve_width": 40,
                "sleeve_density": 65,
                "w_d": "40/65",
                "fabric_recipe_id": 6,
                "model_of_the_loom_id": 7,
                "q_warp": "288",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 26,
                "sleeve_width": 47,
                "sleeve_density": 75,
                "w_d": "47/75",
                "fabric_recipe_id": 10,
                "model_of_the_loom_id": 7,
                "q_warp": "338",
                "q_weft": "35.0",
                "d_warp": "105",
                "d_weft": "105",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 27,
                "sleeve_width": 150,
                "sleeve_density": 110,
                "w_d": "150/110",
                "fabric_recipe_id": 35,
                "model_of_the_loom_id": 7,
                "q_warp": "1150",
                "q_weft": "39.5",
                "d_warp": "140",
                "d_weft": "140",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 28,
                "sleeve_width": 50,
                "sleeve_density": 63,
                "w_d": "50/63",
                "fabric_recipe_id": 14,
                "model_of_the_loom_id": 5,
                "q_warp": "72,290",
                "q_weft": "39.0",
                "d_warp": "78,78",
                "d_weft": "90",
                "color_warp": "прозрачная,зелёная",
                "color_weft": "прозрачная",
                "additive_warp": "нет,нет",
                "additive_weft": "нет",
                "warp": "нет,нет",
                "weft": "нет"
            },
            {
                "loom_number": 29,
                "sleeve_width": 50,
                "sleeve_density": 65,
                "w_d": "50/65",
                "fabric_recipe_id": 1,
                "model_of_the_loom_id": 5,
                "q_warp": "360",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 30,
                "sleeve_width": 50,
                "sleeve_density": 65,
                "w_d": "50/65",
                "fabric_recipe_id": 16,
                "model_of_the_loom_id": 5,
                "q_warp": "360",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 31,
                "sleeve_width": 50,
                "sleeve_density": 60,
                "w_d": "50/60",
                "fabric_recipe_id": 11,
                "model_of_the_loom_id": 5,
                "q_warp": "360",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "78",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 32,
                "sleeve_width": 40,
                "sleeve_density": 60,
                "w_d": "40/60",
                "fabric_recipe_id": 5,
                "model_of_the_loom_id": 5,
                "q_warp": "288",
                "q_weft": "35.3",
                "d_warp": "90",
                "d_weft": "78",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 33,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 5,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 34,
                "sleeve_width": 42,
                "sleeve_density": 68,
                "w_d": "42/68",
                "fabric_recipe_id": 7,
                "model_of_the_loom_id": 5,
                "q_warp": "312",
                "q_weft": "36.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 35,
                "sleeve_width": 150,
                "sleeve_density": 110,
                "w_d": "150/110",
                "fabric_recipe_id": 35,
                "model_of_the_loom_id": 5,
                "q_warp": "1150",
                "q_weft": "39.5",
                "d_warp": "140",
                "d_weft": "140",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 36,
                "sleeve_width": 160,
                "sleeve_density": 180,
                "w_d": "160/180",
                "fabric_recipe_id": 36,
                "model_of_the_loom_id": 5,
                "q_warp": "1154",
                "q_weft": "47.5",
                "d_warp": "220",
                "d_weft": "220",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 37,
                "sleeve_width": 36,
                "sleeve_density": 65,
                "w_d": "36/65",
                "fabric_recipe_id": 3,
                "model_of_the_loom_id": 7,
                "q_warp": "260",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 38,
                "sleeve_width": 50,
                "sleeve_density": 60,
                "w_d": "50/60",
                "fabric_recipe_id": 11,
                "model_of_the_loom_id": 7,
                "q_warp": "360",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "78",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 39,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 7,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 40,
                "sleeve_width": 40,
                "sleeve_density": 65,
                "w_d": "40/65",
                "fabric_recipe_id": 6,
                "model_of_the_loom_id": 7,
                "q_warp": "288",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 41,
                "sleeve_width": 190,
                "sleeve_density": 160,
                "w_d": "190/160",
                "fabric_recipe_id": 37,
                "model_of_the_loom_id": 7,
                "q_warp": "1374",
                "q_weft": "38.5",
                "d_warp": "170",
                "d_weft": "220",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 42,
                "sleeve_width": 40,
                "sleeve_density": 65,
                "w_d": "40/65",
                "fabric_recipe_id": 6,
                "model_of_the_loom_id": 7,
                "q_warp": "288",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 43,
                "sleeve_width": 45,
                "sleeve_density": 60,
                "w_d": "45/60",
                "fabric_recipe_id": 8,
                "model_of_the_loom_id": 7,
                "q_warp": "346",
                "q_weft": "36.0",
                "d_warp": "78",
                "d_weft": "78",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 44,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 7,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 45,
                "sleeve_width": 50,
                "sleeve_density": 60,
                "w_d": "50/60",
                "fabric_recipe_id": 11,
                "model_of_the_loom_id": 7,
                "q_warp": "360",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "78",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 46,
                "sleeve_width": 50,
                "sleeve_density": 65,
                "w_d": "50/65",
                "fabric_recipe_id": 16,
                "model_of_the_loom_id": 7,
                "q_warp": "360",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 47,
                "sleeve_width": 150,
                "sleeve_density": 110,
                "w_d": "150/110",
                "fabric_recipe_id": 35,
                "model_of_the_loom_id": 7,
                "q_warp": "1150",
                "q_weft": "39.5",
                "d_warp": "140",
                "d_weft": "140",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 48,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 7,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 49,
                "sleeve_width": 40,
                "sleeve_density": 65,
                "w_d": "40/65",
                "fabric_recipe_id": 6,
                "model_of_the_loom_id": 7,
                "q_warp": "288",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 50,
                "sleeve_width": 60,
                "sleeve_density": 70,
                "w_d": "60/70",
                "fabric_recipe_id": 45,
                "model_of_the_loom_id": 7,
                "q_warp": "450",
                "q_weft": "38.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 51,
                "sleeve_width": 36,
                "sleeve_density": 65,
                "w_d": "36/65",
                "fabric_recipe_id": 38,
                "model_of_the_loom_id": 7,
                "q_warp": "254",
                "q_weft": "35.2",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 52,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 7,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 53,
                "sleeve_width": 36,
                "sleeve_density": 65,
                "w_d": "36/65",
                "fabric_recipe_id": 3,
                "model_of_the_loom_id": 7,
                "q_warp": "260",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 54,
                "sleeve_width": 50,
                "sleeve_density": 65,
                "w_d": "50/65",
                "fabric_recipe_id": 16,
                "model_of_the_loom_id": 7,
                "q_warp": "360",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 55,
                "sleeve_width": 36,
                "sleeve_density": 65,
                "w_d": "36/65",
                "fabric_recipe_id": 3,
                "model_of_the_loom_id": 5,
                "q_warp": "260",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 56,
                "sleeve_width": 42,
                "sleeve_density": 68,
                "w_d": "42/68",
                "fabric_recipe_id": 7,
                "model_of_the_loom_id": 5,
                "q_warp": "312",
                "q_weft": "36.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 57,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 5,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 58,
                "sleeve_width": 42,
                "sleeve_density": 68,
                "w_d": "42/68",
                "fabric_recipe_id": 7,
                "model_of_the_loom_id": 5,
                "q_warp": "312",
                "q_weft": "36.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 59,
                "sleeve_width": 150,
                "sleeve_density": 85,
                "w_d": "150/85",
                "fabric_recipe_id": 34,
                "model_of_the_loom_id": 5,
                "q_warp": "1150",
                "q_weft": "36.0",
                "d_warp": "112",
                "d_weft": "112",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 60,
                "sleeve_width": 40,
                "sleeve_density": 65,
                "w_d": "40/65",
                "fabric_recipe_id": 6,
                "model_of_the_loom_id": 5,
                "q_warp": "288",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 61,
                "sleeve_width": 50,
                "sleeve_density": 63,
                "w_d": "50/63",
                "fabric_recipe_id": 14,
                "model_of_the_loom_id": 5,
                "q_warp": "72,290",
                "q_weft": "39.0",
                "d_warp": "78,78",
                "d_weft": "90",
                "color_warp": "прозрачная,зелёная",
                "color_weft": "прозрачная",
                "additive_warp": "нет,нет",
                "additive_weft": "нет",
                "warp": "нет,нет",
                "weft": "нет"
            },
            {
                "loom_number": 62,
                "sleeve_width": 36,
                "sleeve_density": 65,
                "w_d": "36/65",
                "fabric_recipe_id": 3,
                "model_of_the_loom_id": 5,
                "q_warp": "260",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 63,
                "sleeve_width": 42,
                "sleeve_density": 68,
                "w_d": "42/68",
                "fabric_recipe_id": 7,
                "model_of_the_loom_id": 5,
                "q_warp": "312",
                "q_weft": "36.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 64,
                "sleeve_width": 54,
                "sleeve_density": 80,
                "w_d": "54/80",
                "fabric_recipe_id": 21,
                "model_of_the_loom_id": 5,
                "q_warp": "392",
                "q_weft": "35.0",
                "d_warp": "110",
                "d_weft": "110",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 65,
                "sleeve_width": 54,
                "sleeve_density": 80,
                "w_d": "54/80",
                "fabric_recipe_id": 21,
                "model_of_the_loom_id": 5,
                "q_warp": "392",
                "q_weft": "35.0",
                "d_warp": "110",
                "d_weft": "110",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 66,
                "sleeve_width": 54,
                "sleeve_density": 80,
                "w_d": "54/80",
                "fabric_recipe_id": 21,
                "model_of_the_loom_id": 5,
                "q_warp": "392",
                "q_weft": "35.0",
                "d_warp": "110",
                "d_weft": "110",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 67,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 5,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 68,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 5,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 69,
                "sleeve_width": 47,
                "sleeve_density": 75,
                "w_d": "47/75",
                "fabric_recipe_id": 10,
                "model_of_the_loom_id": 5,
                "q_warp": "338",
                "q_weft": "35.0",
                "d_warp": "105",
                "d_weft": "105",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 70,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 5,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 71,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 5,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 72,
                "sleeve_width": 39,
                "sleeve_density": 68,
                "w_d": "39/68",
                "fabric_recipe_id": 4,
                "model_of_the_loom_id": 5,
                "q_warp": "282",
                "q_weft": "35.5",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 87,
                "sleeve_width": 55,
                "sleeve_density": 66,
                "w_d": "55/66",
                "fabric_recipe_id": 22,
                "model_of_the_loom_id": 9,
                "q_warp": "432",
                "q_weft": "36.5",
                "d_warp": "90",
                "d_weft": "78",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 88,
                "sleeve_width": 48,
                "sleeve_density": 67,
                "w_d": "48/67",
                "fabric_recipe_id": 40,
                "model_of_the_loom_id": 9,
                "q_warp": "348",
                "q_weft": "38.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 89,
                "sleeve_width": 38,
                "sleeve_density": 75,
                "w_d": "38/75",
                "fabric_recipe_id": 39,
                "model_of_the_loom_id": 9,
                "q_warp": "280",
                "q_weft": "34.5",
                "d_warp": "105",
                "d_weft": "105",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 90,
                "sleeve_width": 38,
                "sleeve_density": 75,
                "w_d": "38/75",
                "fabric_recipe_id": 39,
                "model_of_the_loom_id": 8,
                "q_warp": "280",
                "q_weft": "34.5",
                "d_warp": "105",
                "d_weft": "105",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 91,
                "sleeve_width": 60,
                "sleeve_density": 60,
                "w_d": "60/60",
                "fabric_recipe_id": 26,
                "model_of_the_loom_id": 8,
                "q_warp": "428",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "78",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 92,
                "sleeve_width": 128,
                "sleeve_density": 110,
                "w_d": "128/110",
                "fabric_recipe_id": 33,
                "model_of_the_loom_id": 10,
                "q_warp": "1000",
                "q_weft": "36.0",
                "d_warp": "140",
                "d_weft": "140",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 93,
                "sleeve_width": 56,
                "sleeve_density": 62,
                "w_d": "56/62",
                "fabric_recipe_id": 24,
                "model_of_the_loom_id": 10,
                "q_warp": "408",
                "q_weft": "39.0",
                "d_warp": "78",
                "d_weft": "78",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 94,
                "sleeve_width": 50,
                "sleeve_density": 70,
                "w_d": "50/70",
                "fabric_recipe_id": 41,
                "model_of_the_loom_id": 1,
                "q_warp": "378",
                "q_weft": "38.0",
                "d_warp": "90",
                "d_weft": "90",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 95,
                "sleeve_width": 60,
                "sleeve_density": 60,
                "w_d": "60/60",
                "fabric_recipe_id": 26,
                "model_of_the_loom_id": 2,
                "q_warp": "428",
                "q_weft": "35.0",
                "d_warp": "90",
                "d_weft": "78",
                "color_warp": "белая",
                "color_weft": "белая",
                "additive_warp": "светостаб",
                "additive_weft": "светостаб",
                "warp": "светостаб",
                "weft": "светостаб"
            },
            {
                "loom_number": 96,
                "sleeve_width": 100,
                "sleeve_density": 75,
                "w_d": "100/75",
                "fabric_recipe_id": 30,
                "model_of_the_loom_id": 2,
                "q_warp": "710",
                "q_weft": "37.0",
                "d_warp": "64",
                "d_weft": "64",
                "color_warp": "оранжевая",
                "color_weft": "оранжевая",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 97,
                "sleeve_width": 128,
                "sleeve_density": 110,
                "w_d": "128/110",
                "fabric_recipe_id": 33,
                "model_of_the_loom_id": 3,
                "q_warp": "1000",
                "q_weft": "36.0",
                "d_warp": "140",
                "d_weft": "140",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 98,
                "sleeve_width": 128,
                "sleeve_density": 110,
                "w_d": "128/110",
                "fabric_recipe_id": 33,
                "model_of_the_loom_id": 3,
                "q_warp": "1000",
                "q_weft": "36.0",
                "d_warp": "140",
                "d_weft": "140",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            },
            {
                "loom_number": 99,
                "sleeve_width": 128,
                "sleeve_density": 110,
                "w_d": "128/110",
                "fabric_recipe_id": 33,
                "model_of_the_loom_id": 3,
                "q_warp": "1000",
                "q_weft": "36.0",
                "d_warp": "140",
                "d_weft": "140",
                "color_warp": "цветная",
                "color_weft": "цветная",
                "additive_warp": "нет",
                "additive_weft": "нет",
                "warp": "нет",
                "weft": "нет"
            }
        ]

        console.log(allNumbers);

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