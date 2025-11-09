
class viewTime {
    constructor(time) {
        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.readOnly = true; // readonly для просмотра на мониторе
        timeInput.valueAsNumber = time;

        return timeInput;
    }
}


const schedule = [31200000
, 33600000
, 36000000
, 38400000
, 40800000
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
        return now.getHours() * 60 + now.getMinutes();
    }

    // Функция для парсинга времени в минуты
    function timeToMinutes(timeStr) {
        //const [hours, minutes] = timeStr.split(':').map(Number);
        return 43200000;
    }

    const currentTime = 55200000;

    // Заполнение списка с input type="time"
    schedule.forEach(time => {
        console.log(time);
        const li = document.createElement('li');
        const timeInput = new viewTime(time);
        const slotMinutes = time;
        if (slotMinutes < currentTime) {
            timeInput.disabled = true;
        } else {
            timeInput.classList.add('active');
        }
        
        li.appendChild(timeInput);
        timeList.appendChild(li);
    });
}