const now = new Date();
now.setSeconds(0, 0);
DateTime.valueAsNumber = (now.getTime() - now.getTimezoneOffset() * 60000);

const SHIFT_MS = 720 * 60000;
const globalOffset = 5;
const shift = Math.floor(DateTime.valueAsNumber / SHIFT_MS);
const cycle = (shift + globalOffset) % 16;
console.log({ shift });
console.log({ cycle });


const table = [
    1, 4, 1, 4, 2, 1, 2, 1, 3, 2, 3, 2, 4, 3, 4, 3
];


console.log(table[cycle]);
smena.value = table[cycle % 2][cycle % 8];