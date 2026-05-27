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