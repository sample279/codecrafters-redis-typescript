import * as net from "net";
import { parseResp } from "./parseResp";
import { handlers } from "./handlers";

const PORT = 6379;
const HOSTNAME = "127.0.0.1";

const server: net.Server = net.createServer((connection: net.Socket) => {
  connection.on("data", (data: Buffer) => {
    const tokens = parseResp(data);
    if (tokens.length === 0) return;

    const command: string = tokens[0].toUpperCase();
    const handler = handlers[command];
    connection.write(
      handler ? handler(tokens.slice(1)) : "-ERR unknown command\r\n",
    );
  });
});

server.listen(PORT, HOSTNAME);
