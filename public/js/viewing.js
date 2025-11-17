
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

(async () => {
    const thread = await Tape.loadData("getThreads");

    console.log(Tape);
    console.log(thread);



    const task = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "getTime"
        }),
    }).then((task) => task.json());
    console.log(task);

    const schedule = task[0].map(item => item.time_seconds * 1000);
    let intervalSecondsJob = [0];

    for (let i = 1; i < task[0].length; i++) {
        intervalSecondsJob.push(task[0][i].time_seconds - task[0][i - 1].time_seconds);

    }
    let nameThread = [];
    for (var i = 0; i < intervalSecondsJob.length; i++) {
        const foundItem = thread[0].find(item => item.time_seconds === intervalSecondsJob[i]);
        nameThread.push(foundItem ? foundItem.density + " уток" : "основа");


    }
    
    console.log(intervalSecondsJob);

    const timeList = document.createElement("ol");
    //main.classList.add("container");
    //timeList.classList.add("time-list");
    main.appendChild(timeList);
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



    const now = new Date();

    const startOfDay2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 7, now.getMinutes(), 0, 0);

    const currentTime = startOfDay2.getTime();

    // Заполнение списка с input type="time"
    const stTime = getCurrentMinutes();
    schedule.forEach((time,i) => {
        const li = document.createElement('li');
        const timeInput = new viewTime(time);
        const threadName = new viewText(nameThread[i]);
        const slotMinutes = time;
        let sum = time;
        if (sum < currentTime) {
            timeInput.disabled = true;
        } else {
            timeInput.classList.add('active');
        }

        li.appendChild(timeInput);
        //li.appendChild(threadName);
        timeList.appendChild(li);
    });
}) ();



//(async () => {
//    const tableName = await getTableName();
//    console.log(tableName);
//    await loadTable();
//})();