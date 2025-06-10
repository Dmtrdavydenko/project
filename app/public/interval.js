function start(B, C) {
  C.valueAsNumber = 67200000 - B.valueAsNumber;
}
function norm(delta, answer) {
  answer.valueAsNumber =
    67200000 - Math.round(delta.valueAsNumber / 300000) * 300000;

  // answer.valueAsNumber =  delta.valueAsNumber/300000;
  // console.log(delta.valueAsNumber);
  // console.log(Math.round(delta.valueAsNumber/300000));
}
const button = document.createElement("button");
button.textContent = "Заполнить";
const button2 = document.createElement("button");
button2.textContent = "Обновить";
{
  function ctreate(name, nameChild, input) {
    let parent = document.createElement(name);
    let any = document.createElement(nameChild);
    any.append(...input);
    parent.append(any);
    return parent;
  }
  function add(parent, nameChild, input) {
    let any = document.createElement(nameChild);
    any.append(...input);
    parent.append(any);
    return null;
  }

  function createLink(time){
    const Time = document.createElement("input");
    Time.type = "time";
    Time.link = time;
    Time.valueAsNumber = Time.link.weight;
    return Time;
  }
  function create(time) {
    const Time = document.createElement("input");
    Time.type = "time";
    Time.valueAsNumber = time;
    return Time;
  }
  function createW(time, weight) {
    const Time = document.createElement("input");
    Time.type = "time";
    Time.valueAsNumber = time;
    Time.weight = weight;
    return Time;
  }
  function createN(time) {
    const Time = document.createElement("input");
    Time.type = "number";
    Time.valueAsNumber = time;
    return Time;
  }
  const TimeStart = create(28800000);
  const TimeEnd = create(67200000);
  const TimeEndLocal = create(67200000);
  const TimeDelta = create(delta(TimeStart, TimeEnd));
  const TimeAnswer = create();
  const TimeNormaliz = create();
  const TimeStep = create();
  const TimeDelta2 = create(delta(TimeStart, TimeEnd));
  const TimeDelta3 = create(delta(TimeNormaliz, TimeEnd));

  const TimeFlour = create(2100000);
  const TimeSalt = create(2400000);
  const TimeAll = create(300000);
  const nFlout = createN(8);
  const nSalt = createN(9);
  const Time = create();

  function gTable(){
  const tag = document.createElement("button");
  tag.textContent = "table";
    return tag; 
  }
  let line = [
    [createN(0), createN(0), create(), gTable()],
    [createN(0), createN(0), create(), gTable()],
  ];
  // let rootUl = ctreate("ul", "li", [TimeStart, TimeEnd, TimeDelta]);
  // add(rootUl, "li", [TimeNormaliz, TimeEndLocal]);
  // add(rootUl, "li", [TimeFlour, TimeSalt, TimeDelta3]);
  // add(rootUl, "li", [nFlout, nSalt, TimeDelta2]);
  // add(rootUl, "li", line[0]);
  // add(rootUl, "li", line[1]);
  // add(rootUl, "li", [Time]);
  // main.append(rootUl);

  let rootUl = ctreate("ul", "li", [TimeStart]);
  add(rootUl, "li", [TimeNormaliz, TimeEndLocal]);
  add(rootUl, "li", [TimeFlour, TimeSalt, TimeDelta3]);
  add(rootUl, "li", [nFlout, nSalt, TimeDelta2, gTable()]);
  add(rootUl, "li", line[0]);
  add(rootUl, "li", line[1]);

  // add(rootUl, "li", [Time]);
  main.append(rootUl);
  main.append(button);
  main.append(button2);


  function chank(time, div) {
    return time.valueAsNumber / div.valueAsNumber;
  }

  function sum(x, x2) {
    return x.valueAsNumber + x2.valueAsNumber;
  }
  function mul(time, n) {
    return time.valueAsNumber * n.valueAsNumber;
  }
  function conpare(a, b, a2, b2) {
    //     line[0][0].valueAsNumber = nFlout.valueAsNumber + a2;
    //     line[0][1].valueAsNumber = nSalt.valueAsNumber + Math.trunc(b);

    //     line[1][0].valueAsNumber = nFlout.valueAsNumber + Math.trunc(a);
    //     line[1][1].valueAsNumber = nSalt.valueAsNumber;

    console.log("ifF", nFlout.valueAsNumber);
    console.log("ifS", nSalt.valueAsNumber + Math.trunc(b));

    console.log("ifF", nFlout.valueAsNumber + Math.trunc(a));
    console.log("ifS", nSalt.valueAsNumber);

    if (a < b) {
      line[0][0].valueAsNumber = nFlout.valueAsNumber + a2;
      line[0][1].valueAsNumber = nSalt.valueAsNumber + Math.trunc(b);

      line[1][0].valueAsNumber = nFlout.valueAsNumber + Math.trunc(a);
      line[1][1].valueAsNumber = nSalt.valueAsNumber;
    } else {
      line[1][0].valueAsNumber = nFlout.valueAsNumber + a2;
      line[1][1].valueAsNumber = nSalt.valueAsNumber + Math.trunc(b);

      line[0][0].valueAsNumber = nFlout.valueAsNumber + Math.trunc(a);
      line[0][1].valueAsNumber = nSalt.valueAsNumber;
    }

    line[0][2].valueAsNumber =
      TimeDelta3.valueAsNumber -
      mul(TimeFlour, line[0][0]) -
      mul(TimeSalt, line[0][1]);
    line[1][2].valueAsNumber =
      TimeDelta3.valueAsNumber -
      mul(TimeFlour, line[1][0]) -
      mul(TimeSalt, line[1][1]);
  }

  button.addEventListener("pointerdown", () => {
    console.log(start(TimeStart, TimeAnswer));
    console.log(norm(TimeAnswer, TimeNormaliz));
    const del = delta(TimeNormaliz, TimeEnd);
    const task = mul(TimeFlour, nFlout) + mul(TimeSalt, nSalt);
    let octatoc = 0;

    const cauntFlour = chank(TimeFlour, TimeAll);
    const cauntSalt = chank(TimeSalt, TimeAll);

    if (del >= task) {
      octatoc = del - task;
      TimeDelta2.valueAsNumber = octatoc;
      TimeDelta3.valueAsNumber = delta(TimeNormaliz, TimeEnd);
      const caunt = chank(TimeDelta2, TimeAll);

      const chast = caunt / (cauntFlour + cauntSalt);
      const chast2 = caunt / cauntFlour;
      const chast3 = caunt / cauntSalt;
      console.log(octatoc);
      console.log("ostalos chastei", caunt);
      console.log("ostalos chastei/7", chast2);
      console.log("ostalos chastei/8", chast3);
      console.log("ostalos chastei/(7+8)", chast);

      if (chast === 1) {
        conpare(caunt / cauntFlour, caunt / cauntSalt, 1, 0);
      } else {
        conpare(caunt / cauntFlour, caunt / cauntSalt, 0, 0);
      }
    } else {
      const count = (del - task) / 300000;
      console.log("ostalos castei", count);
      console.log("F", count / cauntFlour);
      console.log("S", count / cauntSalt);

      let F = -count / cauntFlour;
      let S = -count / cauntSalt;
      console.log("FS", F + S);

      line[0][0].valueAsNumber = nFlout.valueAsNumber;
      line[0][1].valueAsNumber =
        nSalt.valueAsNumber - Math.ceil(-count / cauntSalt);

      line[1][0].valueAsNumber =
        nFlout.valueAsNumber - Math.ceil(-count / cauntFlour);
      line[1][1].valueAsNumber = nSalt.valueAsNumber;
    }
  });

  let bilding = document.createElement("ol");
  let timedata = [TimeFlour, TimeSalt];

  
    
  let timeData = [];
  let timeEdit = [];

  function time12(time){        
    if(time<46800000){    
      return time;    
    }
    else{    
      return time - 43200000;    
    }
    
  }
  rootUl.addEventListener("pointerdown", (event) => {
    if(!event.target.closest("button")) return
    if(event.target.closest("button").textContent !== "table") return
    
    // console.log(event.target.closest("li"));
    const node = event.target.closest("li");
    console.log(event.target.childNodes[0], event.target.childNodes[1]);
    const size = sum(node.childNodes[0], node.childNodes[1]);
    // console.log(size);
    let acc = TimeNormaliz.valueAsNumber;
        
    timeData = [];
    timeEdit = [];

    bilding.innerHTML = "";
    
    let st = create(acc);
    add(bilding, "li", [st]);
    timeData.push(st);
    for (let i = 0; i < 2; i++) {
      const size = node.childNodes[i].valueAsNumber
      for (let j = 0; j < size; j++) {
        const time = createW(time12(acc+=timedata[i].valueAsNumber), timedata[i].valueAsNumber);
        timeData.push(time);
        add(bilding, "li", [time]);
      }
    }
    console.log(timeData);
    bilding.childNodes.forEach((item,i)=>{
      const edit = createLink(item.childNodes[0]);
      timeEdit.push(edit);
      item.append(edit);      
    })
    bilding.childNodes.forEach((item,i)=>{
      if(i>0){
      const button = document.createElement("button");
      button.textContent = "Up";
      bilding.childNodes[i].append(button);        
      }
    })
  });
    
  main.append(bilding);
  
  
  bilding.addEventListener("pointerdown", (event) => {
    if(!event.target.closest("button")) return
    if(event.target.closest("button").textContent !== "Up") return
    const node = event.target.closest("li");
    // console.log(node);
    // const node = event.target.closest("li");
    node.previousElementSibling.firstChild.valueAsNumber += node.childNodes[0].weight;
    node.previousElementSibling.firstChild.weight += node.childNodes[0].weight;
    
        
    node.previousElementSibling.childNodes[1].valueAsNumber += node.childNodes[0].weight;
    
        
    node.childNodes[0].weight = 0;
    node.childNodes[1].valueAsNumber = 0;
    node.remove();

    
  });
  
    
  button2.addEventListener("pointerdown", (event) => {

    timeData.forEach((time,i)=>{
      time.weight = timeEdit[i].valueAsNumber || 0;
      // timeEdit[i].valueAsNumber = time.weight;
      // time.valueAsNumber = timeEdit[i].valueAsNumber || 0;
    });
    
    for(let i = 1;i<timeData.length; i++){
      // console.log(timeData[i-1].valueAsNumber,timeData[i]);
      timeData[i].valueAsNumber = time12(timeData[i-1].valueAsNumber + timeData[i].weight);
    }
  });
}




































function delta(TimeStart, TimeEnd) {
  return TimeEnd.valueAsNumber - TimeStart.valueAsNumber;
}



function summ(A, x, B, y, C) {
  return (
    A.valueAsNumber * x.valueAsNumber +
    B.valueAsNumber * y.valueAsNumber +
    C.valueAsNumber
  );
}

