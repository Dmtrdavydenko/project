class DataTape {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.data = [];
    }
    async loadData(action, params = {}) {
        try {
            console.log("1");
            if (document.location.hostname === "localhost") {
                try {
                    return [this.loadState(action)];
                    //return this.data;
                } catch (e) {
                    return [localSpace[action]];
                    //return this.data;
                }
                //console.info("Loaded localStorage no localhost");
                //return this.data;
            }
            try {
                const localData = this.loadState(action);
                if (localData) {
                    this.data = localData;
                    console.info("Loaded data from localStorage");
                } else if (localSpace[action]) {
                    // fallback на локальные данные (например, жестко закодированные)
                    this.data = [localSpace[action]];
                    console.info("Loaded data from localSpace");
                }
            } catch (error) {
                console.warn("Local load failed:", error.message);
                this.data = [localSpace[action]];
            }

            // Фоновая загрузка с сервера
            (async () => {
                try {
                    const serverData = await this.request(action, params);
                    this.data = serverData;
                    this.saveState(action, this.data);
                    console.info("Background server update complete");
                } catch (serverError) {
                    console.error("Background server load failed:", serverError.message);
                }
            })();

            // Возвращаем локальные данные немедленно
            return this.data;
        } catch (error) {
            console.warn("Local load failed:", error.message);

            try {
                this.data = await this.request(action, params);
                this.saveState(action, this.data);
                console.info("Load sql and save local space data");
                return this.data;

            } catch (serverError) {
                console.error("Server load failed:", serverError.message);
                this.data = [localSpace[action]];
                console.info("Load local space data");
                return this.data;

            }
            console.error("Ошибка при загрузке данных:", error);
            console.dir(error);
        }
    }
    async request(action, params = {}) {
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
        for (const [key, value] of response.headers.entries()) {
            console.log("\x1b[34m [" + key + "][" + value + "]");
        }
        const contentType = response.headers.get('content-type');
        console.log("\x1b[33m [" + contentType + "]");

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const text = await response.text();

        try {
            const data = JSON.parse(text);
            console.info("Load server sql");
            return { ok: true, data };
        } catch (error) {
            console.log("\x1b[33m [" + text + "]");
            console.dir(error);
            if (error.message.includes("is not valid JSON")) {
                throw new Error("is not valid JSON");
            }
            if (error.message === "Unexpected end of JSON input") {
                throw error;
            }
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

    saveState(action, tapeData) {
        if (action === "getThreads") {
            try {
                localStorage.setItem('tapeSettings', JSON.stringify(tapeData));
            } catch (e) {
                console.error('Ошибка при сохранении в localStorage:', e);
            }
        }
    }
    loadState(action) {
        try {
            if (action !== "getThreads") throw new Error("No load localStorage");
            const saved = localStorage.getItem('tapeSettings');
            if (!saved) throw new Error("No load localStorage");
            return JSON.parse(saved);
        } catch (e) {
            throw new Error("No load localStorage");
        }
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "светостаб 1,5%",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "светостаб 1,5%",
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
        "additive": "нет",
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
        "additive": "светостаб 1,5%",
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
        "additive": "светостаб 1,5%",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "светостаб 2%",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "нет",
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
        "additive": "светостаб 2%",
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
        "additive": "нет",
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
        "additive": "светостаб 2%",
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
        "additive": "светостаб 2%",
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
    const threadi = await Thread.loadData("getThreads");

    console.log(tape);
    console.log(threadi);

    console.log(tape[0]);
    console.log(threadi[0]);
    console.log(cmd);
    const thread = threadi[0].map(({ id, density, speed, length }) => ({
        id,
        density,
        speed,
        length
    }));
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
    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {
            //Thread.data = myThread;
            localStorage.setItem('tapeSettings', JSON.stringify(myThread));
            console.log(myThread);
        }
    });
    window.addEventListener("beforeunload", () => {
        localStorage.setItem('tapeSettings', JSON.stringify(myThread));
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
    //const buttonLine = [];
    //const buttonRow = [];

    //for (let j = 0; j < 27; j++) {
    //    buttonLine.push([]);
    //}

    let infoTime = [];
    const saveSate = [];
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





    let listTask = [];
    const section = document.getElementById("section");
    const select = document.createElement("select");

    let dtinput = null;
    let dateSave = 0;



    //let myThread = [];
    let myThread = thread.slice();
    let uniqueDensity = [...new Set(myThread.map(item => item.density))];
    console.log(uniqueDensity);
    console.log(myThread);
    function initJobTime() {
        const time = document.createElement("input");

        // id нужен для связи с label
        time.id = "job-time-start";

        time.type = "time";
        time.valueAsNumber = INIT_INPUT_DATA.TimeStart.valueAsNumber;

        time.addEventListener("change", () => handleCalculation());
        time.addEventListener("input", () => handleCalculation());

        const label = document.createElement("label");
        label.textContent = "Ввод начала";

        // связываем label с input
        label.htmlFor = time.id;
        label.addEventListener("click", () => {
            time.showPicker?.();
        });

        const li = document.createElement("li");
        const ol = document.createElement("ol");

        li.append(time, label);
        ol.append(li);

        section.append(ol);

        return { ol, start: time };
    }
    const TaskList = initJobTime();
    TaskList.reference = [];
    let compactSelectBtn = [];

    {


        const eve = new CustomEvent("calc", {
            bubbles: true, // Позволяет событию всплывать
            cancelable: true, // Позволяет событию быть отменяемым
        });

        //################################################################################################
        //################################################################################################
        //################################################################################################
        //################################################################################################
        //################################################################################################


    }
    function dropListSelectTex(array, select = document.createElement("select")) {
        array.forEach((tape) => {
            let option = document.createElement("option");
            option.value = tape;
            option.textContent = tape;
            select.append(option);
        });
        return select;
    }
    function calculate(select, length, speed, time, buttons, action) {
        const density = Number(select.value);
        const tape = myThread.find(item => item.density === density);

        const l = parseFloat(length.value);
        const s = parseFloat(speed.value);
        const t = parseFloat(time.valueAsNumber);

        //console.log(tape);

        let interval = 0;
        if ("density" === action) {
            length.value = tape.length;
            speed.value = tape.speed;
            interval = tape.length / tape.speed * 60000;
            time.valueAsNumber = Math.floor(interval / 60000) * 60000;
            for (let button of buttons) {
                button.value = interval;
                button.dataset.density = density;
            }
            updateTimeTask();
        }
        if ("interval" === action) {
            length.value = s * (time.valueAsNumber / 60000);
            for (let button of buttons) {
                button.value = time.valueAsNumber;
            }
            handleCalculation();
        }
        if ("speed" === action) {
            const interval = l / s * 60000;
            time.valueAsNumber = Math.floor(interval / 60000) * 60000;
            for (let button of buttons) {
                button.value = interval;
            }
            update(density, s);
            handleCalculation();
        }
        if ("length" === action) {
            const interval = l / s * 60000;
            time.valueAsNumber = Math.floor(interval / 60000) * 60000;
            for (let button of buttons) {
                button.value = interval;
            }
            handleCalculation();
            //tape.length = l;
        }
    }
    function update(density, speed) {
        const tape = myThread.find(item => item.density === density);
        tape.speed = speed;
    }
    function handleCalculation(event) {
        //section.innerHTML = "";
        //select.innerHTML = "";

        const ol = TaskList.ol;
        //console.log(selectedButtons);
        //console.log(buttonLine);
        //dtinput = document.createElement("input");
        //dtinput.type = "date";
        //// Получаем текущую дату
        //const now = new Date();
        //// Создаём дату для начала сегодняшнего дня: год, месяц, день, 0 часов, 0 минут, 0 секунд, 0 миллисекунд
        //const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        //// Получаем timestamp в миллисекундах
        //const timestampInMs = startOfDay.getTime() + 3600000 * 7;
        //dtinput.valueAsNumber = timestampInMs;
        //dateSave = timestampInMs;


        console.log(selectedButtons);
        compactSelectBtn = selectedButtons.filter(item => item != null);
        console.log(compactSelectBtn);

        const schedule = compactSelectBtn.map(({ column: { select, length } }) => ({ density: select.value, length: length.value }));

        const sequence = groupSequence(schedule);

        const grouped = groupAll(schedule);
        localStorage.setItem('tapeSequence', JSON.stringify(sequence));
        console.log(sequence);
        console.log(grouped);

        stats.innerHTML = grouped.map(item => `
        <b>${item.density}</b>
        Количество: <span>${item.count}</span><span> Катушек ${item.count * 230}</span> 
        <hr>
        `).join("");


        const needCount = compactSelectBtn.length;
        while (TaskList.reference.length > needCount) {
            const last = TaskList.reference.pop();
            last.time.remove();
            last.li.remove();
        }
        while (TaskList.reference.length < needCount) {

            const li = document.createElement("li");

            const time = document.createElement("input");
            time.type = "time";
            time.disabled = true;
            const small = document.createElement("small");

            small.classList.add("small");

            li.append(time, small);
            ol.append(li);

            TaskList.reference.push({
                li,
                time,
                small
            });
        }
        updateTimeTask();
    }
    //################################################################################################
    //################################################################################################
    //################################################################################################
    //################################################################################################




    const columns = [];

    const buttonRow = [];
    const buttonLine = [];

    const ROW_BUTTONS = 25;
    const COLS = 14;

    // ------------------------------------
    // подготовка структур
    // ------------------------------------
    const selectedButtons = new Array(ROW_BUTTONS).fill(null);

    const grid = document.getElementById("grid");
    grid.addEventListener("click", function (e) {

        const btn = e.target.closest("button.tap");
        if (!btn) return;

        const row = btn.row;

        const prev = selectedButtons[row];
        // если уже есть активная в строке — снимаем
        if (prev && prev !== btn) {
            prev.classList.remove("tg");
        }

        // если клик по уже активной → выключаем
        if (prev === btn) {
            btn.classList.remove("tg");
            selectedButtons[row] = null;
            handleCalculation(event);
            return;
        }

        // ставим новую
        btn.classList.add("tg");
        selectedButtons[row] = btn;
        //console.log(selectedButtons);
        handleCalculation(event);
    });

    for (let col = 0; col < COLS; col++) {

        columns[col] = {};

        buttonRow[col] = [];
    }

    for (let row = 0; row < ROW_BUTTONS; row++) {

        buttonLine[row] = [];
    }

    // ------------------------------------
    // 1 строка SELECT
    // ------------------------------------

    for (let col = 0; col < COLS; col++) {

        const select = dropListSelectTex(uniqueDensity);

        select.name = "density";
        columns[col].select = select;

        select.column = columns[col];

        grid.append(select);
    }

    // ------------------------------------
    // 2 строка LENGTH
    // ------------------------------------

    for (let col = 0; col < COLS; col++) {

        const length = document.createElement("input");

        length.type = "number";

        length.name = "length";

        length.placeholder = "Метр";

        length.dataset.colunms = col;

        columns[col].length = length;

        length.column = columns[col];

        grid.append(length);
    }

    // ------------------------------------
    // 3 строка SPEED
    // ------------------------------------

    for (let col = 0; col < COLS; col++) {

        const speed = document.createElement("input");

        speed.type = "number";

        speed.name = "speed";

        speed.placeholder = "Скорость";

        columns[col].speed = speed;

        speed.column = columns[col];

        grid.append(speed);
    }

    // ------------------------------------
    // 4 строка TIME
    // ------------------------------------

    for (let col = 0; col < COLS; col++) {

        const time = document.createElement("input");

        time.type = "time";

        time.name = "interval";

        time.valueAsNumber = 10 * 60000;
        //Math.floor(dataTime[col] / 60000) * 60000 || 0;

        columns[col].time = time;

        time.column = columns[col];

        grid.append(time);
    }

    // ------------------------------------
    // КНОПКИ
    // ------------------------------------

    for (let row = 0; row < ROW_BUTTONS; row++) {

        for (let col = 0; col < COLS; col++) {

            const tapButton = document.createElement("button");

            tapButton.classList.add("tap");
            tapButton.classList.add("col-" + col);

            tapButton.column = columns[col];

            tapButton.row = row;

            buttonRow[col].push(tapButton);

            buttonLine[row].push(tapButton);

            columns[col].buttons ??= [];

            columns[col].buttons.push(tapButton);

            grid.append(tapButton);
        }
    }

    // ------------------------------------
    // СОБЫТИЯ
    // ------------------------------------

    function handleInput(event) {
        const column = event.target.column;
        console.log(column);
        //column.select.value = "90";
        calculate(
            column.select,
            column.length,
            column.speed,
            column.time,
            column.buttons,
            event.target.name
        );
    }
    for (let col = 0; col < COLS; col++) {

        const column = columns[col];

        column.select.addEventListener(
            "change",
            handleInput
        );

        column.length.addEventListener(
            "input",
            handleInput
        );

        column.speed.addEventListener(
            "input",
            handleInput
        );

        column.time.addEventListener(
            "input",
            handleInput
        );

        column.select.dispatchEvent(
            new Event("change")
        );
    }
    console.log(columns);

    const saved = localStorage.getItem('tapeSequence');
    if (saved) {
        const loadState = JSON.parse(saved);

        // ####### STATE #######
        //const loadState = [
        //    { density: 78, length: 16000, count: 6 },
        //    { density: 90, length: 13800, count: 3 },
        //    { density: 90, length: 32000, count: 1 },
        //    { density: 90, length: 31000, count: 1 },
        //    { density: 78, length: 16000, count: 3 }
        //];


        const columnMap = new Map();

        let nextColumnIndex = 0;
        let globalCounter = 0;
        console.log(loadState);
        loadState.forEach(item => {

            const key = `${item.density}_${item.length}`;

            // если колонка уже была
            if (!columnMap.has(key)) {

                columnMap.set(key, nextColumnIndex);

                nextColumnIndex++;
            }

            // берем старый colIndex
            const colIndex = columnMap.get(key);

            const col = columns[colIndex];

            if (!col) return;

            // select
            col.select.value = item.density;
            col.select.dispatchEvent(
                new Event("change", { bubbles: true })
            );

            // length
            col.length.value = item.length;
            col.length.dispatchEvent(
                new Event("input", { bubbles: true })
            );

            // buttons
            for (let i = 0; i < item.count; i++) {

                const btn = col.buttons[globalCounter];

                if (!btn) continue;

                btn.dispatchEvent(
                    new Event("click", { bubbles: true })
                );

                globalCounter++;
            }
        });
        console.log(columnMap);
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
    const get = document.createElement("button");
    //get.textContent = "Загрузить";
    //main.append(get);

    //main.append(section);

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
            option.textContent = `${tape.density} ${tape.additive === "нет" ? tape.color : tape.additive}`;
            select.append(option);
        });
        return select;
    }
    let selectName;








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
    let selectTapeName = {};
    function updateTimeTask() {
        let sum = TaskList.start.valueAsNumber;
        let mod = 0;
        compactSelectBtn.forEach((item, i) => {
            const ref = TaskList.reference[i];

            const li = ref.li;
            const time = ref.time;
            const small = ref.small;
            small.textContent = item.dataset.density;

            updateColor(li, +item.value);

            sum += +item.value;

            let timeMS = time12(sum + mod);

            let timeS = Math.floor(timeMS / 60000);

            mod = timeMS % 60000;

            time.valueAsNumber = timeS * 60000;
        });
    }
    function groupSequence(arr) {

        const result = [];

        let current = null;

        for (const item of arr) {

            if (
                current &&
                current.density === item.density &&
                current.length === item.length
            ) {

                current.count++;

            } else {

                current = {
                    density: item.density,
                    length: item.length,
                    count: 1
                };

                result.push(current);
            }
        }

        return result;
    }
    function groupAll(arr) {

        const map = new Map();

        for (const item of arr) {

            const key =
                `${item.density}_${item.length}`;

            if (!map.has(key)) {

                map.set(key, {
                    density: item.density,
                    length: item.length,
                    count: 0
                });
            }

            map.get(key).count++;
        }

        return [...map.values()];
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
        const color = getRedToBlueColor(totalMinutes / 60000); // Получаем цвет
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

        const minPixels = 130; // Минимальное значение в пикселях
        const maxPixels = 380; // Максимальное значение в пикселях

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
        return pixelValue > 900 ? 900 : pixelValue; // Начинаем с 20 пикселей для 20 минут
    }
    function getRedToBlueColor(minutes) {
        const minMinutes = 20;
        const maxMinutes = 40;

        // Ограничиваем минуты
        const clamped = Math.min(Math.max(minutes, minMinutes), maxMinutes);

        // Нормализуем в диапазон [0,1]
        const t = (clamped - minMinutes) / (maxMinutes - minMinutes);

        // Красный → синий
        const r = Math.floor(lerp(255, 0, t)); // Красный уменьшается
        const g = 0;                           // Зеленый всегда 0
        const b = Math.floor(lerp(0, 255, t)); // Синий увеличивается

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Линейная интерполяция
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }
    function getWeatherGradientColor(minutes) {
        const minMinutes = 20;
        const maxMinutes = 90;

        // Ограничиваем минуты
        const clamped = Math.min(Math.max(minutes, minMinutes), maxMinutes);
        const t = (clamped - minMinutes) / (maxMinutes - minMinutes);

        let r, g, b;

        if (t <= 0.5) {
            // Красный → зеленый
            const tt = t * 2;
            r = 255;
            g = Math.floor(lerp(0, 255, tt));
            b = 0;
        } else {
            // Зеленый → синий
            const tt = (t - 0.5) * 2;
            r = 0;
            g = Math.floor(lerp(255, 0, tt));
            b = Math.floor(lerp(0, 255, tt));
        }

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Линейная интерполяция
    function lerp(a, b, t) {
        return a + (b - a) * t;
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
})("test");















