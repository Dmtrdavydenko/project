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
        const result = await fetch("https://worktime.up.railway.app/textile", {
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


















































































// Массив для хранения координат кликов
let clicks = [];

let canvas = document.querySelector('canvas.maplibregl-canvas');
let clickEventTg = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
});
clickEventTg._isTrusted = true;
let pin = document.querySelector('button.btn.btn-circle.btn-sm.btn-ghost');
// pin.dispatchEvent(clickEventTg);
// let clickEvent = new MouseEvent('click', {
//     bubbles: true,
//     cancelable: true,
//     clientX: 177,
//     clientY: 209,
//     button: 0,
//     buttons: 0,
//     view: window
// });
// clickEvent._isTrusted = true;
// canvas.dispatchEvent(clickEvent);
function run() {
    let count = 0;
    let clientX = 74;
    let clientY = 31;


    const randomInterval2 = Math.floor(Math.random() * 2000) + 1000;

    const interval = setInterval(() => {
        if (count < 15) {
            // Генерируем случайный интервал от 1 до 3 секунд
            // const randomInterval = Math.floor(Math.random() * 2000) + 2000;
            const randomInterval = 1000;



            let newClick = new MouseEvent('click', {
                clientX: clientX,
                clientY: clientY,
                bubbles: true,
                cancelable: true,
                button: 0,
                buttons: 0,
                view: window
            });
            newClick._isTrusted = true;



            setTimeout(() => {
                // Добавляем смещение (можно изменить логику добавления)
                // const newX = targetClick.clientX + (count * maxDelta);
                // const newY = targetClick.clientY + (count + 1);

                // console.log(`Смещение ${count + 1}: Новые координаты X=${newX}, Y=${newY}`);

                // Можно также отправить новый клик с этими координатами

                pin.dispatchEvent(clickEventTg);



                setTimeout(() => {
                    canvas.dispatchEvent(newClick);


                    setTimeout(() => {
                        canvas.dispatchEvent(newClick);
                        clientX += 62;

                    }, randomInterval);

                }, randomInterval);

            }, randomInterval);






            count++;
        } else {
            clearInterval(interval);
            console.log('Таймер завершён. 10 смещений добавлено.');
        }
    }, 3000); // Интервал в 1 секунду
}
// run();


// Функция для записи кликов
function recordClicks() {
    document.addEventListener('click', function (event) {
        // Сохраняем координаты клика
        clicks.push({
            clientX: event.clientX,
            clientY: event.clientY,
            timestamp: Date.now()
        });

        console.log(`Клик записан: X=${event.clientX}, Y=${event.clientY}`);

        // Если записано 2 клика, запускаем обработку
        if (clicks.length === 2) {

            const click1 = clicks[0];
            const click2 = clicks[1];

            // Вычисляем разницу между смещениями
            const deltaX = Math.abs(click1.clientX - click2.clientX);
            const deltaY = Math.abs(click1.clientY - click2.clientY);

            // Определяем большее смещение
            const maxDelta = Math.max(deltaX, deltaY);
            console.log(`Разница по X: ${deltaX}, по Y: ${deltaY}, максимальная: ${maxDelta}`);

            // Определяем, к какому клику прибавлять смещение (к тому, у которого больше координата)
            const targetClick = click1.clientX + click1.clientY > click2.clientX + click2.clientY ? click1 : click2;
            console.log(`Будем добавлять смещение к клику: X=${targetClick.clientX}, Y=${targetClick.clientY}`);
            clicks.length = 0;
        }
    });
}


// Запускаем запись кликов
// recordClicks();


function run2() {
    let countX = 0;
    let countY = 0;
    let clientX = 74;
    let clientY = 31;

    const totalXPasses = 14;
    const totalYPasses = 1;

    const interval = setInterval(() => {
        if (countY < totalYPasses) {
            if (countX < totalXPasses) {
                const randomInterval = 1000;
                let newClick = new MouseEvent('click', {
                    clientX: clientX,
                    clientY: clientY,
                    bubbles: true,
                    cancelable: true,
                    button: 0,
                    buttons: 0,
                    view: window
                });
                newClick._isTrusted = true;

                setTimeout(() => {
                    pin.dispatchEvent(clickEventTg);
                    setTimeout(() => {
                        console.log("pin", newClick.clientX, newClick.clientY)
                        canvas.dispatchEvent(newClick);
                        setTimeout(() => {
                            canvas.dispatchEvent(newClick);
                            // Увеличиваем X для следующей итерации
                            countX++;

                            setTimeout(() => {
                                clientX += 62;
                            }, randomInterval);

                            console.log(`Проход: X=${countX}/${totalXPasses}, Y=${countY + 1}/${totalYPasses}, Координаты: X=${clientX}, Y=${clientY}`);

                        }, randomInterval);
                    }, randomInterval);
                }, randomInterval);

            } else {
                // Завершили проход по X, переходим к следующему Y
                countX = 0;
                countY++;
                clientX = 74; // Сбрасываем X в начальное положение
                clientY += 62; // Увеличиваем Y

                console.log(`Переход к следующему ряду Y: ${countY}/${totalYPasses}`);
            }
        } else {
            clearInterval(interval);
            console.log('Завершено! Сетка 15×8 обработана.');
        }
    }, 1500);
}

run2();








let countY = 0; // Счетчик выполнений
const totalExecutions = 10; // Общее количество выполнений

const interval = setInterval(() => {
    if (countY < totalExecutions) {
        // Здесь можно добавить код, который будет выполняться в каждом интервале
        console.log(`Выполнение ${countY + 1}`);
        countY++; // Увеличиваем счетчик
    } else {
        clearInterval(interval);
        console.log('Завершено! Сетка 15×8 обработана.');
    }
}, 1500);
