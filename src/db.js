//const db = require("./sqlite");
const combined = require("../server");
const text = require("./data.json");

const mysql = require('mysql2/promise');

function login() {
  return new Promise((resolve, reject) => {
    resolve("ok");
  });
}
function insert(body) {
  return new Promise((resolve, reject) => {
    // Использование serialize для последовательного выполнения запросов
    db.serialize(() => {
      // Подготовка SQL-запроса
      const stmt = db.prepare(
        "INSERT INTO " +
          body.table.name +
          " (meters, quantity, time, date) VALUES (?, ?, ?, ?)"
      );
      let successCount = 0;
      let errorCount = 0;
      // Вставка данных
      body.data.forEach((item) => {
        stmt.run(
          item.meters,
          item.quantity,
          item.time,
          item.data,
          function (err) {
            if (err) {
              console.error("Ошибка вставки:", err.message);
              errorCount++;
            } else {
              console.log(`Запись успешно добавлена: ${item.meters}`);
              successCount++;
            }
          }
        );
      });
      // Завершение подготовки запроса
      stmt.finalize(() => {
        if (errorCount > 0) {
          reject(
            `Обработано записей: Успешно - ${successCount}, Ошибок - ${errorCount}`
          );
        } else {
          resolve(`Все записи успешно добавлены: ${successCount}`);
        }
      });
    });
  });
}
function select(body) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let query =
        "SELECT * FROM " +
        body.table.name +" INNER JOIN MyChrono ON " +
        body.table.name +".date = MyChrono.date_id";
      
      
//             let query =
//         "SELECT * FROM " +
//         body.table.name +" INNER JOIN MyChrono ON " +
//         body.table.name +".date = MyChrono.date_id";
      // let query = "SELECT *,rowid FROM " + body.table.name;
      let conditions = [];
      let params = [];

      // Добавляем условия фильтрации, если они указаны
      if (body.millisecond) {
        conditions.push("millisecond = ?");
        params.push(body.millisecond);
      }
      if (body.quantity) {
        conditions.push("quantity = ?");
        params.push(body.quantity);
      }
      if (body.time) {
        conditions.push("time = ?");
        params.push(body.time);
      }
      if (body.date) {
        conditions.push("date = ?");
        params.push(body.date);
      }
       
      if (body.saveId) {
        conditions.push("save_id = ?");
        params.push(body.saveId);
      }

      // Если есть условия, добавляем их к запросу
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
      query += " ORDER BY date ASC";

      console.log(body);
      console.log(query, params);
      db.all(query, params, (err, rows) => {
        if (err) {
          reject("Ошибка при получении данных: " + err.message);
        } else {
          // resolve(query+"| |"+params); // Возвращаем полученные данные
          resolve(rows); // Возвращаем полученные данные
        }
      });
    });
  });
}
function selectT(filters) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let query = "SELECT *,rowid FROM " + filters.table.name;
      let conditions = [];
      let params = [];

      // Добавляем условия фильтрации, если они указаны
      if (filters.millisecond) {
        conditions.push("millisecond = ?");
        params.push(filters.millisecond);
      }
      if (filters.quantity) {
        conditions.push("quantity = ?");
        params.push(filters.quantity);
      }
      if (filters.time) {
        conditions.push("time = ?");
        params.push(filters.time);
      }
      if (filters.date) {
        conditions.push("date = ?");
        params.push(filters.date);
      }

      // Если есть условия, добавляем их к запросу
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      console.log(query, params);
      db.all(query, params, (err, rows) => {
        if (err) {
          reject("Ошибка при получении данных: " + err.message);
        } else {
          // resolve(query+"| |"+params); // Возвращаем полученные данные
          resolve(rows); // Возвращаем полученные данные
        }
      });
    });
  });
}
function today(filters) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // `SELECT * FROM history WHERE date >= 1741651200000;`
      let query =
        "SELECT * FROM " +
        filters.table.name +
        " INNER JOIN MyChrono ON " +
        filters.table.name +".date = MyChrono.date_id";
      let conditions = [];
      let params = [];

      // Добавляем условия фильтрации, если они указаны
      if (filters.millisecond) {
        conditions.push("millisecond = ?");
        params.push(filters.millisecond);
      }
      if (filters.quantity) {
        conditions.push("quantity = ?");
        params.push(filters.quantity);
      }
      if (filters.time) {
        conditions.push("time = ?");
        params.push(filters.time);
      }

      if (filters.date) {
        conditions.push("date = ?");
        params.push(filters.date);
      }

      if (filters.ms) {
        conditions.push("MyChrono.date >= ?");
        params.push(filters.ms);
      }

      // Если есть условия, добавляем их к запросу
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
      
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(JSON.stringify("Ошибка при получении данных: " + err.message));
        } else {
          // resolve({rows,query, params}); // Возвращаем полученные данные
          if (rows.length > 0) {
            resolve(rows); // Возвращаем полученные данные
          } else {
            resolve({ messeag: "Записей за последние 24 часа не найдено." }); // Возвращаем полученные данные
          }
        }
      });
    });
  });
}
function todayW(body) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Удаляем старые записи на текущую дату
      db.run(
        "DELETE FROM " + body.table.name + " WHERE date = ? AND time = ?",
        [body.key.date, body.key.time],
        (err) => {
          if (err) {
            return reject(err);
          }
          // resolve(`Все записи успешно удалены.`);
        }
      );
      // Добавляем новые записи
      let successCount = 0;
      let errorCount = 0;
      const stmt = db.prepare(
        "INSERT INTO " +
          body.table.name +
          " (millisecond, quantity, time, date, run) VALUES (?, ?, ?, ?,?)"
      );

      body.data.forEach((item) => {
        stmt.run(
          item.millisecond,
          item.quantity,
          item.time,
          item.data,
          item.run,
          function (err) {
            if (err) {
              console.error("Ошибка вставки:", err.message);
              errorCount++;
            } else {
              console.log(`Запись успешно добавлена: ${item.millisecond}`);
              successCount++;
            }
          }
        );
      });
      // Завершение подготовки запроса
      stmt.finalize(() => {
        if (errorCount > 0) {
          reject(
            `Обработано записей: Успешно - ${successCount}, Ошибок - ${errorCount}`
          );
        } else {
          // console.log(text.message.success);
          // resolve(`Все записи успешно добавлены: ${successCount}`);
          resolve(text.messageInsert);
        }
      });
    });
  });
}

function remove(body) {
  return new Promise((resolve, reject) => {
    if (true) {
      // if (combined === process.env.example) {
      db.serialize(() => {
        // Удаляем старые записи на текущую дату

        db.run(
          "DELETE FROM " + body.table.name + " WHERE save_id = ?",
          [body.key.save_id],
          (err) => {
            if (err) {
              return reject(err);
            }
            resolve(text.messageRemove);
          }
        );
        
        
        

        // Добавляем новые записи
        // let successCount = 0;
        // let errorCount = 0;
        // const stmt = db.prepare("INSERT INTO " + body.table.name +" (meters, quantity, time, date) VALUES (?, ?, ?, ?)"
        // );
        // body.data.forEach((item) => {stmt.run(
        //     item.meters,
        //     item.quantity,
        //     item.time,
        //     item.data,
        //     function (err) {
        //       if (err) {
        //         console.error("Ошибка вставки:", err.message);
        //         errorCount++;
        //       } else {
        //         console.log(`Запись успешно добавлена: ${item.meters}`);
        //         successCount++;
        //       }
        //     }
        //   );
        // });
        // Завершение подготовки запроса
        // stmt.finalize(() => {
        //   if (errorCount > 0) {
        //     reject(`Обработано записей: Успешно - ${successCount}, Ошибок - ${errorCount}`);
        //   } else {
        //     resolve(`Все записи успешно добавлены: ${successCount}`);
        //   }
        // });
      });
    } else {
      reject(JSON.stringify(text.message.user.access));
      // reject('"Все записи успешно на месте."');
      // reject(throw new Error('"Все записи успешно на месте."'));
    }
  });
}

// function save(body) {
//   return new Promise((resolve, reject) => {
//     return db.serialize(() => {
//       return db.get(
//         "SELECT date_id,* " + "FROM MyChronoTest " + "WHERE date = ?",
//         [body.key.date],
//         function (err, row) {
//           console.log(JSON.stringify(row));
//           if (err) {
//             return console.error(err.message);
//           }
//           let date_id;

//           if (row) {
//             console.log(`ID item: ${row.date_id}`);
//             date_id = row.date_id;
//             // resolve(date_id);
//           } else {
//             console.log("Вставить новую дату");
//             db.run(
//               "INSERT INTO MyChronoTest (date) VALUES (?)",
//               [body.key.date],
//               function (err) {
//                 if (err) {
//                   return console.error(err.message);
//                 }
//                 console.log(JSON.stringify(this));

//                 // Получаем ID последнего вставленного
//                 date_id = this.lastID;
//                 console.log(`New ID date_id: ${date_id}`);
//                 // resolve(date_id);
//               }
//             );
//           }

//           db.run(
//             "INSERT INTO MySaveTest (date_id) VALUES (?)",
//             [date_id],
//             function (err) {
//               if (err) {
//                 return console.error(err.message);
//               }
//               let save_id = this.lastID;
//               body.data.forEach((o) => {
//                 db.run(
//                   "INSERT INTO diaty_ref (millisecond,quantity,time,date,run,save_id) " +
//                     "VALUES (?,?,?,?,?,?)",
//                   [o.millisecond, o.quantity, o.time, date_id, o.run, save_id],
//                   (err) => {
//                     if (err) {
//                       return reject(err);
//                     }
//                   }
//                 );

//                 console.log(JSON.stringify(o));
//               });
//               resolve(JSON.stringify(this));
//             }
//           );
//         }
//       );
//     });
//   });
// }








// function save(body) {
//   return new Promise((resolve, reject) => {
//     db.serialize(() => {
//       // Проверяем, существует ли дата
//       db.get(
//         "SELECT date_id FROM MyChrono WHERE date = ?",
//         [body.key.date],
//         function (err, row) {
//           if (err) {
//             console.error(err.message);
//             return reject(err);
//           }

//           // Если дата существует, используем ее
//           const date_id = row ? row.date_id : null;

//           // Если дата не существует, вставляем новую
//           if (!date_id) {
//             console.log("Вставить новую дату");
//             db.run(
//               "INSERT INTO MyChrono (date) VALUES (?)",
//               [body.key.date],
//               function (err) {
//                 if (err) {
//                   console.error(err.message);
//                   return reject(err);
//                 }
//                 console.log(`New ID date_id: ${this.lastID}`);
//                 insertIntoMySaveTest(this.lastID, body.data, resolve, reject);
//               }
//             );
//           } else {
//             console.log(`ID item: ${date_id}`);
//             insertIntoMySaveTest(date_id, body.data, resolve, reject);
//           }
//         }
//       );
//     });
//   });
// }

// function insertIntoMySaveTest(date_id, data, resolve, reject) {
//   db.run(
//     "INSERT INTO MySaveTest (date_id) VALUES (?)",
//     [date_id],
//     function (err) {
//       if (err) {
//         console.error(err.message);
//         return reject(err);
//       }

//       const save_id = this.lastID;
//       console.log(`New save_id: ${save_id}`);

//       // Вставка данных в diary_ref
//       const insertPromises = data.map((o) => {
//         return new Promise((resolve, reject) => {
//           db.run(
//             "INSERT INTO diary_ref (millisecond, quantity, time, date, run, save_id) VALUES (?,?,?,?,?,?)",
//             [o.millisecond, o.quantity, o.time, date_id, o.run, save_id],
//             (err) => {
//               if (err) {
//                 return reject(err);
//               }
//               console.log(JSON.stringify(o));
//               resolve();
//             }
//           );
//         });
//       });

//       // Ждем завершения всех вставок
//       Promise.all(insertPromises)
//         .then(() => resolve(JSON.stringify(this)))
//         .catch(reject);
//     }
//   );
// }

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}


async function save(body) {
  try {
    await run(db, "BEGIN TRANSACTION");

    // Проверяем, существует ли дата
    const row = await get(db, "SELECT date_id FROM MyChrono WHERE date = ?", [body.key.date]);
    const date_id = row ? row.date_id : null;

    // Если дата не существует, вставляем новую
    if (!date_id) {
      console.log("Вставить новую дату");
      const insertResult = await run(db, "INSERT INTO MyChrono (date) VALUES (?)", [body.key.date]);
      console.log(`New ID date_id: ${insertResult.lastID}`);
      await insertIntoMySaveTest(insertResult.lastID, body.data);
    } else {
      console.log(`ID item: ${date_id}`);
      await insertIntoMySaveTest(date_id, body.data);
    }

    await run(db, "COMMIT");
  } catch (err) {
    await run(db, "ROLLBACK");
    console.error(err.message);
    throw err; // Пробрасываем ошибку дальше
  }
}

async function insertIntoMySaveTest(date_id, data) {
  const insertResult = await run(db, "INSERT INTO MySaveTest (date_id) VALUES (?)", [date_id]);
  const save_id = insertResult.lastID;
  console.log(`New save_id: ${save_id}`);

  // Вставка данных в diary_ref
  const insertPromises = data.map(async (o) => {
    await run(db, "INSERT INTO diary_ref (millisecond, quantity, time, date, run, save_id) VALUES (?,?,?,?,?,?)", 
      [o.millisecond, o.quantity, o.time, date_id, o.run, save_id]);
    console.log(JSON.stringify(o));
  });

  // Ждем завершения всех вставок
  await Promise.all(insertPromises);
}

module.exports = {
  selectT,
  insert,
  select,
  todayW,
  today,
  remove,
  login,
  save,
};
