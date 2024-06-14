import * as net from "net";

import { soInit, soRead, soWrite } from "./socket";
import type { TCPConn } from "./socket";

async function newConn(socket: net.Socket): Promise<void> {
  console.log("new connection", socket.remoteAddress, socket.remotePort);
  try {
    await serveClient(socket);
  } catch (exc) {
    console.error("exception:", exc);
  } finally {
    socket.destroy();
  }
}

async function serveClient(socket: net.Socket): Promise<void> {
  const conn: TCPConn = soInit(socket);
  while (true) {
    const data = await soRead(conn);
    if (data.length === 0) {
      console.log("end connection");
      break;
    }
    console.log("data", data);
    await soWrite(conn, data);
  }
}

console.log("Make Server");
const server = net.createServer({ pauseOnConnect: true });

server.on("error", (err: Error) => {
  throw err;
});
server.on("connection", newConn);

server.listen({ host: "127.0.0.1", port: 1234 });
