function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}
function isIPhone() {
    return /iPhone/i.test(navigator.userAgent);
}
if (isIPhone()) {
    document.body.classList.add("android");
    console.log("This device is an iPhone.");
} else {
    console.log("This device is not an iPhone.");
}
if (isAndroid()) {
    document.body.classList.add("android");
    console.log("This device is an Android.");
} else {
    console.log("This device is not an Android.");
}
function create3() {
    const TimeStart = document.createElement("input");
    TimeStart.type = "time";
    TimeStart.valueAsNumber = 28800000;

    TimeStart.addEventListener("input", handleInput2);
    TimeStart.addEventListener("pointerdown", handleInput2);
    TimeStart.addEventListener("change", handleInput2);

    const TimeEnd = document.createElement("input");
    TimeEnd.type = "time";
    TimeEnd.valueAsNumber = 67200000;

    const sum = document.createElement("input");
    sum.type = "time";
    sum.valueAsNumber = TimeStart.valueAsNumber;
    sum.addEventListener("getSum", function (e) {
        this.valueAsNumber = getListTimeSum(TimeStart.valueAsNumber);
        // console.log(this,"Sum");
    });
    const fix = document.createElement("input");
    fix.type = "time";
    fix.valueAsNumber = TimeStart.valueAsNumber;
    fix.addEventListener("getSum", function (e) {
        this.valueAsNumber = getListTimeSum(TimeStart.valueAsNumber);
        // console.log(this,"Sum");
    });

    let dx1 = document.createElement("input");
    dx1.type = "number";
    dx1.valueAsNumber = (TimeEnd.valueAsNumber - TimeStart.valueAsNumber) / 60000;
    dx1.addEventListener("getSum", function (e) {
        this.value =
            quantity.value > 0
                ? (TimeEnd.valueAsNumber - getListTimeSum(TimeStart.valueAsNumber)) /
                60000 /
                quantity.value
                : (TimeEnd.valueAsNumber - getListTimeSum(TimeStart.valueAsNumber)) /
                60000;
        // console.log(this,"Sum");
    });

    const TimeDx = document.createElement("input");
    TimeDx.type = "time";
    TimeDx.valueAsNumber = TimeEnd.valueAsNumber - TimeStart.valueAsNumber;
    TimeDx.addEventListener("getSum", function (e) {
        this.valueAsNumber =
            quantity.value > 0
                ? (TimeEnd.valueAsNumber - getListTimeSum(TimeStart.valueAsNumber)) /
                quantity.value
                : TimeEnd.valueAsNumber - getListTimeSum(TimeStart.valueAsNumber);
        // console.log(this,"Sum");
    });

    let quan = document.createElement("input");
    quan.type = "number";
    quan.value = 1;
    quan.min = 1;

    quan.addEventListener("input", handleInput2);
    quan.addEventListener("pointerdown", handleInput2);
    quan.addEventListener("change", handleInput2);
    return { TimeStart, TimeEnd, TimeDx, dx1, sum, fix, quan };
}
function time12(time) {
    if (time < 46800000) {
        return time;
    } else {
        return time - 43200000;
    }
}
const INIT_INPUT_DATA = create3();
const start = INIT_INPUT_DATA.TimeStart;
const end = INIT_INPUT_DATA.TimeEnd;
const timeDx = INIT_INPUT_DATA.TimeDx;
const dx = INIT_INPUT_DATA.dx1;
// dx.classList.add("fixed-menu");
const summa = INIT_INPUT_DATA.sum;
const summaFix = INIT_INPUT_DATA.fix;
const quantity = INIT_INPUT_DATA.quan;
// main.append(start);
// main.append(end);
const buttonLine = [];
const buttonRow = [];

for (let j = 0; j < 27; j++) {
    buttonLine.push([]);
}

let infoTime = [];
const getSum = new CustomEvent("getSum", {
    bubbles: true, // Позволяет событию всплывать
    cancelable: true, // Позволяет событию быть отменяемым
});

function handleInput2(event) {
    summa.dispatchEvent(getSum);
    dx.dispatchEvent(getSum);
    timeDx.dispatchEvent(getSum);
    summaFix.dispatchEvent(getSum);
}

const DeviceOrientationEvent = document.createElement("div");
main.append(DeviceOrientationEvent);

const DeviceMotionEvent = document.createElement("div");
main.append(DeviceMotionEvent);

{
    function handleInputTime(event) {
        // console.log("event");
        const buttons = buttonRow[this.name];
        for (let button of buttons) {
            button.textContent = this.value;
            button.value = this.valueAsNumber;
        }
        summa.dispatchEvent(getSum);
        dx.dispatchEvent(getSum);
        timeDx.dispatchEvent(getSum);
    }

    const ul = document.createElement("ul");
    const m = document.createElement("td");
    const v = document.createElement("td");
    const t = document.createElement("td");
    const calculateButton = document.createElement("button");
    calculateButton.textContent = "Вычислить";
    calculateButton.style.display = "block";

    // calc.style.marginLeft = 6 + "px";

    const trm = document.createElement("tr");
    const trv = document.createElement("tr");
    const trt = document.createElement("tr");

    const labelm = document.createElement("label");
    const labelv = document.createElement("label");
    const labelt = document.createElement("label");

    labelm.textContent = "Метр";
    labelv.textContent = "Скорость";
    labelt.textContent = "Время";

    const ltrm = document.createElement("td");
    const ltrv = document.createElement("td");
    const ltrt = document.createElement("td");

    ltrm.append(labelm);
    ltrv.append(labelv);
    ltrt.append(labelt);

    const table = document.createElement("table");

    const eve = new CustomEvent("calc", {
        bubbles: true, // Позволяет событию всплывать
        cancelable: true, // Позволяет событию быть отменяемым
    });

    const ol = document.createElement("ol");

    // ol.append(start, end);

    for (let i = 0; i < 23; i++) {
        const li = document.createElement("li");
        li.id = i;
        // loatd
        li.addEventListener("click", function (e) {
            if (!e.target.closest("button")) return;
            if (list[this.id] === e.target) {
                e.target.classList.remove("tg");
                delete list[this.id];
            } else {
                list[this.id] && list[this.id].classList.remove("tg");
                list[this.id] = e.target;
                e.target.classList.add("tg");
            }
            handleInput2(event);
            // let sum = getListTimeSum();

            // timeDx.valueAsNumber = end.valueAsNumber - sum - start.valueAsNumber;
            // summa.valueAsNumber = sum + start.valueAsNumber;
            // dx.value = (end.valueAsNumber - sum - start.valueAsNumber) / 60000;
            // console.log(end.valueAsNumber - sum - start.valueAsNumber);
        });
        ol.append(li);
    }

    const btn = [];
    for (let i = 0; i < 7; i++) {
        buttonRow.push([]);
        //  calc
        const distance = document.createElement("input");
        distance.type = "number";
        m.append(distance);
        const speed = document.createElement("input");
        speed.type = "number";
        v.append(speed);
        const time = document.createElement("input");
        time.name = i;
        time.type = "time";
        t.append(time);

        infoTime.push(time);

        distance.addEventListener("calc", function (e) {
            if (speed.valueAsNumber > 0)
                if (time.valueAsNumber > 0)
                    // if (!Number.isNaN(speed.valueAsNumber) && speed.valueAsNumber > 0)
                    // if (!Number.isNaN(seconds.valueAsNumber) && time.valueAsNumber > 0)
                    // if(Number.isNaN(distance.valueAsNumber))
                    this.valueAsNumber = speed.valueAsNumber * (time.valueAsNumber / 60000);
            time.dispatchEvent(new MouseEvent("change", {}));
        });
        speed.addEventListener("calc", function (e) {
            if (speed.valueAsNumber > 0)
                // if (!Number.isNaN(distance.valueAsNumber) && distance.valueAsNumber > 0)
                // if (!Number.isNaN(time.valueAsNumber) && time.valueAsNumber > 0)
                // if(Number.isNaN(speed.valueAsNumber))
                // this.valueAsNumber = distance.valueAsNumber / (time.valueAsNumber / 60000);
                time.dispatchEvent(new MouseEvent("change", {}));
        });
        time.addEventListener("calc", function (e) {
            // if (!Number.isNaN(distance.valueAsNumber) && distance.valueAsNumber > 0)
            //   if (!Number.isNaN(speed.valueAsNumber) && speed.valueAsNumber > 0)
            //     if (Number.isNaN(time.valueAsNumber)) {
            if (distance.valueAsNumber > 0)
                if (speed.valueAsNumber > 0)
                    time.valueAsNumber = (distance.valueAsNumber / speed.valueAsNumber) * 60000;
            time.dispatchEvent(new MouseEvent("change", {}));
            // seconds.valueAsNumber = (distance.valueAsNumber / speed.valueAsNumber) * 60;
            // }
        });

        calculateButton.addEventListener("pointerdown", function (e) {
            distance.dispatchEvent(eve);
            time.dispatchEvent(eve);
            // speed.dispatchEvent(eve);
            console.log("Calc");
        });

        //     panel button tap
        for (let j = 0; j < 23; j++) {
            const btn0 = document.createElement("button");
            btn0.classList.add("tap");

            buttonLine[j].push(btn0);
            buttonRow[i].push(btn0);

            btn0.coll = i;

            ol.childNodes[j].append(btn0);
        }

        time.addEventListener("input", handleInputTime);
        time.addEventListener("pointerdown", handleInputTime);
        time.addEventListener("change", handleInputTime);
    }

    table.classList.add("block");
    trm.classList.add("block");
    trv.classList.add("block");
    trt.classList.add("block");

    trm.append(ltrm, m);
    trv.append(ltrv, v);
    trt.append(ltrt, t);

    table.append(trm);
    table.append(trv);
    table.append(trt);

    const diw = document.createElement("section");

    diw.append(start);

    const diwend = document.createElement("section");
    const labelSum = document.createElement("label");
    labelSum.textContent = "Сумма";
    const labelQuantity = document.createElement("label");
    labelQuantity.textContent = "Количество";
    const labelOst = document.createElement("label");
    labelOst.textContent = "Остаток";

    const d1 = document.createElement("div");
    const d2 = document.createElement("div");
    const d3 = document.createElement("div");

    // diwend.append(summa, timeDx, dx);

    d1.append(labelSum, summa);
    d2.append(labelQuantity, quantity);
    d3.append(labelOst, dx, timeDx);
    diwend.append(d1);
    diwend.append(d2);
    // diwend.append(labelOst,dx);
    diwend.append(d3);

    labelSum.classList.add("resolve");
    summa.classList.add("resolve");

    labelOst.classList.add("resolve");
    dx.classList.add("resolve");
    timeDx.classList.add("resolve");

    main.append(table);
    main.append(calculateButton);
    main.append(diw);
    main.append(ol);
    main.append(diwend);
}

{
    const pin = document.createElement("div");
    // summaFix.style.height="inherit";
    // summaFix.style.maxHeight= "min-content";
    // summaFix.style.height= "inherit";
    // max-height: inherit
    pin.append(summaFix);
    pin.classList.add("pin");
    main.append(pin);

    // Добавляем клонированный элемент в контейнер

    // clonedContainer.appendChild(clonedNode);

    // console.log(rect);

    function updatePosition() {
        const rect = summa.getBoundingClientRect();
        if (window.visualViewport) {
            // visualViewport.height — высота видимой области
            // window.innerHeight — полная высота окна браузера
            // Если клавиатура открыта, visualViewport.height будет меньше
            const bottomOffset =
                window.innerHeight -
                window.visualViewport.height -
                window.visualViewport.offsetTop;
            pin.style.bottom = bottomOffset + "px";
            pin.style.left = this.offsetLeft + "px";
            pin.style.width = this.width + "px";
            // pin.style.height = this.height/this.scale + 'px';
            // button3.textContent = this.scale;
            // console.log(window.visualViewport);

            // console.log(rect);

            // Определяем позицию элемента относительно окна
            const position = {
                top: rect.top + window.scrollY, // Положение сверху относительно документа
                left: rect.left + window.scrollX, // Положение слева относительно документа
                bottom: rect.bottom + window.scrollY, // Положение слева относительно документа
            };

            // pageYOffset
            // console.log(`Позиция элемента:\nСверху: ${position.top}px\nСлева: ${position.left}px`);
            // console.log(this.offsetTop+this.height,position.bottom);
            // console.log("Position",this.offsetTop+this.height,position.bottom);
            if (this.offsetTop + this.height < position.bottom) {
                // pin.style.visibility="visible";
            } else {
                pin.style.visibility = "hidden";
            }
        } else {
            pin.style.bottom = "0px";
        }
    }
    // Обновляем позицию при изменении viewport (например, при появлении клавиатуры)
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", updatePosition);
        window.visualViewport.addEventListener("scroll", updatePosition);
    }
    // Начальная установка
    updatePosition();

    let initialDistance = 0;
    let initialWidth1 = 100;
    let initialHeight1 = 100;
    let currentDistance = 0;

    let initialWidth2 = 100;
    let initialHeight2 = 100;

    initialWidth1 = pin.offsetWidth;
    initialHeight1 = pin.offsetHeight;

    // initialWidth2 = summaFix.offsetWidth;
    // initialHeight2 = summaFix.offsetHeight;

    function getDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    document.body.addEventListener("touchstart", (event) => {
        if (event.touches.length === 2) {
            // initialDistance = getDistance(event.touches);
            // initialWidth1 = resizableElement1.offsetWidth;
            // initialHeight1 = resizableElement1.offsetHeight;
            // resizableElement1.textContent = initialDistance+"\n"+currentDistance;
        }
    });

    document.body.addEventListener("touchmove", (event) => {
        if (event.touches.length === 2) {
            // currentDistance = getDistance(event.touches);
            // const scaleFactor = currentDistance / initialDistance;

            // Изменяем размеры первого элемента
            // const newWidth1 = initialWidth1 / scaleFactor;
            // const newHeight1 = initialHeight1 / scaleFactor;

            const newWidth1 = initialWidth1 / window.visualViewport.scale;
            const newHeight1 = initialHeight1 / window.visualViewport.scale;

            // const newWidth2 = initialWidth2 / window.visualViewport.scale;
            // const newHeight2 = initialHeight2 / window.visualViewport.scale;
            // resizableElement1.textContent = currentDistance+"\n"+initialDistance+"\n"+scaleFactor+"\n"+window.visualViewport.scale;

            // const newWidth1 = initialWidth1;
            // const newHeight1 = initialHeight1;

            // initialWidth1 = newWidth1;
            // initialHeight1 = newHeight1;

            // Изменяем размеры первого элемента
            // const newWidth1 = initialWidth1 - currentDistance;
            // const newHeight1 = initialHeight1 - currentDistance;

            // Обновляем размеры первого элемента
            pin.style.width = `${newWidth1}px`;
            pin.style.height = `${newHeight1}px`;

            // summaFix.style.width = `${newWidth2}px`;
            // summaFix.style.height = `${newHeight2}px`;

            // Уменьшаем размеры второго элемента на то же значение
            // const widthDifference = newWidth1 - initialWidth1;
            // const heightDifference = newHeight1 - initialHeight1;

            // Уменьшаем размеры второго элемента, чтобы сохранить визуальный эффект
        }
    });

    // Остановка изменения размера при завершении жеста
    document.body.addEventListener("touchend", (event) => {
        if (event.touches.length < 2) {
            // initialDistance = getDistance(event.touches);
            // resizableElement1.style.width = `${initialWidth1}px`;
            // resizableElement1.style.height = `${initialHeight1}px`;
            // let a = resizableElement1.style.width - currentDistance;
            // let b = resizableElement1.style.height - currentDistance;
            // resizableElement1.style.width = `${0}px`;
            // resizableElement1.style.height = `${0}px`;
            // resizableElement1.style.width = `${initialWidth1/window.visualViewport.scale}px`;
            // resizableElement1.style.height = `${initialHeight1/window.visualViewport.scale}px`;
            // resizableElement1.textContent = "End";
            // initialWidth1 = pin.offsetWidth;
            // initialHeight1 = pin.offsetHeight;
            // initialWidth1 = resizableElement1.offsetWidth;
            // initialHeight1 = resizableElement1.offsetHeight;
        }
    });

    document.body.addEventListener("touchcancel", () => {
        initialDistance = 0; // Сбрасываем начальное расстояние
    });
}

const button = document.createElement("button");
button.textContent = "Вычислить";
main.append(button);
const send = document.createElement("button");
send.textContent = "Сохранить";
// main.append(send);
const get = document.createElement("button");
get.textContent = "Загрузить";
main.append(get);

const section = document.createElement("section");
main.append(section);

let list = [];
let listMS = [];

const select = document.createElement("select");
let dateSave = 0;

const event = new PointerEvent("pointerdown", {
    bubbles: true, // Allows the event to bubble up
    cancelable: true, // Allows the event to be cancelable
});

async function load(e) {
    if (!e.target.closest("button")) return;
    let task = e.target.closest("div");

    infoTime.forEach((item) => (item.valueAsNumber = NaN));
    infoTime.forEach((item) => item.dispatchEvent(event));
    list.length &&
        list.forEach((item, i) => {
            item.classList.remove("tg");
            delete list[i];
        });

    const data = [];
    console.log(this.date.valueAsNumber, this.time.textContent, this.saveId);

    const response = await fetch(document.location.href, {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "select",
            table: {
                name: "diary_ref",
            },
            // date: this.date.valueAsNumber,
            // time: this.time.value,
            // time: this.time.textContent,
            saveId: this.saveId
        }),
    }).then((response) => response.json());


    response.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
            data.push(item.millisecond);
        }
    });

    let current = [];
    data.forEach((val, i) => {
        if (current.indexOf(val) < 0) {
            current.push(val);
        }
        let c = current.indexOf(val);
        infoTime[c].valueAsNumber = val;
        infoTime[c].dispatchEvent(event);
        buttonLine[i][c].classList.add("tg");
        list[i] = buttonLine[i][c];
    });
    start.valueAsNumber = this.beginning.valueAsNumber;

    summa.dispatchEvent(getSum);
    dx.dispatchEvent(getSum);
    timeDx.dispatchEvent(getSum);
}
function getListTimeSum(sum = 0) {
    list.forEach((item) => {
        sum += +item.value;
    });
    return sum;
}
async function removeRequest(e) {
    // if (!e.target.closest("button")) return;
    //   let g = e.target.closest("div");
    //   console.log(g.id);
    //   infoTime.forEach((item) => (item.valueAsNumber = NaN));
    //   infoTime.forEach((item) => item.dispatchEvent(event));
    //   list.length &&
    //     list.forEach((item, i) => {
    //       item.classList.remove("tg");
    //       delete list[i];
    //     });

    //   let sum = 0;
    //   let current = [];
    //   data[g.id].forEach((val, i) => {
    //     console.log(val, i);
    //     if (current.indexOf(val) < 0) {
    //       current.push(val);
    //     }
    //     sum+=val;
    //     let c = current.indexOf(val);
    //     infoTime[c].valueAsNumber = val;
    //     infoTime[c].dispatchEvent(event);
    //     buttonLine[i][c].classList.add("tg");
    //     list[i] = buttonLine[i][c];
    //   });
    //   timeDx.valueAsNumber = end.valueAsNumber - sum - start.valueAsNumber;
    //   dx.value = (end.valueAsNumber - sum - start.valueAsNumber) / 60000;
    //   summa.valueAsNumber = sum + start.valueAsNumber;

    // console.log(this.date.valueAsNumber);
    // console.log(this.time.value);
    let date = this.date.valueAsNumber ||
        e.target.closest("div").querySelector("input").valueAsNumber;
    let time = this.time.textContent ||
        e.target.closest("div").querySelector("select").value;
    console.log(date, time, this.saveID);

    // console.log(this.time.textContent);

    try {
        const response = await fetch(document.location.href, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({
                action: "remove",
                table: {
                    name: "diary_ref",
                },
                key: {
                    date: date,
                    time: time,
                    save_id: this.saveID,
                },
            }),
        }).then((response) => response.json());
        console.log(response);

        if (response.success === "0") {
            this.classList.add("success");
            setTimeout(() => {
                this.classList.remove("success");
            }, 3000);
        } else throw response;
    } catch (error) {
        this.classList.add("reject");
        setTimeout(() => {
            this.classList.remove("reject");
        }, 3000);
        console.warn(error);
    }
}

function begin(ol, timeRun) {
    // console.log(sum);
    let sum = timeRun || 28800000;
    // let sum = start.valueAsNumber;
    const box = document.createElement("li");
    const time = document.createElement("input");
    time.type = "time";
    time.valueAsNumber = time12(sum);
    box.append(time);
    ol.append(box);
    return sum;
}
async function getDB() {
    return await fetch(document.location.href, {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "select",
            table: {
                name: "diary_ref",
            },
            data: null,
        }),
    }).then((response) => response.json());
}

let data = [];

get.addEventListener("click", async function (e) {
    const response = await getDB();
    console.log(response);

    let select = document.createElement("select");
    section.id = "";
    viewData(response, select);
});

function Task(millisecond, quantity, time, data, run) {
    this.millisecond = millisecond;
    this.quantity = quantity;
    this.time = time;
    this.data = data;
    this.run = run;
}

send.addEventListener("click", async function (e) {
    const dat = [];
    const dateSave = dtinput.valueAsNumber;
    console.log("data " + dateSave);
    console.log("time " + select.value);
    console.log("run " + start.valueAsNumber);
    let currentValue = 0; // Переменная для хранения текущего значения
    let count = 0;

    list.forEach((item, i) => {
        if (item.value === currentValue) {
            count++;
        } else {
            if (currentValue) {
                // Если это не первое значение, выводим результат
                console.log("millisecond " + currentValue, "quantity " + count);
                dat.push(new Task(currentValue, count, select.value, dateSave, start.valueAsNumber));
            }
            currentValue = item.value;
            count = 1;
        }
    });

    if (currentValue !== null) {
        console.log("millisecond " + currentValue, "quantity " + count);
        dat.push(
            new Task(currentValue, count, select.value, dateSave, start.valueAsNumber)
        );
    }
    console.log(list);
    console.log(dat);

    let response = "";
    response = await fetch(document.location.href, {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "ping"
        }),
    }).then((response) => response.json());
    console.log(response);


    //try {
    //    // date:13
    //    // millisecond:2100000
    //    // quantity:7
    //    // run:28800000
    //    // save_id:13
    //    // time:"День"

    //    // await fetch(document.location.href, {
    //    //   method: "POST",
    //    //   headers: {
    //    //     "Content-Type": "application/json;charset=utf-8",
    //    //   },
    //    //   body: JSON.stringify({
    //    //     action: "todayW",
    //    //     table: {
    //    //       name: "diary",
    //    //     },
    //    //     data: dat,
    //    //     key: {
    //    //       date: dateSave,
    //    //       time: select.value,
    //    //     },
    //    //   }),
    //    // }).then((response) => response.json());
    //    // console.log(response);

    //    response = await fetch(document.location.href, {
    //        method: "POST",
    //        headers: {
    //            "Content-Type": "application/json;charset=utf-8",
    //        },
    //        body: JSON.stringify({
    //            action: "save",
    //            table: {
    //                name: "diary_ref",
    //            },
    //            data: dat,
    //            key: {
    //                date: dateSave,
    //                time: select.value,
    //            },
    //        }),
    //    })
    //        .then((response) => response.json())

    //    if (response.success === "0") {
    //        this.classList.add("success");
    //        setTimeout(() => {
    //            this.classList.remove("success");
    //        }, 3000);
    //    } else throw response;
    //} catch (error) {
    //    this.classList.add("reject");
    //    setTimeout(() => {
    //        this.classList.remove("reject");
    //    }, 3000);
    //    console.warn(response);
    //    // console.warn(error);
    //}
});

// let newStart = {};
// newStart.value = start.valueAsNumber;

// list[0] = newStart;
function dropListSelectS(array, select) {
    let option = document.createElement("option");
    array.forEach((data) => {
        option.value = data.name;
        option.textContent = data.name;
        select.append(option);
    });
    return option;
}
function dropListSelect(array, select) {
    array.forEach((data) => {
        let option = document.createElement("option");
        option.value = data.name;
        option.textContent = data.name;
        select.append(option);
    });
    return select;
}
let dtinput = null;

button.addEventListener("click", function (e) {
    section.innerHTML = "";
    select.innerHTML = "";
    console.log(list);
    console.log(buttonLine);
    // buttonLine.forEach(item=>item.forEach(item=>console.log(item.value)))

    let sum = 0;
    dtinput = document.createElement("input");
    const ol = document.createElement("ol");

    dtinput.type = "date";
    const today = new Date();

    // Добавляем смещение к текущему времени
    const adjustedTime = new Date(today.getTime());

    // Получаем год, месяц и день
    const year = adjustedTime.getFullYear();
    const month = adjustedTime.getMonth(); // Месяцы начинаются с 0 (январь)
    const day = adjustedTime.getDate();

    // Создаем новую дату без времени и получаем её в миллисекундах
    const dateWithoutTimeInMs =
        new Date(year, month, day).getTime() + 3600000 * 7;

    // console.log("Дата без времени в миллисекундах:", dateWithoutTimeInMs +3600000 * 7); // Выводит дату без времени в миллисекундах

    dtinput.valueAsNumber = dateWithoutTimeInMs;
    dateSave = dateWithoutTimeInMs;
    section.append(dtinput);

    section.append(dropListSelect([{ name: "День" }, { name: "Ночь" }], select));
    section.append(ol);

    let sum2 = start.valueAsNumber;
    const box = document.createElement("li");
    const time = document.createElement("input");
    time.type = "time";
    time.valueAsNumber = sum2;
    box.append(time);
    ol.append(box);
    list.forEach((item) => {
        const box = document.createElement("li");
        updateColor(box, +item.value);
        const time = document.createElement("input");
        time.type = "time";
        sum2 += +item.value;
        time.valueAsNumber = time12(sum2);
        box.append(time);
        ol.append(box);
    });

    section.append(send);

    console.log(sum2);
});

const color = [
    "#E7C697",
    "#7FC7FF",
    "#FF7514",
    "darkgray",
    "pink",
    " #FCDD76",
    "#3EB489",
];

function updateColor(input, totalMinutes) {
    // const timeValue = input.value; // Получаем значение времени
    // if (timeValue) {
    // const [hours, minutes] = timeValue.split(':').map(Number); // Разбиваем время на часы и минуты
    // const totalMinutes = hours * 60 + minutes; // Переводим в общее количество минут
    const color = getLinearGradientColor(totalMinutes / 60000); // Получаем цвет
    input.style.backgroundColor = color; // Устанавливаем цвет фона ячейки
    // input.style.paddingRight = 4*totalMinutes/60000+"px";
    input.style.width = minutesToPixels(totalMinutes / 60000) + "px";
    // } else {
    // Если значение времени не задано, сбрасываем цвет
    // input.style.backgroundColor = '';
    // }
}

function minutesToPixels(minutes) {
    // Нормализуем минуты от 20 до 90
    const minMinutes = 20;
    const maxMinutes = 90;

    const minPixels = 80; // Минимальное значение в пикселях
    const maxPixels = 200; // Максимальное значение в пикселях

    // Проверяем, что минуты находятся в пределах
    if (minutes < minMinutes || minutes > maxMinutes) {
        // throw new Error("Minutes should be between 20 and 90.");
    }

    // Нормализация
    const normalizedValue = (minutes - minMinutes) / (maxMinutes - minMinutes);
    // console.log(normalizedValue);
    // Используем квадратичное преобразование для увеличения различия
    // const pixelValue = Math.pow(normalizedValue, 2) * (maxMinutes - minMinutes) * 10; // Умножаем на 10 для увеличения масштаба
    // const pixelValue = normalizedValue * (maxMinutes - minMinutes) * 6; // Умножаем на 10 для увеличения масштаба
    const pixelValue = minPixels + normalizedValue * (maxPixels - minPixels);
    // console.log(pixelValue);

    // Добавляем базовое значение для смещения
    return pixelValue; // Начинаем с 20 пикселей для 20 минут
}

function getLinearGradientColor(minutes) {
    // Нормализуем минуты от 20 до 90
    const minMinutes = 20;
    const maxMinutes = 90;
    const normalizedValue = (minutes - minMinutes) / (maxMinutes - minMinutes);

    // Ограничиваем значение от 0 до 1
    const clampedValue = Math.min(Math.max(normalizedValue, 0), 1);

    let red, green, blue;

    if (clampedValue <= 0.5) {
        // Переход от синего к зеленому
        const transitionValue = clampedValue * 2; // Увеличиваем диапазон до [0, 1]
        red = 0;
        green = Math.floor(transitionValue * 255); // Увеличиваем зеленый
        blue = 255 - Math.floor(transitionValue * 255); // Уменьшаем синий
    } else {
        // Переход от зеленого к красному
        const transitionValue = (clampedValue - 0.5) * 2; // Увеличиваем диапазон до [0, 1]
        red = Math.floor(transitionValue * 255); // Увеличиваем красный
        green = 255 - Math.floor(transitionValue * 255); // Уменьшаем зеленый
        blue = 0; // Синий всегда 0
    }

    return `rgb(${red}, ${green}, ${blue})`;
}

//(async () => {
//    const today = new Date();

//    // Добавляем смещение к текущему времени
//    const adjustedTime = new Date(today.getTime());

//    // Получаем год, месяц и день
//    const year = adjustedTime.getFullYear();
//    const month = adjustedTime.getMonth(); // Месяцы начинаются с 0 (январь)
//    const day = adjustedTime.getDate();

//    // Создаем новую дату без времени и получаем её в миллисекундах
//    const dateWithoutTimeInMs = new Date(year, month, day).getTime() + 3600000 * 7;
//    console.log(dateWithoutTimeInMs);

//    const response = await fetch(document.location.href, {
//        method: "POST",
//        headers: {
//            "Content-Type": "application/json;charset=utf-8",
//        },
//        body: JSON.stringify({
//            action: "today",
//            table: {
//                name: "diary_ref",
//            },
//            ms: dateWithoutTimeInMs - 24 * 60 * 60 * 1000,
//            // date:dateWithoutTimeInMs-47*60*60*1000,
//        }),
//    }).then((response) => response.json())
//    console.log(response);


//    let select = document.createElement("select");
//    section.id = "today";

//    if (response.messeag) {
//        const no_records = document.createElement("span");
//        no_records.textContent = response.messeag;
//        section.append(no_records);
//    } else {
//        viewData(response, select);
//    }

//    fetch(document.location.href, {
//        method: "POST",
//        headers: {
//            "Content-Type": "application/json;charset=utf-8",
//        },
//        body: JSON.stringify({
//            action: "selectT",
//            table: {
//                name: "MyChrono",
//            },
//            data: null,
//            // ms: dateWithoutTimeInMs - 24 * 60 * 60 * 1000,
//            // date:dateWithoutTimeInMs-47*60*60*1000,
//        }),
//    })
//        .then((response) => response.json())
//        .then(console.log);

//    fetch(document.location.href, {
//        method: "POST",
//        headers: {
//            "Content-Type": "application/json;charset=utf-8",
//        },
//        body: JSON.stringify({
//            action: "selectT",
//            table: {
//                name: "diary_ref",
//            },
//            data: null,
//            // ms: dateWithoutTimeInMs - 24 * 60 * 60 * 1000,
//            // date:dateWithoutTimeInMs-47*60*60*1000,
//        }),
//    })
//        .then((response) => response.json())
//        .then(console.log);

//    // fetch(document.location.href, {
//    //   method: "POST",
//    //   headers: {
//    //     "Content-Type": "application/json;charset=utf-8",
//    //   },
//    //   body: JSON.stringify({
//    //     action: "selectT",
//    //     table: {
//    //       name: "MyСhange",
//    //     },
//    //     data: null
//    //   }),
//    // }).then((response) => response.json()).then(console.log);

//    fetch(document.location.href, {
//        method: "POST",
//        headers: {
//            "Content-Type": "application/json;charset=utf-8",
//        },
//        body: JSON.stringify({
//            action: "selectT",
//            table: {
//                name: "MySaveTest",
//            },
//            data: null,
//        }),
//    })
//        .then((response) => response.json())
//        .then(console.log);

//    fetch(document.location.href, {
//        method: "POST",
//        headers: {
//            "Content-Type": "application/json;charset=utf-8",
//        },
//        body: JSON.stringify({
//            action: "select",
//            table: {
//                name: "diary_ref",
//            },
//            data: null,
//        }),
//    })
//        .then((response) => response.json())
//        .then(console.log);

//    // fetch(document.location.href, {
//    //     method: "POST",
//    //     headers: {
//    //       "Content-Type": "application/json;charset=utf-8",
//    //     },
//    //     body: JSON.stringify({
//    //       action: "getOrAddValue",
//    //         date:1747872000000
//    //     }),
//    //   }).then((response) => response.json()).then(console.log);
//})();

let countDiv = 0;

function renderPass() {
    let div = document.createElement("div");

    let date = document.createElement("input");
    let p = document.createElement("p");

    let ul = document.createElement("ul");
    let ol = document.createElement("ol");

    let buttonLoad = document.createElement("button");
    let buttonRemove = document.createElement("button");

    buttonLoad.addEventListener("pointerdown", load);
    buttonLoad.date = date;
    buttonLoad.time = p;

    buttonRemove.addEventListener("pointerdown", removeRequest);
    buttonRemove.date = date;
    buttonRemove.time = p;

    div.append(date);
    div.append(p);
    div.append(ol);
    div.append(buttonLoad);
    div.append(buttonRemove);
    div.classList.add("tail");
    section.append(div);
    let sum = 0;

    const lineData = document.createElement("li");
    const time = document.createElement("input");
    time.type = "time";
    lineData.append(time);
    ol.append(lineData);

    const TimeOfDay = new Object();
    // console.log(TimeOfDay);

    const option = document.createElement("option");

    div.id = countDiv;
    countDiv++;
    return function (database) {
        date.type = "date";
        date.valueAsNumber = database.date;
        date.min = date.value;
        date.max = date.value;

        sum = sum || database.run || 28800000;
        time.valueAsNumber = time12(database.run || 28800000);
        time.setAttribute("disabled", true);
        buttonRemove.beginning = time;
        buttonLoad.beginning = time;

        buttonRemove.saveID = database.save_id;
        buttonLoad.saveId = database.save_id;

        p.textContent = database.time;

        for (let i = 0; i < database.quantity; i++) {
            const lineData = document.createElement("li");
            const time = document.createElement("input");
            lineData.append(time);
            ol.append(lineData);

            time.type = "time";
            // time.setAttribute('readonly', true);
            time.setAttribute("disabled", true);
            sum += +database.millisecond;

            // console.log(sum);
            listMS.push(database.millisecond);
            time.valueAsNumber = time12(sum);
            updateColor(lineData, +database.millisecond);
        }
        buttonLoad.textContent = "Загрузить";
        buttonRemove.textContent = "Удалить";
        return div;
    };
}

function write(database, sum, ol, list) {
    const time = document.createElement("input");
    time.type = "time";

    for (let i = 0; i < database.quantity; i++) {
        const lineData = document.createElement("li");
        const time = document.createElement("input");
        time.type = "time";
        lineData.append(time);
        ol.append(lineData);

        sum += +database.millisecond;
        listMS.push(database.millisecond);
        time.valueAsNumber = time12(sum);
        updateColor(lineData, +database.millisecond);
    }
    return sum;
}

function viewData(ansver, select) {
    const archiv = [];

    section.innerHTML = "";
    select.innerHTML = "";

    let ul = document.createElement("ul");
    let obj = {};
    let sum = 0;
    let count = 0;
    let currentValue = null; // Переменная для хранения текущего значения
    let currentValue2 = null; // Переменная для хранения текущего значения

    let fnh = renderPass();

    ansver.forEach((database) => {
        // const minute = database.millisecond / 60000;
        if (database.save_id === currentValue) {
            fnh(database);
        } else {
            if (currentValue !== null && currentValue2 !== null) {
                fnh = renderPass(archiv);
            }
            currentValue = database.save_id;
            currentValue2 = database.time;
            archiv.push({ date: dtinput, time: select });
            fnh(database);
        }
    });
    if (obj && ul) {
        for (const [key, value] of Object.entries(obj)) {
            const listItem = document.createElement("li");
            listItem.textContent = `Время: ${key}, Количество: ${value}`;
            ul.appendChild(listItem);
        }
    }
    console.log(archiv.length);
}

// const socket = new WebSocket("wss://worktime.glitch.me");

// socket.addEventListener("open", () => {
//   console.log("Connected to the WebSocket server.");
//   socket.send("Hello, server!"); // Отправляем сообщение при открытии соединения
// });

// socket.addEventListener("message", (event) => {
//   const message = event.data;
//   console.log("Message from server:", message);
// });

// // Обработка ошибок
// socket.addEventListener("error", (error) => {
//   console.error("WebSocket error:", error);
// });

// // Обработка закрытия соединения
// socket.addEventListener("close", () => {
//   console.log("Disconnected from the WebSocket server.");
// });

// socket.addEventListener("message", async (event) => {
//   const blob = event.data; // Получаем Blob
//   if (blob instanceof Blob) {
//     try {
//       const arrayBuffer = await blob.arrayBuffer(); // Преобразуем Blob в ArrayBuffer
//       const decoder = new TextDecoder("utf-8"); // Указываем кодировку
//       const messageString = decoder.decode(arrayBuffer); // Декодируем
//       console.log("Message from server:", messageString);
//     } catch (error) {
//       console.error("Error reading Blob:", error);
//     }
//   } else {
//     console.warn("Received non-Blob data:", blob);
//   }
// });

// socket.addEventListener("message", (event) => {
//   const blob = event.data; // Получаем Blob
//   if (blob instanceof Blob) {
//     const reader = new FileReader();

//     // Когда чтение завершено, выводим строку
//     reader.onload = () => {
//       const messageString = reader.result; // Получаем строку
//       console.log("Message from server:", messageString);
//     };

//     // Читаем Blob как текст
//     reader.readAsText(blob);
//   } else {
//     console.warn("Received non-Blob data:", blob);
//   }
// });
