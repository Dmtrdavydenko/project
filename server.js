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
    "insertTime": insertTime,
    "getTime": getTime,
    "getThreads": getThreads,
    "getTape": getTape,
    "select": select,
    "drop": dropTable,
    "getAllTableNames": getAllTableNames,
    "getColumnsAndTypesForTable": getTableColumns,
    "sql": sql,
    "insertGenerate": insertGenerate,
    "setWhere": setWhere,
    "ping": ping,
    "getColumnsJoin": getColumnsJoin,
    "getTable": getTable,
    "getQuntity": getQuntity,
    "getSourceTable": getSourceTable,
    "getMetaDataTable": getMetaDataTable,
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
const ManualTableTextileUse = require('./src/tableManualSleeve');
//const dbConfig = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL; // считываем из env railway


const pool = mysql.createPool(dbConfig); // создаём пул подключений
let copyQuerySql;
async function getColumnsJoin(body) {
    const connection = await pool.getConnection();
    let sql = "SELECT * " +
        "FROM textile t " +
        "JOIN sleeve_width_density  swd ON t.wd_id = swd.sleeve_width_density_id " +
        "JOIN sleeve_width           sw ON swd.sleeve_width_id = sw.sleeve_width_id " +
        "JOIN sleeve_density                 d ON swd.sleeve_density_id = d.sleeve_density_id " +
        "JOIN warp_quantity                 warp ON t.warp_quantity_id = warp.warp_id " +
        "JOIN weft_quantity                 weft ON t.weft_quantity_id = weft.weft_id "
    const baseSql = `${sql} LIMIT 0;`;
    const data = {};

    try {
        // Выполняем запрос и получаем metadata
        const data = (await connection.execute(baseSql))[1];

        // Декодируем metadata
        //const decodedMetadata = metadata.map(meta=>decodeMetadataBuffer(meta));
        //console.log(decodedMetadata);
        //// Последовательно выполняем запросы для каждого метаданных
        //for (const meta of decodedMetadata) {
        //    if (meta.orgName === meta.orgTable) {
        //        const sql = "SELECT "+meta.orgName+" FROM "+meta.orgTable;
        //        //const sql = `SELECT \`${meta.orgName}\` FROM \`${meta.orgTable}\``;
        //        console.log(sql);
        //        data[meta.orgName] = (await connection.execute(sql))[0];
        //    }
        //}

        console.log(`Список колонок и типов таблицы "${body.table.name}":`, data);
        return data;

    } catch (err) {
        console.error('Ошибка при получении колонок таблицы:', err);
        throw err;

    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}

function decodeSliceBuffer(data, start, length, encoding = 'utf8') {
    // Создаем Buffer из массива байт (если data — массив)
    const buf = Buffer.from(data);
    // Извлекаем срез и преобразуем в строку с указанной кодировкой
    return buf.slice(start, start + length).toString(encoding);
}

function decodeMetadataBuffer(metadata) {
    const data = metadata._buf.data;

    return {
        catalog: decodeSliceBuffer(data, metadata._catalogStart, metadata._catalogLength, metadata._clientEncoding),
        schema: decodeSliceBuffer(data, metadata._schemaStart, metadata._schemaLength, metadata._clientEncoding),
        table: decodeSliceBuffer(data, metadata._tableStart, metadata._tableLength, metadata._clientEncoding),
        orgTable: decodeSliceBuffer(data, metadata._orgTableStart, metadata._orgTableLength, metadata._clientEncoding),
        orgName: decodeSliceBuffer(data, metadata._orgNameStart, metadata._orgNameLength, metadata._clientEncoding),
    };
}

async function getTableColumns(body) {
    // Создаём подключение к базе данных
    const connection = await pool.getConnection();
    try {
        // Выполняем запрос DESCRIBE для получения колонок таблицы
        const [rows] = await connection.execute(`DESCRIBE \`${body.table.name}\``);
        // Извлекаем названия колонок и их типы т.д.
        const columnsInfo = rows.map(row => ({
            Field: row.Field,
            Type: row.Type,
            Extra: row.Extra
        }));

        console.log(`Список колонок и типов таблицы "${body.table.name}":`, columnsInfo);
        return rows; // Возвращаем массив объектов с названиями и типами колонок
    } catch (err) {
        console.error('Ошибка при получении колонок таблицы:', err);
        throw err;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}
async function ping() {
    return "pong";
}
function transformKeys(inputObj) {
    const keyMapping = {
        'type': 'type_id',
        'sleeve_width_density': 'sleeve_w_d_id',
        'yarn_type': 'yarn_id',
        'warp_quantity': 'quantity_id',
        'weft_quantity': 'quantity_id',
        'Thread_Parameters': 'thread_densiti_id',
        'color': 'color_id',
        'additive': 'additive_id'
    };

    const result = {};

    for (const [key, value] of Object.entries(inputObj)) {
        const mappedKey = keyMapping[key] || key;
        result[mappedKey] = value;
    }

    return result;
}

async function getPriKey(nameTable) {
    const [descRows] = await connection.execute(`DESCRIBE \`${body.table.name}\``);

    const primaryKeyColumn = descRows.find(row => row.Key === 'PRI')?.Field || null;
    const primaryKeyColumns = descRows.filter(row => row.Key === 'PRI').map(row => row.Field);

    return primaryKeyColumn;
    //return primaryKeyColumns.length > 1 ? primaryKeyColumns : primaryKeyColumns[0];  // undefined
    //return primaryKeyColumns.length ? (primaryKeyColumns.length > 1 ? primaryKeyColumns : primaryKeyColumns[0]) : null;
}
async function slt() {
    const connection = await pool.getConnection();

    try {
        console.log('Успешно подключено к базе данных MySQL!');

        // Получаем все данные из таблицы после вставки
        //const sql = 'SELECT * FROM ' + body.table.name + ' ORDER BY id'
        let sql;
        let descRows;
        console.log("Запрос от клиента имя таблицы " + body.table.name);
        console.log("Запрос sql " + sql);
        const all = await connection.execute(sql);
        const [rows] = all;


        // Извлекаем информацию о колонках
        //const columnsInfo = descRows.map(row => ({
        //    Field: row.Field,
        //    Type: row.Type,
        //    Extra: row.Extra,
        //    Key: row.Key  // Здесь ключ (например, 'PRI' для первичного ключа)
        //}));

        //// Находим имя столбца с первичным ключом
        ////const primaryKeyColumns = descRows.filter(row => row.Key === 'PRI').map(row => row.Field);

        //const primaryKeyColumn = descRows.find(row => row.Key === 'PRI')?.Field || null;
        //select.pri = primaryKeyColumn;
        //select.name = body.table.name;
        return data

    } catch (err) {
        console.error('Ошибка:', err);
        throw err;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }


}
async function getQuntity(body) {
    const connection = await pool.getConnection();

    const keysToDelete = [];
    for (const key in body) {
        if (body[key] === 0 || body[key] === "") {
            keysToDelete.push(key);
        }
    }
    keysToDelete.forEach(key => delete body[key]);

    const requiredFields = [
        'type'
    ];

    const conditions = [];
    const values = [];
    const filters = body;

    // Перебираем только разрешённые поля
    for (const field of requiredFields) {
        if (filters[field] !== undefined && filters[field] !== null && filters[field] !== '') {
            // Предполагаем, что все значения числовые (как в валидации), но если есть строки — добавьте экранирование
            conditions.push(`\`${field}\` = ?`);
            values.push(filters[field]);
        }
    }


    let whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let sql = `SELECT id, quantity, type
FROM (
    SELECT
        warp_id AS id,
        warp_quantity AS quantity,
        '1' AS type
    FROM warp_quantity
    UNION ALL
    SELECT
        weft_id AS id,
        weft_quantity AS quantity,
        '2' AS type
    FROM weft_quantity
) AS combined
${whereClause};`;
    console.log(sql);

    return await connection.execute(sql, values);
    //const [rows] = await connection.execute(query, values);
    //return {
    //    success: true,
    //    rows: rows
    //};
}
async function getSourceTable(body) {

    //const allowedTables = ['users', 'products', 'orders']; // Список разрешённых таблиц
    //if (!allowedTables.includes(body.table.name)) {
    //    throw new Error('Недопустимое имя таблицы');
    //}    
    try {
        const connection = await pool.getConnection();
        console.log('Подключение к MySQL успешно установлено');
        try {
            const request = `SELECT * FROM \`${body.table.name}\`;`
            console.log(request);
            return await connection.execute(request);
        } catch (error) {
            console.error('Error request MySQL:', error.message);
        }
    } catch (error) {
        console.error('Error connection MySQL:', error.message);
    }
}
async function where(filters = {}) {
    console.log(filters);
    //const requiredFields = [
    //    'width', 'density',
    //];
    const conditions = [];
    const values = [];
    // Перебираем только разрешённые поля
    //for (const field of requiredFields) {
    //    if (filters[field] !== undefined && filters[field] !== null && filters[field] !== '') {
    //        // Предполагаем, что все значения числовые (как в валидации), но если есть строки — добавьте экранирование
    //        conditions.push(`\`${field}\` = ?`);
    //        values.push(filters[field]);
    //    }
    //}
    for (let field in filters) {
        console.log("key: " + field, "value " + filters[field]);
        if (filters[field] !== undefined && filters[field] !== null && filters[field] !== '') {
            conditions.push(`\`${field}\` = ?`);
            values.push(filters[field]);
        }
    }
    return {
        whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
        whereValues: values
    };
}

async function getMeta1(body) {
    try {
        const connection = await pool.getConnection();
        try {
            console.log('Успешно подключено к базе данных MySQL!');
            console.log("bodyTableName: ",body.table.name);
            const sql = `SELECT
            COLUMN_NAME,
            DATA_TYPE,
            COLUMN_TYPE,
            IS_NULLABLE,
            COLUMN_KEY,
            EXTRA,
            COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = ?
            AND TABLE_SCHEMA = "railway"`;

            const data = await connection.execute(sql, [body.table.name]);
            console.info(data);
            return data;
        } catch (err) {
            console.error('Ошибка:', err);
            throw err;
        } finally {
            if (connection) connection.release();
            console.log("Соединение возвращено.");
        }
    } catch (error) {
        console.error('Error connection MySQL:', error.message);
    }
}
async function getMeta2(body) {
    try {
        const connection = await pool.getConnection();
        try {
            console.log('Успешно подключено к базе данных MySQL!');

            const sql = "SHOW CREATE TABLE " + body.table.name;
            const data = await connection.execute(sql);
            console.info(data);
            return data;
        } catch (err) {
            console.error('Ошибка:', err);
            throw err;
        } finally {
            if (connection) connection.release();
            console.log("Соединение возвращено.");
        }
    } catch (error) {
        console.error('Error connection MySQL:', error.message);
    }
}
async function getMeta3(body) {
    try {
        const connection = await pool.getConnection();
        try {
            console.log('Успешно подключено к базе данных MySQL!');

            const sql = "DESCRIBE " + body.table.name;
            const data = await connection.execute(sql);
            console.info(data);
            return data
        } catch (err) {
            console.error('Ошибка:', err);
            throw err;
        } finally {
            if (connection) connection.release();
            console.log("Соединение возвращено.");
        }
    } catch (error) {
        console.error('Error connection MySQL:', error.message);
    }
}
async function getMetaDataTable(body) {
    const get1 = await getMeta1(body);
    const get2 = await getMeta2(body);
    const get3 = await getMeta3(body);
    return {
        get1,
        get2,
        get3
    };
}
async function select(body) {
    const connection = await pool.getConnection();

    try {
        console.log('Успешно подключено к базе данных MySQL!');

        // Получаем все данные из таблицы после вставки
        //const sql = 'SELECT * FROM ' + body.table.name + ' ORDER BY id'
        let sql;
        let descRows;
        console.log("Запрос от клиента имя таблицы " + body.table.name);
        switch (body.table.name) {
            case "machine":
                //const field = ["thread_id", "thread_density", "thread_length"];
                sql = `
                SELECT machine.*, s.* FROM machine
                LEFT JOIN speed s ON machine.speed_id = s.speed_id


                `;
                //sql = "SELECT l.loom_id, l.loom_number, l.loom_name_str, l.loom_nameId, s.speed AS loom_speed, l.weft FROM looms l JOIN speed s ON l.loom_speed = s.speed_id";
                break;
            case "looms":
                //const field = ["thread_id", "thread_density", "thread_length"];
                //sql = `SELECT
                //    loom_number,
                //    type_id
                //    FROM looms;`;
                let msn = `LEFT JOIN sleeve_width_density swd                    ON m.sleeve_w_d_id = swd.sleeve_width_density_id
                LEFT JOIN sleeve_width sw                    ON swd.sleeve_width_id = sw.sleeve_width_id
                LEFT JOIN sleeve_density d                    ON swd.sleeve_density_id = d.sleeve_density_id
                LEFT JOIN Thread_Parameters thread                    ON m.thread_densiti_id = thread.thread_id
                LEFT JOIN color c                    ON m.color_id = c.color_id
                LEFT JOIN additive ad                    ON m.additive_id = ad.additive_id
                LEFT JOIN warp_quantity warp                    ON m.quantity_id = warp.warp_id
                LEFT JOIN weft_quantity weft                    ON m.quantity_id = weft.weft_id
                LEFT JOIN yarn_type type                    ON m.yarn_id = type.yarn_id`;

                //sql = `SELECT
                //        -- l.loom_id,
                //        l.loom_number,
                //        -- l.loom_name_str,
                //        -- l.loom_nameId,
                //        -- s.speed AS loom_speed,
                //        -- l.weft,
                //        type.yarn_name,
                //        sw.sleeve_width as s_width,
                //        d.density as s_density,
                //        CASE
                //            WHEN type.yarn_name = "warp" THEN warp.warp_quantity
                //            WHEN type.yarn_name = "weft" THEN weft.weft_quantity
                //            ELSE NULL
                //            END as quantity,
                //        thread.thread_density as t_density,
                //        c.color,
                //        thread.thread_length as t_length,
                //        ad.additive_name,
                //        m.*
                //     FROM looms l
                //     JOIN speed s ON l.loom_speed = s.speed_id
                //     LEFT JOIN \`manual\` m ON l.type_id = m.sleeve_w_d_id
                //     LEFT JOIN sleeve_width_density swd                    ON m.sleeve_w_d_id = swd.sleeve_width_density_id
                //     LEFT JOIN sleeve_width sw                    ON swd.sleeve_width_id = sw.sleeve_width_id
                //     LEFT JOIN sleeve_density d                    ON swd.sleeve_density_id = d.sleeve_density_id
                //     LEFT JOIN Thread_Parameters thread ON m.thread_densiti_id = thread.thread_id
                //     LEFT JOIN additive ad ON m.additive_id = ad.id
                //     LEFT JOIN color c ON m.color_id = c.color_id
                //     LEFT JOIN yarn_type type ON m.yarn_id = type.yarn_id
                //     LEFT JOIN warp_quantity warp                    ON m.quantity_id = warp.warp_id
                //     LEFT JOIN weft_quantity weft                    ON m.quantity_id = weft.weft_id
                //     `;
                const total = `
                
                UNION ALL

-- Итоговая строка с суммой quantity
SELECT
    NULL AS loom_id,
    NULL AS loom_number,
    NULL AS width,
    NULL AS density,
    'Total' AS yarn_name,
    SUM(CASE
        WHEN type.yarn_name = 'warp' THEN warp.warp_quantity
        WHEN type.yarn_name = 'weft' THEN weft.weft_quantity
        ELSE NULL
    END) AS quantity,
    NULL AS thread_density,
    NULL AS color,
    NULL AS additive_name,
    NULL AS type_id,
    NULL AS sleeve_w_d_id,
    NULL AS yarn_id,
    NULL AS quantity_id,
    NULL AS thread_densiti_id,
    NULL AS color_id,
    NULL AS additive_id,
    NULL AS created_at,
    NULL AS updated_at
FROM looms l
JOIN speed s ON l.loom_speed = s.speed_id
LEFT JOIN sleeve_width_density swd ON l.type_id = swd.sleeve_width_density_id
LEFT JOIN sleeve_width sw ON swd.sleeve_width_id = sw.sleeve_width_id
LEFT JOIN sleeve_density d ON swd.sleeve_density_id = d.sleeve_density_id
LEFT JOIN \`manual\` m ON l.type_id = m.sleeve_w_d_id AND l.modifier_id = m.additive_id
LEFT JOIN Thread_Parameters thread ON m.thread_densiti_id = thread.thread_id
LEFT JOIN color c ON m.color_id = c.color_id
LEFT JOIN additive ad ON m.additive_id = ad.id
LEFT JOIN yarn_type type ON m.yarn_id = type.yarn_id
LEFT JOIN warp_quantity warp ON m.quantity_id = warp.warp_id
LEFT JOIN weft_quantity weft ON m.quantity_id = weft.weft_id
WHERE type.yarn_name = 'warp' AND thread.thread_density = 105 AND ad.additive_name = 'светостабилизатор';
                
                `;

                sql = `SELECT 
                        -- l.loom_id,
                        l.loom_number,
                        -- machine.machine_name,
                        -- s.speed,
                        -- machine.shuttle,
                        sw.sleeve_width as width,
                        d.density as density,
                        -- l.modifier_id,
                        type.yarn_name,
                        CASE
                            WHEN type.yarn_id = 1 THEN warp.warp_quantity
                            WHEN type.yarn_id = 2 THEN weft.weft_quantity
                            ELSE NULL
                        END as quantity,
                        CASE
                            WHEN type.yarn_id = 2 AND weft.weft_quantity > 25 THEN CEIL(weft.weft_quantity * 0.1 * sw.sleeve_width * 2 * s.speed * 720 / (weft.weft_quantity * 10) * 0.89)
                            WHEN type.yarn_id = 2 AND weft.weft_quantity < 25 THEN CEIL(weft.weft_quantity * 0.1 * sw.sleeve_width * 2 * s.speed * 720 / (weft.weft_quantity * 20) * 0.89)
                            ELSE NULL
                        END as weft_lenth,

                        CASE
                            WHEN type.yarn_id = 2 AND weft.weft_quantity > 25 THEN CEIL(s.speed * 720 / (weft.weft_quantity * 10) * 0.89)
                            WHEN type.yarn_id = 2 AND weft.weft_quantity < 25 THEN CEIL(s.speed * 720 / (weft.weft_quantity * 20) * 0.89)
                            ELSE NULL
                        END as productivity,

                        -- thread.thread_length,


                        CASE
                            WHEN type.yarn_id = 2 AND weft.weft_quantity > 25 THEN CEIL(weft.weft_quantity * 0.1 * sw.sleeve_width * 2 * s.speed * 720 / (weft.weft_quantity * 10) * 0.89 / thread.thread_length)
                            WHEN type.yarn_id = 2 AND weft.weft_quantity < 25 THEN CEIL(weft.weft_quantity * 0.1 * sw.sleeve_width * 2 * s.speed * 720 / (weft.weft_quantity * 20) * 0.89 / thread.thread_length)
                            ELSE NULL
                        END as quantity_weft,

                        thread.thread_density,
                        c.color,
                        ad.additive_name
                        -- l.loom_nameId,
                        -- l.weft
                        -- m.*
                     FROM looms l

                     JOIN machine ON l.machine_id = machine.machine_id
                     LEFT JOIN speed s ON machine.speed_id = s.speed_id


                     LEFT JOIN sleeve_width_density swd ON l.type_id = swd.sleeve_width_density_id
                     LEFT JOIN sleeve_width sw ON swd.sleeve_width_id = sw.sleeve_width_id
                     LEFT JOIN sleeve_density d ON swd.sleeve_density_id = d.sleeve_density_id

                     LEFT JOIN \`manual\` m ON l.type_id = m.sleeve_w_d_id AND l.modifier_id = m.additive_id
                     LEFT JOIN Thread_Parameters thread ON m.thread_densiti_id = thread.thread_id
                     LEFT JOIN color c ON m.color_id = c.color_id
                     LEFT JOIN additive ad ON m.additive_id = ad.additive_id


                     LEFT JOIN yarn_type type ON m.yarn_id = type.yarn_id
                     LEFT JOIN warp_quantity warp ON m.quantity_id = warp.warp_id
                     LEFT JOIN weft_quantity weft ON m.quantity_id = weft.weft_id

                     -- WHERE type.yarn_name = "warp" and thread.thread_density = "105" and ad.additive_name = "светостабилизатор"

                     -- GROUP BY type.yarn_name, thread.thread_density, c.color, ad.additive_name

                     ORDER BY width ASC, density ASC



                     `;
                //                sql = `SELECT 
                //    d.density,  -- Поле для группировки
                //    SUM(CASE
                //        WHEN type.yarn_name = "warp" THEN COALESCE(warp.warp_quantity, 0)
                //        WHEN type.yarn_name = "weft" THEN COALESCE(weft.weft_quantity, 0)
                //        ELSE 0
                //    END) AS total_quantity,  -- Общий расход quantity по density
                //    SUM(CASE
                //        WHEN type.yarn_name = "weft" AND COALESCE(weft.weft_quantity, 0) > 25 THEN 
                //            CEIL(COALESCE(weft.weft_quantity, 0) * 0.1 * COALESCE(sw.sleeve_width, 0) * 2 * COALESCE(s.speed, 0) * 720 / NULLIF(weft.weft_quantity * 10, 0) * 0.89)
                //        WHEN type.yarn_name = "weft" AND COALESCE(weft.weft_quantity, 0) < 25 THEN 
                //            CEIL(COALESCE(weft.weft_quantity, 0) * 0.1 * COALESCE(sw.sleeve_width, 0) * 2 * COALESCE(s.speed, 0) * 720 / NULLIF(weft.weft_quantity * 20, 0) * 0.89)
                //        ELSE 0
                //    END) AS total_weft_lenth,  -- Общий расход weft_lenth по density
                //    SUM(CASE
                //        WHEN type.yarn_name = "weft" AND COALESCE(weft.weft_quantity, 0) > 25 THEN 
                //            CEIL(COALESCE(s.speed, 0) * 720 / NULLIF(weft.weft_quantity * 10, 0) * 0.89)
                //        WHEN type.yarn_name = "weft" AND COALESCE(weft.weft_quantity, 0) < 25 THEN 
                //            CEIL(COALESCE(s.speed, 0) * 720 / NULLIF(weft.weft_quantity * 20, 0) * 0.89)
                //        ELSE 0
                //    END) AS total_productivity,  -- Общий расход productivity по density
                //    SUM(CASE
                //        WHEN type.yarn_name = "weft" AND COALESCE(weft.weft_quantity, 0) > 25 THEN 
                //            CEIL(COALESCE(weft.weft_quantity, 0) * 0.1 * COALESCE(sw.sleeve_width, 0) * 2 * COALESCE(s.speed, 0) * 720 / NULLIF(weft.weft_quantity * 10, 0) * 0.89 / NULLIF(thread.thread_length, 0))
                //        WHEN type.yarn_name = "weft" AND COALESCE(weft.weft_quantity, 0) < 25 THEN 
                //            CEIL(COALESCE(weft.weft_quantity, 0) * 0.1 * COALESCE(sw.sleeve_width, 0) * 2 * COALESCE(s.speed, 0) * 720 / NULLIF(weft.weft_quantity * 20, 0) * 0.89 / NULLIF(thread.thread_length, 0))
                //        ELSE 0
                //    END) AS total_quantity_weft,  -- Общий расход quantity_weft по density
                //    COUNT(*) AS count_looms  -- Количество станков в каждой группе density
                //FROM looms l
                //JOIN machine ON l.machine_id = machine.machine_id
                //LEFT JOIN speed s ON machine.speed_id = s.speed_id
                //LEFT JOIN sleeve_width_density swd ON l.type_id = swd.sleeve_width_density_id
                //LEFT JOIN sleeve_width sw ON swd.sleeve_width_id = sw.sleeve_width_id
                //LEFT JOIN sleeve_density d ON swd.sleeve_density_id = d.sleeve_density_id  -- Источник density
                //LEFT JOIN \`manual\` m ON l.type_id = m.sleeve_w_d_id AND l.modifier_id = m.additive_id
                //LEFT JOIN Thread_Parameters thread ON m.thread_densiti_id = thread.thread_id
                //LEFT JOIN color c ON m.color_id = c.color_id
                //LEFT JOIN additive ad ON m.additive_id = ad.id
                //LEFT JOIN yarn_type type ON m.yarn_id = type.yarn_id
                //LEFT JOIN warp_quantity warp ON m.quantity_id = warp.warp_id
                //LEFT JOIN weft_quantity weft ON m.quantity_id = weft.weft_id
                //-- WHERE d.density IN (60, 75)  -- Раскомментируй для фильтрации по конкретным density
                //GROUP BY d.density
                //ORDER BY d.density;
                //`
                //                sql = `SELECT 
                //    type.yarn_name,  -- Разделение по warp/weft
                //    thread.thread_density,  -- Плотность нити для подгруппировки
                //    SUM(CASE
                //        WHEN type.yarn_name = "warp" THEN COALESCE(warp.warp_quantity, 0)
                //        WHEN type.yarn_name = "weft" THEN COALESCE(weft.weft_quantity, 0)
                //        ELSE 0
                //    END) AS total_quantity,  -- Общий расход quantity по группам
                //    SUM(CASE
                //        WHEN type.yarn_name = "weft" AND COALESCE(weft.weft_quantity, 0) > 25 THEN 
                //            CEIL(COALESCE(weft.weft_quantity, 0) * 0.1 * COALESCE(sw.sleeve_width, 0) * 2 * COALESCE(s.speed, 0) * 720 / NULLIF(weft.weft_quantity * 10, 0) * 0.89)
                //        WHEN type.yarn_name = "weft" AND COALESCE(weft.weft_quantity, 0) < 25 THEN 
                //            CEIL(COALESCE(weft.weft_quantity, 0) * 0.1 * COALESCE(sw.sleeve_width, 0) * 2 * COALESCE(s.speed, 0) * 720 / NULLIF(weft.weft_quantity * 20, 0) * 0.89)
                //        ELSE 0
                //    END) AS total_weft_lenth,  -- Общий расход weft_lenth (только для weft)
                //    SUM(CASE
                //        WHEN type.yarn_name = "weft" AND COALESCE(weft.weft_quantity, 0) > 25 THEN 
                //            CEIL(COALESCE(s.speed, 0) * 720 / NULLIF(weft.weft_quantity * 10, 0) * 0.89)
                //        WHEN type.yarn_name = "weft" AND COALESCE(weft.weft_quantity, 0) < 25 THEN 
                //            CEIL(COALESCE(s.speed, 0) * 720 / NULLIF(weft.weft_quantity * 20, 0) * 0.89)
                //        ELSE 0
                //    END) AS total_productivity,  -- Общий расход productivity (только для weft)
                //    SUM(CASE
                //        WHEN type.yarn_name = "weft" AND COALESCE(weft.weft_quantity, 0) > 25 THEN 
                //            CEIL(COALESCE(weft.weft_quantity, 0) * 0.1 * COALESCE(sw.sleeve_width, 0) * 2 * COALESCE(s.speed, 0) * 720 / NULLIF(weft.weft_quantity * 10, 0) * 0.89 / NULLIF(thread.thread_length, 0))
                //        WHEN type.yarn_name = "weft" AND COALESCE(weft.weft_quantity, 0) < 25 THEN 
                //            CEIL(COALESCE(weft.weft_quantity, 0) * 0.1 * COALESCE(sw.sleeve_width, 0) * 2 * COALESCE(s.speed, 0) * 720 / NULLIF(weft.weft_quantity * 20, 0) * 0.89 / NULLIF(thread.thread_length, 0))
                //        ELSE 0
                //    END) AS total_quantity_weft,  -- Общий расход quantity_weft (только для weft)
                //    COUNT(*) AS count_looms  -- Количество станков в каждой группе
                //FROM looms l
                //JOIN machine ON l.machine_id = machine.machine_id
                //LEFT JOIN speed s ON machine.speed_id = s.speed_id
                //LEFT JOIN sleeve_width_density swd ON l.type_id = swd.sleeve_width_density_id
                //LEFT JOIN sleeve_width sw ON swd.sleeve_width_id = sw.sleeve_width_id
                //LEFT JOIN sleeve_density d ON swd.sleeve_density_id = d.sleeve_density_id  -- Пока оставил JOIN, но density не используется в выводе
                //LEFT JOIN \`manual\` m ON l.type_id = m.sleeve_w_d_id AND l.modifier_id = m.additive_id
                //LEFT JOIN Thread_Parameters thread ON m.thread_densiti_id = thread.thread_id
                //LEFT JOIN color c ON m.color_id = c.color_id
                //LEFT JOIN additive ad ON m.additive_id = ad.id
                //LEFT JOIN yarn_type type ON m.yarn_id = type.yarn_id
                //LEFT JOIN warp_quantity warp ON m.quantity_id = warp.warp_id
                //LEFT JOIN weft_quantity weft ON m.quantity_id = weft.weft_id
                //-- WHERE type.yarn_name = 'weft' AND thread.thread_density > 100  -- Пример фильтра
                //GROUP BY type.yarn_name, thread.thread_density
                //ORDER BY type.yarn_name, thread.thread_density;

                //`

                //                                          UNION ALL

                //                --Итоговая строка: суммируем quantity только для группы "warp 78 белая нет"
                //                SELECT 
                //    NULL AS loom_id,
                //                    NULL AS loom_speed,
                //                        NULL AS weft,
                //                            NULL AS loom_number,
                //                                'Итого warp 78 белая нет' AS width, --Текст для идентификации итога
                //    NULL AS density,
                //                    "warp" AS yarn_name,
                //                        SUM(CASE
                //        WHEN type.yarn_name = "warp" THEN warp.warp_quantity
                //        WHEN type.yarn_name = "weft" THEN weft.weft_quantity
                //        ELSE 0
                //    END) AS quantity, --Сумма quantity для группы
                //    NULL AS weft_length, --Не суммируем, так как не указано
                //                "78" AS thread_density,
                //                    "белая" AS color,
                //                        "нет" AS additive_name,
                //                            NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL-- NULL для всех полей m.* (замените на конкретные, если знаете)
                //FROM looms l
                //JOIN speed s ON l.loom_speed = s.speed_id 
                //LEFT JOIN sleeve_width_density swd ON l.type_id = swd.sleeve_width_density_id
                //LEFT JOIN sleeve_width sw ON swd.sleeve_width_id = sw.sleeve_width_id
                //LEFT JOIN sleeve_density d ON swd.sleeve_density_id = d.sleeve_density_id
                //LEFT JOIN \`manual\` m ON l.type_id = m.sleeve_w_d_id AND l.modifier_id = m.additive_id
                //LEFT JOIN Thread_Parameters thread ON m.thread_densiti_id = thread.thread_id
                //LEFT JOIN color c ON m.color_id = c.color_id
                //LEFT JOIN additive ad ON m.additive_id = ad.id
                //LEFT JOIN yarn_type type ON m.yarn_id = type.yarn_id
                //LEFT JOIN warp_quantity warp ON m.quantity_id = warp.warp_id
                //LEFT JOIN weft_quantity weft ON m.quantity_id = weft.weft_id
                //WHERE type.yarn_name = 'warp' AND thread.thread_density = 78 AND c.color = 'белая' AND ad.additive_name = 'нет'  -- Фильтр для группы

                //ORDER BY width ASC, density ASC
                break;
            case "Thread_Parameters":
                const field = ["thread_id", "thread_density", "thread_length"];
                //sql = "SELECT t." + field.join(", t.") + ", c.color FROM threadPP t JOIN color c ON t.color_id = c.color_id";
                sql = "SELECT thread_density, thread_length, thread_speed_id, thread_time FROM Thread_Parameters ORDER BY thread_density ASC";


                break;
            case "textile":
                //const field = ["textile_id", "textile_number", "circular_width", "density", "weft_quantity", "warp_quantity", "warp_name", "warp_name2", "weft_name1", "weft_name2"];
                // textile_id	textile_width	textile_density	weft_quantity	warp_quantity	warp_name	warp_name2	weft_name1	weft_name2	textile_number	id	circular_width	density
                // textile_id	weft_quantity	warp_quantity	warp_name	warp_name2	weft_name1	weft_name2	textile_number	id	circular_width	density

                select.fields = [
                    "textile_id",
                    "width_id",
                    "textile_number",
                    "width.sleeve_width",  // из circular_width
                    "d.sleeve_density",             // из density
                    "weft_quantity",
                    "warp_quantity_id",
                    "warp_name",
                    "warp_name2",
                    "weft_name1",
                    "weft_name2"
                ];

                // Для полей из textile добавляем префикс "t."
                select.sqlFields = select.fields.map(f => {
                    if (f.startsWith("width.") || f.startsWith("d.")) {
                        return f; // уже с префиксом правильным
                    } else {
                        return "t." + f;
                    }
                });
                //sql = "SELECT " + select.sqlFields.join(", ") + " " +
                sql = "SELECT textile_id, sleeve_width,density,warp_quantity,weft_quantity,warp_name,	warp_name2,	weft_name1,	weft_name2 " +
                    "FROM textile t " +
                    "JOIN sleeve_width_density  swd ON t.wd_id = swd.sleeve_width_density_id " +
                    "JOIN sleeve_width           sw ON swd.sleeve_width_id = sw.sleeve_width_id " +
                    "JOIN sleeve_density                 d ON swd.sleeve_density_id = d.sleeve_density_id " +
                    "JOIN warp_quantity                 warp ON t.warp_quantity_id = warp.warp_id " +
                    "JOIN weft_quantity                 weft ON t.weft_quantity_id = weft.weft_id "



                //"JOIN sleeve_width        width ON t.width_id   = width.sleeve_width_id " +
                //"JOIN density                 d ON t.density_id = d.sleeve_density_id " +



                if ('wd' in body) {
                    if ('id' in body.wd) {
                        // оба поля есть
                        sql += "WHERE t.wd_id = " + body.wd.id + " " +
                            "ORDER BY d.density ASC, warp.warp_quantity ASC ";
                    } else {
                        // circular_width есть, id нет
                        console.log('circular_width есть, но id отсутствует');
                    }
                } else {
                    // circular_width нет, значит id нет
                    console.log('circular_width отсутствует, значит id тоже отсутствует');
                }
                sql += ";";
                [descRows] = await connection.execute(`DESCRIBE \`${body.table.name}\``);
                select.pri = descRows.find(row => row.Key === 'PRI')?.Field || null;
                break;

            case "warp_quantity":
                sql = `SELECT *, 'warp_quantity' AS type FROM warp_quantity`;
                break;
            case "weft_quantity":
                sql = `SELECT *, 'weft_quantity' AS type FROM weft_quantity`;

                break;
            case "manual":




                const keysToDelete = [];
                for (const key in body) {
                    if (body[key] === 0 || body[key] === "") {
                        keysToDelete.push(key);
                    }
                }
                keysToDelete.forEach(key => delete body[key]);
                //const manual = new ManualTableTextileUse(pool);
                try {
                    //return await manual.insertManual(transformKeys(body));
                    return await manual.select(transformKeys(body));
                } catch (error) {
                    console.log('select failed: ' + error.message);
                }

                break;
            case "sleeve_width_density":
                //const field = ["textile_id", "textile_number", "circular_width", "density", "weft_quantity", "warp_quantity", "warp_name", "warp_name2", "weft_name1", "weft_name2"];
                // textile_id	textile_width	textile_density	weft_quantity	warp_quantity	warp_name	warp_name2	weft_name1	weft_name2	textile_number	id	circular_width	density
                // textile_id	weft_quantity	warp_quantity	warp_name	warp_name2	weft_name1	weft_name2	textile_number	id	circular_width	density

                const { whereClause, whereValues } = where(body.table.where);
                //const where = body.table?.where.length ? `WHERE ${body.table.where}` : '';
                sql = "SELECT swd.sleeve_width_density_id, swd.sleeve_width_id, swd.sleeve_density_id, sleeve_width, density " +
                    "FROM sleeve_width_density swd " +
                    "JOIN sleeve_width sw   ON swd.sleeve_width_id = sw.sleeve_width_id " +
                    "JOIN sleeve_density sd ON swd.sleeve_density_id = sd.sleeve_density_id " +
                    "ORDER BY sleeve_width ASC, density ASC ";

                //[descRows] = await connection.execute(`DESCRIBE \`${body.table.name}\``);
                //select.pri = descRows.find(row => row.Key === 'PRI')?.Field || null;
                break;
            case "TapeExtrusion":
                sql = "SELECT * " +
                    "FROM TapeExtrusion " +
                    "JOIN Thread_Parameters ON TapeExtrusion.thread_id = Thread_Parameters.thread_id " +
                    "JOIN color ON TapeExtrusion.color_id = color.color_id " +
                    "JOIN additive ON TapeExtrusion.additive_id = additive.additive_id " +
                    "ORDER BY thread_density ASC";
                break;
            default:
                sql = 'SELECT * FROM `' + body.table.name + "`";
                [descRows] = await connection.execute(`DESCRIBE \`${body.table.name}\``);
                const primaryKeyColumn = descRows.find(row => row.Key === 'PRI')?.Field || null;
                select.pri = primaryKeyColumn;


        }
        const all = await connection.execute(sql);
        const [rows] = all;




        // Извлекаем информацию о колонках
        //const columnsInfo = descRows.map(row => ({
        //    Field: row.Field,
        //    Type: row.Type,
        //    Extra: row.Extra,
        //    Key: row.Key  // Здесь ключ (например, 'PRI' для первичного ключа)
        //}));

        //// Находим имя столбца с первичным ключом
        ////const primaryKeyColumns = descRows.filter(row => row.Key === 'PRI').map(row => row.Field);

        //const primaryKeyColumn = descRows.find(row => row.Key === 'PRI')?.Field || null;
        //select.pri = primaryKeyColumn;
        //select.name = body.table.name;


        function decodeSlice(data, start, length, encoding = 'utf-8') {
            const slice = data.slice(start, start + length);
            const decoder = new TextDecoder(encoding);
            return decoder.decode(new Uint8Array(slice));
        }
        function decodeMetadata(metadata) {
            const data = metadata._buf.data;
            return {
                catalog: decodeSlice(data, metadata._catalogStart, metadata._catalogLength, metadata._clientEncoding),
                schema: decodeSlice(data, metadata._schemaStart, metadata._schemaLength, metadata._clientEncoding),
                table: decodeSlice(data, metadata._tableStart, metadata._tableLength, metadata._clientEncoding),
                orgTable: decodeSlice(data, metadata._orgTableStart, metadata._orgTableLength, metadata._clientEncoding),
                orgName: decodeSlice(data, metadata._orgNameStart, metadata._orgNameLength, metadata._clientEncoding),
            };
        }


        console.log("Клиент " + sql);




        //console.log("ROW ",get1[[1]]);
        //get1[1] = get1[1].map(meta => (decodeMetadata(meta)));
        //get2[1] = get2[1].map(meta => (decodeMetadata(meta)));
        //get3[1] = get3[1].map(meta => (decodeMetadata(meta)));
        return {
            all,
            rows,
            //Field: select.fields,
            //F: select.sqlFields,
            //key: select.pri,
        };
    } catch (err) {
        console.error('Ошибка:', err);
        throw err;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}
async function getTable(body) {
    const connection = await pool.getConnection();

    try {
        console.log('Успешно подключено к базе данных MySQL!');

        // Получаем все данные из таблицы после вставки
        //const sql = 'SELECT * FROM ' + body.table.name + ' ORDER BY id'
        let sql;
        let descRows;
        console.log("Запрос от клиента имя таблицы " + body.table.name);
        switch (body.table.name) {
            case "looms":
                //const field = ["thread_id", "thread_density", "thread_length"];
                sql = "SELECT l.loom_id, l.loom_number, m.machine_name AS loom_name, s.speed AS loom_speed, l.weft FROM looms l JOIN speed s ON l.loom_speed = s.speed_id JOIN machine m ON l.machine_id = m.machine_id";
                //sql = "SELECT l.loom_id, l.loom_number, l.loom_name_str, l.loom_nameId, s.speed AS loom_speed, l.weft FROM looms l JOIN speed s ON l.loom_speed = s.speed_id";
                break;
            case "Thread_Parameters":
                //const field = ["thread_id", "thread_density", "thread_length"];
                //sql = "SELECT t." + field.join(", t.") + ", c.color FROM threadPP t JOIN color c ON t.color_id = c.color_id";
                sql = "SELECT * FROM Thread_Parameters";

                break;
            case "textile":
                //const field = ["textile_id", "textile_number", "circular_width", "density", "weft_quantity", "warp_quantity", "warp_name", "warp_name2", "weft_name1", "weft_name2"];
                // textile_id	textile_width	textile_density	weft_quantity	warp_quantity	warp_name	warp_name2	weft_name1	weft_name2	textile_number	id	circular_width	density
                // textile_id	weft_quantity	warp_quantity	warp_name	warp_name2	weft_name1	weft_name2	textile_number	id	circular_width	density

                select.fields = [
                    "textile_id",
                    "textile_number",
                    "width.circular_width",  // из circular_width
                    "d.density",             // из density
                    "weft_quantity",
                    "warp_quantity_id",
                    "warp_name",
                    "warp_name2",
                    "weft_name1",
                    "weft_name2"
                ];

                // Для полей из textile добавляем префикс "t."
                select.sqlFields = select.fields.map(f => {
                    if (f.startsWith("width.") || f.startsWith("d.")) {
                        return f; // уже с префиксом правильным
                    } else {
                        return "t." + f;
                    }
                });
                sql = "SELECT " + select.sqlFields.join(", ") + " " +
                    "FROM textile t " +
                    "JOIN circular_width width ON t.width_id = width.id " +
                    "JOIN density d ON t.density_id = d.id;";

                [descRows] = await connection.execute(`DESCRIBE \`${body.table.name}\``);
                select.pri = descRows.find(row => row.Key === 'PRI')?.Field || null;
                break;
            case "sleeve_width_density":
                //const field = ["textile_id", "textile_number", "circular_width", "density", "weft_quantity", "warp_quantity", "warp_name", "warp_name2", "weft_name1", "weft_name2"];
                // textile_id	textile_width	textile_density	weft_quantity	warp_quantity	warp_name	warp_name2	weft_name1	weft_name2	textile_number	id	circular_width	density
                // textile_id	weft_quantity	warp_quantity	warp_name	warp_name2	weft_name1	weft_name2	textile_number	id	circular_width	density



                sql = "SELECT sleeve_width_density_id, sleeve_width, density " +
                    "FROM sleeve_width_density swd " +
                    "JOIN sleeve_width sw   ON swd.sleeve_width_id = sw.sleeve_width_id " +
                    "JOIN sleeve_density sd ON swd.sleeve_density_id = sd.sleeve_density_id";

                [descRows] = await connection.execute(`DESCRIBE \`${body.table.name}\``);
                select.pri = descRows.find(row => row.Key === 'PRI')?.Field || null;
                break;
            case "TapeExtrusion":
                sql = "SELECT * " +
                    "FROM TapeExtrusion " +
                    "JOIN Thread_Parameters ON TapeExtrusion.thread_id = Thread_Parameters.thread_id " +
                    "JOIN color ON TapeExtrusion.color_id = color.color_id " +
                    "JOIN additive ON TapeExtrusion.additive_id = additive.additive_id " +
                    "ORDER BY thread_density ASC";
                break;
            default:
                sql = 'SELECT * FROM ' + body.table.name;
                [descRows] = await connection.execute(`DESCRIBE \`${body.table.name}\``);
                const primaryKeyColumn = descRows.find(row => row.Key === 'PRI')?.Field || null;
                select.pri = primaryKeyColumn;


        }
        const all = await connection.execute(sql);
        const [rows] = all;


        // Извлекаем информацию о колонках
        //const columnsInfo = descRows.map(row => ({
        //    Field: row.Field,
        //    Type: row.Type,
        //    Extra: row.Extra,
        //    Key: row.Key  // Здесь ключ (например, 'PRI' для первичного ключа)
        //}));

        //// Находим имя столбца с первичным ключом
        ////const primaryKeyColumns = descRows.filter(row => row.Key === 'PRI').map(row => row.Field);

        //const primaryKeyColumn = descRows.find(row => row.Key === 'PRI')?.Field || null;
        //select.pri = primaryKeyColumn;
        //select.name = body.table.name;
        console.log("Клиент " + sql);
        return {
            all,
            rows,
            Field: select.fields,
            F: select.sqlFields,
            key: select.pri
        };

    } catch (err) {
        console.error('Ошибка:', err);
        throw err;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}


async function insertGenerate(body) {
    //body.table.name
    //body.table.fields
    //body.table.values
    const shape = body.table.fields.map(() => '?').join(', ');
    const sql = "INSERT INTO `" + body.table.name + "` (" + body.table.fields.join(', ') + ") VALUES (" + shape + ")";
    console.log(body, sql);
    const connection = await pool.getConnection();
    try {
        console.log('Успешно подключено к базе данных MySQL!');

        // Вставка новой записи
        const [insertResult] = await connection.execute(sql, body.table.values);

        console.log('Inserted ID:', insertResult.insertId);

        return {
            insertId: insertResult.insertId,
            //rows // все данные таблицы
            body: body,
            sql: sql,
        };
    } catch (err) {
        console.error('Ошибка:', err);
        throw err;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}
const manual = new ManualTableTextileUse(pool);
async function insert(body) {
    const connection = await pool.getConnection();

    try {
        console.log("data server", body);
        console.log('Успешно подключено к базе данных MySQL!');

        // Вставка новой записи
        return await connection.execute(
            'INSERT INTO ' + body.table.name + ' (thread_id, color_id, additive_id) VALUES (?, ?, ?)',
            [body.Thread_Parameters, body.color, body.additive]
        );
        //const [insertResult] =
        //INSERT INTO TapeExtrusion (thread_id, color_id, additive_id) VALUES(1, 1, 2)
        //console.log('Inserted ID:', insertResult.insertId);

        // Получаем все данные из таблицы после вставки
        //const [rows] = await connection.execute(
        //    'SELECT id, width, density FROM ' + body.table.name + ' ORDER BY id'
        //);

        //delete body.action;
        //delete body.table.name;
        //delete body.table;



        //let body = {        
        //    Thread_Parameters: 2,
        //    action: 'insert',
        //    table: { name: 'TapeExtrusion' },
        //    color: 1,
        //    additive: 2
        //}



        //return body;
    } catch (err) {
        console.error('Ошибка:', err);
        throw err;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}
async function insertTime(body) {
    const connection = await pool.getConnection();

    try {
        console.log('Успешно подключено к базе данных MySQL!');

        connection.execute("TRUNCATE TABLE timestamps");
        const times = body.data.map(time => time / 1000);
        const placeholders = body.data.map(() => '(FROM_UNIXTIME(?))').join(', ');
        const sql = `INSERT INTO timestamps (task_time) VALUES ${placeholders}`;

        // Вставка новой записи
        return await connection.execute(sql, times);



        //console.log('Inserted ID:', insertResult.insertId);

        // Получаем все данные из таблицы после вставки
        //const [rows] = await connection.execute(
        //    'SELECT id, width, density FROM ' + body.table.name + ' ORDER BY id'
        //);
        //delete body.action;
        //delete body.table.name;
        //delete body.table;
        //return await manual.insertManual(transformKeys(body));
    } catch (err) {
        console.error('Ошибка:', err);
        throw err;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}


async function getTape() {
    try {
        const connection = await pool.getConnection();
        try {
            console.log('Успешно подключено к базе данных MySQL!');
            const sql = "SELECT id, thread_density, color, additive_name, thread_time * 60 as time_seconds, thread_time * 60 * 1000 as time_milliseconds " +
                "FROM TapeExtrusion " +
                "JOIN Thread_Parameters ON TapeExtrusion.thread_id = Thread_Parameters.thread_id " +
                "JOIN color ON TapeExtrusion.color_id = color.color_id " +
                "JOIN additive ON TapeExtrusion.additive_id = additive.additive_id " +
                "ORDER BY thread_density ASC";
            return await connection.execute(sql);
        } catch (err) {
            console.error('Ошибка:', err);
            throw err;
        } finally {
            if (connection) connection.release();
            console.log("Соединение возвращено.");
        }
    } catch (error) {
        console.error('Error connection MySQL:', error.message);
    }
}
async function getTime() {
    try {
        const connection = await pool.getConnection();
        try {
            console.log('Успешно подключено к базе данных MySQL!');
            const sql = `


            SELECT timestamps.id, UNIX_TIMESTAMP(task_time) AS time_seconds, UNIX_TIMESTAMP(task_time) * 1000 AS time_milliseconds,

            Thread_Parameters.thread_density, color.color, additive.additive_name

            FROM timestamps

            JOIN TapeExtrusion ON timestamps.TapeExtrusion_id = TapeExtrusion.id

            JOIN Thread_Parameters ON TapeExtrusion.thread_id = Thread_Parameters.thread_id

            JOIN color ON TapeExtrusion.color_id = color.color_id

            JOIN additive ON TapeExtrusion.additive_id = additive.additive_id

            WHERE task_time >= DATE_SUB(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 HOUR), INTERVAL 1800 HOUR)
            ORDER BY task_time ASC;

`
            return await connection.execute(sql);
        } catch (err) {
            console.error('Ошибка:', err);
            throw err;
        } finally {
            if (connection) connection.release();
            console.log("Соединение возвращено.");
        }
    } catch (error) {
        console.error('Error connection MySQL:', error.message);
    }
}


async function getThreads() {
    try {
        const connection = await pool.getConnection();
        try {
            console.log('Успешно подключено к базе данных MySQL!');
            const sql = `SELECT thread_density as density, thread_length as length, thread_time * 60 as time_seconds, thread_time * 60 * 1000 as time_milliseconds FROM Thread_Parameters ORDER BY density ASC`;
            return await connection.execute(sql);
        } catch (err) {
            console.error('Ошибка:', err);
            throw err;
        } finally {
            if (connection) connection.release();
            console.log("Соединение возвращено.");
        }
    } catch (error) {
        console.error('Error connection MySQL:', error.message);
    }
}



async function createTable() {
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



async function setWhere(body) {
    const sqlQuery = `UPDATE ${body.table.name} SET ${body.table.colum_name} = ? WHERE ${body.table.whereColum} = ?`;
    const params = [body.table.value, body.table.id]; // если нужно добавить 1 к id
    //const params = [body.table.value, body.table.id + 1]; // если нужно добавить 1 к id
    const connection = await pool.getConnection();
    try {


        // Получаем все данные из таблицы после вставки
        //const sql = 'SELECT * FROM ' + body.table.name + ' ORDER BY id'


        const [result] = await connection.execute(sqlQuery, params);


        return {
            result // все данные таблицы
        };

    } catch (err) {
        console.error('Ошибка:', err);
        throw err;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }


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
    const color = `
    CREATE TABLE IF NOT EXISTS color (
      color_id INT AUTO_INCREMENT PRIMARY KEY,
      color VARCHAR(200) NOT NULL
    );
  `;
    const looms = `
    CREATE TABLE IF NOT EXISTS looms (
        loom_id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        loom_name VARCHAR(50),
        loom_speed SMALLINT UNSIGNED
    );
    `;
    //thread_density SMALLINT UNSIGNED
    //TINYINT UNSIGNED	
    const textile = `
    CREATE TABLE IF NOT EXISTS textile (
        textile_id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        textile_width TINYINT UNSIGNED,
        textile_density TINYINT UNSIGNED,
        warp_quantity SMALLINT UNSIGNED
    );
    `;


    try {
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

//main();

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
    const parentNamesSet = new Set([
        "Thread_Parameters",
        "additive",
        "circular_width",
        "color",
        "employees",
        "machine",
        "sleeve_density",
        "sleeve_width",
        "speed",
        "warp_quantity",
        "weft_quantity",
        "yarn_type"
    ]);

    try {
        // Выполняем запрос SHOW TABLES
        const [rows] = await connection.execute('SHOW TABLES');

        // Имя колонки зависит от имени базы данных, получаем его динамически
        const tableNames = rows.map(row => {
            const value = Object.values(row)[0];
            return {
                value: value,
                isParent: parentNamesSet.has(value)
            };
        });

        console.log('Список таблиц:', tableNames);
        //return tableNames;
        return tableNames;
    } catch (err) {
        console.error('Ошибка при получении таблиц:', err);
        throw err
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
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
        if (connection) connection.release();
        console.log("Соединение возвращено.");
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
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}




const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32); // 32 байта ключа, храните этот ключ в безопасном месте
const iv = crypto.randomBytes(16);  // 16 байт вектор инициализации
function encodeId(id) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(id.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Чтобы потом расшифровать, нужно знать iv, поэтому добавим его к результату
    return iv.toString('hex') + ':' + encrypted;
}

function decodeToken(token) {
    const parts = token.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
// Пример использования:
const id = 12345;
const token = encodeId(id);
console.log('Token:', token);

const decodedId = decodeToken(token);
console.log('Decoded id:', decodedId);


async function sql(body) {

    // Создаём подключение к базе данных
    const connection = await pool.getConnection();
    let all
    try {
        // Выполняем переданный SQL-запрос
        if (Array.isArray(body.values))
            all = await connection.execute(body.query, body.values);
        else
            all = await connection.query(body.query);

        console.log('Результаты запроса:', all);
        return all; // Возвращаем результаты запроса
    } catch (err) {
        console.error('Ошибка при выполнении запроса:', err);
        throw err; // Пробрасываем ошибку дальше
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}


//async function getTableColumns(body) {
//    // Создаём подключение к базе данных
//    const connection = await pool.getConnection();

//    try {
//        // Выполняем запрос DESCRIBE для получения колонок таблицы
//        const [rows] = await connection.execute(`DESCRIBE ${body.table.name}`);

//        // Извлекаем названия колонок
//        const columnNames = rows.map(row => row.Field);

//        console.log(`Список колонок таблицы "${body.table.name}":`, columnNames);
//        return columnNames;
//    } catch (err) {
//        console.error('Ошибка при получении колонок таблицы:', err);
//        throw err;
//    } finally {
//        await connection.release();
//    }
//}


async function getColumnsAndTypesForTable(body) {
    // Создаём подключение к базе данных
    const connection = await pool.getConnection();

    try {
        // Выполняем запрос для получения информации о столбцах указанной таблицы
        const [columns] = await connection.execute(`SHOW COLUMNS FROM ??`, [body.table.name]);

        // Массив для хранения информации о столбцах
        const columnsInfo = columns.map(column => ({
            Field: column.Field,
            Type: column.Type
        }));

        console.log(`Информация о столбцах для таблицы ${body.table.name}:`, columnsInfo);
        return JSON.stringify(columnsInfo);
    } catch (err) {
        console.error(`Ошибка при получении информации о столбцах для таблицы ${body.table.name}:`, err);
        throw err;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}

// Вызов функции с именем таблицы "MyTable"
//getColumnsAndTypesForTable('MyTable');




const MIMETYPES = {
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
    let pathName = parsedUrl.pathname;

    if (req.method === "GET") {
        if (pathName.startsWith('/api')) {
            // Здесь обработка запроса к базе данных и возврат JSON
            // pathName оставляем как есть, не меняем

            const base = path.basename(pathName);
            console.log(base);
            getTableColumns({ table: { name: "textile" } })
                .then(result => {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(result));
                })
                .catch(error => {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: error.message }));
                    console.error(error);
                });
        } else {
            // Для остальных маршрутов — отдаём HTML страницы
            const parsedUrl = url.parse(req.url, true);
            console.log(parsedUrl.pathname);
            let pathName = parsedUrl.pathname;
            let ext = path.extname(pathName);
            if (pathName !== "/" && pathName[pathName.length - 1] === "/") {
                res.writeHead(302, { Location: pathName.slice(0, -1) });
                res.end();
                return;
            }

            if (pathName === '/') {
                pathName = '/index.html';
                ext = '.html';
            } else if (!ext) {
                pathName += '.html';
                ext = '.html';
            }

            let filePath = path.join(process.cwd(), "/public", pathName);
            console.log(pathName);
            fs.exists(filePath, function (exists, err) {
                if (!exists || !MIMETYPES[ext]) {
                    console.log("File does not exist: " + pathName);
                    res.writeHead(404, { "Content-Type": "text/plain" });
                    res.write("404 Not Found");
                    res.end();
                    return;
                }
                res.writeHead(200, { "Content-Type": MIMETYPES[ext] });
                console.log(filePath);
                const fileStream = fs.createReadStream(filePath);
                fileStream.pipe(res);
            });
            // Здесь отдаём статический файл из файловой системы
        }










    }

    if (req.url === "/textile") {
        if (req.method === "POST") {
            let chunks = [];
            req.on("data", (chunk) => {
                chunks.push(chunk);
            }).on("end", () => {
                try {
                    if (chunks.length === 0)
                        throw new Error("Empty request body");
                    const buffer = Buffer.concat(chunks);
                    const parsedBody = JSON.parse(buffer);
                    console.log("Received data:", parsedBody);

                    let action;
                    let data;

                    if (Array.isArray(parsedBody)) {
                        // this array
                        data = {};
                        parsedBody.forEach(item => {
                            if (item && item.key !== undefined) {
                                data[item.key] = item.value;
                            }
                        });

                        action = data.action || "processData";

                    } else if (parsedBody && typeof parsedBody === "object") {
                        // this object
                        data = parsedBody;

                        if (!parsedBody.action)
                            throw new Error("The 'action' field is missing from the request");

                        action = parsedBody.action;
                    } else {
                        throw new Error("Invalid data format");
                    }

                    if (typeof functionDB[action] !== "function") {
                        throw new Error(`Function '${action}' not found`);
                    }
                    console.log("Pre function data:", data);
                    functionDB[action](data)
                        .then((resolve) => JSON.stringify(resolve))
                        .then((resolve) => res.end(resolve))
                        .catch(error => {
                            res.end(error.message);
                            console.log("Er", error);
                        })

                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: error.message,
                        status: 'error'
                    }));
                    console.error("Ошибка обработки запроса:", error);

                }
            }).on("error", (error) => {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    error: 'Internal server error',
                    status: 'error'
                }));
                console.error("Flow error:", error);
            });
        }
    } else {
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
                    .catch(error => {
                        res.end(error.message)
                        console.log(error);
                    })
            });
        }
    }
});
server.listen(PORT);
console.log("Server listening on " + PORT);


module.exports = combined;

