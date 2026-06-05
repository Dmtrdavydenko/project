console.log(fio);
console.log(DateTime);
console.log(smena);
console.log(loom);
console.log(recipe);
console.log(product);
function form1() {
    this.fio = fio.value;
    this.dateTime = DateTime.valueAsNumber;
    this.smena = smena.value;
    this.loom = loom.value;
    this.recipe = recipe.value;
    this.product = product.value;
}
console.log(new form1());
form.addEventListener("submit", async function (event) {

    event.preventDefault();
    const data = new form1();

    try {

        const response = await fetch("/app", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data),

        });

        const result = await response.json();
        console.log(result);


        //result.message || "Успешно";
        btn.innerText = 0 || "Успешно";

    }
    catch (error) {
        btn.innerText = "Ошибка соединения с сервером";
        console.error(error);
    }

});
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



//const grid = document.createElement('div');
const grid = document.getElementById("recipeSelect");
grid.classList.add("container-grid");

const uniqueSleeveWidths = [];
const seen = new Set();
for (const item of dataRow) {
    if (!seen.has(item.sleeve_width)) {
        seen.add(item.sleeve_width);
        uniqueSleeveWidths.push(item);
    }
}
console.log({ uniqueSleeveWidths });
let numbers = [];
let lastVal = 0;
let currentRow = null;
uniqueSleeveWidths.forEach(obj => {
    const btn = document.createElement("button");
    btn.classList.add("select-button");
    btn.classList.add("tach-button");

    const sleeve = new SleeveWidthDensityInfo(obj);
    btn.id = sleeve.id;
    btn.textContent = sleeve.width;
    numbers.push((sleeve.width / 10) | 0);

    btn.addEventListener("click", () => {
        const filteredByWidth = dataRow.filter(item => item.sleeve_width === Number(btn.textContent));
        console.log(filteredByWidth);
        grid.innerHTML = "";

        let currentRow = null;
        let lastVal = 0;
        filteredByWidth.forEach(obj => {


            const density = document.createElement("button");
            density.classList.add("select-button");
            density.classList.add("tach-button");

            const sleeve = new SleeveWidthDensityInfo(obj);
            density.id = sleeve.id;
            density.textContent = sleeve.density;

            const group = sleeve.density < 100 ? (sleeve.density / 10) | 0 : (sleeve.density / 100) | 0;


            if (group !== lastVal) {
                currentRow = document.createElement("div");
                currentRow.classList.add("row");
                grid.appendChild(currentRow);
                lastVal = group;
            }

            currentRow.appendChild(density);
        })
    })
    const group = sleeve.width < 100 ? (sleeve.width / 10) | 0 : (sleeve.width / 100) | 0;


    if (group !== lastVal) {
        currentRow = document.createElement("div");
        currentRow.classList.add("row");
        grid.appendChild(currentRow);
        lastVal = group;
    }

    currentRow.appendChild(btn);

});

console.log({ numbers });



//document.body.append(grid);
