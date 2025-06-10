const socket = new WebSocket("wss://worktime.glitch.me");

socket.addEventListener("open", () => {
  console.log("Connected to the WebSocket server.");
  socket.send("Hello, server!"); // Отправляем сообщение при открытии соединения
});

socket.addEventListener("message", (event) => {
  const message = event.data;
  console.log("Message from server:", message);
});


// socket.addEventListener("message", async (event) => {
//   const blob = event.data; // Получаем Blob
//   if (blob instanceof Blob) {
//     try {
//       const arrayBuffer = await blob.arrayBuffer(); // Преобразуем Blob в ArrayBuffer
//       const decoder = new TextDecoder("utf-8"); // Указываем кодировку
//       const messageString = decoder.decode(arrayBuffer); // Декодируем
//       console.log("Message from server:", messageString);
//     } catch (error) {
//       console.error("Error reading Blob:", error);
//     }
//   } else {
//     console.warn("Received non-Blob data:", blob);
//   }
// });

// socket.addEventListener("message", (event) => {
//   const blob = event.data; // Получаем Blob
//   if (blob instanceof Blob) {
//     const reader = new FileReader();

//     // Когда чтение завершено, выводим строку
//     reader.onload = () => {
//       const messageString = reader.result; // Получаем строку
//       console.log("Message from server:", messageString);
//     };

//     // Читаем Blob как текст
//     reader.readAsText(blob);
//   } else {
//     console.warn("Received non-Blob data:", blob);
//   }
// });

// Обработка ошибок
socket.addEventListener("error", (error) => {
  console.error("WebSocket error:", error);
});

// Обработка закрытия соединения
socket.addEventListener("close", () => {
  console.log("Disconnected from the WebSocket server.");
});