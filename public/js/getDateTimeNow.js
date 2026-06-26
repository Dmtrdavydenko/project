const now = new Date();
now.setSeconds(0, 0);
DateTime.valueAsNumber = (now.getTime() - now.getTimezoneOffset() * 60000);

const SHIFT_MS = 720 * 60000;
const globalOffset = 5;
const shift = Math.floor((DateTime.valueAsNumber + (4 * 60000 * 60)) / SHIFT_MS);
const cycle = (shift + globalOffset) % 16;
console.log({ shift }, ((DateTime.valueAsNumber + (4 * 60000 * 60)) / SHIFT_MS));
console.log({ cycle });


const table = [
    1, 4, 1, 4, 2, 1, 2, 1, 3, 2, 3, 2, 4, 3, 4, 3
];
console.log(table[cycle]);

smena.value = table[cycle];
product.value = 2000;

const shifts = [
    { day: 1, night: 4 },
    { day: 1, night: 4 },
    { day: 2, night: 1 },
    { day: 2, night: 1 },
    { day: 3, night: 2 },
    { day: 3, night: 2 },
    { day: 4, night: 3 },
    { day: 4, night: 3 }
];
const p = Math.floor(cycle / 2);

const isNight = cycle % 2 === 1;

const result = isNight ? shifts[p].night : shifts[p].day;
console.log({ result });

fio.value = "Weaver";
loom.value = 1;
recipe.value = 19;
