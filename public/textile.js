console.log("textile");
console.log(document.location.href);








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


main.append(width);
main.append(density);
main.append(send);
function Textile(InputWidth,inputDensity){
    this.width = InputWidth.valueAsNumber;
    this.density = inputDensity.valueAsNumber;
}
send.addEventListener("click", async function (e) {
    fetch(document.location.href, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        action: "insert",
        table: {
          name: "textile",
        },
        data: new Textile(width,density)
      }),
    })
        .then((response) => response.json())
      .then(console.log)
})