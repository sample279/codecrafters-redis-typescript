import * as net from "net";
import { parseResp } from "./parseResp";

const PORT = 6379;
const HOSTNAME = "127.0.0.1";
const store = new Map<string, string>();

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    const tokens = parseResp(data);

    if (tokens.length === 0) return;

    const command: string = tokens[0].toUpperCase();

    if (command === "PING") {
      connection.write("+PONG\r\n");
      return;
    }

    if (command === "ECHO") {
      connection.write(`$${tokens[1].length}\r\n${tokens[1]}\r\n`);
      return;
    }

    if (command === "SET") {
      const key: string = tokens[1];
      const value: string = tokens[2];
      const flag: string = tokens[3].toUpperCase();
      const timeOut: number = Number(tokens[4]);

      if (flag === "PX") {
        store.set(key, value);
        connection.write(`+OK\r\n`);
        setTimeout(() => store.delete(key), timeOut);
        return;
      }

      connection.write(`+OK\r\n`);
      return;
    }

    if (command === "GET") {
      const key: string = tokens[1];

      if (store.has(key)) {
        const value = store.get(key)!;
        connection.write(`$${value.length}\r\n${value}\r\n`);
        return;
      }
      connection.write(`$-1\r\n`);
      return;
    }

    connection.write(`-ERR unknown command\r\n`);
  });
});

server.listen(PORT, HOSTNAME);
