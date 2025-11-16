
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


const schedule = [
1763150400000 
,1763152380000 
,1763154360000 
,1763156340000 
,1763158320000 
,1763160300000 
,1763162280000 
,1763164260000 
,1763169600000 
,1763172000000 
,1763174400000 
,1763176800000 
,1763179200000 
,1763181600000 
,1763184000000 
,1763186400000 
,1763188800000];



(async () => {
    const thread = await fetch("https://worktime.up.railway.app/textile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "getThreads"
        }),
    }).then((thread) => thread.json());
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
    let dataLength = [0];

    for (let i = 1; i < task[0].length; i++) {
        dataLength.push((task[0][i].time_seconds - task[0][i - 1].time_seconds)*400/60);

    }
    let nameThread = [];
    for (var i = 0; i < dataLength.length; i++) {
        //nameThread.push(thread[0].find(item => item.length === dataLength[i] ? item.density + " уток" : "основа"));
        const foundItem = thread[0].find(item => item.length === dataLength[i]);
        nameThread.push(foundItem ? foundItem.density + " уток" : "основа");


    }
    
    console.log(dataLength);

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
        //console.log(time);
        const li = document.createElement('li');
        //const timeInput = new viewTime(time);
        const timeInput = new viewTime(time);
        const threadName = new viewText(nameThread[i]);
        const slotMinutes = time;
        console.log(time, "<", currentTime);
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