class DataTape {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.data = [];
    }
    async loadData(action, params = {}) {
        try {
            if (document.location.hostname === "localhost") {
                throw new Error("No load connection");
            }

            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({
                    action: action, // Например, "getThreads", "getTasks"
                    ...params
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            this.data = await response.json(); // Предполагаем, что API возвращает массив объектов
            console.info("Load server sql space data");
            return this.data;
        } catch (error) {
            if (error.message === "No load connection") {
                this.data = [localSpace[action]];
                console.info("Load local space data");
                return this.data;
            }
            console.error("Ошибка при загрузке данных:", error);
        }
    }
    getAll() {
        return [...this.data];
    }
    getByIndex(index) {
        if (index < 0 || index >= this.data.length) {
            throw new Error("Индекс вне диапазона");
        }
        return { ...this.data[index] }; // Возвращаем копию объекта
    }
    getById(id) {
        const item = this.data.find(item => item.id === id);
        if (!item) {
            throw new Error(`Элемент с ID ${id} не найден`);
        }
        return { ...item }; // Возвращаем копию
    }
    filter(callback) {
        return this.data.filter(callback);
    }
    add(item) {
        if (!item || typeof item !== 'object') {
            throw new Error("Неверный элемент для добавления");
        }
        this.data.push({ ...item }); // Добавляем копию
        return this.data.length - 1; // Возвращаем индекс нового элемента
    }
    updateById(id, updates) {
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error(`Элемент с ID ${id} не найден`);
        }
        this.data[index] = { ...this.data[index], ...updates }; // Обновляем объект
        return { ...this.data[index] }; // Возвращаем обновленный элемент
    }
    removeById(id) {
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error(`Элемент с ID ${id} не найден`);
        }
        const removed = this.data.splice(index, 1)[0];
        return removed; // Возвращаем удаленный элемент
    }
    async syncInsert(action, item) {
        try {
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({
                    action: action, // Например, "insertTask"
                    data: item
                }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            const result = await response.json();
            // После успешной синхронизации можно обновить локальные данные, если сервер вернул новый ID и т.д.
            return result;
        } catch (error) {
            console.error("Ошибка при синхронизации вставки:", error);
            throw error;
        }
    }
    getCount() {
        return this.data.length;
    }
    sort(compareFunction) {
        return [...this.data].sort(compareFunction);
    }
}
const Tape = new DataTape("https://worktime.up.railway.app/app");
const Thread = new DataTape("https://worktime.up.railway.app/app");
const localSpace = {};
localSpace.getTape = [
    {
        "id": 19,
        "group_id": 13,
        "density": 50,
        "type": "уток",
        "color": "белая",
        "additive_name": "нет",
        "thread_time": 62,
        "time_seconds": 3720,
        "time_milliseconds": 3720000
    },
    {
        "id": 1,
        "group_id": 1,
        "density": 64,
        "type": "уток",
        "color": "белая",
        "additive_name": "нет",
        "thread_time": 58,
        "time_seconds": 3480,
        "time_milliseconds": 3480000
    },
    {
        "id": 10,
        "group_id": 1,
        "density": 64,
        "type": "уток",
        "color": "оранжевая",
        "additive_name": "нет",
        "thread_time": 58,
        "time_seconds": 3480,
        "time_milliseconds": 3480000
    },
    {
        "id": 2,
        "group_id": 2,
        "density": 78,
        "type": "уток",
        "color": "белая",
        "additive_name": "нет",
        "thread_time": 36.36360168457031,
        "time_seconds": 2181.8161010742188,
        "time_milliseconds": 2181816.1010742188
    },
    {
        "id": 23,
        "group_id": 2,
        "density": 78,
        "type": "уток",
        "color": "цветная",
        "additive_name": "нет",
        "thread_time": 36.36360168457031,
        "time_seconds": 2181.8161010742188,
        "time_milliseconds": 2181816.1010742188
    },
    {
        "id": 22,
        "group_id": 2,
        "density": 78,
        "type": "уток",
        "color": "желтая",
        "additive_name": "нет",
        "thread_time": 36.36360168457031,
        "time_seconds": 2181.8161010742188,
        "time_milliseconds": 2181816.1010742188
    },
    {
        "id": 11,
        "group_id": 14,
        "density": 78,
        "type": "уток",
        "color": "зелёная",
        "additive_name": "нет",
        "thread_time": 45.714298248291016,
        "time_seconds": 2742.857894897461,
        "time_milliseconds": 2742857.894897461
    },
    {
        "id": 21,
        "group_id": 2,
        "density": 78,
        "type": "уток",
        "color": "оранжевая",
        "additive_name": "нет",
        "thread_time": 36.36360168457031,
        "time_seconds": 2181.8161010742188,
        "time_milliseconds": 2181816.1010742188
    },
    {
        "id": 20,
        "group_id": 2,
        "density": 78,
        "type": "уток",
        "color": "белая",
        "additive_name": "светостаб 1,5%",
        "thread_time": 36.36360168457031,
        "time_seconds": 2181.8161010742188,
        "time_milliseconds": 2181816.1010742188
    },
    {
        "id": 24,
        "group_id": 3,
        "density": 90,
        "type": "уток",
        "color": "серая",
        "additive_name": "нет",
        "thread_time": 31.111099243164062,
        "time_seconds": 1866.6659545898438,
        "time_milliseconds": 1866665.9545898438
    },
    {
        "id": 27,
        "group_id": 15,
        "density": 90,
        "type": "уток",
        "color": "цветная",
        "additive_name": "нет",
        "thread_time": 40,
        "time_seconds": 2400,
        "time_milliseconds": 2400000
    },
    {
        "id": 26,
        "group_id": 3,
        "density": 90,
        "type": "уток",
        "color": "чёрная",
        "additive_name": "нет",
        "thread_time": 31.111099243164062,
        "time_seconds": 1866.6659545898438,
        "time_milliseconds": 1866665.9545898438
    },
    {
        "id": 25,
        "group_id": 3,
        "density": 90,
        "type": "уток",
        "color": "красная",
        "additive_name": "нет",
        "thread_time": 31.111099243164062,
        "time_seconds": 1866.6659545898438,
        "time_milliseconds": 1866665.9545898438
    },
    {
        "id": 18,
        "group_id": 3,
        "density": 90,
        "type": "уток",
        "color": "оранжевая",
        "additive_name": "нет",
        "thread_time": 31.111099243164062,
        "time_seconds": 1866.6659545898438,
        "time_milliseconds": 1866665.9545898438
    },
    {
        "id": 17,
        "group_id": 3,
        "density": 90,
        "type": "уток",
        "color": "прозрачная",
        "additive_name": "нет",
        "thread_time": 31.111099243164062,
        "time_seconds": 1866.6659545898438,
        "time_milliseconds": 1866665.9545898438
    },
    {
        "id": 16,
        "group_id": 3,
        "density": 90,
        "type": "уток",
        "color": "синяя",
        "additive_name": "нет",
        "thread_time": 31.111099243164062,
        "time_seconds": 1866.6659545898438,
        "time_milliseconds": 1866665.9545898438
    },
    {
        "id": 14,
        "group_id": 3,
        "density": 90,
        "type": "уток",
        "color": "белая",
        "additive_name": "светостаб 1,5%",
        "thread_time": 31.111099243164062,
        "time_seconds": 1866.6659545898438,
        "time_milliseconds": 1866665.9545898438
    },
    {
        "id": 3,
        "group_id": 3,
        "density": 90,
        "type": "уток",
        "color": "белая",
        "additive_name": "нет",
        "thread_time": 31.111099243164062,
        "time_seconds": 1866.6659545898438,
        "time_milliseconds": 1866665.9545898438
    },
    {
        "id": 28,
        "group_id": 10,
        "density": 102,
        "type": "уток",
        "color": "белая",
        "additive_name": "светостаб 1,5%",
        "thread_time": 34,
        "time_seconds": 2040,
        "time_milliseconds": 2040000
    },
    {
        "id": 15,
        "group_id": 4,
        "density": 105,
        "type": "уток",
        "color": "белая",
        "additive_name": "светостаб 1,5%",
        "thread_time": 28.875,
        "time_seconds": 1732.5,
        "time_milliseconds": 1732500
    },
    {
        "id": 33,
        "group_id": 4,
        "density": 105,
        "type": "уток",
        "color": "зелёная",
        "additive_name": "нет",
        "thread_time": 28.875,
        "time_seconds": 1732.5,
        "time_milliseconds": 1732500
    },
    {
        "id": 32,
        "group_id": 4,
        "density": 105,
        "type": "уток",
        "color": "бирюзовая",
        "additive_name": "нет",
        "thread_time": 28.875,
        "time_seconds": 1732.5,
        "time_milliseconds": 1732500
    },
    {
        "id": 31,
        "group_id": 4,
        "density": 105,
        "type": "уток",
        "color": "цветная",
        "additive_name": "нет",
        "thread_time": 28.875,
        "time_seconds": 1732.5,
        "time_milliseconds": 1732500
    },
    {
        "id": 30,
        "group_id": 4,
        "density": 105,
        "type": "уток",
        "color": "чёрная",
        "additive_name": "нет",
        "thread_time": 28.875,
        "time_seconds": 1732.5,
        "time_milliseconds": 1732500
    },
    {
        "id": 29,
        "group_id": 4,
        "density": 105,
        "type": "уток",
        "color": "красная",
        "additive_name": "нет",
        "thread_time": 28.875,
        "time_seconds": 1732.5,
        "time_milliseconds": 1732500
    },
    {
        "id": 5,
        "group_id": 5,
        "density": 110,
        "type": "уток",
        "color": "белая",
        "additive_name": "нет",
        "thread_time": 27,
        "time_seconds": 1620,
        "time_milliseconds": 1620000
    },
    {
        "id": 38,
        "group_id": 5,
        "density": 110,
        "type": "уток",
        "color": "белая",
        "additive_name": "светостаб 2%",
        "thread_time": 27,
        "time_seconds": 1620,
        "time_milliseconds": 1620000
    },
    {
        "id": 37,
        "group_id": 5,
        "density": 110,
        "type": "уток",
        "color": "чёрная",
        "additive_name": "нет",
        "thread_time": 27,
        "time_seconds": 1620,
        "time_milliseconds": 1620000
    },
    {
        "id": 36,
        "group_id": 5,
        "density": 110,
        "type": "уток",
        "color": "желтая",
        "additive_name": "нет",
        "thread_time": 27,
        "time_seconds": 1620,
        "time_milliseconds": 1620000
    },
    {
        "id": 35,
        "group_id": 5,
        "density": 110,
        "type": "уток",
        "color": "темно-синяя",
        "additive_name": "нет",
        "thread_time": 27,
        "time_seconds": 1620,
        "time_milliseconds": 1620000
    },
    {
        "id": 34,
        "group_id": 5,
        "density": 110,
        "type": "уток",
        "color": "синяя",
        "additive_name": "нет",
        "thread_time": 27,
        "time_seconds": 1620,
        "time_milliseconds": 1620000
    },
    {
        "id": 6,
        "group_id": 6,
        "density": 112,
        "type": "уток",
        "color": "белая",
        "additive_name": "нет",
        "thread_time": 30,
        "time_seconds": 1800,
        "time_milliseconds": 1800000
    },
    {
        "id": 12,
        "group_id": 6,
        "density": 112,
        "type": "уток",
        "color": "цветная",
        "additive_name": "нет",
        "thread_time": 30,
        "time_seconds": 1800,
        "time_milliseconds": 1800000
    },
    {
        "id": 39,
        "group_id": 11,
        "density": 130,
        "type": "уток",
        "color": "белая",
        "additive_name": "нет",
        "thread_time": 26.651399612426758,
        "time_seconds": 1599.0839767456055,
        "time_milliseconds": 1599083.9767456055
    },
    {
        "id": 40,
        "group_id": 11,
        "density": 130,
        "type": "уток",
        "color": "синяя",
        "additive_name": "нет",
        "thread_time": 26.651399612426758,
        "time_seconds": 1599.0839767456055,
        "time_milliseconds": 1599083.9767456055
    },
    {
        "id": 41,
        "group_id": 11,
        "density": 130,
        "type": "уток",
        "color": "чёрная",
        "additive_name": "нет",
        "thread_time": 26.651399612426758,
        "time_seconds": 1599.0839767456055,
        "time_milliseconds": 1599083.9767456055
    },
    {
        "id": 7,
        "group_id": 7,
        "density": 140,
        "type": "уток",
        "color": "белая",
        "additive_name": "нет",
        "thread_time": 28,
        "time_seconds": 1680,
        "time_milliseconds": 1680000
    },
    {
        "id": 42,
        "group_id": 7,
        "density": 140,
        "type": "уток",
        "color": "цветная",
        "additive_name": "нет",
        "thread_time": 28,
        "time_seconds": 1680,
        "time_milliseconds": 1680000
    },
    {
        "id": 13,
        "group_id": 8,
        "density": 170,
        "type": "уток",
        "color": "цветная",
        "additive_name": "нет",
        "thread_time": 28,
        "time_seconds": 1680,
        "time_milliseconds": 1680000
    },
    {
        "id": 8,
        "group_id": 8,
        "density": 170,
        "type": "уток",
        "color": "белая",
        "additive_name": "нет",
        "thread_time": 28,
        "time_seconds": 1680,
        "time_milliseconds": 1680000
    },
    {
        "id": 43,
        "group_id": 8,
        "density": 170,
        "type": "уток",
        "color": "белая",
        "additive_name": "светостаб 2%",
        "thread_time": 28,
        "time_seconds": 1680,
        "time_milliseconds": 1680000
    },
    {
        "id": 9,
        "group_id": 9,
        "density": 220,
        "type": "уток",
        "color": "белая",
        "additive_name": "нет",
        "thread_time": 26,
        "time_seconds": 1560,
        "time_milliseconds": 1560000
    },
    {
        "id": 44,
        "group_id": 9,
        "density": 220,
        "type": "уток",
        "color": "белая",
        "additive_name": "светостаб 2%",
        "thread_time": 26,
        "time_seconds": 1560,
        "time_milliseconds": 1560000
    },
    {
        "id": 45,
        "group_id": 12,
        "density": 240,
        "type": "уток",
        "color": "белая",
        "additive_name": "светостаб 2%",
        "thread_time": 22,
        "time_seconds": 1320,
        "time_milliseconds": 1320000
    }
]

localSpace.getThreads = [
    {
        "id": 13,
        "density": 50,
        "length": 25420,
        "speed": 410,
        "time_seconds": 3720,
        "time_milliseconds": 3720000
    },
    {
        "id": 1,
        "density": 64,
        "length": 20300,
        "speed": 350,
        "time_seconds": 3480,
        "time_milliseconds": 3480000
    },
    {
        "id": 14,
        "density": 78,
        "length": 16000,
        "speed": 350,
        "time_seconds": 2742.857894897461,
        "time_milliseconds": 2742857.894897461
    },
    {
        "id": 2,
        "density": 78,
        "length": 16000,
        "speed": 440,
        "time_seconds": 2181.8161010742188,
        "time_milliseconds": 2181816.1010742188
    },
    {
        "id": 15,
        "density": 90,
        "length": 14000,
        "speed": 350,
        "time_seconds": 2400,
        "time_milliseconds": 2400000
    },
    {
        "id": 3,
        "density": 90,
        "length": 14000,
        "speed": 450,
        "time_seconds": 1866.6659545898438,
        "time_milliseconds": 1866665.9545898438
    },
    {
        "id": 10,
        "density": 102,
        "length": 11900,
        "speed": 350,
        "time_seconds": 2040,
        "time_milliseconds": 2040000
    },
    {
        "id": 4,
        "density": 105,
        "length": 11550,
        "speed": 400,
        "time_seconds": 1732.5,
        "time_milliseconds": 1732500
    },
    {
        "id": 5,
        "density": 110,
        "length": 10850,
        "speed": 400,
        "time_seconds": 1620,
        "time_milliseconds": 1620000
    },
    {
        "id": 6,
        "density": 112,
        "length": 10500,
        "speed": 350,
        "time_seconds": 1800,
        "time_milliseconds": 1800000
    },
    {
        "id": 11,
        "density": 130,
        "length": 9328,
        "speed": 350,
        "time_seconds": 1599.0839767456055,
        "time_milliseconds": 1599083.9767456055
    },
    {
        "id": 7,
        "density": 140,
        "length": 8400,
        "speed": 300,
        "time_seconds": 1680,
        "time_milliseconds": 1680000
    },
    {
        "id": 8,
        "density": 170,
        "length": 7000,
        "speed": 250,
        "time_seconds": 1680,
        "time_milliseconds": 1680000
    },
    {
        "id": 9,
        "density": 220,
        "length": 5200,
        "speed": 200,
        "time_seconds": 1560,
        "time_milliseconds": 1560000
    },
    {
        "id": 12,
        "density": 240,
        "length": 4400,
        "speed": 200,
        "time_seconds": 1320,
        "time_milliseconds": 1320000
    }
];



(async (cmd) => {
    const tape = await Tape.loadData("getTape");
    const thread = await Thread.loadData("getThreads");








    console.log(tape);
    console.log(thread);

    console.log(tape[0]);
    console.log(thread[0]);
    console.log(cmd);


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
    const event = new PointerEvent("pointerdown", {
        bubbles: true, // Allows the event to bubble up
        cancelable: true, // Allows the event to be cancelable
    });
    function create3() {
        const TimeStart = document.createElement("input");
        TimeStart.type = "time";
        TimeStart.valueAsNumber = 28800000;

        TimeStart.addEventListener("input", handleCalculation);
        TimeStart.addEventListener("change", handleCalculation);

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
    //main.append(start);
    //main.append(end);
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
    //main.append(DeviceOrientationEvent);

    const DeviceMotionEvent = document.createElement("div");
    //main.append(DeviceMotionEvent);





    let selectedButtons = [];
    let listTask = [];
    const section = document.createElement("section");
    const select = document.createElement("select");
    const send = document.createElement("button");

    let dtinput = null;
    let dateSave = 0;



    let myThread = [];
    myThread[0] = thread[0].slice();
    myThread[0].push({ density: "Время", length: 32000, speed: 400, time_milliseconds: 4800000, id: 0 });
    {
        function dropListSelectTex(array, select = document.createElement("select")) {
            array.forEach((tape) => {
                let option = document.createElement("option");
                option.value = tape.length / tape.speed * 60000;
                //option.value = tape.time_milliseconds;
                option.textContent = Number.isInteger(tape.density) ? `${tape.density} ${tape.speed && "v" + tape.speed || ""}` : `${tape.density}`
                option.name = tape.id;
                select.append(option);
            });
            return select;
        }
        function handleSelect(event) {
            console.log(this, event.target.value)
            if (event.target.value === "4800000") {
                //    //infoTime[this.name].style.display = "inline-block";
                infoTime[this.name].removeAttribute("disabled");
            } else {
                //    //infoTime[this.name].style.display = "none";
                infoTime[this.name].setAttribute("disabled", true);

            }
            infoTime[this.name].valueAsNumber = Math.floor(event.target.value / 60000) * 60000;

            // ## dev
            //setTimeTask();

            let tape = {};
            tape.name = 0;
            const buttons = buttonRow[this.name];
            if (this.options) {
                tape.name = this.options[this.selectedIndex].name;
                for (let button of buttons) {
                    button.name = tape.name;
                }
            }
            for (let button of buttons) {
                button.value = event.target.value;
                //button.value = this.valueAsNumber;
                //button.textContent = Math.floor(infoTime[this.name].valueAsNumber / 60000);
                //button.textContent = infoTime[this.name].valueAsNumber % 60000;
                //button.textContent = infoTime[this.name].value;
                //button.textContent = infoTime[this.name].value.slice(0, 5);
                //button.textContent = "";
            }
            //const fullMinutes = Math.floor(totalMs / 60000);
            //leftoverMs = totalMs % 60000;
            handleCalculation();
        }
        function handleSetButtonColumn(event) {
            console.log(handleSetButtonColumn.name, event.target.value, infoTime[this.name].valueAsNumber, this.valueAsNumber);
            let tape = {};
            tape.name = 0;
            const buttons = buttonRow[this.name];
            if (this.options) {
                tape.name = this.options[this.selectedIndex].name;
                for (let button of buttons) {
                    button.name = tape.name;
                }
            }
            for (let button of buttons) {
                button.value = this.valueAsNumber;
                //button.value = this.valueAsNumber;
                //button.textContent = Math.floor(infoTime[this.name].valueAsNumber / 60000);
                //button.textContent = infoTime[this.name].valueAsNumber % 60000;
                //button.textContent = infoTime[this.name].value;
                //button.textContent = infoTime[this.name].value.slice(0, 5);
                //button.textContent = "";
            }
            //const fullMinutes = Math.floor(totalMs / 60000);
            //leftoverMs = totalMs % 60000;
            handleCalculation();
        }
        //background: linear - gradient(to right, #06d327b0 0 % 56 %, #00eeff6b 0 % 100 %);

        const timeLine = document.createElement("tr");


        const table = document.createElement("table");

        const eve = new CustomEvent("calc", {
            bubbles: true, // Позволяет событию всплывать
            cancelable: true, // Позволяет событию быть отменяемым
        });

        const tbody = document.createElement("tbody");

        // ol.append(start, end);

        for (let i = 0; i < 23; i++) {
            const line = document.createElement("tr");
            line.id = i;
            // ## loatd
            line.addEventListener("click", function (e) {
                if (!e.target.closest("button")) return;
                if (selectedButtons[this.id] === e.target) {
                    e.target.classList.remove("tg");
                    //selectedButtons[this.id].textContent = 0;  
                    delete selectedButtons[this.id];
                } else {
                    selectedButtons[this.id] && selectedButtons[this.id].classList.remove("tg");
                    selectedButtons[this.id] = e.target;
                    e.target.classList.add("tg");

                    //selectedButtons[this.id].textContent = i;  
                    console.log(selectedButtons);
                    console.log({
                        name: selectedButtons[this.id].name,
                        textContent: selectedButtons[this.id].textContent,
                        value: selectedButtons[this.id].value
                    });
                }
                handleCalculation(event);
            });
            tbody.append(line);
        }

        let dataTime = [0, 0, 0, 0];
        for (let counterColunms = 0; counterColunms < 5; counterColunms++) {
            buttonRow.push([]);
            //######################################################################### calc

            //main.append(dropListSelectTex(thread[0]));


            const time = document.createElement("input");
            const td = document.createElement("td");
            const br = document.createElement("br");
            time.name = counterColunms;
            time.type = "time";
            time.placeholder = "с";
            time.valueAsNumber = Math.floor(dataTime[counterColunms] / 60000) * 60000 || 0;
            //time.style.display = "none";
            console.log(myThread[0]);
            let select = dropListSelectTex(myThread[0]);
            select.name = counterColunms;


            td.append(select);
            td.append(br);
            td.append(time);


            timeLine.append(td);
            infoTime.push(time);


            //     panel button tap
            for (let j = 0; j < 23; j++) {
                const tapButton = document.createElement("button");


                const cell = document.createElement("td");
                tapButton.classList.add("tap");

                buttonLine[j].push(tapButton);
                buttonRow[counterColunms].push(tapButton);

                tapButton.coll = counterColunms;

                cell.append(tapButton);
                //cell.classList.add("col"+counterColunms);

                tbody.childNodes[j].append(cell);
            }

            select.addEventListener('change', handleSelect);

            time.addEventListener("input", handleSetButtonColumn);
            time.addEventListener("change", handleSetButtonColumn);
            time.dispatchEvent(new MouseEvent("change", {}));
        }


        table.classList.add("block");


        const aViewTime = document.createElement("a");
        aViewTime.href = "/viewTime";
        aViewTime.textContent = "Просмотр";

        const setTime = document.createElement("button");
        setTime.textContent = "setToDay";



        setTime.addEventListener("click", async function () {
            const response = await fetch("https://worktime.up.railway.app/app", {
                //response = await fetch(document.location.href, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({
                    action: "setToDay"
                }),
            }).then((response) => response.json());
            console.log(response);
        });



        const thead = document.createElement("thead");
        main.append(start);
        main.append(aViewTime);
        main.append(setTime);
        thead.append(timeLine);
        table.append(thead, tbody);
        main.append(table);
    }

    {
        const pin = document.createElement("div");
        // summaFix.style.height="inherit";
        // summaFix.style.maxHeight= "min-content";
        // summaFix.style.height= "inherit";
        // max-height: inherit
        pin.append(summaFix);
        pin.classList.add("pin");
        //main.append(pin);

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
    //main.append(button);
    send.textContent = "Сохранить";
    main.append(send);
    const get = document.createElement("button");
    //get.textContent = "Загрузить";
    //main.append(get);

    main.append(section);

    let listMS = [];




    async function load(e) {
        if (!e.target.closest("button")) return;
        let task = e.target.closest("div");

        infoTime.forEach((item) => (item.valueAsNumber = NaN));
        infoTime.forEach((item) => item.dispatchEvent(event));
        selectedButtons.length &&
            selectedButtons.forEach((item, i) => {
                item.classList.remove("tg");
                delete selectedButtons[i];
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
            selectedButtons[i] = buttonLine[i][c];
        });
        start.valueAsNumber = this.beginning.valueAsNumber;

        summa.dispatchEvent(getSum);
        dx.dispatchEvent(getSum);
        timeDx.dispatchEvent(getSum);
    }
    function getListTimeSum(sum = 0) {
        selectedButtons.forEach((item) => {
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
        //   selectedButtons.length &&
        //     selectedButtons.forEach((item, i) => {
        //       item.classList.remove("tg");
        //       delete selectedButtons[i];
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
        //     selectedButtons[i] = buttonLine[i][c];
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
        this.millisecond = +millisecond;
        this.second = millisecond / 1000;
        this.minute = millisecond / 60000;
        this.quantity = quantity;
        this.time = time;
        this.data = data;
        this.run = run;
        this.runMinute = run / 60000;
    }

    send.addEventListener("click", async function (e) {
        const dat = [];
        const dateSave = dtinput.valueAsNumber;
        console.log("data ", dateSave);
        console.log("time ", select.value);
        console.log("run ", start.valueAsNumber);
        let currentValue = 0; // Переменная для хранения текущего значения
        let count = 0;

        let cc = dtinput.valueAsNumber + start.valueAsNumber;
        selectedButtons.forEach((item, i) => {
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
        const timeData = [];
        timeData.push({ elementDate: dtinput, elementTime: start, elementName: selectTapeName, time: cc, name: selectTapeName.value });
        selectedButtons.forEach((item, i) => {
            cc += +item.value;
            timeData.push({ elementDate: dtinput, elementTime: item, elementName: selectName[i], time: cc, name: selectName[i].value });
        });

        const timeTape = timeData.map(tape => ({
            time: tape.time,
            name: tape.name
        }))

        if (currentValue !== null) {
            console.log("millisecond " + currentValue, "quantity " + count);
            dat.push(
                new Task(currentValue, count, select.value, dateSave, start.valueAsNumber)
            );
        }
        console.log(selectedButtons);
        console.log(timeData);
        console.log(timeTape);


        try {
            // date:13
            // millisecond:2100000
            // quantity:7
            // run:28800000
            // save_id:13
            // time:"День"

            // await fetch(document.location.href, {
            //   method: "POST",
            //   headers: {
            //     "Content-Type": "application/json;charset=utf-8",
            //   },
            //   body: JSON.stringify({
            //     action: "todayW",
            //     table: {
            //       name: "diary",
            //     },
            //     data: dat,
            //     key: {
            //       date: dateSave,
            //       time: select.value,
            //     },
            //   }),
            // }).then((response) => response.json());
            // console.log(response);

            //response = await fetch(document.location.href, {
            //    method: "POST",
            //    headers: {
            //        "Content-Type": "application/json;charset=utf-8",
            //    },
            //    body: JSON.stringify({
            //        action: "save",
            //        table: {
            //            name: "timestamps",
            //        },
            //        data: dat,
            //        key: {
            //            date: dateSave,
            //            time: select.value,
            //        },
            //    }),
            //}).then((response) => response.json());


            //let response = {}

            let response = await fetch("https://worktime.up.railway.app/app", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({
                    action: "insertTime",
                    data: timeTape
                }),
            }).then((response) => response.json());
            console.log(response);


            response = await fetch("https://worktime.up.railway.app/app", {
                //response = await fetch(document.location.href, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({
                    action: "ping"
                }),
            }).then((response) => response.json());
            console.log(response);

            if (response === "pong") {
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
            console.warn(response);
            // console.warn(error);
        }
    });

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
    function setNameTape(array, select) {
        array.forEach((tape) => {
            let option = document.createElement("option");
            option.value = tape.id;

            //option.textContent = `${tape.color}`;
            option.textContent = `${tape.density} ${tape.additive_name === "нет" ? tape.color : tape.additive_name}`;
            select.append(option);
        });
        return select;
    }
    let selectName;
    let lineTask;








    let tapeMap = tape[0];
    function setTimeTask(event) {
        console.log(selectedButtons, listTask);
        const tape = {};
        tape.name = 0;
        tape.ms = 0;
        tape.sumMs = start.valueAsNumber;
        tape.mod = 0;
        selectedButtons.forEach((item, i) => {
            tape.name = +item.name;
            tape.ms = +item.value;
            tape.sumMs += +item.value;

            let timeMS = time12(tape.sumMs + tape.mod);
            tape.mod = timeMS % 60000;
            // ## minute
            listTask[i].valueAsNumber = Math.floor(timeMS / 60000) * 60000;



            //selectName[i]


            let tapeNamesArray = tapeMap.filter(current => +item.name === current.group_id);
            if (tapeNamesArray.length === 0) {
                setNameTape(tapeMap, selectName[i]);
            } else {
                setNameTape(tapeNamesArray, selectName[i]);
            }

            //const box = document.createElement("li");
            //updateColor(box, +item.value);
            //const time = document.createElement("input");
            //time.type = "time";
            //time.name = item.name;
            //sum2 += +item.value;
            ////time.valueAsNumber = time12(sum2);

            //let timeMS = time12(sum2 + mod);
            //let timeS = Math.floor(timeMS / 60000);
            //mod = timeMS % 60000;
            //time.valueAsNumber = timeS * 60000;



            //time.setAttribute("disabled", true);

            //const TapeName = document.createElement("select");
            //TapeName.name = item.name;

            //let tapeNamesArray = tape[0].filter(current => current.group_id === +time.name);

            //console.log(tapeNamesArray);

            //if (tapeNamesArray.length === 0) {
            //    setNameTape(tape[0], TapeName);
            //} else {
            //    setNameTape(tapeNamesArray, TapeName);
            //}

            //selectName.push(TapeName);

            //box.append(time);
            //box.append(TapeName);
            //ol.append(box);
            //console.log(sum2);
        });
    }
    selectName = [];
    lineTask = [];
    let selectTapeName = {};

    function handleCalculation(event) {
        section.innerHTML = "";
        select.innerHTML = "";



        //console.log(selectedButtons);
        //console.log(buttonLine);
        dtinput = document.createElement("input");
        const ol = document.createElement("ol");

        dtinput.type = "date";

        // Получаем текущую дату
        const now = new Date();

        // Создаём дату для начала сегодняшнего дня: год, месяц, день, 0 часов, 0 минут, 0 секунд, 0 миллисекунд
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

        // Получаем timestamp в миллисекундах
        const timestampInMs = startOfDay.getTime() + 3600000 * 7;


        dtinput.valueAsNumber = timestampInMs;
        dateSave = timestampInMs;
        section.append(dtinput);

        section.append(dropListSelect([{ name: "День" }, { name: "Ночь" }], select));
        section.append(ol);

        let sum2 = start.valueAsNumber;
        const box = document.createElement("li");
        const time = document.createElement("input");
        time.type = "time";
        time.valueAsNumber = sum2;
        time.setAttribute("disabled", true);
        box.append(time);

        const startTapeName = document.createElement("select");

        setNameTape(tape[0], startTapeName);
        selectTapeName = startTapeName;
        box.append(startTapeName);

        ol.append(box);


        //let intervalSecondsJob = [start.valueAsNumber / 60000];

        //for (let i = 1; i < selectedButtons.length; i++) {
        //    intervalSecondsJob.push(selectedButtons[i].value / 60000);
        //}
        //console.log(intervalSecondsJob);
        let mod = 0;


        selectedButtons.forEach((button, i) => {
            const box = document.createElement("li");
            updateColor(box, +button.value);


            lineTask[i] = {};
            lineTask[i].time = document.createElement("input");
            lineTask[i].time.setAttribute("disabled", true);
            lineTask[i].time.type = "time";


            lineTask[i].time.name = button.name;
            listTask[i] = lineTask[i].time;


            sum2 += +button.value;


            let timeMS = time12(sum2 + mod);
            let timeS = Math.floor(timeMS / 60000);
            mod = timeMS % 60000;
            lineTask[i].time.valueAsNumber = timeS * 60000;

            lineTask[i].select = document.createElement("select");
            lineTask[i].select.name = button.name;
            selectName[i] = lineTask[i].select;


            let tapeNamesArray = tape[0].filter(current => +lineTask[i].time.name === current.group_id);
            if (tapeNamesArray.length === 0) {
                setNameTape(tape[0], lineTask[i].select);
            } else {
                setNameTape(tapeNamesArray, lineTask[i].select);
            }

            console.log(lineTask);


            box.append(lineTask[i].time);
            box.append(lineTask[i].select);
            ol.append(box);
            console.log(sum2);
        });
        section.append(send);






        selectName.forEach((select, index) => {
            select.addEventListener('change', () => {
                const selectedValue = select.value; // Значение из таргета
                const selectedName = select.name; // Значение из таргета
                // Синхронизируем значение во всех нижних select'ах от index+1 до конца
                console.log(index, selectedName, selectedValue);
                for (let i = index + 1; i < selectName.length; i++) {
                    if (selectName[i].name === selectedName)
                        selectName[i].value = selectedValue;
                }
            });
        });
    }

    button.addEventListener("click", handleCalculation);




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

        const minPixels = 120; // Минимальное значение в пикселях
        const maxPixels = 240; // Максимальное значение в пикселях

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

    function write(database, sum, ol, selectedButtons) {
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
})("test");
















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
