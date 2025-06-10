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
const fs = require("fs"); // For interacting with the file system
const http = require("http");
const path = require("path"); // For working with file and directory paths
const WebSocket = require("ws"); // Исправлено: используйте правильное имя переменной
const wss = new WebSocket.Server({ noServer: true });

const clients = new Set();

const server = http.createServer((req, res) => {
  // res.writeHead(200, { 'Content-Type': 'text/plain' });
  // res.end('WebSocket server is running\n');
  const parsedUrl = new URL(req.url, "https://worktime.glitch.me/");
  let pathName = parsedUrl.pathname;
  let ext = path.extname(pathName);

  if (pathName === "/") {
    ext = ".html";
    pathName = "/index.html";
  } else if (!ext) {
    ext = ".html";
    pathName += ext;
  }

  let filePath = path.join(process.cwd(), "/public", pathName);

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
});

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, onSocketConnect);
});

function onSocketConnect(ws) {
  clients.add(ws);
  ws.on("message", function (message) {
    console.log(message.toString('utf-8'));
    // Ограничение на 50 символов
    // message = message.slice(0, 50);
    for (let client of clients) {
      client.send(message);
    }
  });
  ws.on("close", function () {
    clients.delete(ws);
  });
}


server.listen(process.env.PORT, () => {
  console.log("Server is listening on port 3000");
});
