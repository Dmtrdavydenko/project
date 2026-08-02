import mysql from "mysql2/promise";

//считываем из env railway
const dbConfig = {
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
};

const pool = mysql.createPool(dbConfig); // создаём пул подключений

    
export async function getAwaitConnect(maxRetries = 5, retryDelay = 3000) {
    let currentRetry = 0;
    while (currentRetry < maxRetries) {
        try {
            const connection = await pool.getConnection();
            console.log("Успешное подключение к MySQL");
            return connection;
        } catch (error) {
            currentRetry++;
            console.error(`Ошибка подключения MySQL (попытка ${currentRetry}/${maxRetries}):`, error.message);
            if (currentRetry >= maxRetries) {
                throw new Error(`Не удалось подключиться к MySQL после ${maxRetries} попыток. Последняя ошибка: ${error.message}`);
            }
            if (error.code === "ECONNREFUSED") {
                console.log(`Ожидание ${retryDelay / 1000} секунд перед повтором...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } else {
                throw error; // Другие ошибки не ретраим
            }
            const exception = {
                errno: -111,
                code: 'ECONNREFUSED',
                syscall: 'connect',
                port: 3306,
                fatal: true
            }
        }
    }
}