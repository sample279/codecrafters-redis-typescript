import * as net from "net";
import { parseResp } from "./parseResp";

const PORT = 6379;
const HOSTNAME = "127.0.0.1";

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    parseResp(data);
    connection.write("+PONG\r\n");
  });
});

server.listen(PORT, HOSTNAME);
