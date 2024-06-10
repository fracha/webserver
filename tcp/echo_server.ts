import * as net from "net";

function newConn(socket: net.Socket): void {}

const server = net.createServer();
server.listen({ host: "127.0.0.1", port: 1234 });
