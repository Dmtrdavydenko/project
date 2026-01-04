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
(async () => {
    async function showTableFn() {
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

        const container = document.getElementById('table-container');
        container.innerHTML = '';

        if (result.rows) {
            const table = createTable(result.rows);
            container.appendChild(table);
        } else {
            container.textContent = 'U';
        }
    }
    showTableFn()
})();

















































































// const canvas = document.createElement('canvas');
// canvas.style.position = "absolute";
// canvas.style.top = "0px";
// canvas.style.left = "0px";
// canvas.style.backgroundColor = "rgba(0, 0, 0, .3)";
//   canvas.width = 800;
//   canvas.height = 600;
//   canvas.style.imageRendering = 'pixelated';
//   document.body.appendChild(canvas);
//   const ctx = canvas.getContext('2d');
//   ctx.imageSmoothingEnabled = false;
//   ctx.fillStyle = 'red';
//   const centerX = Math.floor(canvas.width / 2);
//   const centerY = Math.floor(canvas.height / 2);
//   // ctx.fillRect(centerX, centerY, 1, 1);
// let dx0 = 15;
// let dy0 = 15;
// for (let y = 0; y < 38; y++) {
//     for (let x = 0; x < 38; x++) {
//         ctx.fillRect(dx0*x, dy0*y, 2, 2);
//     }
// }
// document.body.append(canvas);
// const showB = document.createElement('button');
// showB.textContent = "W";
// showB.style.position = "absolute";
// showB.style.top = "500px";
// showB.style.left = "800px";
// showB.addEventListener("click",function (){
//     if(canvas.style.display === "none")
//     canvas.style.display = "";
//     else
//     canvas.style.display = "none";     
// })
// document.body.append(showB);
// let clickEventTg = new MouseEvent('click', {
//     bubbles: true,
//     cancelable: true,
//     view: window
// });
// clickEventTg._isTrusted = true;
// let pin = document.querySelector('button.btn.btn-circle.btn-sm.btn-ghost');
// pin.dispatchEvent(clickEventTg);


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function dispatchClicks() {
    const canvas = document.querySelector('canvas.maplibregl-canvas');
    const pin = document.querySelector('button.btn.btn-circle.btn-sm.btn-ghost');

    const repeatCount = 38; // Количество повторений последовательности
    const elements = [pin, canvas, canvas];

    let clickEventTg = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    clickEventTg._isTrusted = true;
    const events = [clickEventTg, newClick, newClick];


    let dx0 = 15;
    let dy0 = 15;
    for (let y = 0; y < repeatCount; y++) {
        for (let x = 0; x < repeatCount; x++) {
            // ctx.fillRect(dx0*x, dy0*y, 5, 5);     
            let newClick = new MouseEvent('click', {
                clientX: dx0 * x,
                clientY: dy0 * y,
                bubbles: true,
                cancelable: true,
                button: 0,
                buttons: 0,
                view: window
            });
            newClick._isTrusted = true;
            events[1] = newClick;
            events[2] = newClick;
            // console.warn(`Цикл: y=${y}, x=${x} | Координаты: clientX=${newClick.clientX}, clientY=${newClick.clientY}`);
            for (let i = 0; i < elements.length; i++) {
                elements[i].dispatchEvent(events[i]);
                console.log("tick");

                // Задержка 1 секунда после каждого события
                let delayMS = 100 + Math.random() * 500
                await delay(delayMS);
            }

        }
    }
    console.warn("Все события завершены!");
}

// Запускаем
dispatchClicks();






































// transform: translate(-50%, -50%) translate(991px, 668px) rotateX(0deg) rotateZ(0deg);









// const canvas = document.createElement('canvas');
// canvas.style.position = "absolute";
// canvas.style.top = "0px";
// canvas.style.left = "0px";
// canvas.style.backgroundColor = "rgba(0, 0, 0, .3)";
//   canvas.width = 800;
//   canvas.height = 600;
//   canvas.style.imageRendering = 'pixelated';
//   document.body.appendChild(canvas);
//   const ctx = canvas.getContext('2d');
//   ctx.imageSmoothingEnabled = false;
//   ctx.fillStyle = 'red';
//   const centerX = Math.floor(canvas.width / 2);
//   const centerY = Math.floor(canvas.height / 2);
//   // ctx.fillRect(centerX, centerY, 1, 1);
// let dx0 = 15;
// let dy0 = 15;
// for (let y = 0; y < 38; y++) {
//     for (let x = 0; x < 38; x++) {
//         ctx.fillRect(dx0*x, dy0*y, 2, 2);
//     }
// }
// document.body.append(canvas);
// const showB = document.createElement('button');
// showB.textContent = "W";
// showB.style.position = "absolute";
// showB.style.top = "500px";
// showB.style.left = "800px";
// showB.addEventListener("click",function (){
//     if(canvas.style.display === "none")
//     canvas.style.display = "";
//     else
//     canvas.style.display = "none";     
// })
// document.body.append(showB);
// let clickEventTg = new MouseEvent('click', {
//     bubbles: true,
//     cancelable: true,
//     view: window
// });
// clickEventTg._isTrusted = true;
// let pin = document.querySelector('button.btn.btn-circle.btn-sm.btn-ghost');
// pin.dispatchEvent(clickEventTg);


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function dispatchClicks() {
    const canvas = document.querySelector('canvas.maplibregl-canvas');
    const pin = document.querySelector('button.btn.btn-circle.btn-sm.btn-ghost');

    const repeatCount = 38; // Количество повторений последовательности
    const elements = [pin, canvas, canvas];

    let clickEventTg = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
    });
    clickEventTg._isTrusted = true;
    const events = [clickEventTg];


    let dx0 = 15;
    let dy0 = 15;
    for (let y = 0; y < 11; y++) {
        for (let x = 0; x < 11; x++) {
            // ctx.fillRect(dx0*x, dy0*y, 5, 5);     
            let newClick = new MouseEvent('click', {
                clientX: dx0 * x,
                clientY: dy0 * y,
                bubbles: true,
                cancelable: true,
                button: 0,
                buttons: 0,
                view: window
            });
            newClick._isTrusted = true;
            events[1] = newClick;
            events[2] = newClick;
            // console.warn(`Цикл: y=${y}, x=${x} | Координаты: clientX=${newClick.clientX}, clientY=${newClick.clientY}`);
            for (let i = 0; i < elements.length; i++) {
                elements[i].dispatchEvent(events[i]);
                console.log("tick");

                // Задержка 1 секунда после каждого события
                let delayMS = 200 + Math.random() * 800
                await delay(delayMS);
            }

        }
    }
    console.warn("Все события завершены!");
}

// Запускаем
dispatchClicks();


