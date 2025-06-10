function dot(x = 0, y = 0) {
  this.x = x;
  this.y = y;
  this.adress = [this.x, this.y];
  this.draw = (svg) => {
    let circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", this.x);
    circle.setAttribute("cy", -this.y);
    circle.setAttribute("r", "2");
    
    svg.append(circle);
    this.svg = svg;
    return {
      x: this.x,
      y: this.y,
      adress: this.adress
    };
  };
  this.uiDraw = (svg) => {
    let circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", this.x);
    circle.setAttribute("cy", this.y);
    circle.setAttribute("r", "3");
    svg.append(circle);
    return {
      x: this.x,
      y: this.y,
      adress: this.adress,
    };
  };
  this.color = (svg, color) => {
      let circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
      circle.setAttribute("cx", this.x);
      circle.setAttribute("cy", -this.y);
      circle.setAttribute("r", "3");
      circle.setAttribute("stroke", color);
      this.target = circle;
      svg.append(circle);
  }
  this.setX = (x) => {
    this.x = x;
    this.target.setAttribute("cx", this.x);
  };
  this.setY = (y) => {
    this.y = y;
    this.target.setAttribute("cy", -this.y);
  };
  this.setAdress = (x, y) => {
    this.setX(x);
    this.setY(y);
  };
}
function zomm2(svg, c = 1) {
  this.width = svg.getAttribute("width") / c;
  this.height = svg.getAttribute("height") / c;
  // this.x = 0;
  this.x = (this.width / 2) * -1;
  this.y = -this.height / 2;
  // this.y = -this.height;
  // delete this.zoom;
}
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("width", 450);
svg.setAttribute("height", 450);
svg.viewBox.baseVal.zoom = zomm2;
svg.viewBox.baseVal.zoom(svg);
document.body.append(svg);
function Tupl(x, y) {
  this.x = x;
  this.y = y;
}
function Grid(x, y) {
  this.x = x;
  this.y = y;
}
let grid = new Tupl(40, 40);
let scale = new Tupl(1, 1);
for (let ortX = -grid.x * scale.x; ortX <= grid.x * scale.x; ortX += grid.x) {
  let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("stroke", "green");
  path.setAttribute("stroke-width", ".5");
  path.setAttribute("d","M" + ortX + "," + grid.y * scale.y + "V -" + grid.y * scale.y);
  svg.append(path);
}
for (let ortY = grid.y * scale.y; ortY >= -grid.y * scale.y; ortY -= grid.y) {
  let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("stroke", "green");
  path.setAttribute("stroke-width", ".5");
  path.setAttribute("d","M-" + grid.x * scale.x + "," + ortY + "H " + grid.x * scale.x);
  svg.append(path);
}

let left = null;
let right = null;
{
  let dots = [];
  let sumX = 0;
  let sumX2 = 0;
  let sumY = 0;
  let sumXY = 0;
  let range = 3;

  

  for (let x = -range; x < range; x+=.3) {
    const dotX = x * grid.y * scale.y;
    dots.push(new dot(dotX, sigmoid(x) * grid.y * scale.y));
    // dots.push(new dot(dotX, liner(x) * grid.y));
    // dots.push(new dot(dotX, f(x) * grid.y));
    // dots.push(new dot(dotX, logsig(x, liner) * grid.y));
    // dots.push(new dot(dotX, hardlims(x) * grid.y));
  }
  dots.forEach((item) => item.draw(svg));
  
  // dots.push(new dot(1 * grid.x, 6 * grid.y));
  let pointR = new dot(1 * grid.y * scale.y, parabolaVertex(1) * grid.y * scale.y);
  pointR.color(svg, "red");
  right = pointR;
  let pointL = new dot(-1 * grid.y * scale.y, parabolaVertex(-1) * grid.y * scale.y);
  pointL.color(svg, "blue");
  left = pointL;
  // dots.push(new dot(2 * grid.x, 4 * grid.y));
  // dots.push(new dot(3 * grid.x, 2 * grid.y));
  // dots.push(new dot(4 * grid.x, 4 * grid.y));
  // dots.push(new dot(5 * grid.x, 5 * grid.y));

  // dots.push(new dot(50, 60));
  // dots.push(new dot(60, 70));
  // dots.push(new dot(70, 80));
  // dots.push(new dot(80, 90));
  // dots.push(new dot(90, 100));
  // dots.push(new dot(100, 110));
  // dots.forEach((item) => item.draw(svg));
  // dots.forEach((item) => (sumX += item.x));
  // dots.forEach((item) => (sumY += item.y));
  // dots.forEach((item) => (sumX2 += item.x ** 2));
  // dots.forEach((item) => (sumXY += item.x * item.y));
  console.log(dots);
  // console.log(sumX);
  // console.log(sumX2);
  // console.log(sumY);
  // console.log(sumXY);
  let a = (sumY * sumX2 - sumX * sumXY) / (dots.length * sumX2 - sumX ** 2);
  // let a = (sumY * sumX2 - sumX * sumXY) / (5 * sumX2 - sumX ** 2);
  let b = (dots.length * sumXY - sumX * sumY) / (dots.length * sumX2 - sumX ** 2);
  // let b = (5 * sumXY - sumX * sumY) / (5 * sumX2 - sumX ** 2);
  // console.log(a);
  // console.log(b);
  // console.log(a+b*x);
  // console.log(">>>");

  // let tride = [];
  // tride.push(new dot(100, a + b * 100));
  // tride.push(new dot(736 * 1.3, a + b * 736 * 1.3));
  // tride.forEach(item => item.draw(svg));
  {
    let lineAbscissa = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    lineAbscissa.setAttribute("x1", -200);
    lineAbscissa.setAttribute("x2", 200);
    lineAbscissa.setAttribute("y1", 0);
    lineAbscissa.setAttribute("y2", 0);
    lineAbscissa.setAttribute("stroke", "black");
    svg.append(lineAbscissa);

    let lineOrdinate = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    lineOrdinate.setAttribute("x1", 0);
    lineOrdinate.setAttribute("x2", 0);
    lineOrdinate.setAttribute("y1", -200);
    lineOrdinate.setAttribute("y2", 200);
    lineOrdinate.setAttribute("stroke", "black");
    svg.append(lineOrdinate);
  }

  svg.addEventListener("click", crDot);

  function crDot(event) {
    let pt = new DOMPoint(event.clientX, event.clientY);
    let cursor = pt.matrixTransform(this.getScreenCTM().inverse());
    let point = new dot(cursor.x, cursor.y);
    dots.push(point);
    point.uiDraw(this);
    sumX += point.x;
    sumY += point.y;
    sumX2 += point.x ** 2;
    sumXY += point.x * point.y;

    const aF = (sumX, sumY, sumX2, sumXY, length) =>
      (sumY * sumX2 - sumX * sumXY) / (length * sumX2 - sumX ** 2);
    const bF = (sumX, sumY, sumX2, sumXY, length) =>
      (length * sumXY - sumX * sumY) / (length * sumX2 - sumX ** 2);

    let a = aF(sumX, sumY, sumX2, sumXY, dots.length);
    let b = bF(sumX, sumY, sumX2, sumXY, dots.length);

    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", 0);
    line.setAttribute("x2", 500);
    // line.setAttribute("y1", -activate(0));
    line.setAttribute("y1", a + b * 0);
    // line.setAttribute("y2", -activate(736*1.3));
    line.setAttribute("y2", a + b * 736 * 1.3);
    line.setAttribute("stroke", "black");
    this.append(line);

    this.removeEventListener("pointermove", crDot);
  }
}
