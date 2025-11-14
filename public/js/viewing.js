
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


//const schedule = [1762934400000
//    , 1762936800000
//    , 1762939200000
//    , 1762941600000
//    , 1762944000000
//    , 1762946400000
//    , 1762948800000
//    , 1762951200000
//    , 1762953600000
//    , 1762956000000
//    , 1762958400000
//    , 1762960800000
//    , 1762963200000
//    , 1762965600000
//    , 1762968000000
//    , 1762970400000
//    , 1762972800000];





(async () => {
    const response = await fetch("https://worktime.up.railway.app/textile", {
        //response = await fetch(document.location.href, {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
            action: "getTime"
        }),
    }).then((response) => response.json());
    console.log(response);

    const schedule = response[0].map(item => item.time_seconds * 1000);
    let deldaTime = [0];

    for (let i = 1; i < response[0].length; i++) {
        deldaTime.push((response[0][i].time_seconds - response[0][i - 1].time_seconds)*1000);

    }




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
        const currentT = new viewTime(deldaTime[i]);
        const slotMinutes = time;
        console.log(time, "<", currentTime);
        let sum = time;
        if (sum < currentTime) {
            timeInput.disabled = true;
        } else {
            timeInput.classList.add('active');
        }

        li.appendChild(timeInput);
        li.appendChild(currentT);
        timeList.appendChild(li);
    });
}) ();



//(async () => {
//    const tableName = await getTableName();
//    console.log(tableName);
//    await loadTable();
//})();