import { Socket } from "net";

const socket = new Socket();

socket.connect({ port: 6379 }, () => {
  console.log("connected to server");
});

export { socket };
