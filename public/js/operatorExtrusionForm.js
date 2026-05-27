console.log(fio);
console.log(DateTime);
console.log(smena);
console.log(extrusion);
console.log(density);
console.log(type1);
console.log(type2);
console.log(planWeight);
console.log(actWeight);
console.log(slop);
console.log(time);
console.log(text);
function form1() {
    this.fio = fio.value
    this.DateTime = DateTime.value
    this.smena = smena.value
    this.extrusion = extrusion.value
    this.density = density.value
    this.type1 = type1.checked
    this.type2 = type2.checked
    this.type = type1.checked ? 1 : type2.checked ? 2 : false
    this.planWeight = planWeight.value
    this.actWeight = actWeight.value
    this.slop = slop.value
    this.time = time.value
    this.text = text.value
}
console.log(new form1());
form.addEventListener("submit", async function (event) {

    event.preventDefault();
    const data = new form1();
    console.log(data);
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