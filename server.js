const http = require("http"); // To use the HTTP interfaces in Node.js
const fs = require("fs"); // For interacting with the file system
const path = require("path"); // For working with file and directory paths
const url = require("url"); // For URL resolution and parsing
const crypto = require('crypto');

//const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 3000;

// const db = require("./src/sqlite.js");
// const functionDB = require("./src/db.js");


//считываем из env railway
const dbConfig = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306, // Укажите порт по умолчанию, если переменная не установлена
};

const mysql = require('mysql2/promise');

//const dbConfig = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL; // считываем из env railway


async function main() {
    try {
        const pool = mysql.createPool(dbConfig); // передаем строку подключения

        const connection = await pool.getConnection();

        console.log('Успешно подключено к базе данных MySQL!');

        const [rows, fields] = await connection.execute('SELECT * FROM textile');

        console.log('Результаты запроса:', rows);

        connection.release();
        await pool.end();
        console.log('Пул соединений закрыт.');
    } catch (err) {
        console.error('Ошибка:', err);
    }
}

main();







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

const server = http.createServer();

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
  
  if (req.method === "GET") {
    const parsedUrl = new URL(req.url, "https://worktime.glitch.me/");
    let pathName = parsedUrl.pathname;
    let ext = path.extname(pathName);
    if (pathName !== "/" && pathName[pathName.length - 1] === "/") {
      res.writeHead(302, { Location: pathName.slice(0, -1) });
      res.end();
      return;
    }

    if (pathName === "/") {
      ext = ".html";
      pathName = "/index.html";
    } else if (!ext) {
      ext = ".html";
      pathName += ext;
    }
    let filePath = path.join(process.cwd(), "/public", pathName);
    console.log(pathName);
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
  if (req.method === "POST") {
    let body = [];
    // req.on("data", (chunk) => {
    //     body.push(chunk);
    //   }).on("end", () => {
    //     body = Buffer.concat(body)
    //     if (body != "") {
    //       body = JSON.parse(body);
    //       functionDB[body.action](body)
    //         .then((resolve) => JSON.stringify(resolve))
    //         .then((resolve) => res.end(resolve))
    //         .catch(error=>{
    //         res.end(error)
    //         console.log(error);
    //       })
    //     }
    // });
  }
});
server.listen(PORT);
console.log("Server listening on " + PORT);


module.exports = combined;

