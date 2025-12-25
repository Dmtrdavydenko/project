
class viewTime {
    constructor(time) {
        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        //timeInput.type = 'datetime-local';

        timeInput.readOnly = true; // readonly для просмотра на мониторе
        timeInput.valueAsNumber = time;
        //console.log(timeInput.valueAsNumber);
        return timeInput;
    }
}
class viewText {
    constructor(name) {
        const timeInput = document.createElement('label');
        //timeInput.type = 'text';
        //timeInput.type = 'datetime-local';

        //timeInput.readOnly = true; // readonly для просмотра на мониторе
        timeInput.textContent = name;
        //console.log(timeInput.valueAsNumber);
        return timeInput;
    }
}
class DataTape {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.data = [];
    }
    async loadData(action, params = {}) {
        try {
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
            return this.data;
        } catch (error) {
            console.error("Ошибка при загрузке данных:", error);
            throw error;
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





const Tape = new DataTape("https://worktime.up.railway.app/textile");
const Thread = new DataTape("https://worktime.up.railway.app/textile");
const Time = new DataTape("https://worktime.up.railway.app/textile");

(async () => {
    const tape = await Tape.loadData("getTape");
    const thread = await Thread.loadData("getThreads");
    const task = await Time.loadData("getTime");
    //const task = [[]];

    console.log(Tape);
    console.log(tape);

    console.log(Thread);
    console.log(thread);

    console.log(Time);
    console.log(task);

    //console.log(task[0]);




    //task[0] = [
    //    {
    //        "id": 1,
    //        "time_seconds": 1763150400,
    //        "time_milliseconds": 1763150400000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "светостабилизатор 1,5%"
    //    },
    //    {
    //        "id": 2,
    //        "time_seconds": 1763152380,
    //        "time_milliseconds": 1763152380000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 3,
    //        "time_seconds": 1763154360,
    //        "time_milliseconds": 1763154360000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 4,
    //        "time_seconds": 1763156340,
    //        "time_milliseconds": 1763156340000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 5,
    //        "time_seconds": 1763158320,
    //        "time_milliseconds": 1763158320000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 6,
    //        "time_seconds": 1763160300,
    //        "time_milliseconds": 1763160300000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 7,
    //        "time_seconds": 1763162280,
    //        "time_milliseconds": 1763162280000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 8,
    //        "time_seconds": 1763164260,
    //        "time_milliseconds": 1763164260000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 9,
    //        "time_seconds": 1763169600,
    //        "time_milliseconds": 1763169600000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 10,
    //        "time_seconds": 1763172000,
    //        "time_milliseconds": 1763172000000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 11,
    //        "time_seconds": 1763174400,
    //        "time_milliseconds": 1763174400000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 12,
    //        "time_seconds": 1763176800,
    //        "time_milliseconds": 1763176800000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 13,
    //        "time_seconds": 1763179200,
    //        "time_milliseconds": 1763179200000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 14,
    //        "time_seconds": 1763181600,
    //        "time_milliseconds": 1763181600000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 15,
    //        "time_seconds": 1763184000,
    //        "time_milliseconds": 1763184000000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 16,
    //        "time_seconds": 1763186400,
    //        "time_milliseconds": 1763186400000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    },
    //    {
    //        "id": 17,
    //        "time_seconds": 1763188800,
    //        "time_milliseconds": 1763188800000,
    //        "thread_density": 90,
    //        "color": "белая",
    //        "additive_name": "нет"
    //    }
    //]
    //option.textContent = `${tape.density} ${item.additive_name === "нет" ? item.color : item.additive_name}`;



    function predictYarn(task, i) {
        const range = task[i].task_minutes - task[i - 1].task_minutes;
        const task_length = range * task[i].speed;
        task[i].task_length = task_length;
        return { range, task_length, ...task[i] };
    }
    //if (Math.abs(item.task_length - item.length) <= 20) {
    //    console.log(`Индекс ${i}: Уток (weft) - task_length: ${item.task_length}, length: ${item.length}`);
    //} else {
    //    console.log(`Индекс ${i}: Основа (warp) - task_length: ${item.task_length}, length: ${item.length}`);
    //}
    //const schedule = task[0].map(item => ({ time: item.time_milliseconds, name: `${item.type} ${item.density} ${item.additive_name === "нет" ? item.color : item.additive_name}` }));
    let intervalSecondsJob = [0];


    for (let i = 1; i < task[0].length; i++) {
        
        intervalSecondsJob.push(predictYarn(task[0],i));

    }


    console.log(task[0]);
    let leftoverMs = 0; 

    const schedule = task[0].map(item => {
        const warp_or_weft = Math.abs(item.task_length - item.length) <= 450 ? item.type : 'основа';
        const nameAdd = item.additive_name === "нет" ? item.color : item.additive_name;

        const totalMs = item.task_milliseconds + leftoverMs;
        const fullMinutes = Math.floor(totalMs / 60000);
        leftoverMs = totalMs % 60000;
        const timeHHMM = fullMinutes * 60000;
        console.log(warp_or_weft, item.density, item.task_length, item.length, item.speed, Math.abs(item.task_length - item.length));

        return {
            time: timeHHMM,
            name: `${warp_or_weft} ${item.density} ${nameAdd}`
        };
    });
    console.log(schedule);


    let nameThread = [];
    //for (var i = 0; i < intervalSecondsJob.length; i++) {
    //    const foundItem = tape[0].find(item => item.time_seconds === intervalSecondsJob[i]);
    //    nameThread.push(foundItem ? foundItem.density + " уток" : "основа");
    //}

    console.log(intervalSecondsJob);





    function make() {
        const timeList = document.createElement("ol");
        const section = document.createElement("section");
        const h2 = document.createElement("h2");
        h2.textContent = "Экструдер 1";
        section.appendChild(h2);
        section.appendChild(timeList);

        section.classList.add("class");
        main.appendChild(section);

        const now = new Date();

        const startOfDay2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 7, now.getMinutes(), 0, 0);

        const currentTime = startOfDay2.getTime();

        // Заполнение списка с input type="time"
        const stTime = getCurrentMinutes();

        schedule.forEach((item) => {
            const li = document.createElement('li');
            const timeInput = new viewTime(item.time);
            const threadName = new viewText(item.name);
            const slotMinutes = item.time;
            let sum = item.time;
            if (sum < currentTime) {
                timeInput.disabled = true;
            } else {
                timeInput.classList.add('active');
            }

            li.appendChild(timeInput);
            li.appendChild(threadName);
            li.classList.add("time");

            timeList.appendChild(li);
        });


    }

    make();
    //make();
    //make();


    //main.classList.add("container");
    //timeList.classList.add("time-list");

    //main.appendChild(timeList);
    const infoDiv = 0;

    // Генерация расписания: от 00:00 до 23:20 с шагом 40 минут
    //const schedule = [];
    //for (let hours = 0; hours < 24; hours++) {
    //    for (let minutes = 0; minutes < 60; minutes += 40) {
    //        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    //        schedule.push(timeStr);
    //    }
    //}

    // Функция для получения текущего времени в минутах с начала дня
    function getCurrentMinutes() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0, 0);
        //const startOfDay = new Date(7, 0, 0, 0);
        //const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7 + 8, 0, 0, 0);
        //const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 7, 0, 0, 0);
        //const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0, 0);
        //const startOfDay = new Date(now.getHours(), now.getMinutes(), 0, 0);
        //return now.getHours() * 60 + now.getMinutes()*60*1000;
        //return startOfDay.getTime() + 3600000 * 7;
        //return 28800000;
        //const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 7, now.getMinutes(), 0, 0);
        //const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7 + 8, 0, 0, 0);
        return startOfDay.getTime();
    }




    main.classList.add("container");
})();



//(async () => {
//    const tableName = await getTableName();
//    console.log(tableName);
//    await loadTable();
//})();