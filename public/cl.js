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

  const TimeEnd = document.createElement("input");
  TimeEnd.type = "time";
  TimeEnd.valueAsNumber = 67200000;

  const TimeDx = document.createElement("input");
  TimeDx.type = "time";
  TimeDx.valueAsNumber = TimeEnd.valueAsNumber - TimeStart.valueAsNumber;

  let dx1 = document.createElement("input");
  dx1.type = "number";
  dx1.valueAsNumber = (TimeEnd.valueAsNumber - TimeStart.valueAsNumber) / 60000;

  const summa = document.createElement("input");
  summa.type = "time";
  summa.valueAsNumber = TimeStart.valueAsNumber;

  summa.addEventListener("getSum", function (e) {
    const a = getTimeSumm();
    this.valueAsNumber = a + TimeStart.valueAsNumber;
    dx.value = (TimeEnd.valueAsNumber - a - TimeStart.valueAsNumber) / 60000;
    console.log("test");
  });

  return { TimeStart, TimeEnd, TimeDx, dx1, summa };
}
function time12(time) {
  if (time < 46800000) {
    return time;
  } else {
    return time - 43200000;
  }
}

const buttonLogin = document.createElement("button");
buttonLogin.textContent = "Login";
buttonLogin.addEventListener("click", async function (event){
    const response = await fetch(document.location.href, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      action: "login"
    }),
  }).then((response) => response.json());
  console.log(response);
})
main.append(buttonLogin);



const start = create3().TimeStart;
const end = create3().TimeEnd;
const timeDx = create3().TimeDx;
const dx = create3().dx1;
// dx.classList.add("fixed-menu");
const summa = create3().summa;
// main.append(end);
const buttonLine = [];
const buttonRow = [];

for (let j = 0; j < 27; j++) {
  buttonLine.push([]);
}

let infoTime = [];

{
  
  
  function handleInput(event) {
    const buttons = buttonRow[this.name];
    for (let button of buttons) {
      button.textContent = this.value;
      button.value = this.valueAsNumber;
    }
    summa.dispatchEvent(getSum);
  }
  const ul = document.createElement("ul");
  const c = document.createElement("td");
  const m = document.createElement("td");
  const v = document.createElement("td");
  const t = document.createElement("td");
  const calc = document.createElement("button");
  calc.textContent = "Вычислить";
  // calc.style.marginLeft = 6 + "px";

  const trc = document.createElement("tr");
  const trm = document.createElement("tr");
  const trv = document.createElement("tr");
  const trt = document.createElement("tr");

  const labelc = document.createElement("label");
  const labelm = document.createElement("label");
  const labelv = document.createElement("label");
  const labelt = document.createElement("label");

  labelc.textContent = "Секунда";
  labelm.textContent = "Метр";
  labelv.textContent = "Скорость";
  labelt.textContent = "Время";

  const ltrc = document.createElement("td");
  const ltrm = document.createElement("td");
  const ltrv = document.createElement("td");
  const ltrt = document.createElement("td");

  ltrc.append(labelc);
  ltrm.append(labelm);
  ltrv.append(labelv);
  ltrt.append(labelt);

  const table = document.createElement("table");

  const eve = new CustomEvent("calc", {
    bubbles: true, // Позволяет событию всплывать
    cancelable: true, // Позволяет событию быть отменяемым
  });

  const getSum = new CustomEvent("getSum", {
    bubbles: true, // Позволяет событию всплывать
    cancelable: true, // Позволяет событию быть отменяемым
  });

  const ol = document.createElement("ol");

  // ol.append(start, end);

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
    buttonRow.push([]);

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
    time.name = i;
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
      btn0.classList.add("tap");

      buttonLine[j].push(btn0);
      buttonRow[i].push(btn0);

      btn0.coll = i;
      {
      //       time.addEventListener("input", function (e) {
      //         btn0.textContent = time.value;
      //         btn0.value = time.valueAsNumber;
      //         summa.dispatchEvent(getSum);
      //       });

      //       time.addEventListener("pointerdown", function (e) {
      //         btn0.textContent = time.value;
      //         btn0.value = time.valueAsNumber;
      //         summa.dispatchEvent(getSum);
      //       });
      //       time.addEventListener("change", function (e) {
      //         btn0.textContent = time.value;
      //         btn0.value = time.valueAsNumber;
      //         summa.dispatchEvent(getSum);
      //       });
      //       time.addEventListener("update", function (e) {
      //         btn0.textContent = time.value;
      //         btn0.value = time.valueAsNumber;
      //         summa.dispatchEvent(getSum);
      //       });
      }
      ol.childNodes[j].append(btn0);
    }
       
    time.addEventListener("input",       handleInput);
    time.addEventListener("pointerdown", handleInput);
    time.addEventListener("change",      handleInput);
    time.addEventListener("update",      handleInput);


  }

  // c.classList.add("s");
  // m.classList.add("m");
  // v.classList.add("v");
  // t.classList.add("time");

  table.classList.add("block");
  trc.classList.add("block");
  trm.classList.add("block");
  trv.classList.add("block");
  trt.classList.add("block");

  trc.append(ltrc, c);
  trm.append(ltrm, m);
  trv.append(ltrv, v);
  trt.append(ltrt, t);

  table.append(trc);
  table.append(trm);
  table.append(trv);
  table.append(trt);
  main.append(table);
  main.append(calc);

  const diw = document.createElement("section");

  diw.append(start);
  // diw.append(start, end);
  main.append(diw);

  const diwend = document.createElement("section");

  // diwend.append(summa, timeDx, dx);
  diwend.append(summa);
  diwend.append(dx);

  main.append(ol);
  main.append(diwend);
}

const button = document.createElement("button");
button.textContent = "Вычислить";
main.append(button);
const get = document.createElement("button");
get.textContent    = "Загрузить";
main.append(get);

const section = document.createElement("section");
main.append(section);

let list = [];

function Pare(meters, quantity, time, data, run) {
  this.meters = meters;
  this.quantity = quantity;
  this.time = time;
  this.data = data;
  this.run = run;
}
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
  list.length && list.forEach((item, i) => {
      item.classList.remove("tg");
      delete list[i];
  });

  const data = []
  const response = await fetch(document.location.href, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      action: "select",
      table: {
        name: "diary",
      },
      date:this.date.valueAsNumber,
      // time:this.time.value,
      time:this.time.textContent,
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
  start.valueAsNumber = this.run.valueAsNumber;
    
  summa.dispatchEvent(getSum);
  dx.dispatchEvent(getSum);
  timeDx.dispatchEvent(getSum);
}
const getSum = new CustomEvent("getSum", {
  bubbles: true, // Позволяет событию всплывать
  cancelable: true, // Позволяет событию быть отменяемым
});
function getTimeSumm() {
  let sum = 0;
  list.forEach((item) => {
    sum += +item.value;
  });
  return sum;
}

// section.addEventListener("pointerdown", load);

function begin(ol, timeRun) {
  // console.log(sum);
  let sum = timeRun||28800000;
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
        name: "diary",
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








let listMS = [];
let countDiv = 0;
get.addEventListener("click", async function (e) {
  
  
  
  const response = await getDB();
  console.log(response);
  
  let select = document.createElement("select");
  section.id = "";
  viewData(response,select)

});

function renderPass(){
  let div = document.createElement("div");
  
  let date = document.createElement("input");
  let p = document.createElement("p");
  
  let ul = document.createElement("ul");
  let ol = document.createElement("ol");
  

  let buttonWrite = document.createElement("button");
  
  
  buttonWrite.addEventListener("pointerdown", load);
  buttonWrite.date = date;
  buttonWrite.time = p;
  
  
  div.append(date);
  div.append(p);
  div.append(ol);
  div.append(buttonWrite);
  div.classList.add("tail");
  section.append(div);
  let sum = 0;
  
  const lineData = document.createElement("li");
  const time = document.createElement("input");
  time.type = "time";
  lineData.append(time);
  ol.append(lineData);      
  
  
  
  const TimeOfDay = new Object();
  console.log(TimeOfDay);
  
  const option = document.createElement("option");

  div.id = countDiv;
  countDiv++;
  return function (database){
    date.type = "date";
    date.valueAsNumber = database.date;
    date.min = date.value;
    date.max = date.value;
    
    sum = sum||database.run||28800000;
    time.valueAsNumber = time12(database.run||28800000);
    time.setAttribute('disabled', true);
    buttonWrite.run = time;
    
    p.textContent = database.time;
    
    
    for (let i = 0; i < database.quantity; i++) {
      const lineData = document.createElement("li");
      const time = document.createElement("input");
      lineData.append(time);
      ol.append(lineData);    
      
      time.type = "time";
      // time.setAttribute('readonly', true);
      time.setAttribute('disabled', true);
      sum += +database.millisecond;
      
      // console.log(sum);
      listMS.push(database.millisecond);
      time.valueAsNumber = time12(sum);
      updateColor(lineData, +database.millisecond);
    }
    buttonWrite.textContent = "Загрузить";
    return div;
  }
}
function viewData(ansver, select) {

  const archiv = [];
  
  section.innerHTML = "";
  select.innerHTML = "";

  let ol = document.createElement("ol");

  let dtinput = document.createElement("input");
  let ul = document.createElement("ul");

  let div = document.createElement("div");

  let buttonWrite = document.createElement("button");

  let obj = {};
  let sum = 0;
  let count = 0;
  let currentValue = null; // Переменная для хранения текущего значения
  let currentValue2 = null; // Переменная для хранения текущего значения

  
  let fnh = renderPass();
  
  ansver.forEach((database) => {
    const minute = database.millisecond / 60000;
    if (database.date === currentValue && database.time === currentValue2) {
      if (obj[minute]) {
        obj[minute] += database.quantity;
      } else {
        obj[minute] = database.quantity;
      }
      sum = write(database, sum, ol, data[count]);
      div.append(ol);
      div.append(buttonWrite);
      div.classList.add("tail");
      
      fnh(database)
      // console.log(fnh(database));
    } else {
      if (currentValue !== null && currentValue2 !== null) {
        if (obj && ul) {
          for (const [key, value] of Object.entries(obj)) {
            const listItem = document.createElement("li");
            listItem.textContent = `Время: ${key}, Количество: ${value}`;
            ul.appendChild(listItem);
          }
        }
        obj = new Object();
        ol = document.createElement("ol");
        dtinput = document.createElement("input");
        select = document.createElement("select");
        ul = document.createElement("ul");
        // section.append(div);
        div = document.createElement("div");
        fnh = renderPass(archiv);
        

        buttonWrite = document.createElement("button");

        sum = begin(ol, database.run);
        
        count++;
      }
      console.log(
        "millisecond " + database.millisecond,
        "quantity " + database.quantity,
        obj
      );

      currentValue = database.date;
      currentValue2 = database.time;

      sum = begin(ol, database.run);

      dtinput.type = "date";
      dtinput.valueAsNumber = database.date;
      div.append(dtinput);

      // archiv.push({ date: dtinput, time: select });

      div.append(dropListSelect([{ name: database.time }], select));
      buttonWrite.textContent = "Загрузить";

      // buttonWrite.addEventListener("pointerdown", load);

      div.append(ul);

      obj[minute] = database.quantity;
      data[count] = [];
      div.id = count;
      sum = write(database, sum, ol, data[count]);
      fnh(database);
      // console.log(fnh(database));
      
    }
  });
  div.append(ol);
  div.append(buttonWrite);
  div.classList.add("tail");
  // section.append(div);
  if (obj && ul) {
    for (const [key, value] of Object.entries(obj)) {
      const listItem = document.createElement("li");
      listItem.textContent = `Время: ${key}, Количество: ${value}`;
      ul.appendChild(listItem);
    }
  }
  console.log(archiv.length)
  console.log(archiv)
}



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
  const dateWithoutTimeInMs = new Date(year, month, day).getTime() + 3600000 * 7;

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
