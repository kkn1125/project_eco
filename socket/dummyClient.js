import axios from "axios";
import { v4 } from "uuid";
import protobuf from "protobufjs";
import WebSocket from "ws";

const game = {
  size: {
    user: {
      x: 30,
      y: 30,
    },
  },
  speed: 5,
};
const { Message, Field } = protobuf;
let me = null;

Field.d(1, "string", "required")(Message.prototype, "uuid");
Field.d(2, "int32", "required")(Message.prototype, "server");
Field.d(3, "int32", "required")(Message.prototype, "channel");
Field.d(4, "float", "required")(Message.prototype, "pox");
Field.d(5, "float", "required")(Message.prototype, "poy");
Field.d(6, "float", "required")(Message.prototype, "poz");
Field.d(7, "float", "required")(Message.prototype, "roy");

const amount = 5;
const start = 0;
const end = amount - start;
const users = new Map();

for (let i = start; i < end; i++) {
  const uuid = v4();
  users.set(uuid, {
    uuid: uuid,
    locale: "ko-kr",
  });
}

function connectSocket(socketInfo) {
  const socket = new WebSocket(
    `ws://${
      socketInfo.socket.ip === "192.168.254.16"
        ? "localhost"
        : socketInfo.socket.ip
    }:${socketInfo.socket.port}/?csrftoken=${socketInfo.user.uuid}`
  );
  socket.binaryType = "arraybuffer";
  socket.onopen = function (e) {
    console.log("소켓 오픈");
    me = socketInfo.user.uuid;
    socket.send(
      JSON.stringify({
        type: "attach",
        server: socketInfo.server.pk,
        channel: socketInfo.channel.pk,
        locale: socketInfo.user.locale,
        socket: {
          ip: socketInfo.socket.ip,
          port: socketInfo.socket.port,
        },
      })
    );
    setTimeout(() => {
      socket.send(
        JSON.stringify({
          type: "login",
          uuid: socketInfo.user.uuid,
          nickname: "guest-" + socketInfo.user.uuid.slice(0, 10),
          password: "1234",
        })
      );
      setTimeout(() => {
        setInterval(() => {
          socket.send(
            Message.encode(
              new Message({
                uuid: socketInfo.user.uuid,
                server: socketInfo.server.pk,
                channel: socketInfo.channel.pk,
                pox: Math.random() * 500 - 100 + 100,
                poy: Math.random() * 500 - 100 + 100,
                poz: 0,
                roy: (Math.PI / 180) * 90,
              })
            ).finish()
          );
        }, 16);
      }, 2000);
    }, 2000);
  };
  socket.onmessage = function (message) {
    const { data } = message;
    // if (data instanceof ArrayBuffer) {
    //   const decoded = Message.decode(new Uint8Array(data));
    //   const json = decoded.toJSON();
    //   for (let i = 0; i < users.length / 2; i++) {
    //     const user1 = users[i];
    //     const user2 = users[users.length - 1 - i];
    //     if (user1.uuid === json.uuid) {
    //       user1.pox = json.pox;
    //       user1.poy = json.poy;
    //       user1.poz = json.poz;
    //       user1.roy = json.roy;
    //     }

    //     if (user1 !== user2) {
    //       if (user2.uuid === json.uuid) {
    //         user2.pox = json.pox;
    //         user2.poy = json.poy;
    //         user2.poz = json.poz;
    //         user2.roy = json.roy;
    //       }
    //     }
    //   }
    // } else {
    //   try {
    //     const json = JSON.parse(data);
    //     if (json.type === "players") {
    //       users = json.players;
    //     }
    //   } catch (e) {}
    // }
  };
  socket.onerror = function (e) {
    console.log("소켓 에러");
    throw e.message;
  };
  socket.onclose = function (e) {
    console.log("소켓 닫힘");
  };

  users.set(
    socketInfo.user.uuid,
    Object.assign(users.get(socketInfo.user.uuid), { socket: socket })
  );
}

// window.addEventListener("load", () => {
for (let user of users.values()) {
  axios
    .post(`http://localhost:3000/v1/query/enter`, {
      uuid: user.uuid,
      locale: user.locale,
      pox: 500 / 2 - game.size.user.x / 2,
      poy: 500 / 2 - game.size.user.y / 2,
      roy: (Math.PI / 180) * 90,
    })
    .then((result) => {
      const { data } = result;
      connectSocket(data);
    });
}
// });
