/**
 * Module handles database management
 *
 * Server API calls the methods in here to query and update the SQLite database
 */

// Utilities we need
const fs = require("fs");

// Initialize the database
// const dataBaseFile = "./.data/list.db";
const dataBaseFileTask = "./.data/task.db";
// const exists = fs.existsSync(dataBaseFile);
// const sqlite3 = require("sqlite3").verbose();
// const dbWrapper = require("sqlite");
// let db;

/* 
We're using the sqlite wrapper so that we can make async / await connections
- https://www.npmjs.com/package/sqlite
*/
const sqlite3 = require("sqlite3").verbose();
const sqlite3Task = require("sqlite3").verbose();
// Create a new SQLite database or open an existing one
// const path = require('path');
// path.join(__dirname, 'mydatabase.db')
const db = new sqlite3Task.Database(dataBaseFileTask, (err) => {
  fs.readdir("./.data/", (err, files) => {
    files.forEach((file) => {
      console.log("f", file);

      // fs.unlink("./data/" + "list.db", function (err) {
      //   if (err) return console.log(err);
      //   // console.log(`"list.db" deleted successfully ${"list.db"}`);
      // });
    });
  });
  if (err) {
    console.error("Could not connect to database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    // Create a table if it doesn't exist
    // diary

    //
    
        
    db.run("PRAGMA foreign_keys = ON", (err) => {
        if (err) {
            console.error('Ошибка при включении внешних ключей:', err.message);
        } else {
            console.log('Поддержка внешних ключей включена.');
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS MyСhange (
    time_id INTEGER PRIMARY KEY AUTOINCREMENT,
    time TEXT UNIQUE)`,
      (err) => {
        if (err) {
          console.error("Could not create table:", err.message);
        } else {
          console.log("Users table created or already exists.");
        }
      }
    );
    db.run(`CREATE TABLE IF NOT EXISTS MyChrono (
      date_id INTEGER PRIMARY KEY AUTOINCREMENT,
      date INTEGER UNIQUE)`,
      (err) => {
        if (err) {
          console.error("Could not create table:", err.message);
        } else {
          console.log("Users table created or already exists.");
        }
      }
    );
        


    // run INTEGER,
    db.run(
      `CREATE TABLE IF NOT EXISTS diary (millisecond INTEGER, quantity INTEGER, time TEXT, date INTEGER, run INTEGER)`,
      (err) => {
        if (err) {
          console.error("Could not create table:", err.message);
        } else {
          console.log("Users table created or already exists.");
        }
      }
    );
        
    db.run(
      `CREATE TABLE IF NOT EXISTS diary_clone (
      millisecond INTEGER,
      quantity INTEGER,
      time TEXT,
      date INTEGER,
      run INTEGER)`,
      (err) => {
        if (err) {
          console.error("Could not create table:", err.message);
        } else {
          console.log("Users table created or already exists.");
        }
      }
    );
        
    db.run(
      `CREATE TABLE IF NOT EXISTS diary_ref (
      millisecond INTEGER,
      quantity INTEGER,
      time TEXT,
      run INTEGER,
      date INTEGER,
      FOREIGN KEY (date) REFERENCES MyChrono (date_id) ON DELETE CASCADE ON UPDATE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error("Could not create table:", err.message);
        } else {
          console.log("Users table created or already exists.");
        }
      }
    );
       
        
    db.run(`CREATE TABLE IF NOT EXISTS MyChronoTest (
      date_id INTEGER PRIMARY KEY AUTOINCREMENT,
      date INTEGER UNIQUE)`,
      (err) => {
        if (err) {
          console.error("Could not create table:", err.message);
        } else {
          console.log("Users table created or already exists.");
        }
      }
    );
      
    db.run(`CREATE TABLE IF NOT EXISTS MySaveTest (
      save_id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_id INTEGER)`,
      (err) => {
        if (err) {
          console.error("Could not create table:", err.message);
        } else {
          console.log("Users table created or already exists.");
        }
      }
    );
    

    
    
//     Circular Looms
//     thread
    
    

    
    //     db.run(`CREATE TABLE IF NOT EXISTS thread (
    // name TEXT,
    // density INTEGER,
    // speed INTEGER)`,
        //   (err) => {
        // if (err) {
        //   console.error("Could not create table:", err.message);
        // } else {
        //   console.log("Users table created or already exists.");
        // }
      // }
    // );
    
    
    
//     db.run(`CREATE TABLE IF NOT EXISTS cloth (
    // width INTEGER,
    // density INTEGER,
    // base_type_id INTEGER,
    // shuttle_type_id INTEGER)`,
        //   (err) => {
        // if (err) {
        //   console.error("Could not create table:", err.message);
        // } else {
        //   console.log("Users table created or already exists.");
        // }
      // }
    // );
    
    
    
    
//     db.run(
//       `CREATE TABLE IF NOT EXISTS task (
//       task_id INTEGER PRIMARY KEY AUTOINCREMENT,
//       millisecond INTEGER NOT NULL,
//       quantity INTEGER NOT NULL,
//       name TEXT NOT NULL,
//       time TEXT NOT NULL,
//       machine INTEGER,
      
      
      
//       save INTEGER,
//       FOREIGN KEY (save) REFERENCES MySaveTest (save_id) ON DELETE CASCADE ON UPDATE CASCADE
//       date INTEGER,
//       FOREIGN KEY (date) REFERENCES MyChronoTest (date_id) ON DELETE CASCADE ON UPDATE CASCADE
//       )`,
//       (err) => {
//         if (err) {
//           console.error("Could not create table:", err.message);
//         } else {
//           console.log("Users table created or already exists.");
//         }
//       }
//     );
  }
});
// const dbTask = new sqlite3.Database(dataBaseFile, (err) => {
//   fs.readdir("./.data/", (err, files) => {
//     files.forEach((file) => {
//       console.log(file);

//       // fs.unlink("./.data/" + file, function (err) {
//       //   if (err) return console.log(err);
//       //   console.log(`file deleted successfully ${file}`);
//       // });

//     });
//   });
//     if (err) {
//         console.error('Could not connect to database:', err.message);
//     } else {
//         console.log('Connected to the SQLite database.');
//         // Create a table if it doesn't exist
//       // diary

//       // run INTEGER,
//       dbTask.run(`CREATE TABLE IF NOT EXISTS diary (millisecond INTEGER, quantity INTEGER, time TEXT, date INTEGER, run INTEGER)`, (err) => {
//             if (err) {
//                 console.error('Could not create table:', err.message);
//             } else {
//                 console.log('Users table created or already exists.');
//             }
//         });

//       dbTask.run(`CREATE TABLE IF NOT EXISTS history (meters INTEGER, quantity INTEGER, time TEXT, date INTEGER)`, (err) => {
//             if (err) {
//                 console.error('Could not create table:', err.message);
//             } else {
//                 console.log('Users table created or already exists.');
//             }
//         });
//       dbTask.run(`CREATE TABLE IF NOT EXISTS datetime (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, group_id INTEGER,
//       FOREIGN KEY (group_id)
//     REFERENCES supplier_groups (group_id)
//        ON UPDATE CASCADE
//        ON DELETE CASCADE)`),(err)=>{
//         if (err) {
//           console.error('Could not create table:', err.message);
//         } else {
//           console.log('Users table created or already exists.');
//         }
//       }

//       dbTask.run(`CREATE TABLE IF NOT EXISTS task (
//       millisecond INTEGER,
//       quantity INTEGER,
//       time TEXT,
//       date INTEGER,
//       run INTEGER,
//       group_id integer PRIMARY KEY,
//       FOREIGN KEY (group_id)
// REFERENCES supplier_groups (group_id)
//        ON UPDATE CASCADE
//        ON DELETE CASCADE)`),(err)=>{
//         if (err) {
//           console.error('Could not create table:', err.message);
//         } else {
//           console.log('Users table created or already exists.');
//         }
//       }
//     }
// });

// dbWrapper
//   .open({
//     filename: dbFile,
//     driver: sqlite3.Database
//   })
//   .then(async dBase => {
//     db = dBase;

//     // We use try and catch blocks throughout to handle any database errors
//     try {
//       // The async / await syntax lets us write the db operations in a way that won't block the app
//       if (!exists) {
//         // Database doesn't exist yet - create Choices and Log tables
//         await db.run(
//           "CREATE TABLE Choices (id INTEGER PRIMARY KEY AUTOINCREMENT, language TEXT, picks INTEGER)"
//         );

//         // Add default choices to table
//         await db.run(
//           "INSERT INTO Choices (language, picks) VALUES ('HTML', 0), ('JavaScript', 0), ('CSS', 0)"
//         );

//         // Log can start empty - we'll insert a new record whenever the user chooses a poll option
//         await db.run(
//           "CREATE TABLE Log (id INTEGER PRIMARY KEY AUTOINCREMENT, choice TEXT, time STRING)"
//         );
//       } else {
//         // We have a database already - write Choices records to log for info
//         console.log(await db.all("SELECT * from Choices"));

//         //If you need to remove a table from the database use this syntax
//         //db.run("DROP TABLE Logs"); //will fail if the table doesn't exist
//       }
//     } catch (dbError) {
//       console.error(dbError);
//     }
//   });

// Our server script will call these methods to connect to the db
module.exports = db;

// // Create an HTTP server
// const server = http.createServer((req, res) => {
//     if (req.method === 'GET' && req.url === '/') {
//         res.writeHead(200, { 'Content-Type': 'text/plain' });
//         res.end('Welcome to the SQLite Node.js server!\n');
//     } else {
//         res.writeHead(404, { 'Content-Type': 'text/plain' });
//         res.end('404 Not Found\n');
//     }
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

// Close the database connection on process exit
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Could not close the database connection:", err.message);
    } else {
      console.log("Database connection closed.");
    }
    process.exit(0);
  });
});

// const sqlite3 = require('sqlite3').verbose();
// const db = new sqlite3.Database('your_database.db');

// // Использование serialize для последовательного выполнения запросов
// db.serialize(() => {
//     // Создание таблицы
//     db.run(`CREATE TABLE IF NOT EXISTS records (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         meters TEXT,
//         quantity INTEGER,
//         time TEXT,
//         data INTEGER
//     )`);

//     // Подготовка SQL-запроса
//     const stmt = db.prepare("INSERT INTO records (meters, quantity, time, data) VALUES (?, ?, ?, ?)");

//     // Вставка данных
//     const data = [
//         { meters: '2100000', quantity: 4, time: 'День', data: 1741219200000 },
//         { meters: '2400000', quantity: 2, time: 'День', data: 1741219200000 }
//     ];

//     data.forEach(item => {
//         stmt.run(item.meters, item.quantity, item.time, item.data);
//     });

//     // Завершение подготовки запроса
//     stmt.finalize();
// });

// // Закрытие базы данных
// db.close();
