// const net = require('net');

// const SMTP_SERVER = 'smtp.example.com'; // Замените на ваш SMTP-сервер
// const SMTP_PORT = 587; // Обычно 587 для TLS
// const USERNAME = 'your_email@example.com'; // Ваш email
// const PASSWORD = 'your_email_password'; // Ваш пароль
// const FROM = 'your_email@example.com'; // От кого
// const TO = 'recipient@example.com'; // Кому
// const SUBJECT = 'Тестовое сообщение'; // Тема
// const BODY = 'Это тестовое сообщение от Node.js без библиотек!'; // Текст сообщения

// const client = net.createConnection(SMTP_PORT, SMTP_SERVER, () => {
//     console.log('Подключение к SMTP-серверу...');
// });

// client.on('data', (data) => {
//     console.log(data.toString());
// });

// client.on('error', (error) => {
//     console.error('Ошибка:', error);
// });

// client.on('connect', () => {
//     client.write(`EHLO ${SMTP_SERVER}\r\n`);
// });

// client.on('data', (data) => {
//     const response = data.toString();
//     console.log(response);

//     if (response.startsWith('250')) {
//         // Аутентификация
//         client.write(`AUTH LOGIN\r\n`);
//     } else if (response.startsWith('334')) {
//         // Отправка имени пользователя
//         client.write(Buffer.from(USERNAME).toString('base64') + '\r\n');
//     } else if (response.startsWith('334')) {
//         // Отправка пароля
//         client.write(Buffer.from(PASSWORD).toString('base64') + '\r\n');
//     } else if (response.startsWith('235')) {
//         // Начало отправки письма
//         client.write(`MAIL FROM:<${FROM}>\r\n`);
//     } else if (response.startsWith('250')) {
//         client.write(`RCPT TO:<${TO}>\r\n`);
//     } else if (response.startsWith('250')) {
//         client.write(`DATA\r\n`);
//     } else if (response.startsWith('354')) {
//         // Отправка данных письма
//         client.write(`Subject: ${SUBJECT}\r\n`);
//         client.write(`\r\n`);
//         client.write(`${BODY}\r\n`);
//         client.write(`.\r\n`);
//     } else if (response.startsWith('250')) {
//         // Закрытие соединения
//         client.write(`QUIT\r\n`);
//     }
// });

// client.on('end', () => {
//     console.log('Соединение закрыто.');
// });