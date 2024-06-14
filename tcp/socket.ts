import * as net from "net";

export type TCPConn = {
  socket: net.Socket;
  err: null | Error;
  ended: boolean;
  // the callbacks of the promise of the current read
  reader: null | {
    resolve: (value: Buffer) => void;
    reject: (error: Error) => void;
  };
};

export function soInit(socket: net.Socket): TCPConn {
  const conn: TCPConn = {
    socket: socket,
    ended: false,
    reader: null,
    err: null,
  };
  socket.on("data", (data: Buffer) => {
    console.assert(conn.reader);
    conn.socket.pause();
    conn.reader!.resolve(data);
    conn.reader = null;
  });
  socket.on("end", () => {
    conn.ended = true;
    if (conn.reader) {
      conn.reader.resolve(Buffer.from(""));
      conn.reader = null;
    }
  });
  socket.on("error", (err: Error) => {
    conn.err = err;
    if (conn.reader) {
      conn.reader.reject(err);
      conn.reader = null;
    }
  });
  return conn;
}

export function soRead(conn: TCPConn): Promise<Buffer> {
  console.assert(!conn.reader);
  return new Promise((resolve, reject) => {
    if (conn.err) {
      reject(conn.err);
      return;
    }
    if (conn.ended) {
      resolve(Buffer.from(""));
      return;
    }
    conn.reader = { resolve, reject };
    conn.socket.resume();
  });
}

export function soWrite(conn: TCPConn, data: Buffer): Promise<void> {
  console.assert(data.length > 0);
  return new Promise((resolve, reject) => {
    if (conn.err) {
      reject(conn.err);
      return;
    }
    conn.socket.write(data, (err?: Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


/* I don' think it is possible to implement
 * with net. here are the reasons:
 *  cannot create listening socket
 *  don't have access to connection queue
export type TCPListener = {
  socket: net.Socket;
  host: string;
  port: number;
};

export function soListen({
  host,
  port,
}: {
  host: string;
  port: number;
}): TCPListener {
  const listener: TCPListener = {
    socket,
    host,
    port,
  };

  return listener;
}
*/
