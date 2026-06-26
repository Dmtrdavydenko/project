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
    console.log(data);
    try {

        const response = await fetch("/api/weaving_logs/insert", {

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
const dataRowOl = [
    {
        "fabric_recipe_id": 3,
        "sleeve_width": 36,
        "sleeve_density": 65,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "35.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 3,
        "sleeve_width": 36,
        "sleeve_density": 65,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "260.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 38,
        "sleeve_width": 36,
        "sleeve_density": 65,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "35.2",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 38,
        "sleeve_width": 36,
        "sleeve_density": 65,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "254.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 39,
        "sleeve_width": 38,
        "sleeve_density": 75,
        "yarn_name": "weft",
        "tape_density": 105,
        "quantity": "34.5",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 39,
        "sleeve_width": 38,
        "sleeve_density": 75,
        "yarn_name": "warp",
        "tape_density": 105,
        "quantity": "280.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 4,
        "sleeve_width": 39,
        "sleeve_density": 68,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "35.5",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 4,
        "sleeve_width": 39,
        "sleeve_density": 68,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "282.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 2,
        "sleeve_width": 40,
        "sleeve_density": 60,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "35.5",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 5,
        "sleeve_width": 40,
        "sleeve_density": 60,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "35.3",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 2,
        "sleeve_width": 40,
        "sleeve_density": 60,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "286.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 5,
        "sleeve_width": 40,
        "sleeve_density": 60,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "288.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 6,
        "sleeve_width": 40,
        "sleeve_density": 65,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "35.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 6,
        "sleeve_width": 40,
        "sleeve_density": 65,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "288.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 7,
        "sleeve_width": 42,
        "sleeve_density": 68,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "36.5",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 7,
        "sleeve_width": 42,
        "sleeve_density": 68,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "312.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 8,
        "sleeve_width": 45,
        "sleeve_density": 60,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "36.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 8,
        "sleeve_width": 45,
        "sleeve_density": 60,
        "yarn_name": "warp",
        "tape_density": 78,
        "quantity": "346.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 9,
        "sleeve_width": 47,
        "sleeve_density": 60,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "35.5",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 9,
        "sleeve_width": 47,
        "sleeve_density": 60,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "336.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 10,
        "sleeve_width": 47,
        "sleeve_density": 75,
        "yarn_name": "weft",
        "tape_density": 105,
        "quantity": "35.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 10,
        "sleeve_width": 47,
        "sleeve_density": 75,
        "yarn_name": "warp",
        "tape_density": 105,
        "quantity": "338.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 40,
        "sleeve_width": 48,
        "sleeve_density": 67,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "38.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 40,
        "sleeve_width": 48,
        "sleeve_density": 67,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "348.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 11,
        "sleeve_width": 50,
        "sleeve_density": 60,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "35.5",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 12,
        "sleeve_width": 50,
        "sleeve_density": 60,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "35.5",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 11,
        "sleeve_width": 50,
        "sleeve_density": 60,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "360.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 12,
        "sleeve_width": 50,
        "sleeve_density": 60,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "360.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 13,
        "sleeve_width": 50,
        "sleeve_density": 63,
        "yarn_name": "warp",
        "tape_density": 78,
        "quantity": "290.0",
        "color": "желтая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 14,
        "sleeve_width": 50,
        "sleeve_density": 63,
        "yarn_name": "warp",
        "tape_density": 78,
        "quantity": "290.0",
        "color": "зелёная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 14,
        "sleeve_width": 50,
        "sleeve_density": 63,
        "yarn_name": "warp",
        "tape_density": 78,
        "quantity": "72.0",
        "color": "прозрачная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 13,
        "sleeve_width": 50,
        "sleeve_density": 63,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "39.0",
        "color": "прозрачная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 13,
        "sleeve_width": 50,
        "sleeve_density": 63,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "72.0",
        "color": "прозрачная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 14,
        "sleeve_width": 50,
        "sleeve_density": 63,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "39.0",
        "color": "прозрачная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 15,
        "sleeve_width": 50,
        "sleeve_density": 64,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "39.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 15,
        "sleeve_width": 50,
        "sleeve_density": 64,
        "yarn_name": "warp",
        "tape_density": 78,
        "quantity": "400.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 1,
        "sleeve_width": 50,
        "sleeve_density": 65,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "35.5",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 1,
        "sleeve_width": 50,
        "sleeve_density": 65,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "360.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 16,
        "sleeve_width": 50,
        "sleeve_density": 65,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "35.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 16,
        "sleeve_width": 50,
        "sleeve_density": 65,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "360.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 41,
        "sleeve_width": 50,
        "sleeve_density": 70,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "38.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 41,
        "sleeve_width": 50,
        "sleeve_density": 70,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "378.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 17,
        "sleeve_width": 50,
        "sleeve_density": 72,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "38.5",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 17,
        "sleeve_width": 50,
        "sleeve_density": 72,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "378.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 18,
        "sleeve_width": 50,
        "sleeve_density": 75,
        "yarn_name": "weft",
        "tape_density": 105,
        "quantity": "35.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 18,
        "sleeve_width": 50,
        "sleeve_density": 75,
        "yarn_name": "warp",
        "tape_density": 105,
        "quantity": "360.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 19,
        "sleeve_width": 50,
        "sleeve_density": 75,
        "yarn_name": "weft",
        "tape_density": 105,
        "quantity": "35.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 19,
        "sleeve_width": 50,
        "sleeve_density": 75,
        "yarn_name": "warp",
        "tape_density": 105,
        "quantity": "360.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 20,
        "sleeve_width": 52,
        "sleeve_density": 72,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "38.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 20,
        "sleeve_width": 52,
        "sleeve_density": 72,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "396.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 21,
        "sleeve_width": 54,
        "sleeve_density": 80,
        "yarn_name": "weft",
        "tape_density": 110,
        "quantity": "35.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 21,
        "sleeve_width": 54,
        "sleeve_density": 80,
        "yarn_name": "warp",
        "tape_density": 110,
        "quantity": "392.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 42,
        "sleeve_width": 55,
        "sleeve_density": 64,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "37.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 42,
        "sleeve_width": 55,
        "sleeve_density": 64,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "414.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 22,
        "sleeve_width": 55,
        "sleeve_density": 66,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "36.5",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 22,
        "sleeve_width": 55,
        "sleeve_density": 66,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "432.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 23,
        "sleeve_width": 55,
        "sleeve_density": 70,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "37.5",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 23,
        "sleeve_width": 55,
        "sleeve_density": 70,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "414.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 43,
        "sleeve_width": 56,
        "sleeve_density": 60,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "35.5",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 43,
        "sleeve_width": 56,
        "sleeve_density": 60,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "404.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 24,
        "sleeve_width": 56,
        "sleeve_density": 62,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "39.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 24,
        "sleeve_width": 56,
        "sleeve_density": 62,
        "yarn_name": "warp",
        "tape_density": 78,
        "quantity": "408.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 44,
        "sleeve_width": 56,
        "sleeve_density": 67,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "19.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 44,
        "sleeve_width": 56,
        "sleeve_density": 67,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "19.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 44,
        "sleeve_width": 56,
        "sleeve_density": 67,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "422.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 25,
        "sleeve_width": 56,
        "sleeve_density": 75,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "39.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 25,
        "sleeve_width": 56,
        "sleeve_density": 75,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "456.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 26,
        "sleeve_width": 60,
        "sleeve_density": 60,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "35.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 26,
        "sleeve_width": 60,
        "sleeve_density": 60,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "428.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 45,
        "sleeve_width": 60,
        "sleeve_density": 70,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "38.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 45,
        "sleeve_width": 60,
        "sleeve_density": 70,
        "yarn_name": "warp",
        "tape_density": 90,
        "quantity": "450.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 27,
        "sleeve_width": 80,
        "sleeve_density": 95,
        "yarn_name": "weft",
        "tape_density": 105,
        "quantity": "36.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 27,
        "sleeve_width": 80,
        "sleeve_density": 95,
        "yarn_name": "warp",
        "tape_density": 105,
        "quantity": "582.0",
        "color": "белая",
        "additive": "светостаб 1,5%"
    },
    {
        "fabric_recipe_id": 28,
        "sleeve_width": 85,
        "sleeve_density": 58,
        "yarn_name": "weft",
        "tape_density": 78,
        "quantity": "35.8",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 28,
        "sleeve_width": 85,
        "sleeve_density": 58,
        "yarn_name": "warp",
        "tape_density": 78,
        "quantity": "648.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 29,
        "sleeve_width": 90,
        "sleeve_density": 75,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "36.5",
        "color": "цветная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 29,
        "sleeve_width": 90,
        "sleeve_density": 75,
        "yarn_name": "warp",
        "tape_density": 112,
        "quantity": "1000.0",
        "color": "цветная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 30,
        "sleeve_width": 100,
        "sleeve_density": 75,
        "yarn_name": "weft",
        "tape_density": 64,
        "quantity": "37.0",
        "color": "оранжевая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 30,
        "sleeve_width": 100,
        "sleeve_density": 75,
        "yarn_name": "warp",
        "tape_density": 64,
        "quantity": "710.0",
        "color": "оранжевая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 31,
        "sleeve_width": 128,
        "sleeve_density": 75,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "35.0",
        "color": "цветная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 31,
        "sleeve_width": 128,
        "sleeve_density": 75,
        "yarn_name": "warp",
        "tape_density": 112,
        "quantity": "1000.0",
        "color": "цветная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 32,
        "sleeve_width": 128,
        "sleeve_density": 85,
        "yarn_name": "weft",
        "tape_density": 90,
        "quantity": "37.0",
        "color": "цветная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 32,
        "sleeve_width": 128,
        "sleeve_density": 85,
        "yarn_name": "warp",
        "tape_density": 112,
        "quantity": "684.0",
        "color": "цветная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 33,
        "sleeve_width": 128,
        "sleeve_density": 110,
        "yarn_name": "weft",
        "tape_density": 140,
        "quantity": "36.0",
        "color": "цветная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 33,
        "sleeve_width": 128,
        "sleeve_density": 110,
        "yarn_name": "warp",
        "tape_density": 140,
        "quantity": "1000.0",
        "color": "цветная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 34,
        "sleeve_width": 150,
        "sleeve_density": 85,
        "yarn_name": "weft",
        "tape_density": 112,
        "quantity": "36.0",
        "color": "цветная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 34,
        "sleeve_width": 150,
        "sleeve_density": 85,
        "yarn_name": "warp",
        "tape_density": 112,
        "quantity": "1150.0",
        "color": "цветная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 35,
        "sleeve_width": 150,
        "sleeve_density": 110,
        "yarn_name": "weft",
        "tape_density": 140,
        "quantity": "39.5",
        "color": "цветная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 35,
        "sleeve_width": 150,
        "sleeve_density": 110,
        "yarn_name": "warp",
        "tape_density": 140,
        "quantity": "1150.0",
        "color": "цветная",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 36,
        "sleeve_width": 160,
        "sleeve_density": 180,
        "yarn_name": "weft",
        "tape_density": 220,
        "quantity": "47.5",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 36,
        "sleeve_width": 160,
        "sleeve_density": 180,
        "yarn_name": "warp",
        "tape_density": 220,
        "quantity": "1154.0",
        "color": "белая",
        "additive": "нет"
    },
    {
        "fabric_recipe_id": 37,
        "sleeve_width": 190,
        "sleeve_density": 160,
        "yarn_name": "warp",
        "tape_density": 170,
        "quantity": "1374.0",
        "color": "белая",
        "additive": "светостаб 2%"
    },
    {
        "fabric_recipe_id": 37,
        "sleeve_width": 190,
        "sleeve_density": 160,
        "yarn_name": "weft",
        "tape_density": 220,
        "quantity": "38.5",
        "color": "белая",
        "additive": "светостаб 2%"
    }
]
console.log(dataRowOl);
let objo = {
    "fabric_recipe_id": 3,
    "sleeve_width": 36,
    "sleeve_density": 65,
    "yarn_name": "weft",
    "tape_density": 90,
    "quantity": "35.0",
    "color": "белая",
    "additive": "нет"
}
class SleeveWidthDensityInfo {
    //constructor(table) {
    //    this.table = table;

    //}
    constructor(row) {
        Object.assign(this, row);
    }
    get id() { return this.fabric_recipe_id; }
    get sleeve_width_id() { return this.sleeve_width_id; }
    get sleeve_density_id() { return this.sleeve_density_id; }
    get width() { return this.sleeve_width; }
    get density() { return this.sleeve_density; }
    //get tape_density() { return this.tape_density; }
}



//const grid = document.createElement('div');
const grid = document.getElementById("recipeSelect");
grid.classList.add("container-grid");

//const uniqueSleeveWidths = [];
//const seen = new Set();
//for (const item of dataRowOl) {
//    if (!seen.has(item.sleeve_width)) {
//        seen.add(item.sleeve_width);
//        uniqueSleeveWidths.push(item);
//    }
//}
//console.log({ uniqueSleeveWidths });
//let numbers = [];
//let lastVal = 0;
//let currentRow = null;
//let str = "";
//uniqueSleeveWidths.forEach(obj => {
//    const btn = document.createElement("button");
//    btn.classList.add("select-button");
//    btn.classList.add("tach-button");

//    const sleeve = new SleeveWidthDensityInfo(obj);
//    btn.id = sleeve.id;
//    btn.textContent = sleeve.width;
//    numbers.push((sleeve.width / 10) | 0);

//    btn.addEventListener("click", () => {
//        str += btn.textContent;
//        const filteredByWidth = dataRow.filter(item => item.sleeve_width === Number(btn.textContent));
//        console.log(filteredByWidth);
//        grid.innerHTML = str ||"";

//        const uniqueSleeveDensity = [];
//        const seen = new Set();
//        for (const item of filteredByWidth) {
//            if (!seen.has(item.sleeve_density)) {
//                seen.add(item.sleeve_density);
//                uniqueSleeveDensity.push(item);
//            }
//        }
//        console.log({ uniqueSleeveDensity });

//        let currentRow = null;
//        let lastVal = 0;
//        uniqueSleeveDensity.forEach(obj => {

//            const density = document.createElement("button");
//            density.classList.add("select-button");
//            density.classList.add("tach-button");

//            const sleeve = new SleeveWidthDensityInfo(obj);
//            density.id = sleeve.id;
//            density.textContent = sleeve.density;

//            density.addEventListener("click", () => {
//                str += "/"+density.textContent;
//                const filteredByTape = filteredByWidth.filter(item => item.sleeve_density === Number(density.textContent));
//                console.log(filteredByTape);
//                grid.innerHTML = str||"";
//                const grouped = new Map();
//                filteredByTape.forEach(item => {
//                    if (!grouped.has(item.fabric_recipe_id)) {
//                        grouped.set(item.fabric_recipe_id, []);
//                    }
//                    grouped.get(item.fabric_recipe_id).push(item);
//                });
//                const ids = [...grouped.keys()];;
//                console.log(ids, grouped);
//                ids.forEach(id => {
//                    const items = grouped.get(id);
//                    const label = document.createElement('label');

//                    label.innerHTML = `
//                    <input type="radio" name="recipe" value="${id}">

//                    <div>
//                        ${items.map(item => `
//                            <div>
//                                ${item.yarn_name} |
//                                ${item.tape_density} |
//                                ${item.quantity} |
//                                ${item.color} |
//                                ${item.additive}
//                            </div>
//                        `).join('')}
//                    </div>
//                `;

//                    grid.appendChild(label);
//                });
//                grid.addEventListener('change', (e) => {
//                    const id = e.target.value;
//                    const items = grouped.get(Number(id));
//                    console.log(items);
//                    recipe.value = Number(id);
//                    if (!items) return;
//                });
//            })
//            const group = sleeve.density < 100 ? (sleeve.density / 10) | 0 : (sleeve.density / 100) | 0;
//            if (group !== lastVal) {
//                currentRow = document.createElement("div");
//                currentRow.classList.add("row");
//                grid.appendChild(currentRow);
//                lastVal = group;
//            }

//            currentRow.appendChild(density);
//        })
//    })
//    const group = sleeve.width < 100 ? (sleeve.width / 10) | 0 : (sleeve.width / 100) | 0;


//    if (group !== lastVal) {
//        currentRow = document.createElement("div");
//        currentRow.classList.add("row");
//        grid.appendChild(currentRow);
//        lastVal = group;
//    }

//    currentRow.appendChild(btn);

//});

//console.log({ numbers });





(async (api) => {

    const response = await fetch(api);
    if (!response.ok) throw new Error("");
    const data = await response.json();
    const dataRow = data.fabric_recipe;
    console.log({ response, dataRow });
    fio.value = data.profile.fio;

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
    let str = "";
    uniqueSleeveWidths.forEach(obj => {
        const btn = document.createElement("button");
        btn.classList.add("select-button");
        btn.classList.add("tach-button");

        const sleeve = new SleeveWidthDensityInfo(obj);
        btn.id = sleeve.id;
        btn.textContent = sleeve.width;
        numbers.push((sleeve.width / 10) | 0);

        btn.addEventListener("click", () => {
            str += btn.textContent;
            const filteredByWidth = dataRow.filter(item => item.sleeve_width === Number(btn.textContent));
            console.log(filteredByWidth);
            grid.innerHTML = str || "";

            const uniqueSleeveDensity = [];
            const seen = new Set();
            for (const item of filteredByWidth) {
                if (!seen.has(item.sleeve_density)) {
                    seen.add(item.sleeve_density);
                    uniqueSleeveDensity.push(item);
                }
            }
            console.log({ uniqueSleeveDensity });

            let currentRow = null;
            let lastVal = 0;
            uniqueSleeveDensity.forEach(obj => {

                const density = document.createElement("button");
                density.classList.add("select-button");
                density.classList.add("tach-button");

                const sleeve = new SleeveWidthDensityInfo(obj);
                density.id = sleeve.id;
                density.textContent = sleeve.density;

                density.addEventListener("click", () => {
                    str += "/" + density.textContent;
                    const filteredByTape = filteredByWidth.filter(item => item.sleeve_density === Number(density.textContent));
                    console.log(filteredByTape);
                    grid.innerHTML = str || "";
                    const grouped = new Map();
                    filteredByTape.forEach(item => {
                        if (!grouped.has(item.fabric_recipe_id)) {
                            grouped.set(item.fabric_recipe_id, []);
                        }
                        grouped.get(item.fabric_recipe_id).push(item);
                    });
                    const ids = [...grouped.keys()];;
                    console.log(ids, grouped);
                    ids.forEach(id => {
                        const items = grouped.get(id);
                        const label = document.createElement('label');

                        label.innerHTML = `
                    <input type="radio" name="recipe" value="${id}">

                    <div>
                        ${items.map(item => `
                            <div>
                                ${item.yarn_name} |
                                ${item.tape_density} |
                                ${item.quantity} |
                                ${item.color} |
                                ${item.additive}
                            </div>
                        `).join('')}
                    </div>
                `;

                        grid.appendChild(label);
                    });
                    grid.addEventListener('change', (e) => {
                        const id = e.target.value;
                        const items = grouped.get(Number(id));
                        console.log(items);
                        recipe.value = Number(id);
                        if (!items) return;
                    });
                })
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

    return data;
})("/api/fabric_recipe/select")
    .then(data => {
        //const test = data.permissions.map(i => `<div class="label">${i.permission_name}</div><div>${i.description}</div>`).join("");
        //console.log(test);
        //permission.innerHTML = test;
        //console.log(data);
    })