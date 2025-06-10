// {

//     let Amat2 = [];
//     let Bmat2 = [];
//     {
//         function sinx(array, arrayAdd, dom, domAdd) {
//             array.push(arrayAdd);
//             if (Array.isArray(domAdd))
//                 dom.append(...domAdd);
//             else
//                 dom.append(domAdd);
//         }
//         function tr() {
//             let row = document.createElement("tr");
//             sinx(ArrayTR, row, tbody, row);
//             let cell = document.createElement("td");
//             let input = document.createElement("input");
//             input.type = "number";
//             input.value = "1";
//             row.append(cell);
//             sinx(Amat2, [input], cell, input);
//         }
//         let tradd = document.createElement("button");
//         tradd.textContent = "|";
//         main.append(tradd);
//         let tdadd = document.createElement("button");
//         tdadd.textContent = "--";
//         main.append(tdadd);
//         let getMat2 = document.createElement("button");
//         getMat2.textContent = "getMat2";
//         main.append(getMat2);
//         let table = document.createElement("table");
//         let tbody = document.createElement("tbody");
//         let thead = document.createElement("thead");
//         table.append(thead);
//         table.append(tbody);
//         main.append(table);
//         // let Amat2 = [];
//         let ArrayTR = [];
//         tr();
//         tradd.addEventListener("pointerdown", function (event) {
//             const button = event.target.closest("button");
//             if (!button) return;
//             let tr = document.createElement("tr");
//             sinx(ArrayTR, tr, tbody, tr);
//             let ArrayTD = [];
//             let arrayInput = [];
//             Amat2.at(-1).forEach(item => {
//                 let td = document.createElement("td");
//                 let input = document.createElement("input");
//                 input.type = "number";
//                 td.append(input);
//                 input.value = "1";
//                 arrayInput.push(input);
//                 ArrayTD.push(td);
//             });
//             sinx(Amat2, arrayInput, tr, ArrayTD);
//             console.log(Amat2);
//         });
//         tdadd.addEventListener("pointerdown", function (event) {
//             const button = event.target.closest("button");
//             if (!button) return;
//             Amat2.forEach((item, index) => {
//                 let td = document.createElement("td");
//                 let input = document.createElement("input");
//                 input.type = "number";
//                 td.append(input);
//                 input.value = "1";
//                 sinx(item, input, ArrayTR[index], td);
//             });
//         });
//         getMat2.addEventListener("pointerdown", function (event) {
//             const button = event.target.closest("button");
//             if (!button) return;
//             console.log(Amat2);
//         });
//     }
//     {
//         function sinx(array, arrayAdd, dom, domAdd) {
//             array.push(arrayAdd);
//             if (Array.isArray(domAdd))
//                 dom.append(...domAdd);
//             else
//                 dom.append(domAdd);
//         }
//         function tr() {
//             let row = document.createElement("tr");
//             sinx(ArrayTR, row, tbody, row);
//             let cell = document.createElement("td");
//             let input = document.createElement("input");
//             input.type = "number";
//             input.value = "1";
//             row.append(cell);
//             sinx(Bmat2, [input], cell, input);
//         }
//         let tradd = document.createElement("button");
//         tradd.textContent = "|";
//         main.append(tradd);
//         let tdadd = document.createElement("button");
//         tdadd.textContent = "--";
//         main.append(tdadd);
//         let getMat2 = document.createElement("button");
//         getMat2.textContent = "getMat2";
//         main.append(getMat2);
//         let table = document.createElement("table");
//         let tbody = document.createElement("tbody");
//         let thead = document.createElement("thead");
//         table.append(thead);
//         table.append(tbody);
//         main.append(table);
//         // let Bmat2 = [];
//         let ArrayTR = [];
//         tr();
//         tradd.addEventListener("pointerdown", function (event) {
//             const button = event.target.closest("button");
//             if (!button) return;
//             let tr = document.createElement("tr");
//             sinx(ArrayTR, tr, tbody, tr);
//             let ArrayTD = [];
//             let arrayInput = [];
//             Bmat2.at(-1).forEach(item => {
//                 let td = document.createElement("td");
//                 let input = document.createElement("input");
//                 input.type = "number";
//                 td.append(input);
//                 input.value = "1";
//                 arrayInput.push(input);
//                 ArrayTD.push(td);
//             });
//             sinx(Bmat2, arrayInput, tr, ArrayTD);
//             console.log(Bmat2);
//         });
//         tdadd.addEventListener("pointerdown", function (event) {
//             const button = event.target.closest("button");
//             if (!button) return;
//             Bmat2.forEach((item, index) => {
//                 let td = document.createElement("td");
//                 let input = document.createElement("input");
//                 input.type = "number";
//                 td.append(input);
//                 input.value = "1";
//                 sinx(item, input, ArrayTR[index], td);
//             });
//         });
//         getMat2.addEventListener("pointerdown", function (event) {
//             const button = event.target.closest("button");
//             if (!button) return;
//             console.log(Bmat2);
//         });
//     }



//     {
//         let calc = document.createElement("button");
//         calc.textContent = "Calc";
//         main.append(calc);

//         let table = document.createElement("table");
//         let tbody = document.createElement("tbody");
//         table.append(tbody);
//         main.append(table);

//         calc.addEventListener("pointerdown", function (event) {
//             const button = event.target.closest("button");
//             if (!button) return;
//             tbody.innerHTML = "";
//             let resMat2 = power(Amat2, Bmat2);
//             resMat2.forEach(item => {
//                 let tr = document.createElement("tr");
//                 item.forEach(value => {
//                     let td = document.createElement("td");
//                     tr.append(td);
//                     td.textContent = value;
//                 })
//                 tbody.append(tr);
//             })
//             // console.log(power(Amat2, Bmat2));
//         });


//     }




//     function power(A, B) {
//         const rowsA = A.length, colsA = A[0].length,
//             rowsB = B.length, colsB = B[0].length;
//         if (colsA != rowsB) throw new Error("A:columns is NOT equal to B:rows (A:" + A[0] + " B:" + B + ")");

//         if (A[0].length === B.length) {
//             // if (colsA != rowsB) throw new Error("A:columns is NOT equal to B:rows (A:" + A[0] + " B:" + B + ")");
//             let C = [];
//             for (let Arow = 0; Arow < rowsA; ++Arow) {
//                 C[Arow] = [];
//                 for (let Bcol = 0; Bcol < colsB; ++Bcol) {
//                     C[Arow][Bcol] = 0;
//                     for (let i = 0; i < colsA; ++i) {
//                         C[Arow][Bcol] += A[Arow][i].valueAsNumber * B[i][Bcol].valueAsNumber;
//                     }
//                 }
//             }
//             return C;
//         }
//     }
// }
console.log("DATA");