if (/Android/i.test(navigator.userAgent)) {
    document.body.classList.add("android");
}

function create3() {
  const TimeStart = document.createElement("input");
  TimeStart.type = "time";
  TimeStart.valueAsNumber = 28800000;

  const TimeEnd = document.createElement("input");
  TimeEnd.type = "time";
  TimeEnd.valueAsNumber = 67200000;

  const TimeDx = document.createElement("input");
  TimeDx.type = "time";
  TimeDx.valueAsNumber = TimeEnd.valueAsNumber - TimeStart.valueAsNumber;

  const dx = document.createElement("input");
  dx.type = "number";
  dx.valueAsNumber = TimeEnd.valueAsNumber - TimeStart.valueAsNumber;
  

  const summa = document.createElement("input");
  summa.type = "time";
  summa.valueAsNumber = TimeStart.valueAsNumber;
  return { TimeStart, TimeEnd, TimeDx, dx, summa};
}
function time12(time) {
  if (time < 46800000) {
    return time;
  } else {
    return time - 43200000;
  }
}

const start = create3().TimeStart;
const end = create3().TimeEnd;
const timeDx = create3().TimeDx;
const dx = create3().dx;
dx.classList.add("fixed-menu");
const summa = create3().summa;
// main.append(start);
// main.append(end);
const buttonLine = [];

for (let j = 0; j < 27; j++) {
  buttonLine.push([]);
}

let infoTime = [];

{
  const ul = document.createElement("ul");
  const c = document.createElement("li");
  const m = document.createElement("li");
  const v = document.createElement("li");
  const t = document.createElement("li");
  const calc = document.createElement("button");
  calc.textContent = "Вычислить";
  calc.style.marginLeft = 6 + "px";

  const eve = new CustomEvent("calc", {
    bubbles: true, // Позволяет событию всплывать
    cancelable: true, // Позволяет событию быть отменяемым
  });

  const ol = document.createElement("ol");
  
  ol.append(start, end);
  

  for (let i = 0; i < 27; i++) {
    const li = document.createElement("li");
    li.id = i;
    // pointerdown
    // click
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
      let sum = 0;
      list.forEach((item) => {
        sum += +item.value;
      });
      timeDx.valueAsNumber = end.valueAsNumber - sum - start.valueAsNumber;
      summa.valueAsNumber = sum + start.valueAsNumber;
      dx.value = (end.valueAsNumber - sum - start.valueAsNumber) / 60000;
      console.log(end.valueAsNumber - sum - start.valueAsNumber);
    });
    ol.append(li);
  }

  const btn = [];
  for (let i = 0; i < 7; i++) {
    //  calc
    const seconds = document.createElement("input");
    seconds.type = "number";
    c.append(seconds);
    const distance = document.createElement("input");
    distance.type = "number";
    m.append(distance);
    const speed = document.createElement("input");
    speed.type = "number";
    v.append(speed);
    const time = document.createElement("input");
    time.type = "time";
    t.append(time);
    infoTime.push(time);

    distance.addEventListener("calc", function (e) {
      if (!Number.isNaN(speed.valueAsNumber) && speed.valueAsNumber > 0)
        if (!Number.isNaN(time.valueAsNumber) && time.valueAsNumber > 0)
          // if(Number.isNaN(distance.valueAsNumber))
          distance.valueAsNumber =
            speed.valueAsNumber * (time.valueAsNumber / 60000);
      time.dispatchEvent(new MouseEvent("update", {}));
    });
    speed.addEventListener("calc", function (e) {
      if (!Number.isNaN(distance.valueAsNumber) && distance.valueAsNumber > 0)
        if (!Number.isNaN(time.valueAsNumber) && time.valueAsNumber > 0)
          // if(Number.isNaN(speed.valueAsNumber))
          speed.valueAsNumber =
            distance.valueAsNumber / (time.valueAsNumber / 60000);
      time.dispatchEvent(new MouseEvent("update", {}));
    });
    time.addEventListener("calc", function (e) {
      if (!Number.isNaN(distance.valueAsNumber) && distance.valueAsNumber > 0)
        if (!Number.isNaN(speed.valueAsNumber) && speed.valueAsNumber > 0)
          if (Number.isNaN(time.valueAsNumber)) {
            time.valueAsNumber =
              (distance.valueAsNumber / speed.valueAsNumber) * 60000;
            time.dispatchEvent(new MouseEvent("update", {}));
            seconds.valueAsNumber =
              (distance.valueAsNumber / speed.valueAsNumber) * 60;
          }
    });

    seconds.addEventListener("calc", function (e) {
      if (
        !Number.isNaN(distance.valueAsNumber) &&
        !Number.isNaN(speed.valueAsNumber) &&
        !Number.isNaN(time.valueAsNumber)
      ) {
        console.log("test");
        // distance.valueAsNumber = speed.valueAsNumber * (seconds.valueAsNumber / 60);
        time.valueAsNumber = seconds.valueAsNumber * 1000;
        time.dispatchEvent(new MouseEvent("update", {}));
      }
    });

    calc.addEventListener("pointerdown", function (e) {
      seconds.dispatchEvent(eve);
      distance.dispatchEvent(eve);
      speed.dispatchEvent(eve);
      time.dispatchEvent(eve);
      console.log("Calc");
    });

    //     panel
    for (let j = 0; j < 27; j++) {
      const btn0 = document.createElement("button");
      buttonLine[j].push(btn0);
      btn0.coll = i;
      time.addEventListener("input", function (e) {
        btn0.textContent = time.value;
        btn0.value = time.valueAsNumber;
      });
      
      time.addEventListener("pointerdown", function (e) {
        btn0.textContent = time.value;
        btn0.value = time.valueAsNumber;
      });
      time.addEventListener("change", function (e) {
        btn0.textContent = time.value;
        btn0.value = time.valueAsNumber;
      });
      time.addEventListener("update", function (e) {
        btn0.textContent = time.value;
        btn0.value = time.valueAsNumber;
      });
      ol.childNodes[2+j].append(btn0);
    }
  }

  c.classList.add("s");
  m.classList.add("m");
  v.classList.add("v");
  t.classList.add("time");
  ul.classList.add("calc");

  ul.append(c, m, v, t, calc);
  main.append(ul);
  ol.append(summa, timeDx, dx);

  main.append(ol);
}
const button = document.createElement("button");
button.textContent = "Вычислить";
main.append(button);
const send = document.createElement("button");
send.textContent = "Сохранить";
main.append(send);
const get = document.createElement("button");
get.textContent = "Загрузить";
main.append(get);

const section = document.createElement("section");
main.append(section);

let list = [];

function Pare(meters, quantity, time, data) {
  this.meters = meters;
  this.quantity = quantity;
  this.time = time;
  this.data = data;
}
const select = document.createElement("select");
let dateSave = 0;

const event = new PointerEvent("pointerdown", {
  bubbles: true, // Allows the event to bubble up
  cancelable: true, // Allows the event to be cancelable
});

section.addEventListener("pointerdown", function (e) {
  if (!e.target.closest("button")) return;
  let g = e.target.closest("div");
  console.log(g.id);
  infoTime.forEach((item) => (item.valueAsNumber = NaN));
  infoTime.forEach((item) => item.dispatchEvent(event));
  list.length &&
    list.forEach((item, i) => {
      item.classList.remove("tg");
      delete list[i];
    });

  let sum = 0;
  let current = [];
  data[g.id].forEach((val, i) => {
    console.log(val, i);
    if (current.indexOf(val) < 0) {
      current.push(val);
    }
    sum+=val;
    let c = current.indexOf(val);
    infoTime[c].valueAsNumber = val;
    infoTime[c].dispatchEvent(event);
    buttonLine[i][c].classList.add("tg");
    list[i] = buttonLine[i][c];
  });
  timeDx.valueAsNumber = end.valueAsNumber - sum - start.valueAsNumber;
  dx.value = (end.valueAsNumber - sum - start.valueAsNumber) / 60000;
  
  summa.valueAsNumber = sum + start.valueAsNumber;
  
});

function begin(ol) {
  let sum = start.valueAsNumber;
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
        name: "history",
      },
      data: null,
    }),
  }).then((response) => response.json());
}

function write(item, sum, ol, list) {
  const time = document.createElement("input");
  time.type = "time";
  for (let i = 0; i < item.quantity; i++) {
    const box = document.createElement("li");
    const time = document.createElement("input");
    time.type = "time";
    sum += +item.meters;
    list.push(item.meters);

    time.valueAsNumber = time12(sum);
    updateColor(box, +item.meters);
    box.append(time);
    ol.append(box);
  }
  return sum;
}

let data = [];

get.addEventListener("pointerdown", async function (e) {
  let select = document.createElement("select");

  section.innerHTML = "";
  select.innerHTML = "";
  const response = await getDB();
  console.log(response);

  let currentValue = null; // Переменная для хранения текущего значения
  let currentValue2 = null; // Переменная для хранения текущего значения

  let ol = document.createElement("ol");
  let sum = begin(ol);

  let dtinput = document.createElement("input");
  let ul = document.createElement("ul");

  let obj = {};

  let div = document.createElement("div");

  let count = 0;
  let buttonWrite = document.createElement("button");
  response.forEach((item) => {
    const minute = item.meters / 60000;
    if (item.date === currentValue && item.time === currentValue2) {
      if (obj[minute]) {
        obj[minute] += item.quantity;
      } else {
        obj[minute] = item.quantity;
      }
      sum = write(item, sum, ol, data[count]);
      div.append(ol);
    } else {
      if (currentValue !== null && currentValue2 !== null) {
        if (obj && ul) {
          for (const [key, value] of Object.entries(obj)) {
            const listItem = document.createElement("li");
            listItem.textContent = `Время: ${key}, Количество: ${value}`;
            ul.appendChild(listItem);
          }
        }

        obj = {};

        ol = document.createElement("ol");

        dtinput = document.createElement("input");

        select = document.createElement("select");
        ul = document.createElement("ul");
        section.append(div);
        div = document.createElement("div");

        buttonWrite = document.createElement("button");

        sum = begin(ol);
        count++;
      }
      console.log("meters " + item.meters, "quantity " + item.quantity, obj);

      currentValue = item.date;
      currentValue2 = item.time;

      dtinput.type = "date";
      dtinput.valueAsNumber = item.date;
      div.append(dtinput);

      div.append(dropListSelect([{ name: item.time }], select));
      buttonWrite.textContent = "Загрузить";

      div.append(ul);
      div.append(buttonWrite);

      obj[minute] = item.quantity;
      data[count] = [];
      div.id = count;
      sum = write(item, sum, ol, data[count]);
    }
  });
  div.append(ol);
  section.append(div);

  if (obj && ul) {
    for (const [key, value] of Object.entries(obj)) {
      const listItem = document.createElement("li");
      listItem.textContent = `Время: ${key}, Количество: ${value}`;
      ul.appendChild(listItem);
    }
  }
});
send.addEventListener("pointerdown", async function (e) {
  const dat = [];
  const dateSave = dtinput.valueAsNumber;
  console.log("data " + dateSave);
  console.log("time " + select.value);
  let currentValue = null; // Переменная для хранения текущего значения
  let count = 0;

  list.forEach((item) => {
    if (item.value === currentValue) {
      count++;
    } else {
      if (currentValue !== null) {
        // Если это не первое значение, выводим результат
        console.log("meters " + currentValue, "quantity " + count);
        dat.push(new Pare(currentValue, count, select.value, dateSave));
      }
      currentValue = item.value;
      count = 1;
    }
  });
  if (currentValue !== null) {
    console.log("meters " + currentValue, "quantity " + count);
    dat.push(new Pare(currentValue, count, select.value, dateSave));
  }
  console.log(dat);
  const response = fetch(document.location.href, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      action: "todayW",
      table: {
        name: "history",
      },
      data: dat,
      key: {
        date: dateSave,
        time: select.value,
      },
    }),
  }).then((response) => response.json());
  console.log(response);
  // dat.forEach((item) => {
  //   fetch(document.location.href, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json;charset=utf-8",
  //     },
  //     body: JSON.stringify({
  //       action: "insert",
  //       table: {
  //         name: "data",
  //       },
  //       data: {
  //         data: item.data,
  //         time: item.time,
  //         meters: item.meters,
  //         quantity: item.quantity,
  //       },
  //     }),
  //   });
  // });
});
// let newStart = {};
// newStart.value = start.valueAsNumber;

// list[0] = newStart;
function dropListSelect(object, select) {
  object.forEach((data) => {
    let option = document.createElement("option");
    option.value = data.name;
    option.textContent = data.name;
    select.append(option);
  });
  return select;
}
let dtinput = null;

button.addEventListener("pointerdown", function (e) {
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

  dtinput.valueAsNumber = today.getTime() + 3600000 * 7;
  dateSave = dtinput.valueAsNumber;
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
    throw new Error("Minutes should be between 20 and 90.");
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

// function getGradientColor(totalMinutes) {
//     const maxMinutes = 120; // Максимальное время в минутах
//     const normalizedValue = Math.min(totalMinutes / maxMinutes, 1); // Нормализуем значение от 0 до 1

//     let red, green, blue;

//     if (normalizedValue <= 0.5) {
//         // Переход от синего к зеленому
//         red = 0;
//         green = Math.floor(255 * (normalizedValue * 2)); // Увеличиваем зеленый
//         blue = 255; // Синий остается 255
//     } else {
//         // Переход от зеленого к красному
//         red = Math.floor(255 * ((normalizedValue - 0.5) * 2)); // Увеличиваем красный
//         green = 255 - red; // Уменьшаем зеленый
//         blue = 0; // Синий становится 0
//     }

//     return `rgb(${red}, ${green}, ${blue})`;
// }

// function getNormalizedTimeColor(timeInMinutes) {
//     // Нормализуем время от 20 до 120 минут
//     const minTime = 20;
//     const maxTime = 120;

//     // Проверяем, что время в пределах допустимого диапазона
//     if (timeInMinutes < minTime || timeInMinutes > maxTime) {
//         throw new Error("Время должно быть в пределах от 20 до 120 минут");
//     }

//     // Нормализуем значение от 0 до 1
//     const normalizedValue = (timeInMinutes - minTime) / (maxTime - minTime);

//     // Преобразуем в цвет
//     const red = Math.floor(255 * normalizedValue); // от 0 до 255
//     const blue = 255 - red; // от 255 до 0

//     return `rgb(${red}, 0, ${blue})`;
// }

// Пример использования
// const timeInMinutes = 12000; // Время в минутах
// const color = getNormalizedTimeColor(timeInMinutes);
// document.body.style.backgroundColor = color;