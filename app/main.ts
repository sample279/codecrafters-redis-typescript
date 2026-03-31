import { Server, createServer, Socket } from "net";
import { socket } from "./socket";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server: Server = createServer((socket: Socket) => {
  socket.write("+PONG\r\n");
});

server.listen(6379, "127.0.0.1");
