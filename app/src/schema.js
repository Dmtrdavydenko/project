const db = require("./sqlite");
// console.log(db);
function schema(db) {
  // return new Promise((resolve, reject) => {
  // return db.all(`SELECT sql FROM sqlite_schema WHERE name = 'interval'`, function (error, rows) {
  //   if (error) console.log(error.message);
  //   console.log(rows);
  // });
  // return
  db.all(
    `SELECT 
        *
      FROM 
        sqlite_schema
      WHERE
        type ='table'
      AND
        name NOT LIKE 'sqlite_%'`,
    function (error, rows) {
      if (error) console.log(error);
      console.log(rows);
      rows.forEach((obj) => {
        console.log(obj.name);
      });
      // console.log(rows);
      // rows.forEach((table) => {
      //   let schema = table.sql.match(/(\w+\s+)+\w+/g);
      //   let out = [];
      //   let value = [];
      //   for (let i = 1; i < schema.length; i++) {
      //     out.push(schema[i].match(/\w+/)[0]);
      //     value.push("?");
      //   }
      //   console.log(out.join(", "),"|", value.join(", "));
      // });
    }
  );
  // });
  return "schema";
}
console.log(schema(db));

function lsid(db) {
  return new Promise((resolve, reject) => {
    // return db.all("SELECT last_insert_rowid()", function (error, rows) {
    //   if (error) reject(error);
    //   resolve(rows);
    // });
    // SELECT id, old_column, other_column FROM users
    // (millisecond INTEGER, quantity INTEGER, time TEXT, date INTEGER, run INTEGER)
    // return db.all(`SELECT * FROM history WHERE date = 1742083200000 AND time = "День";`, function (error, rows) {
    // return db.all(`SELECT millisecond, quantity, run FROM diary ORDER BY date ASC`, function (error, rows) {
    //   if (error) reject(error);
    //   resolve(rows);
    // });
    // return db.all(
    //   `SELECT * FROM MyСhange`,
    //   function (error, rows) {
    //     if (error) reject(error);
    //     resolve(rows);
    //   }
    // );
    // return db.all(
    //   `SELECT * FROM diary_ref INNER JOIN MyChrono ON diary_ref.date = MyChrono.date_id`,
    //   function (error, rows) {
    //     if (error) reject(error);
    //     resolve(rows);
    //   }
    // );
  });
}

lsid(db).then((array) => {
  // console.log(array);
  array.forEach((item) => {
    //     console.log(item.millisecond);
    //     console.log(item.quantity);
    //     console.log(item.time);
    // console.log(item.date);
    //     console.log(item.run);
    //     // "INSERT INTO diary " + +"(millisecond, quantity, time, date, run) VALUES (?, ?, ?, ?, ?)"
    //     // "INSERT INTO " +
    //     // body.table.name +
    //     // " (meters, quantity, time, date) VALUES (?, ?, ?, ?)"
    //     dbTask.serialize(() => {
    //       dbTask.run(
    //         "INSERT OR IGNORE INTO MyChrono (millisecond, quantity, time, date, run) VALUES (?, ?, ?, ?, ?)",
    //         [item.millisecond, item.quantity, item.time, item.date, item.run],
    //         function (err) {
    //           if (err) {
    //             return console.error(err.message);
    //           }
    //           console.log(`Данные добавлены с ID: ${this.lastID}`);
    //         }
    //       );
    //     });
    // db.serialize(() => {
    //   db.run(
    //     "INSERT INTO MyChrono (date) VALUES (?)",
    //     [item.date],
    //     function (err) {
    //       if (err) {
    //         return console.error(err.message);
    //       }
    //       console.log(`Данные добавлены с ID: ${this.lastID}`);
    //     }
    //   );
    // });
    // db.serialize(() => {
    //   db.run(
    //     "INSERT INTO MyСhange (time) VALUES (?)",
    //     [item.time],
    //     function (err) {
    //       if (err) {
    //         return console.error(err.message);
    //       }
    //       console.log(`Данные добавлены с ID: ${this.lastID}`);
    //     }
    //   );
    // });
  });
});

function localcmd(db, dateNum) {
  return new Promise((resolve, reject) => {
    return db.serialize(() => {
      return db.get(
        "SELECT date_id,* " + 
        "FROM MyChronoTest " + 
        "WHERE date = ?",
        [dateNum],
        function (err, row) {
          if (err) {
            return console.error(err.message);
          }
          let date_id;
          if (row) {
            console.log(`ID item: ${row.date_id}`);
            date_id = row.date_id;
            resolve(date_id);
          } else {
            console.log("Вставить новую дату");
            db.run(
              "INSERT INTO MyChronoTest (date) VALUES (?)",
              [dateNum],
              function (err) {
                if (err) {
                  return console.error(err.message);
                }
                // Получаем ID последнего вставленного
                date_id = this.lastID;
                console.log(`New ID date_id: ${date_id}`);
                resolve(date_id);
                
                db.run("INSERT INTO MySaveTest (date_id) VALUES (?)",[date_id],function (err){
                  if(err){
                    return console.error(err.message);
                  }
                  let save_id = this.lastID;
                  
                });
              });
          }
        });
    });
    
    // 'CREATE TABLE diary_ref (\n' +
    //   '      millisecond INTEGER,\n' +
    //   '      quantity INTEGER,\n' +
    //   '      time TEXT,\n' +
    //   '      date INTEGER,\n' +
    //   '      run INTEGER, save_id INTEGER,\n' +
    //   '      FOREIGN KEY (date) REFERENCES MyChrono (date_id) ON DELETE CASCADE ON UPDATE CASCADE\n' +
    //   '      )'

    // db.run(`ALTER TABLE diary_ref ADD COLUMN save_id INTEGER`, (err) => {
    //       if (err) {
    //           return console.error('Error adding column:', err.message);
    //       }
    //       console.log('Column save_id added successfully.');
    // });
    // db.run(`UPDATE diary_ref SET save_id = date`, (err) => {
    //           if (err) {
    //               return console.error('Error updating column:', err.message);
    //           }
    //           console.log('Existing rows updated with default value for save_id.');
    // })
    //

    // db.run("INSERT INTO MyChronoTest (date) VALUES (?)", [1], function (err) {
    //   if (err) {
    //     return console.error(err.message);
    //   }
    //   console.log(`Данные добавлены с ID: ${this.lastID}`);
    // });
    // });
    //     return db.run(
    //       `UPDATE diary_clone
    // SET date = (SELECT date_id FROM MyChrono WHERE MyChrono.date = diary_clone.date);`,
    //       function (error) {
    //         if (error) resolve(error);
    //       }
    //     );
    //     return db.run(
    //       `INSERT INTO diary_ref (millisecond, quantity, time, date, run)
    // SELECT millisecond, quantity, time, date, run FROM diary_clone`,
    //       function (error) {
    //         if (error) resolve(error);
    //       }
    //     );

    // return db.run(
    //   `INSERT INTO MySaveTest (date_id)
    // SELECT date_id FROM MyChrono`,
    //   function (error) {
    //     if (error) resolve(error);
    //   }
    // );
    // return db.all(`SELECT rowid,* FROM MySaveTest;`, function (error, rows) {
    //   if (error) reject(error);
    //   resolve(rows);
    // });

    // return db.all(`SELECT date_id FROM MySaveTest`, function (error, rows) {
    //   if (error) reject(error);
    //   resolve(rows);
    // });
    // return db.all(`SELECT rowid,* FROM MyChrono;`, function (error, rows) {
    //   if (error) reject(error);
    //   resolve(rows);
    // });
    //     161 - 212
    // for(let i=161;i<212;i++){
    // db.run("DELETE FROM diary WHERE rowid = ?",
    //       [212],
    //       (err) => {
    //         if (err) {
    //           return reject(err);
    //         }
    //         // resolve(text.messageRemove);
    //       }
    //     );
    // }
    // return db.get("PRAGMA integrity_check;", (err, row) => {
    //   if (err) {
    //     reject("Integrity check failed:", err.message);
    //   } else {
    //     resolve("Integrity check result:", row);
    //   }
    // });
    // return db.run("DROP TABLE IF EXISTS MySaveTest", function (error) {
    //   if (error) resolve(error);
    // });
    // return db.run("SELECT * FROM diary", function (error) {
    //   if (error) resolve(error);
    // });
    // return db.all("SELECT * FROM MySaveTest", [], (err, rows) => {
    //   if (err) {
    //     reject("Ошибка при получении данных: " + err.message);
    //   } else {
    //     resolve(rows); // Возвращаем полученные данные
    //   }
    // });
    // "PRAGMA integrity_check",
    //            // `SELECT * FROM history WHERE date >= 1741651200000;`,
    //   //    `SELECT * FROM data
    // //WHERE DATE(write_date) = DATE('now', '+7 hours');`,
    //       // `ALTER TABLE users ADD COLUMN write_date DATE;`,
    //       // `ALTER TABLE users RENAME TO history;`,
    //       // `ALTER TABLE history ADD COLUMN run INTEGER;`,
    //   function (error) {
    //   if (error) resolve(error);
    // });
  });
}
localcmd(db, 9).then(console.log);
// console.log(localcmd());
