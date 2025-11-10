
class viewTime {
    constructor(time) {
        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        //timeInput.type = 'datetime-local';

        timeInput.readOnly = true; // readonly для просмотра на мониторе
        timeInput.valueAsNumber = time;
        console.log(timeInput.valueAsNumber);
        return timeInput;
    }
}


const schedule = [-300000*2
    , -300000
    , 0
    , 300000
    , 300000 * 2
    , 43200000
    , 45600000
    , 48000000
    , 50400000
    , 52800000
    , 55200000
    , 57600000
    , 60000000
    , 62400000
    , 64800000
    , 67200000
    , 69600000];





{
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
        //const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0, 0);
        //const startOfDay = new Date(7, 0, 0, 0);
        //const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7 + 8, 0, 0, 0);
        //const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 7, 0, 0, 0);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 7, now.getMinutes(), 0, 0);
        //const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0, 0);
        //const startOfDay = new Date(now.getHours(), now.getMinutes(), 0, 0);
        return startOfDay.getTime();
        //return now.getHours() * 60 + now.getMinutes()*60*1000;
        //return startOfDay.getTime() + 3600000 * 7;
        //return 28800000;
    }



    // Функция для парсинга времени в минуты
    function timeToMinutes(timeStr) {
        //const [hours, minutes] = timeStr.split(':').map(Number);
        return 43200000;
    }
    const now = new Date();

    const startOfDay2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0, 0);

    const currentTime = getCurrentMinutes() - startOfDay2.getTime();

    // Заполнение списка с input type="time"
    schedule.forEach(time => {
        //console.log(time);
        const li = document.createElement('li');
        //const timeInput = new viewTime(time);
        const timeInput = new viewTime(getCurrentMinutes() + time);
        const slotMinutes = time;
        console.log(currentTime);
        if (timeInput.valueAsNumber < currentTime) {
            timeInput.disabled = true;
        } else {
            timeInput.classList.add('active');
        }

        li.appendChild(timeInput);
        timeList.appendChild(li);
    });
}