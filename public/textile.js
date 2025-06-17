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
send.textContent = "Send";


const dropInput = document.createElement("input");
dropInput.type = "text";


const drop = document.createElement("button");
drop.textContent = "Delite";

const getAllTablesName = document.createElement("button");
getAllTablesName.textContent = "Получить имена всех таблиц";

main.append(id);
main.append(width);
main.append(density);
main.append(send);
main.append(dropInput);
main.append(drop);
main.append(getAllTablesName);


function Textile(inputId,inputWidth, inputDensity) {
    this.id = inputId.valueAsNumber;
    this.width = inputWidth.valueAsNumber;
    this.density = inputDensity.valueAsNumber;
}
send.addEventListener("click", async function (e) {
    const result = await fetch("https://worktime.up.railway.app/textile", {
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
    }).then((response) => response.json());

    const container = document.getElementById('table-container');
    container.innerHTML = '';

    if (result.rows) {
        const table = createTable(result.rows);
        container.appendChild(table);
    } else {
        container.textContent = 'U';
    }
});

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

getAllTablesName.addEventListener("click", async function (e) {
    const result = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "getAllTableNames"
        }),
    }).then((response) => response.json());
    console.log(result);
});




//(async () => {

//        const result = await fetch("https://worktime.up.railway.app/textile", {
//            method: "POST",
//            headers: {
//                "Content-Type": "application/json;charset=utf-8",
//            },
//            body: JSON.stringify({
//                action: "select",
//                table: {
//                    name: "textileK",
//                },
//            }),
//        }).then((response) => response.json());

//        const container = document.getElementById('table-container');
//        container.innerHTML = '';

//        if (result.rows) {
//            const table = createTable(result.rows);
//            container.appendChild(table);
//        } else {
//            container.textContent = 'U';
//        }

//})();
