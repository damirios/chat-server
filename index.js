import http from "http";
import { Server } from "socket.io";

import { registerMessageHandlers } from "./handlers/messageHandlers.js";
import { registerUserHandlers } from "./handlers/userHandlers.js";

// создаём http сервер
const server = http.createServer();

// подключаем к серверу socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const log = console.log;

// данная функция выполняется при подключении каждого сокета (обычно, один клиент = один сокет)
const onConnection = (socket) => {
  // выводим сообщение о подключении пользователя
  log("User connected");

  // получаем название комнаты из строки запроса "рукопожатия"
  const { roomId } = socket.handshake.query;
  // сохраняем название комнаты в соответствующем свойстве сокета
  socket.roomId = roomId;

  // присоединяемся к комнате (входим в нее)
  socket.join(roomId);

  // регистрируем обработчики
  // обратите внимание на передаваемые аргументы
  registerMessageHandlers(io, socket);
  registerUserHandlers(io, socket);

  // обрабатываем отключение сокета-пользователя
  socket.on("disconnect", () => {
    // выводим сообщение
    log("User disconnected");
    // покидаем комнату
    socket.leave(roomId);
  });
};

// обрабатываем подключение
io.on("connection", onConnection);

// запускаем сервер
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server ready. Port: ${PORT}`);
});
