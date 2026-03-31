import * as net from "net";
import { parseResp } from "./parseResp";

const PORT = 6379;
const HOSTNAME = "127.0.0.1";

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    console.log(data);

    const tokens = parseResp(data);
    const command: string = tokens[0].toLowerCase();
    console.log(tokens[1]);

    if (command.startsWith("PING ")) {
      connection.write("+PONG\r\n");
      return;
    }
    if (command.startsWith("ECHO ")) {
      connection.write(`$${tokens[1].length}\r\n${tokens[1]}\r\n`);
      return;
    }
  });
});

server.listen(PORT, HOSTNAME);
