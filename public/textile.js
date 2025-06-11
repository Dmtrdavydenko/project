console.log("textile");
console.log(document.location.href);







const id = document.createElement("input");
id.type = "number";
id.min = 1;
id.step = 1;
const width = document.createElement("input");
width.type = "number";
width.min = 0;
width.step = 1;
const density = document.createElement("input");
density.type = "number";
density.min = 0;
density.step = 1;


const send = document.createElement("button");
send.textContent = "Send"


main.append(id);
main.append(width);
main.append(density);
main.append(send);
function Textile(inputId,inputWidth, inputDensity) {
    this.id = inputId.valueAsNumber;
    this.width = inputWidth.valueAsNumber;
    this.density = inputDensity.valueAsNumber;
}
send.addEventListener("click", async function (e) {
    fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "insert",
            table: {
                name: "textile",
            },
            data: new Textile(id, width, density)
        }),
    })

        .then((response) => response.json())
        .then(console.log)
})