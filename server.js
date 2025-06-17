const http = require("http"); // To use the HTTP interfaces in Node.js
const fs = require("fs"); // For interacting with the file system
const path = require("path"); // For working with file and directory paths
const url = require("url"); // For URL resolution and parsing
const crypto = require('crypto');

//const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 3000;

// const db = require("./src/sqlite.js");
const functionDB = {
    "insert": insert,
    "select": select,
    "drop": dropTable,
    "getAllTableNames": getAllTableNames,
    "getColumnsAndTypesForTable": getTableColumns
}


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

const pool = mysql.createPool(dbConfig); // создаём пул подключений


async function insert(body) {
    const pool = mysql.createPool(dbConfig); // создаём пул подключений
    const connection = await pool.getConnection();

    try {
        console.log('Успешно подключено к базе данных MySQL!');

        // Вставка новой записи
        const [insertResult] = await connection.execute(
            'INSERT INTO ' + body.table.name + ' (id, width, density) VALUES (?, ?, ?)',
            [body.data.id, body.data.width, body.data.density]
        );

        console.log('Inserted ID:', insertResult.insertId);

        // Получаем все данные из таблицы после вставки
        const [rows] = await connection.execute(
            'SELECT id, width, density FROM ' + body.table.name + ' ORDER BY id'
        );

        return {
            insertId: insertResult.insertId,
            rows // все данные таблицы
        };

    } catch (err) {
        console.error('Ошибка:', err);
        throw err;
    } finally {
        connection.release();
        await pool.end();
        console.log('Пул соединений закрыт.');
    }
}

async function select(body) {
    const pool = mysql.createPool(dbConfig); // создаём пул подключений
    const connection = await pool.getConnection();

    try {
        console.log('Успешно подключено к базе данных MySQL!');

        // Получаем все данные из таблицы после вставки
        const [rows] = await connection.execute(
            'SELECT id, width, density FROM ' + body.table.name + ' ORDER BY id'
        );

        return {
            rows // все данные таблицы
        };

    } catch (err) {
        console.error('Ошибка:', err);
        throw err;
    } finally {
        connection.release();
        await pool.end();
        console.log('Пул соединений закрыт.');
    }
}

async function createTable() {
    const pool = mysql.createPool(dbConfig); // создаём пул подключений
    const connection = await pool.getConnection();


    connection.connect(err => {
        if (err) {
            console.error('Ошибка подключения: ' + err.stack);
            return;
        }
        console.log('Подключено как id ' + connection.threadId);

        // Создаем таблицу users
        const createUsersTable = `
        CREATE TABLE IF NOT EXISTS textileK (
            id INT AUTO_INCREMENT PRIMARY KEY,
            width INTEGER NOT NULL,
            density INTEGER NOT NULL
        )`;

        // Создаем таблицу posts
        const createPostsTable = `
        CREATE TABLE IF NOT EXISTS circular_loom (
            id INT AUTO_INCREMENT PRIMARY KEY,
            textile_id INTEGER,
            FOREIGN KEY (textile_id) REFERENCES textileK(id) ON DELETE CASCADE
        )`;

        // Выполняем запросы на создание таблиц
        connection.query(createUsersTable, (err, results) => {
            if (err) throw err;
            console.log('Таблица textileK создана или уже существует.');

            connection.query(createPostsTable, (err, results) => {
                if (err) throw err;
                console.log('Таблица circular_loom создана или уже существует.');

                // Закрываем соединение
                connection.end();
            });
        });
    });
}




//createTable();


async function main() {
    const createTextileKTable = `
    CREATE TABLE IF NOT EXISTS textileK (
      id INT AUTO_INCREMENT PRIMARY KEY,
      width INT NOT NULL,
      density INT NOT NULL
    );
  `;

    const createCircularLoomTable = `
    CREATE TABLE IF NOT EXISTS circular_loom (
      id INT AUTO_INCREMENT PRIMARY KEY,
      textile_id INT,
      FOREIGN KEY (textile_id) REFERENCES textileK(id) ON DELETE CASCADE
    );
  `;

    const threadPP = `
    CREATE TABLE IF NOT EXISTS threadPP (
      thread_id INT AUTO_INCREMENT PRIMARY KEY,
      thread_name VARCHAR(300) NOT NULL,
      thread_density SMALLINT UNSIGNED NOT NULL,
      thread_length SMALLINT UNSIGNED NOT NULL
    );
  `;

    const taskPP = `
    CREATE TABLE IF NOT EXISTS taskPP (
      thread_id INT AUTO_INCREMENT PRIMARY KEY,
      thread_name VARCHAR(200) NOT NULL,
      thread_length SMALLINT UNSIGNED NOT NULL,
      thread_density SMALLINT UNSIGNED NOT NULL
    );
  `;
    const typePP = `
    CREATE TABLE IF NOT EXISTS typePP (
      thread_id INT AUTO_INCREMENT PRIMARY KEY,
      thread_name VARCHAR(200) NOT NULL
    );
  `;

    const machine = `
    CREATE TABLE IF NOT EXISTS machine (
      machine_id INT AUTO_INCREMENT PRIMARY KEY,
      machine_name VARCHAR(200) NOT NULL

    );
  `;

    try {
        const pool = mysql.createPool(dbConfig); // создаём пул подключений
        const conn = await pool.getConnection();

        // Создание таблиц
        await conn.query(threadPP);
        //await conn.query(createCircularLoomTable);
        console.log('Таблицы успешно созданы');

        // Вставка записи в textileK
        //const [textileResult] = await conn.query(
        //    'INSERT INTO textileK (width, density) VALUES (?, ?)',
        //    [120, 300]
        //);
        //const textileId = textileResult.insertId;
        //console.log(`Запись в textileK добавлена с id = ${textileId}`);

        // Вставка записи в circular_loom, ссылающейся на textileK
        //const [loomResult] = await conn.query(
        //    'INSERT INTO circular_loom (textile_id) VALUES (?)',
        //    [textileId]
        //);
        //const loomId = loomResult.insertId;
        //console.log(`Запись в circular_loom добавлена с id = ${loomId}`);

        // Получение всех circular_loom с параметрами из textileK
    //    const [rows] = await conn.query(`
    //  SELECT circular_loom.id AS loom_id, textileK.width, textileK.density
    //  FROM circular_loom
    //  JOIN textileK ON circular_loom.textile_id = textileK.id
    //`);

        //console.log('Результаты JOIN:');
        //console.table(rows);

        conn.release();
    } catch (err) {
        console.error('Ошибка:', err);
    }
}

main();

async function dropTable(body) {
    const dropTableQuery = `DROP TABLE IF EXISTS ??`;
    try {
        const conn = await pool.getConnection();
        await conn.query(dropTableQuery, [body.table.name]);
        console.log(`Таблица ${body.table.name} успешно удалена`);
        conn.release();
        const response = {
            success: true,
            message: `Таблица "${body.table.name}" успешно удалена.`,
        };

        return JSON.stringify(response);
    } catch (err) {
        console.error('Ошибка при удалении таблицы:', err);
        throw err;
    }
}

// Использование функции для удаления таблицы
//dropTable(); // Замените на имя вашей таблицы


async function getAllTableNames() {
    // Создаём подключение к базе данных
    const connection = await pool.getConnection();

    try {
        // Выполняем запрос SHOW TABLES
        const [rows] = await connection.execute('SHOW TABLES');

        // Имя колонки зависит от имени базы данных, получаем его динамически
        const tableNames = rows.map(row => Object.values(row)[0]);

        console.log('Список таблиц:', tableNames);
        //return tableNames;
        return tableNames;
    } catch (err) {
        console.error('Ошибка при получении таблиц:', err);
        throw err
    } finally {
        await connection.release();
    }
}
//getAllTableNames();




async function getAllColumnsAndTypes() {
    // Создаём подключение к базе данных
    const connection = await pool.getConnection();

    try {
        // Выполняем запрос SHOW TABLES
        const [tables] = await connection.execute('SHOW TABLES');

        // Имя колонки зависит от имени базы данных, получаем его динамически
        const tableNames = tables.map(row => Object.values(row)[0]);

        // Массив для хранения информации о столбцах
        const columnsInfo = {};

        for (const tableName of tableNames) {
            // Выполняем запрос для получения информации о столбцах
            const [columns] = await connection.execute(`SHOW COLUMNS FROM ${tableName}`);
            columnsInfo[tableName] = columns.map(column => ({
                name: column.Field,
                type: column.Type
            }));
        }

        console.log('Информация о столбцах:', columnsInfo);
        return JSON.stringify(columnsInfo);
    } catch (err) {
        console.error('Ошибка при получении информации о столбцах:', err);
        throw err;
    } finally {
        await connection.release();
    }
}

// Вызов функции
//getAllColumnsAndTypes();


async function getTableColumnsAndTypes() {
    // Создаём подключение к базе данных
    const connection = await pool.getConnection();

    try {
        // Выполняем запрос SHOW TABLES
        const [tables] = await connection.execute('SHOW TABLES');

        // Имя колонки зависит от имени базы данных, получаем его динамически
        const tableNames = tables.map(row => Object.values(row)[0]);

        // Массив для хранения информации о столбцах
        const columnsInfo = {};

        for (const tableName of tableNames) {
            // Выполняем запрос для получения информации о столбцах
            const [columns] = await connection.execute(`SHOW COLUMNS FROM ${tableName}`);
            columnsInfo[tableName] = columns.map(column => ({
                name: column.Field,
                type: column.Type
            }));
        }

        console.log('Информация о столбцах:', columnsInfo);
        return JSON.stringify(columnsInfo);
    } catch (err) {
        console.error('Ошибка при получении информации о столбцах:', err);
        throw err;
    } finally {
        await connection.release();
    }
}







async function getTableColumns(body) {
    // Создаём подключение к базе данных
    const connection = await pool.getConnection();

    try {
        // Выполняем запрос DESCRIBE для получения колонок таблицы
        const [rows] = await connection.execute(`DESCRIBE ${body.table.name}`);

        // Извлекаем названия колонок
        const columnNames = rows.map(row => row.Field);

        console.log(`Список колонок таблицы "${body.table.name}":`, columnNames);
        return columnNames;
    } catch (err) {
        console.error('Ошибка при получении колонок таблицы:', err);
        throw err;
    } finally {
        await connection.release();
    }
}


async function getColumnsAndTypesForTable(body) {
    // Создаём подключение к базе данных
    const connection = await pool.getConnection();

    try {
        // Выполняем запрос для получения информации о столбцах указанной таблицы
        const [columns] = await connection.execute(`SHOW COLUMNS FROM ??`, [body.table.name]);

        // Массив для хранения информации о столбцах
        const columnsInfo = columns.map(column => ({
            name: column.Field,
            type: column.Type
        }));

        console.log(`Информация о столбцах для таблицы ${body.table.name}:`, columnsInfo);
        return JSON.stringify(columnsInfo);
    } catch (err) {
        console.error(`Ошибка при получении информации о столбцах для таблицы ${body.table.name}:`, err);
        throw err;
    } finally {
        await connection.release();
    }
}

// Вызов функции с именем таблицы "MyTable"
//getColumnsAndTypesForTable('MyTable');




const mimeTypes = {
    ".txt": "text/plain",
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
    if (req.url === "/textile")
        if (req.method === "POST") {
            let body = [];
            req.on("data", (chunk) => {
                body.push(chunk);
            }).on("end", () => {
                body = Buffer.concat(body)
                //if (body != "") {
                body = JSON.parse(body);
                console.log(body);

                functionDB[body.action](body)
                  .then((resolve) => JSON.stringify(resolve))
                  .then((resolve) => res.end(resolve))
                  .catch(error=>{
                  res.end(error)
                  console.log(error);
                })
                
            });
        }
});
server.listen(PORT);
console.log("Server listening on " + PORT);


module.exports = combined;

