const http = require("http"); // To use the HTTP interfaces in Node.js
const fs = require("fs"); // For interacting with the file system
const path = require("path"); // For working with file and directory paths
const url = require("url"); // For URL resolution and parsing
const crypto = require('crypto');


// const db = require("./src/sqlite.js");
// const functionDB = require("./src/db.js");

const PORT = process.env.PORT || 3000;

// console.log(db);

// const get = require("./src/getData.js");
// const getTables = require("./src/getTables.js");
// const set = require("./src/setData.js");




// console.log(module);
// To look up MIME types
// Full list of extensions can be found at
// https://www.iana.org/assignments/media-types/media-types.xhtml
const mimeTypes = {
  ".txt":"text/plain",
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// Create the HTTP server with http.createServer([options][, requestListener])
// Documentation: https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener
const server = http.createServer();

// Write the request handler function that is called every time a HTTP request is made against the server
let combined

function generateSessionId() {
    return crypto.randomBytes(16).toString('hex'); // Генерация уникального идентификатора
}

function setCookie(res) {
  const cookieName = "sessionId";
  const sessionId = generateSessionId();
  const maxAge = 36000; // Время жизни куки в секундах
  // Формируем строку куки
  const cookie = `${cookieName}=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
  res.setHeader("Set-Cookie", cookie);
}

function deleteCookie(res) {
  const cookieName = "sessionId";
  const sessionId = ""
  const maxAge = -1; // Время жизни куки в секундах
  // Формируем строку куки
  const cookie = `${cookieName}=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
  res.setHeader("Set-Cookie", cookie);
}



server.on("request", (req, res) => {
  
  const parsedUrl = url.parse(req.url, true); 
  let pathname = parsedUrl.pathname;
  
  
      
  const cookies = req.headers.cookie;  
  
     
  console.log(pathname,pathname.length,cookies);
  
  if(pathname.length>1){
    if(cookies){
      
      // console.log(cookies);
      // deleteCookie(res);
    }else{
      console.log("Новый куки");
      setCookie(res);
    }
  }
  if (req.method === "GET") {


    const parsedUrl = new URL(req.url, "https://worktime.glitch.me/");
    let pathName = parsedUrl.pathname;
    let ext = path.extname(pathName);
    if (pathName !== "/" && pathName[pathName.length - 1] === "/") {
      res.writeHead(302, { Location: pathName.slice(0, -1) });
      res.end();
      return;
    }
    //console.log(parsedUrl);
    // console.log(pathName);
    // console.log(ext);
    
    if (pathName === "/") {
      ext = ".html";
      pathName = "/index.html";
    } else if (!ext) {
      ext = ".html";
      pathName += ext;
    }
    let filePath = path.join(process.cwd(), "/public", pathName);
    console.log(pathName);
    if(cookies && pathName === "/cl.js"){
      filePath = path.join(process.cwd(), "/public", "/clientSuper.js"); 
    }
    // console.log(pathName);
    fs.exists(filePath, function (exists, err) {
      if (!exists || !mimeTypes[ext]) {
        console.log("File does not exist: " + pathName);
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("404 Not Found");
        res.end();
        return;
      }
      
            
      
      
  
      
      res.writeHead(200, { "Content-Type": mimeTypes[ext] });
      console.log(filePath);
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    });
  }
  // console.log(req.method);
  // console.log(req.url);
  // // console.log(req.headers); 
  // console.log(req.query);
  // console.log(req.params);
  // console.log(req.body);
  // // console.log(req.connection);
  // console.log(req.ip);
  // console.log(req.protocol);

  const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(",");
  const ipString = (req.headers['x-forwarded-for'] || req.connection.remoteAddress);

  combined = ip[0]  + ip[1];
  // console.log(req.headers['x-forwarded-for'] || req.connection.remoteAddress);
  // console.log(ipString);
  // console.log(ip);
  // console.log(req.socket.remoteAddress);
  // console.log(req.url.startsWith("/records"));
  // console.log(req.url);
      
  const userAgent = req.headers['user-agent'];
  
  //console.log('User-Agent:', userAgent);
      const ipAddress = req.socket.remoteAddress;

    // Log the user's IP address
    // console.log(`User  IP Address: ${ipAddress}`);
  
          

  if (req.method === "POST") {
    let body = [];
    req.on("data", (chunk) => {
        body.push(chunk);
      }).on("end", () => {
        body = Buffer.concat(body)
        if (body != "") {
          body = JSON.parse(body);
          // console.log(body);
          // console.log(body.action);
          
          // if(combined === process.env.example){
          functionDB[body.action](body)
            .then((resolve) => JSON.stringify(resolve))
            .then((resolve) => res.end(resolve))
            .catch(error=>{
            res.end(error)
            console.log(error);
          })
          // }
        }
    });
  }
});
server.listen(PORT);
console.log("Server listening on " + PORT);


module.exports = combined;



// const http = require('http');
// const url = require('url');
// const sqlite3 = require('sqlite3').verbose();

// // Создаем соединение с базой данных
// const db = new sqlite3.Database('your_database.db');

// // Создаем HTTP сервер
// const server = http.createServer((req, res) => {
//     // Проверяем, что это GET запрос к /records
//     if (req.method === 'GET' && req.url.startsWith('/records')) {
//         // Парсим URL и параметры
//         const parsedUrl = url.parse(req.url, true);
//         const filters = parsedUrl.query; // Получаем параметры из URL

//         // Вызываем функцию select с параметрами фильтрации
//         select(filters)
//             .then(rows => {
//                 res.writeHead(200, { 'Content-Type': 'application/json' });
//                 res.end(JSON.stringify(rows)); // Отправляем полученные данные в ответе
//             })
//             .catch(err => {
//                 res.writeHead(500, { 'Content-Type': 'text/plain' });
//                 res.end('Ошибка при получении данных: ' + err.message);
//             });
//     } else {
//         // Если метод не поддерживается или неправильный путь
//         res.writeHead(404, { 'Content-Type': 'text/plain' });
//         res.end('Не найдено');
//     }
// });

// // Функция select для выполнения SQL-запроса
// function select(filters) {
//     return new Promise((resolve, reject) => {
//         db.serialize(() => {
//             let query = "SELECT * FROM records";
//             let conditions = [];
//             let params = [];

//             // Добавляем условия фильтрации, если они указаны
//             if (filters.meters) {
//                 conditions.push("meters = ?");
//                 params.push(filters.meters);
//             }
//             if (filters.quantity) {
//                 conditions.push("quantity = ?");
//                 params.push(filters.quantity);
//             }

//             // Если есть условия, добавляем их к запросу
//             if (conditions.length > 0) {
//                 query += " WHERE " + conditions.join(" AND ");
//             }

//             db.all(query, params, (err, rows) => {
//                 if (err) {
//                     reject("Ошибка при получении данных: " + err.message);
//                 } else {
//                     resolve(rows);
//                 }
//             });
//         });
//     });
// }

// // Запуск сервера
// const PORT = 3000;
// server.listen(PORT, () => {
//     console.log(`Сервер запущен на http://localhost:${PORT}`);
// });
