class Node {
    constructor(data) {
        this.data = data;
        this.parent = null;
        this.children = [];
    }
}
class Tree {
    constructor(data) {
        let node = new Node(data);
        this._root = node;
    }
    find(data, node = this._root) {
        //if the current node matches the data, return it
        if (node.data == data)
            return node;

        //recurse on each child node
        for (let child of node.children) {
            //if the data is found in any child node it will be returned here 
            if (this.find(data, child))
                return child;
        }

        //otherwise, the data was not found
        return null;
    }
    add(data, parentData) {
        let node = new Node(data);
        let parent = this.find(parentData);

        //if the parent exists, add this node
        if (parent) {
            parent.children.push(node);
            node.parent = parent;

            //return this node
            return node;
        }
        //otherwise throw an error
        else {
            throw new Error(`Cannot add node: parent with data ${parentData} not found.`);
        }
    }
    remove(data) {
        //find the node
        let node = this.find(data)

        //if the node exists, remove it from its parent
        if (node) {
            //find the index of this node in its parent
            let parent = node.parent;
            let indexOfNode = parent.children.indexOf(node);
            //and delete it from the parent
            parent.children.splice(indexOfNode, 1);
        }
        //otherwise throw an error
        else {
            throw new Error(`Cannot remove node: node with data ${data} not found.`);
        }
    }
    //depth-first tree traversal
    //starts at the root
    forEachDepthFirst(callback, node = this._root) {
        //recurse on each child node
        for (let child of node.children) {
            //if the data is found in any child node it will be returned here 
            this.forEachDepthFirst(callback, child);
        }

        //otherwise, the data was not found
        callback(node);
    }
    //breadth-first tree traversal
    forEachBreadthFirst(callback) {
        //start with the root node
        let queue = [];
        queue.push(this._root);

        //while the queue is not empty
        while (queue.length > 0) {
            //take the next node from the queue  
            let node = queue.shift();

            //visit it
            callback(node);

            //and enqueue its children
            for (let child of node.children) {
                queue.push(child);
            }
        }
    }
    contains(callback, traversal) {
        traversal.call(this, callback);
    };
}



let t = new Tree("CEO");
t.add("VP Finance", "CEO");
t.add("VP Sales", "CEO");
t.add("Salesperson", "VP Sales");
t.add("Accountant", "VP Finance");
t.add("Bookkeeper", "VP Finance");


t.forEachDepthFirst(node => console.log(node.data));
t.forEachBreadthFirst(node => console.log(node.data));


{
  let Amat2 = [];
  let Bmat2 = [];

  function timeList(time) {
    let datalist = document.createElement("datalist");
    datalist.id = "interval";
    time.forEach((data) => {
      let option = document.createElement("option");
      [option.value, option.textContent = ""] = data.split(" ");
      datalist.append(option);
    });
    main.append(datalist);
  }

  timeList(["00:35 Мука", "00:40 Соль", "00:50", "01:00", "01:10", "01:20"]);

  // input.setAttribute("list", "interval");

  {
    function node(){
      
    }
    const date = [
      [0,40,35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*0+40*16+0=640", 0, 0,40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*1+40*14+45=640", 0, 0, 0,35,45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*2+40*13+50=640", 0, 0, 0, 0, 0,40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*3+40*12+55=640", 0, 0, 0, 0, 0, 0,50,35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*4+40*11+60=640", 0, 0, 0, 0, 0,40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*5+40*10+65=640", 0, 0, 0, 0, 0, 0, 0, 0,40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*6+40*9+70=640", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*7+40*8+75=640", 0, 0, 0, 0, 0, 0, 0, 0, 0,55, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*8+40*8+40=640", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*9+40*7+45=640", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*10+40*6+50=640", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,60,35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*11+40*5+55=640", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*12+40*4+60=640", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*13+40*3+65=640", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,65, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*14+40*2+70=640", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*15+40*1+75=640", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*16+40*1+40=640", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,70,35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      ["35*17+40*0+45=640", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,75,35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,80,35, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,80,35, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      
      // [0, 35, 70, 105, 140, 175, 210, 245, 280, 315, 350, 385, 420, 455, 490, 525, 560, 600, 640],
      // [0, 0,  35, 105, 140, 175, 210, 245, 280, 315, 350, 385, 420, 455, 490, 525, 560, 600, 640],
      // [0, 0, 0,    35, 140, 175, 210, 245, 280, 315, 350, 385, 420, 455, 490, 525, 560, 600, 640],
      // [0, 0, 0, 0,      35, 175, 210, 245, 280, 315, 350, 385, 420, 455, 490, 525, 560, 600, 640],
      // [0, 0, 0, 0, 0,        35, 210, 245, 280, 315, 350, 385, 420, 455, 490, 525, 560, 600, 640],
      // [0, 0, 0, 0, 0, 0,          35, 245, 280, 315, 350, 385, 420, 455, 490, 525, 560, 600, 640],
      // [0, 0, 0, 0, 0, 0, 0,            35, 280, 315, 350, 385, 420, 455, 490, 525, 560, 600, 640],
      // [0, 0, 0, 0, 0, 0, 0, 0,              35, 315, 350, 385, 420, 455, 490, 525, 560, 600, 640],
      // [0, 0, 0, 0, 0, 0, 0, 0, 0,                35, 350, 385, 420, 455, 490, 525, 560, 600, 640],
      // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                  35, 385, 420, 455, 490, 525, 560, 600, 640],
      // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                    35, 420, 455, 490, 525, 560, 600, 640],
      // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                      35, 455, 490, 525, 560, 600, 640],
      // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                        35, 490, 525, 560, 600, 640],
      // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                          35, 525, 560, 600, 640],
      // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                            35, 560, 600, 640],
      // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                              35, 600, 640],
      // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                                40, 640],
      // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                                  40],
      // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,                                0],

      // [],
      // [0],
      // [80,  10],
      // [80, 80, 80, 80, 80, 80, 80, 80],
      // [35, 35, 35, 55, 80, 80, 80, 80, 80, 80],
      // [35, 35, 35, 35, 35, 65, 80, 80, 80, 80, 80],
      // [35, 35, 35, 35, 35, 35, 35, 75, 80, 80, 80, 80],
      // [35, 35, 35, 35, 35, 35, 35, 35, 40, 80, 80, 80, 80],
      // [35, 35, 35, 35, 35, 35, 35, 35, 85, 35, 80, 80, 80],
      // [35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 50, 80, 80, 80],
      // [35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 60, 80, 80],
      // [35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 80],
      // [35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 40, 40],
      // [70, 70, 70, 70, 70, 70, 70, 70, 80],
    ];
    let table = document.createElement("table");
    let thead = document.createElement("thead");
    let tbody = document.createElement("tbody");
    table.append(thead);
    table.append(tbody);
    main.append(table);

    const linkCell = [];

    function th(abc) {
      let th = document.createElement("th");
      th.textContent = abc;
      return th;
    }
    function td(text) {
      let td = document.createElement("td");
      td.textContent = text;
      return td;
    }
    function tr(cell) {
      let tr = document.createElement("tr");
      tr.append(cell);
      return tr;
    }
    const trtHead = document.createElement("tr");

    trtHead.append(th("[ ]"));

    //     26

    const tree = [];
    for (let y = 0; y < date.length; y++) {
      trtHead.append(th(String.fromCharCode(65 + y)));
      // tbody.append(tr(th(String.fromCharCode(y))));
      let line = tr(th(String.fromCharCode(65 + y)));

      let array = [];
      for (let x = 0; x < date[y].length; x++) {
        if (y === x) line.append(td(String.fromCharCode(65 + y)));
        else line.append(td(date[y][x]));

        if (y < x) {
          // console.log(date[y][x]);
          array.push({ time: date[y][x], index: x });
        }
      }
      tbody.append(line);
      // console.log(array);
      tree.push(array);
    }
    thead.append(trtHead);

    let sum = 0;
    let arsum = [];
    // for(let y = 0; y < tree.length; y++){
    // for(let x = 0; x < tree[y].length; x++){
    //   sum += tree[y][x].time;
    //   y = tree[y][x].index;
    // }

    function tst(object) {
      let summ = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      if (object.time) {
        // arsum.push(object.time);
        // summ[0] = object.time;
        // summ[0] += tst(tree[object.index][0])[0];
        // console.log(tree[object.index]);
        
        // for(let i = 0; i<1;i++){
        for(let i = 0; i<tree[object.index].length;i++){
          if(object.time){
            // summ[i] = object.time;
            // summ[i] += tst(tree[object.index][i])[i];
            
//             console.log(tree[object.index][i].time);
            // console.log(tst(tree[object.index][i])[i]);
            // summ[i] = tree[object.index][i].time;
            // summ.push(0);
            // console.log(tree[object.index][i].time);
            // console.log(tst(tree[object.index][i]));
            // summ[i] += tst(tree[object.index][i])[i];
          }
          if(object.time){
            summ[i] = object.time
            summ[i] += tst(tree[object.index][i])[i]
          }
        //   summ = object.time;
        //   console.log(object.time);
        //   summ += tst(tree[object.index][i]);
        }
      }else{
        return summ;
      }
      return summ
    }
    // for (let y = 0; y < tree.length; y++) {
      for (let x = 0; x < tree[0].length; x++) {
        // console.log(tree[y][x]);
        console.log(tst(tree[0][x]),tree[0][x].time);
      }
    // }
    // console.log(tst(0,0));
    // console.log(tst(0,1));
    // console.log(sum);
    // console.log(sum);
    console.log(tree);
    // console.log(arsum);

//     document.addEventListener("pointerdown", function (event) {
//       const tr = event.target.closest("tr");
//       const td = event.target.closest("td");

//       if (!tr) return;
//       console.dir(tr.sectionRowIndex);
//       console.dir(td.cellIndex);
//       console.dir(tr);

//       for (let i = 0; i < td.cellIndex; i++) {
//         linkCell[tr.sectionRowIndex][i].checked = true;
//       }
//       let sum = 0;
//       linkCell.forEach((links) => {
//         links.forEach((object) => {
//           if (object.checked) sum += +object.value;
//         });
//       });
//       console.log(sum);
//       res.valueAsNumber = sum * 60000;
//     });

    //     function sinx(array, arrayAdd, dom, domAdd) {
    //       array.push(arrayAdd);
    //       if (Array.isArray(domAdd)) dom.append(...domAdd);
    //       else dom.append(domAdd);
    //     }
    //     function inp(value){
    //       let input = document.createElement("input");
    //       input.setAttribute("list", "interval");
    //       input.type = "time";
    //       input.valueAsNumber = value;
    //     }
    //     function tr(value,value2) {
    //       let row = document.createElement("tr");
    //       sinx(ArrayTR, row, tbody, row);
    //       let td = document.createElement("td");

    //       let input = document.createElement("input");
    //       input.setAttribute("list", "interval");
    //       input.type = "time";
    //       input.valueAsNumber = value;

    //       let input2 = document.createElement("input");
    //       input2.setAttribute("list", "interval");
    //       input2.type = "time";
    //       input2.valueAsNumber = value2;

    //       row.append(td);
    //       sinx(Bmat2, [input,input2], td, [input, input2]);
    //       // sinx(Bmat2, [input2], td, input2);
    //     }
    //     let tradd = document.createElement("button");
    //     tradd.textContent = "|";
    //     // main.append(tradd);
    //     let tdadd = document.createElement("button");
    //     tdadd.textContent = "--";
    //     main.append(tdadd);
    //     let getMat2 = document.createElement("button");
    //     getMat2.textContent = "getMat2";
    //     // main.append(getMat2);

    //     // let Bmat2 = [];
    //     let ArrayTR = [];
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 40*60000);
    // tr(35*60000, 0);
    // tr(35*60000, 0);
    // tradd.addEventListener("pointerdown", function (event) {
    //   const button = event.target.closest("button");
    //   if (!button) return;
    //   let tr = document.createElement("tr");
    //   sinx(ArrayTR, tr, tbody, tr);
    //   let ArrayTD = [];
    //   let arrayInput = [];
    //   Bmat2.at(-1).forEach((item) => {
    //     let td = document.createElement("td");
    //     let input = document.createElement("input");
    //     input.type = "time";
    //     td.append(input);
    //     // input.value = "1";
    //     arrayInput.push(input);
    //     ArrayTD.push(td);
    //   });
    //   sinx(Bmat2, arrayInput, tr, ArrayTD);
    //   console.log(Bmat2);
    // });
    // tdadd.addEventListener("pointerdown", function (event) {
    //   const button = event.target.closest("button");
    //   if (!button) return;
    //   Bmat2.forEach((item, index) => {
    //     let td = document.createElement("td");
    //     let input = document.createElement("input");
    //     input.type = "time";
    //     td.append(input);
    //     // input.value = "1";
    //     sinx(item, input, ArrayTR[index], td);
    //   });
    // });
    // getMat2.addEventListener("pointerdown", function (event) {
    //   const button = event.target.closest("button");
    //   if (!button) return;
    //   console.log(Bmat2);
    // });
  }

  // function inputTtype() {
  //   let input = document.createElement("input");
  // }
  // function td(value) {
  //   let td = document.createElement("td");
  //   let input = document.createElement("input");
  //   input.type = "time";
  //   input.valueAsNumber = value;
  //   td.append(input);
  //   return td;
  // }
  //   {
  //     let calc = document.createElement("button");
  //     calc.textContent = "Calc";
  //     main.append(calc);

  //     let table = document.createElement("table");
  //     let tbody = document.createElement("tbody");
  //     table.append(tbody);
  //     // main.append(table);

  //     calc.addEventListener("pointerdown", function (event) {
  //       const button = event.target.closest("button");
  //       if (!button) return;
  //       tbody.innerHTML = "";

  //       console.log(Bmat2);
  //       let summ = 0;
  //       Bmat2.forEach((timeTtype)=>{

  //         summ +=timeTtype[1].valueAsNumber;

  //       })
  //       main.append(td(summ));

  //       // let resMat2 = power(Amat2, Bmat2);
  //       // resMat2.forEach((item) => {
  //       //   let tr = document.createElement("tr");
  //       //   item.forEach((value) => {
  //       //     let td = document.createElement("td");
  //       //     let input = document.createElement("input");
  //       //     input.type = "time";
  //       //     input.valueAsNumber = value;
  //       //     td.append(input);
  //       //     tr.append(td);
  //       //   });
  //       //   tbody.append(tr);
  //       // });
  //       // console.log(power(Amat2, Bmat2));
  //     });
  //   }
}
