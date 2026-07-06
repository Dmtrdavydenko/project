import https from "https";
import querystring from "querystring";
import http from "http";
import fs, { access } from "fs";
import path from "path";
import url from "url";
import crypto from "crypto";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

//const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 3000;

// const db = require("./src/sqlite.js");
const functionDB = {
    "insert": insert,
    "insertTime": insertTime,
    "getTime": getTime,
    "devGetTime": devGetTime,
    "getThreads": getThreads,
    "getTapeDensity": getTapeDensity,
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
    "setToDay": setToDay,
    "getHistory": getHistory,
    "getDay": getDay,
    "getTapeKnowledge": getTapeKnowledge,
    "getUseTape": getUseTape,
    "getLoomsRecipe": getLoomsRecipe,
}

const ENCRYPTION_KEY = process.env.HH_ENCRYPTION_KEY;

//считываем из env railway
const dbConfig = {
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306, // Укажите порт по умолчанию, если переменная не установлена
};

import { ManualRepository } from "./src/tableManualSleeve.js";
import { loadSQL } from "./src/utils.js";
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
        'tape_speed': 'densiti_id',
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
            console.log("bodyTableName: ", body.table.name);
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
const manual = new ManualRepository();
async function select(body) {
    const connection = await getAwaitConnect();
    try {
        console.log('Успешно подключено к базе данных MySQL!');

        // Получаем все данные из таблицы после вставки
        //const sql = 'SELECT * FROM ' + body.table.name + ' ORDER BY id'
        let sql;
        let descRows;
        console.log("Запрос от клиента имя таблицы " + body.table.name);
        const isEmpty = async (table) => {
            const query = `SELECT 1 FROM \`${table.name}\` LIMIT 1`;
            const [rows] = await connection.execute(query);
            return rows.length === 0;
        };
        const getColumns = async (table) => {
            const query = `
                        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
                        FROM information_schema.COLUMNS
                        WHERE TABLE_SCHEMA = DATABASE()
                        AND TABLE_NAME = ?
                        `;
            const [columns] = await connection.execute(query, [table.name]);
            return columns;
        };
        const buildFormSchema = (columns) => {
            return columns.map(col => {
                let inputType = 'text';

                switch (col.DATA_TYPE) {
                    case 'tinyint':
                    case 'smallint':
                    case 'int':
                        inputType = 'number';
                        break;
                    case 'decimal':
                    case 'float':
                    case 'double':
                        inputType = 'number';
                        break;
                    case 'date':
                        inputType = 'date';
                        break;
                    case 'datetime':
                    case 'timestamp':
                        inputType = 'datetime-local';
                        break;
                    case 'enum':
                        inputType = 'select';
                        break;
                    case 'varchar':
                    case 'text':
                    default:
                        inputType = 'text';
                }

                return {
                    name: col.COLUMN_NAME,
                    type: inputType,
                    nullable: col.IS_NULLABLE === 'YES',
                    dbType: col.COLUMN_TYPE,
                    COLUMN_KEY: col.COLUMN_KEY,
                };
            });
        };
        const getParentRelations = async (table) => {
            const query = `
                    SELECT
                        COLUMN_NAME,
                        REFERENCED_TABLE_NAME,
                        REFERENCED_COLUMN_NAME
                    FROM information_schema.KEY_COLUMN_USAGE
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = ?
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                    `;
            const [rows] = await connection.execute(query, [table.name]);
            return rows;
        };
        const getSelectOptions = async (tableName, valueColumn, labelColumn) => {
            const query = `
                    SELECT \`${valueColumn}\` AS value, \`${valueColumn}\` AS label
                    FROM \`${tableName}\`
                    `;
            const [rows] = await connection.execute(query);
            return rows;
        };
        const buildSelectFields = async (table) => {
            const relations = await getParentRelations(table);
            const col = await getColumns(table);
            const columns = buildFormSchema(col);

            const result = {};
            for (const column of columns) {
                //column.COLUMN_KEY === "MUL"
                result[column.name] = {
                    type: 'input',
                    DATA_TYPE: column.type,
                    COLUMN_TYPE: column.dbType,
                    COLUMN_KEY: column.COLUMN_KEY
                };
            }
            for (const rel of relations) {
                let labelColumn = 'id';

                if (rel.REFERENCED_TABLE_NAME === 'tape_density') {
                    labelColumn = 'density';
                }

                const options = await getSelectOptions(
                    rel.REFERENCED_TABLE_NAME,
                    rel.REFERENCED_COLUMN_NAME,
                    labelColumn
                );

                result[rel.COLUMN_NAME] = {
                    type: 'select',
                    options
                };
            }

            return result;
        };
        switch (body.table.name) {
            case "tape_knowledge":
                //const field = ["thread_id", "thread_density", "thread_length"];
                sql = `
                SELECT tape_knowledge.id as id, tape_knowledge.density_id, tape_density.density, tape_knowledge.diameter, tape_knowledge.length  FROM tape_knowledge
                JOIN tape_density ON tape_knowledge.density_id = tape_density.id
                ORDER BY tape_density.density, tape_knowledge.diameter ASC
                `;
                //sql = "SELECT l.loom_id, l.loom_number, l.loom_name_str, l.loom_nameId, s.speed AS loom_speed, l.weft FROM looms l JOIN speed s ON l.loom_speed = s.speed_id";
                break;
            case "machine":
                //const field = ["thread_id", "thread_density", "thread_length"];
                sql = `
                SELECT machine.*, s.* FROM machine
                LEFT JOIN speed s ON machine.speed_id = s.speed_id


                `;
                //sql = "SELECT l.loom_id, l.loom_number, l.loom_name_str, l.loom_nameId, s.speed AS loom_speed, l.weft FROM looms l JOIN speed s ON l.loom_speed = s.speed_id";
                break;
            case "looms":
                sql = loadSQL("./src/sql/looms/manager.sql");
                break;
            case "tape_speed":
                const field = ["recipe_id", "thread_density", "thread_length"];
                //sql = "SELECT t." + field.join(", t.") + ", c.color FROM threadPP t JOIN color c ON t.color_id = c.id";
                sql = `
                SELECT density, length, thread_speed_id, thread_time

                FROM tape_speed

                JOIN tape_density ON tape_speed.density_id = tape_density.id
                JOIN tape_length ON tape_speed.density_id = tape_length.id
                ORDER BY tape_density.density ASC

                `;


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
                sql = "SELECT textile_id, sleeve_width,sleeve_density,warp_quantity,weft_quantity,warp_name,	warp_name2,	weft_name1,	weft_name2 " +
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
            case "fabric_recipe":
                const keysToDelete = [];
                for (const key in body) {
                    if (body[key] === 0 || body[key] === "") {
                        keysToDelete.push(key);
                    }
                }
                keysToDelete.forEach(key => delete body[key]);
                //const manual = new ManualRepository(pool);
                try {
                    return await manual.select(transformKeys(body), connection);
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
                sql = "SELECT swd.sleeve_width_density_id, swd.sleeve_width_id,sleeve_width, swd.sleeve_density_id, sleeve_density " +
                    "FROM sleeve_width_density swd " +
                    "JOIN sleeve_width sw   ON swd.sleeve_width_id = sw.sleeve_width_id " +
                    "JOIN sleeve_density sd ON swd.sleeve_density_id = sd.sleeve_density_id " +
                    "ORDER BY sleeve_width ASC, sleeve_density ASC ";

                //[descRows] = await connection.execute(`DESCRIBE \`${body.table.name}\``);
                //select.pri = descRows.find(row => row.Key === 'PRI')?.Field || null;
                break;
            case "tape_extrusion":
                sql = loadSQL("./src/sql/tape_extrusion/select.sql");
                break;
            case "Tape":
                sql = "SELECT * from Tape " +
                    "JOIN tape_density ON Tape.density_id = tape_density.id " +

                    "ORDER BY density ASC";
                break;
            case "tape_length":
                sql = loadSQL("./src/sql/tape_length/select.sql");
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

        if (body.table.name === "tape_length") {
            return {
                all,
                rows,
                k: await buildSelectFields(body.table)
                //Field: select.fields,
                //F: select.sqlFields,
                //key: select.pri,
            };
        }


        //console.log("ROW ",get1[[1]]);
        //get1[1] = get1[1].map(meta => (decodeMetadata(meta)));
        //get2[1] = get2[1].map(meta => (decodeMetadata(meta)));
        //get3[1] = get3[1].map(meta => (decodeMetadata(meta)));
        return {
            all,
            rows,
            k: await buildSelectFields(body.table),
            //Field: select.fields,
            //F: select.sqlFields,
            //key: select.pri,
        };
    } catch (err) {
        console.error('Ошибка:', err);
        throw err;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено. SELECT");
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
            case "tape_speed":
                //const field = ["thread_id", "thread_density", "thread_length"];
                //sql = "SELECT t." + field.join(", t.") + ", c.color FROM threadPP t JOIN color c ON t.color_id = c.id";
                //sql = "SELECT * FROM tape_speed";
                sql = `
                SELECT recipe_id, density, thread_speed_id FROM tape_speed
                JOIN tape_density ON tape_speed.density_id = tape_density.id
                JOIN tape_length ON tape_speed.density_id = tape_length.id
                ORDER BY tape_density.density ASC
                `
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



                sql = "SELECT sleeve_width_density_id, sleeve_width, sleeve_density " +
                    "FROM sleeve_width_density swd " +
                    "JOIN sleeve_width sw   ON swd.sleeve_width_id = sw.sleeve_width_id " +
                    "JOIN sleeve_density sd ON swd.sleeve_density_id = sd.sleeve_density_id";

                [descRows] = await connection.execute(`DESCRIBE \`${body.table.name}\``);
                select.pri = descRows.find(row => row.Key === 'PRI')?.Field || null;
                break;
            case "tape_extrusion":
                sql = "SELECT * " +
                    "FROM tape_extrusion " +
                    "JOIN tape_speed ON tape_extrusion.tape_id = tape_speed.recipe_id " +
                    "JOIN color ON tape_extrusion.color_id = color.id " +
                    "JOIN additive ON tape_extrusion.additive_id = additive.id " +
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
async function insert(body) {
    const connection = await pool.getConnection();

    try {
        console.log("data server", body);
        console.log('Успешно подключено к базе данных MySQL!');

        // Вставка новой записи
        return await connection.execute(
            'INSERT INTO ' + body.table.name + ' (recipe_id, color_id, additive_id) VALUES (?, ?, ?)',
            [body.tape_speed, body.color, body.additive]
        );
        //const [insertResult] =
        //INSERT INTO tape_extrusion (thread_id, color_id, additive_id) VALUES(1, 1, 2)
        //console.log('Inserted ID:', insertResult.insertId);

        // Получаем все данные из таблицы после вставки
        //const [rows] = await connection.execute(
        //    'SELECT id, width, density FROM ' + body.table.name + ' ORDER BY id'
        //);

        //delete body.action;
        //delete body.table.name;
        //delete body.table;


        //let body = {
        //    tape_speed: 2,
        //    action: 'insert',
        //    table: { name: 'tape_extrusion' },
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
    console.log("CALL=", insertTime.name);
    let connection = null;
    const placeholders = body.data.map(() => '(CONVERT_TZ(FROM_UNIXTIME(?), ?, ?), ?)').join(', ');
    const sql = `INSERT INTO timestamps (task_time, TapeExtrusion_id) VALUES ${placeholders}`;
    // Параметры: [unix, 'Asia/Novosibirsk', '+00:00', name] для каждой строки
    const params = [];
    body.data.forEach(tape => {
        params.push(tape.time / 1000, 'Asia/Novosibirsk', 'UTC', tape.name);
    });



    try {
        connection = await getAwaitConnect();
        //console.log(data);
        //return await connection.execute(sql);
        return await connection.execute(sql, params);
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}
async function getTape() {
    console.log("CALL=", getTape.name)
    let connection = null;
    const sql = "SELECT tape_extrusion.recipe_id as id, tape_speed.recipe_id as group_id, density, yarn_name as type, " +
        "color, additive, thread_time, thread_time * 60 as time_seconds, thread_time * 60 * 1000 as time_milliseconds " +
        "FROM tape_extrusion " +
        "JOIN tape_speed ON tape_extrusion.tape_id = tape_speed.recipe_id " +
        "JOIN tape_length ON tape_speed.density_id = tape_length.id " +
        "JOIN tape_density ON tape_speed.density_id = tape_density.id " +
        "JOIN yarn_type ON tape_length.class_yarn_id = yarn_type.yarn_id " +
        "JOIN color ON tape_extrusion.color_id = color.id " +
        "JOIN additive ON tape_extrusion.additive_id = additive.id " +
        "ORDER BY density ASC";
    try {
        connection = await getAwaitConnect();
        //console.log(data);
        return (await connection.execute(sql))[0];
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}

async function getTapeKnowledge() {
    console.log("CALL=", getTape.name)
    let connection = null;
    const sql = `
    select density, length, diameter from tape_knowledge
    LEFT JOIN tape_density ON tape_knowledge.density_id = tape_density.id
    order by length ASC
    `
    try {
        connection = await getAwaitConnect();
        //console.log(data);
        return await connection.execute(sql);
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}
async function getUseTape() {
    let connection = null;
    try {
        const sql = loadSQL("./src/sql/looms/useTape.sql");
        connection = await getAwaitConnect();
        //console.log(data);
        const [rows] = await connection.execute(sql);
        return rows;
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}
async function getLoomsRecipe() {
    let connection = null;
    try {
        const sql = loadSQL("./src/sql/looms/getLoomsRecipe.sql");
        connection = await getAwaitConnect();
        //console.log(data);
        const [rows] = await connection.execute(sql);
        return rows;
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}
async function getTapeDensity() {
    console.log("CALL=", getTapeDensity.name)
    let connection = null;
    const sql = `
    SELECT
        tape_density.density as tape_density,
        thread_speed_id as tape_speed,
        tape_speed.recipe_id as group_id,
        length as tape_length,
        thread_time * 60 as tape_seconds,
        thread_time * 60000 as tape_milliseconds
    FROM tape_extrusion
        JOIN tape_speed ON tape_extrusion.tape_id = tape_speed.recipe_id

        JOIN tape_length ON tape_speed.density_id = tape_length.id
        JOIN tape_density ON tape_speed.density_id = tape_density.id

        JOIN yarn_type ON tape_length.class_yarn_id = yarn_type.yarn_id

        JOIN color ON tape_extrusion.color_id = color.id
        JOIN additive ON tape_extrusion.additive_id = additive.id

    GROUP BY tape_density, tape_speed, group_id, length
    ORDER BY tape_density ASC
    `;
    try {
        connection = await getAwaitConnect();
        //console.log(data);
        return (await connection.execute(sql))[0];
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}
async function getAwaitConnect(maxRetries = 5, retryDelay = 3000) {
    console.log("CALL=", getAwaitConnect.name)
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
async function setToDay() {
    try {
        const connection = await pool.getConnection();
        try {
            console.log('Успешно подключено к базе данных MySQL!');
            const sql = `

            DELETE FROM timestamps

            WHERE task_time >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 12 HOUR)

            `;
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
async function getRows() {

}
async function getHistory() {
    console.log("CALL=", getHistory.name);
    let connection = null;

    const sql = `
    -- select date(task_time) as date from timestamps
    -- GROUP BY date(task_time)

    SELECT
        task_time AS date,
        client_local_time
    FROM (
        SELECT
            task_time,
            COALESCE(
                CONVERT_TZ(task_time, 'UTC', 'Asia/Novosibirsk'),
                CONVERT_TZ(task_time, '+00:00', '+07:00')
            ) AS client_local_time
        FROM timestamps
        WHERE task_time IS NOT NULL
    ) AS localized

    WHERE TIME(client_local_time) BETWEEN '07:30:00' AND '08:10:00'
       OR TIME(client_local_time) BETWEEN '19:30:00' AND '20:10:00'
    ORDER BY date;


`
    try {
        connection = await getAwaitConnect();
        return (await connection.execute(sql))[0];
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}
async function getDay(body) {
    console.log("CALL=", getDay.name);
    let connection = null;

    const sql = `

            SELECT localized.id,
            UNIX_TIMESTAMP(client_local_time) / 60 AS task_minutes,
            UNIX_TIMESTAMP(client_local_time) AS task_seconds,
            UNIX_TIMESTAMP(client_local_time) * 1000 AS task_milliseconds,
            yarn_name as type,

            tape_density.density,
            color.color,
            additive.additive,
            tape_length.length,
            tape_speed.thread_speed_id as speed,
            (tape_length.length / tape_speed.thread_speed_id) * 60000 as tape_milliseconds

            FROM (
                  SELECT
                      timestamps.*,
                      COALESCE(
                          CONVERT_TZ(task_time, 'UTC', 'Asia/Novosibirsk'),
                          CONVERT_TZ(task_time, '+00:00', '+07:00')
                      ) AS client_local_time
                  FROM timestamps
                  WHERE task_time IS NOT NULL
                ) AS localized

            JOIN tape_extrusion ON localized.TapeExtrusion_id = tape_extrusion.recipe_id

            JOIN tape_speed ON tape_extrusion.tape_id = tape_speed.recipe_id

            JOIN tape_length ON tape_speed.tape_id = tape_length.id

            JOIN yarn_type ON tape_length.class_yarn_id = yarn_type.yarn_id

            JOIN color ON tape_extrusion.color_id = color.id

            JOIN additive ON tape_extrusion.additive_id = additive.id

            WHERE  client_local_time >= '${body.day}'                                 -- начало

                AND  client_local_time <  DATE_ADD('${body.day}', INTERVAL 12 HOUR)  -- +12 ч

            ORDER BY client_local_time ASC;

`
    try {
        connection = await getAwaitConnect();
        return (await connection.execute(sql))[0];
    } catch (error) {
        console.error('Ошибка:', error);
        throw error;
    } finally {
        if (connection) connection.release();
        console.log("Соединение возвращено.");
    }
}
async function getTime() {
    try {
        const connection = await pool.getConnection();
        try {
            console.log('Успешно подключено к базе данных MySQL!');
            const sql = `


            SELECT timestamps.id,
            UNIX_TIMESTAMP(client_local_time) / 60 AS task_minutes,
            UNIX_TIMESTAMP(client_local_time) AS task_seconds,
            UNIX_TIMESTAMP(client_local_time) * 1000 AS task_milliseconds,
            yarn_name as type,

            tape_density.density,
            color.color,
            additive.additive,
            tape_length.length,
            tape_speed.thread_speed_id as speed,
            (tape_length.length / tape_speed.thread_speed_id) * 60000 as tape_milliseconds

            FROM (
                  SELECT
                      timestamps.*,
                      COALESCE(
                          CONVERT_TZ(task_time, 'UTC', 'Asia/Novosibirsk'),
                          CONVERT_TZ(task_time, '+00:00', '+07:00')
                      ) AS client_local_time
                  FROM timestamps
                  WHERE task_time IS NOT NULL
                ) AS timestamps

            JOIN tape_extrusion ON timestamps.TapeExtrusion_id = tape_extrusion.recipe_id

            JOIN tape_speed ON tape_extrusion.tape_id = tape_speed.recipe_id

            JOIN tape_length ON tape_speed.tape_id = tape_length.id

            JOIN yarn_type ON tape_length.class_yarn_id = yarn_type.yarn_id

            JOIN color ON tape_extrusion.color_id = color.id

            JOIN additive ON tape_extrusion.additive_id = additive.id

            -- WHERE task_time >= DATE_SUB(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 HOUR), INTERVAL 12 HOUR)
            WHERE task_time >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 12 HOUR)

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
async function devGetTime() {
    try {
        const connection = await pool.getConnection();
        try {
            console.log('Успешно подключено к базе данных MySQL!');
            const sql = `


            SELECT timestamps.id,
            UNIX_TIMESTAMP(task_time) / 60 AS task_minutes,
            UNIX_TIMESTAMP(task_time) AS task_seconds,
            UNIX_TIMESTAMP(task_time) * 1000 AS task_milliseconds,
            yarn_name as type,

            Tape.density,
            color.color,
            additive.additive,
            Tape.length,
            tape_speed.thread_speed_id as speed,
            (Tape.length / tape_speed.thread_speed_id) * 60000 as tape_milliseconds

            FROM timestamps

            JOIN tape_extrusion ON timestamps.TapeExtrusion_id = tape_extrusion.recipe_id

            JOIN tape_speed ON tape_extrusion.tape_id = tape_speed.recipe_id

            JOIN Tape   ON tape_speed.tape_id = Tape.id

            JOIN yarn_type ON Tape.class_yarn_id = yarn_type.yarn_id

            JOIN color ON tape_extrusion.color_id = color.id

            JOIN additive ON tape_extrusion.additive_id = additive.id

            WHERE task_time >= DATE_SUB(DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 HOUR), INTERVAL 24*3-12 HOUR)

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
        const connection = await getAwaitConnect();
        try {
            console.log('Успешно подключено к базе данных MySQL!');
            const sql = `
            SELECT
                recipe_id as id,
                density,
                length,
                thread_speed_id as speed,
                thread_time * 60 as time_seconds,
                thread_time * 60 * 1000 as time_milliseconds
            FROM tape_speed
                JOIN tape_density ON tape_speed.density_id = tape_density.id
                JOIN tape_length ON tape_speed.density_id = tape_length.id
                ORDER BY density, speed ASC
            `;
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
        "tape_speed",
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
//console.log('Token:', token);

const decodedId = decodeToken(token);
//console.log('Decoded id:', decodedId);


async function sql(body) {

    // Создаём подключение к базе данных
    const connection = await pool.getConnection();
    let all
    try {
        // Выполняем переданный SQL-запрос
        if (Array.isArray(body.values))
            if (body.values.length > 0)
                all = await connection.execute(body.query, body.values);
            else
                all = await connection.query(body.query);

        //console.log('Результаты запроса:', all);
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

const secret = Buffer.from(ENCRYPTION_KEY, "hex");
function encrypt(text) {
    const iv = crypto.randomBytes(16); // 16 байт для AES
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(encryptedData, iv) {
    const ivBuffer = Buffer.from(iv, 'hex');
    const encryptedBuffer = Buffer.from(encryptedData, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secret), ivBuffer);
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
}

async function saveToken(tokenData, userId = 1) {
    console.log(saveToken.name);
    if (!tokenData?.access_token || !tokenData?.expires_in) {
        throw new Error('Invalid tokenData: missing required fields');
    }

    const { access_token, refresh_token, expires_in } = tokenData;
    const expires_at = Date.now() + expires_in * 1000;

    // Шифруем токены
    const { encryptedData: encryptedAccess, iv: ivAccess } = encrypt(access_token);
    const { encryptedData: encryptedRefresh, iv: ivRefresh } = refresh_token ? encrypt(refresh_token) : { encryptedData: null, iv: null };

    const connection = await getAwaitConnect();

    try {
        const query = `
            INSERT INTO hh_tokens (user_id, encrypted_access_token, encrypted_refresh_token, iv_access_token, iv_refresh_token, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                encrypted_access_token = VALUES(encrypted_access_token),
                encrypted_refresh_token = VALUES(encrypted_refresh_token),
                iv_access_token = VALUES(iv_access_token),
                iv_refresh_token = VALUES(iv_refresh_token),
                expires_at = VALUES(expires_at),
                updated_at = CURRENT_TIMESTAMP
        `;

        const [result] = await connection.execute(query, [
            userId, encryptedAccess, encryptedRefresh, ivAccess, ivRefresh, expires_at
        ]);

        console.log('Токен успешно сохранен в БД');
        return result;

    } catch (error) {
        console.error('Ошибка сохранения токена:', error.message);
        throw error;
    } finally {
        connection.release(); // Важно: всегда освобождаем соединение
    }
}


async function getAccessTokenBD(userId = 1) {
    const connection = await getAwaitConnect();

    try {
        const query = 'SELECT encrypted_access_token, iv_access_token, expires_at FROM hh_tokens WHERE user_id = ?';
        const [rows] = await connection.execute(query, [userId]);

        if (rows.length === 0) {
            console.log('Токен не найден для пользователя:', userId);
            return null;
        }

        const row = rows[0];
        const now = Date.now();



        try {
            const decryptedToken = decrypt(row.encrypted_access_token, row.iv_access_token);
            console.log('✅ Токен успешно получен и расшифрован');
            return decryptedToken;
        } catch (error) {
            throw new Error('Ошибка расшифровки токена: ' + error.message);
        }

    } catch (error) {
        console.error('❌ Ошибка получения токена:', error.message);
        throw error;
    } finally {
        connection.release();
    }
}
(async () => {

    //console.log(getAccessTokenBD.name, await getAccessTokenBD());

})();
async function getRefreshTokenBD(userId = 1) {
    const connection = await getAwaitConnect();

    try {
        const query = 'SELECT encrypted_refresh_token, iv_refresh_token FROM hh_tokens WHERE user_id = ?';
        const [rows] = await connection.execute(query, [userId]);

        if (rows.length === 0 || !rows[0].encrypted_refresh_token) {
            return null;
        }

        const row = rows[0];
        return decrypt(row.encrypted_refresh_token, row.iv_refresh_token);

    } catch (error) {
        console.error('❌ Ошибка получения refresh токена:', error.message);
        throw error;
    } finally {
        connection.release();
    }
}
async function deleteTokenBD(userId = 1) {
    const connection = await getAwaitConnect();

    try {
        const query = 'DELETE FROM hh_tokens WHERE user_id = ?';
        const [result] = await connection.execute(query, [userId]);
        console.log('🗑️ Токен удален для пользователя:', userId);
        return result;
    } catch (error) {
        console.error('❌ Ошибка удаления токена:', error.message);
        throw error;
    } finally {
        connection.release();
    }
}
function getAccessToken(code, callback) {
    const postData = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.HH_CLIENT_ID,
        client_secret: process.env.HH_CLIENT_SECRET,
        redirect_uri: process.env.HH_REDIRECT_URI
    });

    const options = {
        hostname: 'hh.ru',
        path: '/oauth/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'User-Agent': `HH-Assistant/1.0 (${process.env.MY_CONTACT})`,
            "HH-User-Agent": `HH-Assistant/1.0 (${process.env.MY_CONTACT})`
        }
    };

    const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const tokenData = JSON.parse(data);
                console.log("TOKEN=", data);
                console.log('УСПЕХ! Токен сохранён');
                callback(null, tokenData);
            } catch (err) {
                console.error('❌ Ошибка при парсинге ответа HH.ru:', err.message);
                console.error('Ответ:', data);
                callback(new Error('Неверный ответ от HH.ru'), null);
            }
        });
    });

    req.on('error', (err) => {
        console.error('❌ Ошибка соединения с HH.ru:', err.message);
        callback(err, null);
    });

    req.write(postData);
    req.end();
}

const server = http.createServer();

let userpages = "";
async function getUserBySession(req) {

    const cookies = Object.fromEntries(
        (req.headers.cookie || "")
            .split(";")
            .filter(Boolean)
            .map(x => x.trim().split("="))
    );

    const sessionId = cookies.session_id;

    if (!sessionId) {
        return null;
    }


    // найти сессию пользователя
    const connectSession = await getAwaitConnect();
    const sqlUserSession = loadSQL("./src/sql/user_session/select.sql");
    const [rows] = await connectSession.execute(sqlUserSession, [sessionId]);
    if (connectSession) connectSession.release();

    return rows.length ? rows[0] : null;
}
async function checkPermission(user_id, permission) {
    const connectSession = await getAwaitConnect();
    const sqlUserSession = loadSQL("./src/sql/user_permission/has_permission.sql");
    const [rows] = await connectSession.execute(sqlUserSession, [user_id, permission]);
    if (connectSession) connectSession.release();

    return rows.length ? rows[0] : null;
}
server.on("request", async (req, res) => {
    console.log("req.url=", req.url)

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    console.log("1837", parsedUrl);
    console.log("pathname", parsedUrl.pathname);
    const pathname = parsedUrl.pathname;

    const endpoint = `${req.method} ${parsedUrl.pathname}`;
    // Главная страница — ссылка для авторизации
    if (pathname === "/conecthh") {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        console.log("1840", parsedUrl);
        const pathname = parsedUrl.pathname;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        const authUrl = `https://hh.ru/oauth/authorize?response_type=code&client_id=${process.env.HH_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.HH_REDIRECT_URI)}&state=123`;
        res.end(`
        <html>
        <head><title>HH.ru OAuth на Node.js</title></head>
        <body>
          <h1>HH.ru OAuth (чистый Node.js)</h1>
          <p><a href="${authUrl}"> Нажмите здесь, чтобы авторизоваться в HH.ru</a></p>
          <p><a href="/nn">token</a></p>
        </body>
      </html>
    `);
    } else if (pathname === '/nn') {
        const code = parsedUrl.searchParams.get('code');
        const state = parsedUrl.searchParams.get('state');
        if (!code || state !== '123') {
            res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('❌ Неверный код или state ' + code + ' ' + state);
            return;
        }

        console.log('Получен code от HH.ru:', code, state);
        getAccessToken(code, async (err, tokenData) => {
            console.log("token=", tokenData);

            await saveToken(tokenData);


            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('❌ Ошибка получения токена: ' + err.message);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
          <html>
            <head><title>Успешно!</title></head>
            <body>
              <h1>✅ Токен успешно получен!</h1>
              <p>Токен сохранён в файл</p>
              <p>Действителен: ${tokenData.expires_in} секунд</p>
              <p>Закройте эту вкладку.</p>
            </body>
          </html>
        `);
            }
        });
    } else if (req.method === "GET") {
        if (pathname === "/api/profile") {

            const user = await getUserBySession(req);
            if (!user) {
                res.writeHead(401, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    redirect: "/authentication"
                }));
                return;
            }
            const connection = await getAwaitConnect();

            try {
                const sqlReg = loadSQL("./src/sql/user_profile/select.sql");
                const [userRows] = await connection.execute(sqlReg, [user.user_id]);
                if (userRows.length > 0) {
                    user.profile = userRows[0];
                } else {
                    user.profile = null;
                }
                const sqlPerm = loadSQL("./src/sql/user_permission/select_by_user_id.sql");
                const [permRows] = await connection.execute(sqlPerm, [user.user_id]);
                if (permRows.length > 0) {
                    user.permissions = permRows;
                } else {
                    user.permissions = [];
                }

                const sqlUsers = loadSQL("./src/sql/users/select.sql");
                const [usersRows] = await connection.execute(sqlUsers, [user.user_id]);
                if (usersRows.length > 0) {
                    user.users = usersRows;
                } else {
                    user.users = [];
                }
                const sqlRoles = loadSQL("./src/sql/roles/select.sql");
                const [rolesRows] = await connection.execute(sqlRoles, [user.user_id]);
                if (rolesRows.length > 0) {
                    user.roles = rolesRows;
                } else {
                    user.roles = [];
                }
                const sqlUserRole = loadSQL("./src/sql/user_role/select_by_user_id.sql");
                const [roles] = await connection.execute(sqlUserRole, [user.user_id]);

                const roleNames = roles.map(r => r.role_name);

                let finalRoles = roles;

                if (roleNames.includes("admin")) {
                    const sqlAllRoles = loadSQL("./src/sql/user_role/select.sql");
                    const [allRoles] = await connection.execute(sqlAllRoles);
                    finalRoles = allRoles;
                }

                user.user_role = finalRoles.length > 0 ? finalRoles : [];

            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: error.message
                }));
                return;

            } finally {
                if (connection) connection.release();
            }
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify(user));
            return
        }
        if (pathname === "/api/fabric_recipe/select") {

            const user = await getUserBySession(req);
            if (!user) {
                res.writeHead(401, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    redirect: "/authentication"
                }));
                return;
            }
            const connection = await getAwaitConnect();
            try {
                const sqlFabricRecipe = loadSQL("./src/sql/fabric_recipe/select.sql");
                const [fabric_recipe] = await connection.execute(sqlFabricRecipe);
                if (fabric_recipe.length > 0) {
                    user.fabric_recipe = fabric_recipe;
                } else {
                    user.fabric_recipe = [];
                }
                const sqlReg = loadSQL("./src/sql/user_profile/select.sql");
                const [userRows] = await connection.execute(sqlReg, [user.user_id]);
                if (userRows.length > 0) {
                    user.profile = userRows[0];
                } else {
                    user.profile = null;
                }
                const sqlPerm = loadSQL("./src/sql/user_permission/select_by_user_id.sql");
                const [permRows] = await connection.execute(sqlPerm, [user.user_id]);
                if (permRows.length > 0) {
                    user.permissions = permRows;
                } else {
                    user.permissions = [];
                }

                //const sqlUsers = loadSQL("./src/sql/users/select.sql");
                //const [usersRows] = await connection.execute(sqlUsers, [user.user_id]);
                //if (usersRows.length > 0) {
                //    user.users = usersRows;
                //} else {
                //    user.users = [];
                //}
                //const sqlRoles = loadSQL("./src/sql/roles/select.sql");
                //const [rolesRows] = await connection.execute(sqlRoles, [user.user_id]);
                //if (rolesRows.length > 0) {
                //    user.roles = rolesRows;
                //} else {
                //    user.roles = [];
                //}
                //const sqlUserRole = loadSQL("./src/sql/user_role/select.sql");
                const sqlUserRole = loadSQL("./src/sql/user_role/select_by_user_id.sql");
                const [user_role] = await connection.execute(sqlUserRole, [user.user_id]);
                if (user_role.length > 0) {
                    user.user_role = user_role;
                } else {
                    user.user_role = [];
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: error.message
                }));
                return;

            } finally {
                if (connection) connection.release();
            }
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify(user));
            return
        }
        if (pathname === "/api/weaving_logs/select") {

            const user = await getUserBySession(req);
            if (!user) {
                res.writeHead(401, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    redirect: "/authentication"
                }));
                return;
            }
            const connection = await getAwaitConnect();
            try {
                const sqlUserWeaver = loadSQL("./src/sql/weaving_logs/select.sql");
                const [user_productions] = await connection.execute(sqlUserWeaver, [user.user_id]);
                if (user_productions.length > 0) {
                    user.user_productions = user_productions;
                } else {
                    user.user_productions = [];
                }

                //const sqlFabricRecipe = loadSQL("./src/sql/fabric_recipe/select.sql");
                //const [fabric_recipe] = await connection.execute(sqlFabricRecipe);
                //if (fabric_recipe.length > 0) {
                //    user.fabric_recipe = fabric_recipe;
                //} else {
                //    user.fabric_recipe = [];
                //}
                const sqlReg = loadSQL("./src/sql/user_profile/select.sql");
                const [userRows] = await connection.execute(sqlReg, [user.user_id]);
                if (userRows.length > 0) {
                    user.profile = userRows[0];
                } else {
                    user.profile = null;
                }
                //const sqlPerm = loadSQL("./src/sql/user_permission/select_by_user_id.sql");
                //const [permRows] = await connection.execute(sqlPerm, [user.user_id]);
                //if (permRows.length > 0) {
                //    user.permissions = permRows;
                //} else {
                //    user.permissions = [];
                //}

                //const sqlUsers = loadSQL("./src/sql/users/select.sql");
                //const [usersRows] = await connection.execute(sqlUsers, [user.user_id]);
                //if (usersRows.length > 0) {
                //    user.users = usersRows;
                //} else {
                //    user.users = [];
                //}
                //const sqlRoles = loadSQL("./src/sql/roles/select.sql");
                //const [rolesRows] = await connection.execute(sqlRoles, [user.user_id]);
                //if (rolesRows.length > 0) {
                //    user.roles = rolesRows;
                //} else {
                //    user.roles = [];
                //}
                //const sqlUserRole = loadSQL("./src/sql/user_role/select.sql");
                //const sqlUserRole = loadSQL("./src/sql/user_role/select_by_user_id.sql");
                //const [user_role] = await connection.execute(sqlUserRole, [user.user_id]);
                //if (user_role.length > 0) {
                //    user.user_role = user_role;
                //} else {
                //    user.user_role = [];
                //}

            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: error.message
                }));
                return;

            } finally {
                if (connection) connection.release();
            }
            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify(user));
            return
        }
        if (pathname.startsWith('/api')) {
            // Здесь обработка запроса к базе данных и возврат JSON
            // pathname оставляем как есть, не меняем

            const base = path.basename(pathname);
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
            let pathname = parsedUrl.pathname;
            const route = pathname;
            let ext = path.extname(pathname);
            if (pathname !== "/" && pathname[pathname.length - 1] === "/") {
                res.writeHead(302, { Location: pathname.slice(0, -1) });
                res.end();
                return;
            }

            if (pathname === '/') {
                pathname = '/index.html';
                ext = '.html';
            } else if (!ext) {
                pathname += '.html';
                ext = '.html';
            }

            let filePath = path.join(process.cwd(), "/public", pathname);
            if (pathname === "/hh.json") {
                filePath = path.join(process.cwd(), "/public/models", pathname);
            }


            if (route === "/loom") {
                filePath = path.join(process.cwd(), "/public/interface", pathname);
            }
            if (route === "/weaver") {
                const user = await getUserBySession(req);

                if (!user) {
                    res.writeHead(302, {
                        Location: "/authentication"
                    });
                    res.end();
                    return;
                }
                /*********                                 *********/
                /********* check role app html render role *********/
                /*********                                 *********/
                const connection = await getAwaitConnect();
                try {
                    const sqlUserRole = loadSQL("./src/sql/user_role/select_by_user_id.sql");
                    const [user_role] = await connection.execute(sqlUserRole, [user.user_id]);
                    if (user_role.length > 0) {
                        if (user_role.map(i => i.role_name).includes("weaver")) {
                            //roleFile = path.join(process.cwd(), "public/forms/roles", "weaver.html");
                        }
                    }
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: error.message
                    }));
                    return;

                } finally {
                    if (connection) connection.release();
                }



                filePath = path.join(process.cwd(), "/public/forms", pathname);
            }
            if (route === "/authentication") {
                filePath = path.join(process.cwd(), "/public/forms", pathname);
            }
            let roleFile = null;
            if (route === "/home") {
                const user = await getUserBySession(req);

                if (!user) {
                    res.writeHead(302, {
                        Location: "/authentication"
                    });
                    res.end();
                    return;
                }
                /*********                                 *********/
                /********* check role app html render role *********/
                /*********                                 *********/
                const connection = await getAwaitConnect();
                try {
                    const sqlUserRole = loadSQL("./src/sql/user_role/select_by_user_id.sql");
                    const [user_role] = await connection.execute(sqlUserRole, [user.user_id]);
                    if (user_role.length > 0) {
                        if (user_role.map(i => i.role_name).includes("weaver")) {
                            roleFile = path.join(process.cwd(), "public/forms/roles", "weaver.html");
                        }
                        if (user_role.map(i => i.role_name).includes("admin")) {
                            roleFile = path.join(process.cwd(), "public/forms/roles", "admin.html");
                        }
                    }
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: error.message
                    }));
                    return;

                } finally {
                    if (connection) connection.release();
                }

                filePath = path.join(process.cwd(), "/public/forms", "profile.html");


                //const connection = await getAwaitConnect();
                //try {
                //    const sqlUserRole = loadSQL("./src/sql/user_role/select_by_user_id.sql");
                //    const [user_pore] = await connection.execute(sqlUserRole, [user.user_id]);

                //    if (user_pore.length > 0) {
                //        user.user_pore = user_pore;

                //        if (user_pore.map(i => i.role_name).includes("weaver"))
                //            filePath = path.join(process.cwd(), "/public/forms", "weaver.html");

                //    } else {
                //        user.user_pore = [];
                //    }

                //} catch (error) {

                //} finally {
                //    connection.release();
                //}
            }

            //res.writeHead(303, {
            //    "Content-Type": "application/json",
            //});

            //res.end(JSON.stringify({
            //    success: false,
            //    redirect: "/authentication",
            //    message: "Ошибка авторизации"
            //}));
            //filePath = path.join(process.cwd(), "/public/forms", "weaver.html");

            //if (pathname === "/n-n.html" || pathname === "/nnstyle.css" || pathname === "nn2-1.js" || pathname === "app.js") {
            //    filePath = path.join(process.cwd(), "/public/models", pathname);
            //}


            //let file = 'viewer.html';

            //if (req.url === '/writer') {
            //    file = 'writer.html';
            //    filePath = path.join(process.cwd(), "/public", file);
            //}


            if (pathname === "/n-n.html") {
                filePath = path.join(process.cwd(), "/public/models", pathname);
            }

            console.log(pathname);
            console.log({ read: filePath });
            fs.exists(filePath, function (exists, err) {
                if (!exists || !MIMETYPES[ext]) {
                    console.log({ path: filePath });
                    console.log("File does not exist: " + pathname);
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`<html>
            <head><title>Успешно!</title></head>
            <body>
              <pre>read file<br>${filePath}</pre>
              <pre>${pathname}</pre>
              <pre>route</pre>
              <pre>${route}</pre>
            </body>
            </html>`);
                    return;
                }
                res.writeHead(200, { "Content-Type": MIMETYPES[ext] });
                console.log(filePath);
                //const fileStream = fs.createReadStream(filePath);
                //fileStream.pipe(res);
                fs.readFile(filePath, "utf8", (err, html) => {
                    if (err) {
                        res.writeHead(500);
                        res.end();
                        return
                    }
                    if (roleFile) {
                        const roleHtml = fs.readFileSync(roleFile, "utf8");

                        html = html.replace(
                            "<!-- ROLE_CONTENT -->",
                            roleHtml
                        );
                    }
                    //res.writeHead(200, {
                    //    "Content-Type": "text/html; charset=utf-8"
                    //});

                    res.end(html);
                });
            });
            // Здесь отдаём статический файл из файловой системы
        }
    }
    if (req.url === "/cli") {
        const clientProfile_server = {
            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            cfIp: req.headers["cf-connecting-ip"],
            realIp: req.headers["x-real-ip"],
            xForwardedFor: req.headers["x-forwarded-for"],
            xForwardedHost: req.headers["x-forwarded-host"],
            xForwardedProto: req.headers["x-forwarded-proto"],
            xForwardedPort: req.headers["x-forwarded-port"],

            userAgent: req.headers["user-agent"],
            language: req.headers["accept-language"],
            encoding: req.headers["accept-encoding"],
            accept: req.headers["accept"],
            acceptCharset: req.headers["accept-charset"],
            acceptLanguage: req.headers["accept-language"],
            connection: req.headers["connection"],
            host: req.headers["host"],

            referer: req.headers["referer"],
            origin: req.headers["origin"],

            dnt: req.headers["dnt"],
            upgradeInsecureRequests: req.headers["upgrade-insecure-requests"],
            secFetchSite: req.headers["sec-fetch-site"],
            secFetchMode: req.headers["sec-fetch-mode"],
            secFetchUser: req.headers["sec-fetch-user"],
            secFetchDest: req.headers["sec-fetch-dest"],

            secChUa: req.headers["sec-ch-ua"],
            secChUaPlatform: req.headers["sec-ch-ua-platform"],
            secChUaMobile: req.headers["sec-ch-ua-mobile"],
            secChUaArch: req.headers["sec-ch-ua-arch"],
            secChUaModel: req.headers["sec-ch-ua-model"],
            secChUaFullVersion: req.headers["sec-ch-ua-full-version"],
            secChUaFullVersionList: req.headers["sec-ch-ua-full-version-list"],

            cookie: req.headers["cookie"],

            tls: {
                encrypted: req.socket.encrypted,
                protocol: req.socket.getProtocol?.(),
                cipher: req.socket.getCipher?.(),
                alpnProtocol: req.socket.alpnProtocol,
                servername: req.socket.servername,
            },

            socket: {
                remoteAddress: req.socket.remoteAddress,
                remotePort: req.socket.remotePort,
                localAddress: req.socket.localAddress,
                localPort: req.socket.localPort,
                bytesRead: req.socket.bytesRead,
                bytesWritten: req.socket.bytesWritten,
                timeout: req.socket.timeout,
            },

            proxy: {
                via: req.headers["via"],
                forwarded: req.headers["forwarded"],
                realIp: req.headers["x-real-ip"],
                clusterClientIp: req.headers["x-cluster-client-ip"],
                trueClientIp: req.headers["true-client-ip"],
            },

            method: req.method,
            url: req.url,
            httpVersion: req.httpVersion,

            timestamp: Date.now(),
        };
        let ContentType = {};
        ContentType.textPlain = {
            "Content-Type": "text/plain"
        }
        ContentType.json = {
            "Content-Type": "application/json"
        }
        ContentType.html = {
            "Content-Type": "text/html"
        }
        
        res.writeHead(200, ContentType.html);
        res.end(`
<html>
<body>
<script>
    const profileServer = ${JSON.stringify(clientProfile_server)};
    console.log(profileServer);
    let clientProfile = {
  // =========================
  // BASIC BROWSER INFO
  // =========================
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  language: navigator.language,
  languages: navigator.languages,
  cookieEnabled: navigator.cookieEnabled,
  doNotTrack: navigator.doNotTrack,

  // =========================
  // HARDWARE / DEVICE
  // =========================
  hardwareConcurrency: navigator.hardwareConcurrency,
  deviceMemory: navigator.deviceMemory,
  maxTouchPoints: navigator.maxTouchPoints,

  // =========================
  // SCREEN / DISPLAY
  // =========================
  screen: {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    orientation: screen.orientation?.type,
  },

  // =========================
  // WINDOW / VIEWPORT
  // =========================
  viewport: {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    devicePixelRatio: window.devicePixelRatio,
  },

  // =========================
  // TIMEZONE / LOCALE
  // =========================
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  timezoneOffset: new Date().getTimezoneOffset(),

  locale: Intl.DateTimeFormat().resolvedOptions().locale,

  // =========================
  // AUDIO FINGERPRINT (WebAudio)
  // =========================
  audioFingerprint: await (async () => {
    try {
      const ctx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100);
      const osc = ctx.createOscillator();
      const comp = ctx.createDynamicsCompressor();

      osc.type = "triangle";
      osc.frequency.value = 10000;

      osc.connect(comp);
      comp.connect(ctx.destination);

      osc.start(0);
      const buffer = await ctx.startRendering();

      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        sum += buffer.getChannelData(0)[i];
      }

      return sum.toString();
    } catch {
      return null;
    }
  })(),

  // =========================
  // CANVAS FINGERPRINT
  // =========================
  canvasFingerprint: (() => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("fingerprint", 2, 2);

      return canvas.toDataURL();
    } catch {
      return null;
    }
  })(),

  // =========================
  // WEBGL FINGERPRINT
  // =========================
  webgl: (() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

      if (!gl) return null;

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        unmaskedVendor: debugInfo
          ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
          : null,
        unmaskedRenderer: debugInfo
          ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          : null,
      };
    } catch {
      return null;
    }
  })(),

  // =========================
  // CLIENT HINTS (MODERN BROWSERS)
  // =========================
  clientHints: {
    ua: navigator.userAgentData?.brands,
    mobile: navigator.userAgentData?.mobile,
    platform: navigator.userAgentData?.platform,
  },

  // =========================
  // NAVIGATION / REFERRER
  // =========================
  referrer: document.referrer,
  url: location.href,

  // =========================
  // STORAGE CAPABILITIES
  // =========================
  storage: {
    localStorage: (() => {
      try {
        return !!window.localStorage;
      } catch {
        return false;
      }
    })(),
    sessionStorage: (() => {
      try {
        return !!window.sessionStorage;
      } catch {
        return false;
      }
    })(),
  },

  // =========================
  // BROWSER FEATURES DETECTION
  // =========================
  features: {
    webgl: !!window.WebGLRenderingContext,
    webgl2: !!window.WebGL2RenderingContext,
    websockets: "WebSocket" in window,
    serviceWorker: "serviceWorker" in navigator,
    notifications: "Notification" in window,
    permissions: !!navigator.permissions,
  },

  // =========================
  // PERFORMANCE SIGNALS
  // =========================
  performance: {
    memory: performance.memory
      ? {
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          usedJSHeapSize: performance.memory.usedJSHeapSize,
        }
      : null,
  },
};
    console.log(clientProfile);
</script>
</body>
</html>
`);
    }
    if (req.url === "/app") {
        if (req.method === "POST") {
            let chunks = [];
            req.on("data", (chunk) => {
                chunks.push(chunk);
            }).on("end", async () => {
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

                    let connection;
                    try {
                        const profile = {
                            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                            userAgent: req.headers["user-agent"],
                            language: req.headers["accept-language"]
                        };
                        const headers = req.headers;

                        const profileMax = {
                            ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,

                            userAgent: headers["user-agent"],
                            language: headers["accept-language"],

                            referer: headers["referer"],
                            origin: headers["origin"],

                            accept: headers["accept"],
                            encoding: headers["accept-encoding"],
                            connection: headers["connection"],

                            host: headers["host"],
                            dnt: headers["dnt"],
                        };
                        connection = await getAwaitConnect();
                        const sql = loadSQL("./src/sql/endpoint/insert.sql");
                        await connection.execute(sql, [
                            endpoint,
                            profile.ip,
                            profile.userAgent,
                            profile.language
                        ]);
                    } catch (e) {
                    } finally {
                        if (connection) {
                            connection.release();
                            console.log("Соединение возвращено.");
                        }
                    }
                    functionDB[action](data)
                        .then((resolve) => JSON.stringify(resolve))
                        .then((resolve) => res.end(resolve))
                        .catch(error => {
                            res.end(error.message);
                            console.log("Er", error);
                        });
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
    } else if (req.method === "POST") {
        if (pathname.startsWith('/api/login')) {
            let chunks = [];

            req.on("data", (chunk) => {
                chunks.push(chunk);
            });
            req.on("end", async () => {

                const connection = await getAwaitConnect();
                try {

                    const buffer = Buffer.concat(chunks);
                    const raw = buffer.toString().trim();
                    if (!raw) throw new Error("Empty body");
                    const data = JSON.parse(raw);

                    let user = new Object();
                    user.login = data.login;

                    const profile = {
                        login: user.login,
                        ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
                        userAgent: req.headers["user-agent"],
                        language: req.headers["accept-language"],
                        timestamp: new Date().toISOString()
                    };

                    // login
                    const sqlLogin = loadSQL("./src/sql/login/select.sql");
                    const [rows] = await connection.execute(sqlLogin, [user.login]);
                    if (!rows.length) {
                        user.password_hash = await bcrypt.hash(data.password, 12);

                        const sqlReg = loadSQL("./src/sql/login/insert.sql");
                        const [result] = await connection.execute(sqlReg, [user.login, user.password_hash]);

                        user.user_id = result.insertId;
                    } else {
                        const success = await bcrypt.compare(data.password, rows[0].password_hash);

                        if (!success) {
                            res.end(JSON.stringify({
                                success: false,
                                message: "Wrong password"
                            }));
                            return
                        }
                        //user = {
                        user.user_id = rows[0].user_id;
                        user.login = rows[0].login;
                        user.password_hash = rows[0].password_hash;
                        //};
                    }
                    const sessionId = crypto.randomBytes(32).toString("hex");
                    const sqlUserSession = loadSQL("./src/sql/user_session/insert.sql");
                    await connection.execute(sqlUserSession, [sessionId, user.user_id, profile.ip, profile.userAgent]);
                    console.log("Соединение возвращено.");
                    // редирект на home
                    res.writeHead(200, {
                        "Content-Type": "application/json",
                        "Set-Cookie": [
                            `session_id=${sessionId}; HttpOnly; Secure; Path=/; Max-Age=86400; SameSite=Lax`
                        ]
                    });

                    res.end(JSON.stringify({
                        success: true,
                        redirect: "/home",
                        message: "Авторизация выполнена"
                    }));
                    return
                } catch (error) {

                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        message: "Ошибка JSON",
                        error: error.message,
                        msg: msg
                    }));
                    return;
                } finally {
                    if (connection) connection.release();
                }
            });
            return;
        } else if (pathname.startsWith("/api/session/quit")) {

            const connection = await getAwaitConnect();
            try {
                const cookies = Object.fromEntries(
                    (req.headers.cookie || "")
                        .split(";")
                        .filter(Boolean)
                        .map(x => x.trim().split("="))
                );

                const sessionId = cookies.session_id;

                if (!sessionId) {
                    res.writeHead(200, {
                        "Set-Cookie": "session_id=; HttpOnly; Path=/; Max-Age=0",
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: true,
                        redirect: "/authentication"
                    }));
                    return;
                }
                const sqlDelete = loadSQL("./src/sql/user_session/delete.sql");
                await connection.execute(sqlDelete, [sessionId]);


                res.writeHead(200, {
                    "Set-Cookie": "session_id=; HttpOnly; Path=/; Max-Age=0",
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: true,
                    redirect: "/authentication"
                }));
                return
            } catch (error) {

                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    error: error.message
                }));
                return;
            } finally {
                if (connection) connection.release();
            }
            return
        } else if (pathname.startsWith("/api/users/role/insert")) {

            const actor = await getUserBySession(req);
            if (!actor) {
                res.writeHead(302, {
                    Location: "/authentication"
                });

                res.end();
                return
            }
            const hasPermission = await checkPermission(actor.user_id, "users.update");
            if (!hasPermission) {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                })
                //res.writeHead(403);
                //res.writeHead(200, {
                //    "Content-Type": "application/json"
                //});
                res.end(JSON.stringify({
                    success: false,
                    user: actor,
                    message: "Permission denied"
                }));
                return
            }

            let chunks = [];

            req.on("data", (chunk) => {
                chunks.push(chunk);
            });
            req.on("end", async () => {

                const connection = await getAwaitConnect();
                try {

                    const buffer = Buffer.concat(chunks);
                    const raw = buffer.toString().trim();
                    if (!raw) throw new Error("Empty body");
                    const data = JSON.parse(raw);
                    const user = {};
                    user.user_id = data.user_id;
                    if (actor.user_id == user.user_id) throw new Error("Изменять свою роль нельзя");
                    user.role_id = data.role_id;


                    const sqlReg = loadSQL("./src/sql/user_role/insert.sql");
                    const [result] = await connection.execute(sqlReg, [user.user_id, user.role_id]);

                    const sqlUserRole = loadSQL("./src/sql/user_role/select.sql");
                    const [user_role] = await connection.execute(sqlUserRole);
                    if (user_role.length > 0) {
                        user.user_role = user_role;
                    } else {
                        user.user_role = [];
                    }

                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });

                    //res.end(JSON.stringify({
                    //    success: true,
                    //    result: result,
                    //    user: user,
                    //    data: data,
                    //    message: "Данные изменены"
                    //}));
                    user.message = "Данные изменены";
                    user.success = true;
                    res.end(JSON.stringify(user));
                    return
                } catch (error) {

                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        error: error.message
                    }));
                    return;
                } finally {
                    if (connection) connection.release();
                }
            })
            return;


        } else if (pathname.startsWith("/api/users/role/delete")) {

            const actor = await getUserBySession(req);
            if (!actor) {
                res.writeHead(302, {
                    Location: "/authentication"
                });

                res.end();
                return
            }
            const hasPermission = await checkPermission(actor.user_id, "users.delete");
            if (!hasPermission) {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                })
                //res.writeHead(403);
                //res.writeHead(200, {
                //    "Content-Type": "application/json"
                //});
                res.end(JSON.stringify({
                    success: false,
                    user: actor,
                    message: "Permission denied"
                }));
                return
            }

            let chunks = [];

            req.on("data", (chunk) => {
                chunks.push(chunk);
            });
            req.on("end", async () => {

                const connection = await getAwaitConnect();
                try {

                    const buffer = Buffer.concat(chunks);
                    const raw = buffer.toString().trim();
                    if (!raw) throw new Error("Empty body");
                    const data = JSON.parse(raw);
                    const user = {};
                    user.user_id = data.user_id;
                    if (actor.user_id == user.user_id) throw new Error("Удалить у себя роль нельзя");
                    user.role_id = data.role_id;


                    const sqlReg = loadSQL("./src/sql/user_role/delete.sql");
                    const [result] = await connection.execute(sqlReg, [user.user_id, user.role_id]);

                    const sqlUserRole = loadSQL("./src/sql/user_role/select.sql");
                    const [user_role] = await connection.execute(sqlUserRole);
                    if (user_role.length > 0) {
                        user.user_role = user_role;
                    } else {
                        user.user_role = [];
                    }

                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });

                    //res.end(JSON.stringify({
                    //    success: true,
                    //    result: result,
                    //    user: user,
                    //    data: data,
                    //    message: "Данные изменены"
                    //}));
                    user.message = "Данные изменены";
                    user.success = true;
                    res.end(JSON.stringify(user));
                    return
                } catch (error) {

                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        error: error.message
                    }));
                    return;
                } finally {
                    if (connection) connection.release();
                }
            })
            return;


        } else if (pathname.startsWith("/api/profile/insert")) {

            const user = await getUserBySession(req);

            if (!user) {
                res.writeHead(302, {
                    Location: "/authentication"
                });

                res.end();
                return
            }
            let chunks = [];

            req.on("data", (chunk) => {
                chunks.push(chunk);
            });
            req.on("end", async () => {

                const connection = await getAwaitConnect();
                try {

                    const buffer = Buffer.concat(chunks);
                    const raw = buffer.toString().trim();
                    if (!raw) throw new Error("Empty body");
                    const data = JSON.parse(raw);

                    user.fio = data.fio;
                    user.birthDate = data.birthDate;
                    const sqlReg = loadSQL("./src/sql/user_profile/insert.sql");
                    const [result] = await connection.execute(sqlReg, [user.user_id, user.fio, user.birthDate]);


                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: true,
                        result: result,
                        user: user,
                        message: "Данные изменены"
                    }));
                    return
                } catch (error) {

                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        error: error.message
                    }));
                    return;
                } finally {
                    if (connection) connection.release();
                }
            })
            return;
        } else if (pathname.startsWith("/api/weaving_logs/insert")) {

            const user = await getUserBySession(req);

            if (!user) {
                res.writeHead(302, {
                    Location: "/authentication"
                });

                res.end();
                return
            }
            let chunks = [];

            req.on("data", (chunk) => {
                chunks.push(chunk);
            });
            req.on("end", async () => {

                const connection = await getAwaitConnect();
                try {

                    const buffer = Buffer.concat(chunks);
                    const raw = buffer.toString().trim();
                    if (!raw) throw new Error("Empty body");
                    const data = JSON.parse(raw);



                    const sqlWeavingLogs = loadSQL("./src/sql/weaving_logs/insert.sql");
                    const [weaving_logs] = await connection.execute(sqlWeavingLogs,
                        [
                            user.user_id,
                            new Date(data.dateTime).toISOString().slice(0, 10),
                            Number(data.smena),
                            Number(data.loom),
                            Number(data.recipe),
                            Number(data.product)
                    ]);
                    if (weaving_logs.length > 0) {
                        user.weaving_logs = weaving_logs;
                    } else {
                        user.weaving_logs = [];
                    }

                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: true,
                        result: weaving_logs,
                        user: user,
                        message: "Информация добавлена"
                    }));
                    return
                } catch (error) {

                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        success: false,
                        error: error.message
                    }));
                    return;
                } finally {
                    if (connection) connection.release();
                }
            })
            return;
        } else if (pathname.startsWith("/api/weaving_logs/select")) {
            const user = await getUserBySession(req);

            if (!user) {
                res.writeHead(302, {
                    Location: "/authentication"
                });

                res.end();
                return
            }
            const connection = await getAwaitConnect();
            try {

                const buffer = Buffer.concat(chunks);
                const raw = buffer.toString().trim();
                if (!raw) throw new Error("Empty body");
                const data = JSON.parse(raw);

                const sqlUserWeaver = loadSQL("./src/sql/weaving_logs/select.sql");
                const [user_productions] = await connection.execute(sqlUserWeaver,[user.user_id]);
                if (user_productions.length > 0) {
                    user.user_productions = user_productions;
                } else {
                    user.user_productions = [];
                }
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    success: true,
                    result: user_productions,
                    user: user,
                    message: "Информация добавлена"
                }));
                return
            } catch (error) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    success: false,
                    error: error.message
                }));
                return;
            } finally {
                if (connection) connection.release();
            }
        } else {
            res.writeHead(404);
            res.end("Not Found");
        }
    } else if (req.url === "/api/tape/insert") {
        if (req.method === "POST") {
            let chunks = [];

            req.on("data", (chunk) => {
                chunks.push(chunk);
            });

            req.on("end", async () => {
                let connection;

                try {
                    if (chunks.length === 0) {
                        throw new Error("Empty request body");
                    }

                    const buffer = Buffer.concat(chunks);
                    const raw = buffer.toString().trim();
                    if (!raw) throw new Error("Empty body");
                    const data = JSON.parse(raw);
                    console.log("Received:", data);

                    const { density_id, length, diameter } = data;

                    // простая валидация
                    if (!density_id || !length || !diameter) {
                        throw new Error("Missing fields");
                    }

                    const query = `
                        INSERT INTO tape_knowledge (density_id, length, diameter)
                        SELECT id, ?, ?
                        FROM tape_density
                        WHERE density = ?
                        `;

                    connection = await getAwaitConnect();

                    const [result] = await connection.execute(query, [
                        density,
                        length,
                        diameter
                    ]);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        insertId: result.insertId
                    }));

                } catch (error) {
                    console.error("Ошибка:", error);

                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        error: error.message
                    }));

                } finally {
                    if (connection) {
                        connection.release();
                        console.log("Соединение закрыто");
                    }
                }
            });

            req.on("error", (error) => {
                console.error("Stream error:", error);

                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({
                    error: "Internal server error"
                }));
            });
        } else { }
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



















//import http from 'http';
//import fs from 'fs';
//import path from 'path';
//import url from 'url';

import { WebSocketServer } from 'ws';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let state = {
    text: '',
    width: 1000,
    height: 400
};
function createCanvasCode(text) {
    const scale = 1.3;
    const can = {}
    can.width = state.width * scale;
    can.height = state.height * scale;
    let font = 13.3333;
    font *= scale;
    let lineHeight = 1.2 * font;
    return `
const canvas = document.createElement('canvas');
canvas.width = ${can.width + 20};
canvas.height = ${can.height + 16};

const ctx = canvas.getContext('2d');

ctx.clearRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = '#000000';
ctx.font = '${font}px Arial';

const lines = ${JSON.stringify(text)}.split('\\n');

let y = 16;

for (const line of lines) {
    ctx.fillText(line, 20, y);
    y += ${lineHeight};
}

// вставляем canvas в страницу (или контейнер)
const app = document.getElementById("app");
app.innerHTML = "";
app.appendChild(canvas);
`;
}
//console.log(__filename);
//console.log(__dirname);

//const server = http.createServer((req, res) => {

//    let file = 'viewer.html';

//    if (req.url === '/writer') {
//        file = 'writer.html';
//    }

//    const filePath = path.join(__dirname, 'public', file);
//    console.log(filePath);
//    fs.readFile(filePath, (err, data) => {

//        if (err) {
//            res.writeHead(500);
//            res.end('error');
//            return;
//        }

//        res.writeHead(200, {
//            'Content-Type': 'text/html'
//        });

//        res.end(data);
//    });
//});
const wss = new WebSocketServer({ server });

function broadcastCanvasCode() {

    const code = createCanvasCode(state.text);

    const payload = JSON.stringify({
        type: 'canvas-code',
        code
    });

    for (const client of wss.clients) {

        if (client.readyState === 1) {
            client.send(payload);
        }
    }
}

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({
        type: 'canvas-code',
        code: createCanvasCode(state.text)
    }));

    ws.on('message', (msg) => {

        const data = JSON.parse(msg.toString());

        if (data.type === 'text-change') {
            console.log(data.text);

            state.text = data.text;
            state.width = data.width;
            state.height = data.height;

            broadcastCanvasCode();

        }
    });
});























