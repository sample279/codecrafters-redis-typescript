import * as net from "net";
import { parseResp } from "./parseResp";

const PORT = 6379;
const HOSTNAME = "127.0.0.1";

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    const tokens = parseResp(data);
    const command: string = tokens[0].toLowerCase();

    if (command.startsWith("PING ")) {
      connection.write("+PONG\r\n");
      return;
    }
    if (command.startsWith("ECHO ")) {
      console.log(tokens[1]);

      connection.write(`$${tokens[1].length}\r\n${tokens[1]}\r\n`);
      return;
    }
  });
});

server.listen(PORT, HOSTNAME);
