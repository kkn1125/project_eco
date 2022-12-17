import axios from "axios";
import { v4 } from "uuid";
import protobuf from "protobufjs";

const { Message, Field } = protobuf;

Field.d(1, "string", "required")(Message.prototype, "uuid");
Field.d(2, "fixed32", "required")(Message.prototype, "server");
Field.d(3, "fixed32", "required")(Message.prototype, "channel");
Field.d(4, "float", "required")(Message.prototype, "pox");
Field.d(5, "float", "required")(Message.prototype, "poy");
Field.d(6, "float", "required")(Message.prototype, "poz");
Field.d(7, "float", "required")(Message.prototype, "roy");

const userInfo = {
  uuid: v4(),
  locale: navigator.language,
};
/* game settings */
const app = document.querySelector("#app");
const ctx = app.getContext("2d");
app.width = innerWidth;
app.height = innerHeight;

const game = {
  size: {
    user: {
      x: 30,
      y: 30,
    },
  },
};
const direction = {
  w: false,
  s: false,
  a: false,
  d: false,
};
let users = [];
let me = null;

/* socket settings */
// const socketHost = import.meta.env.VITE_SOCKET_HOST;
// const socketPort = import.meta.env.VITE_SOCKET_PORT;

function connectSocket(data) {
  const socket = new WebSocket(
    `ws://${"172.18.237.200" || data.socket.ip}:${
      data.socket.port
    }/?csrftoken=${data.user.uuid}`
  );
  socket.binaryType = "arraybuffer";
  socket.onopen = function (e) {
    console.log("소켓 오픈");
    me = data.user.uuid;
    socket.send(
      JSON.stringify({
        type: "attach",
        server: data.server.pk,
        channel: data.channel.pk,
        locale: data.user.locale,
        socket: {
          ip: data.socket.ip,
          port: data.socket.port,
        },
      })
    );
  };
  socket.onmessage = function (message) {
    const { data } = message;
    if (data instanceof ArrayBuffer) {
      const json = Message.decode(new Uint8Array(message)).toJson();
    } else {
      try {
        const json = JSON.parse(data);
        if (json.type === "players") {
          users = json.players;
        } else {
        }
      } catch (e) {}
    }
  };
  socket.onerror = function (e) {
    console.log("소켓 에러");
    throw e.message;
  };
  socket.onclose = function (e) {
    console.log("소켓 닫힘");
  };
}

window.addEventListener("resize", (e) => {
  app.width = innerWidth;
  app.height = innerHeight;
});

function clearScene() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
}

function update() {
  const userList = Array.from(users.values());
  for (let i = 0; i < userList.length / 2; i++) {
    const user1 = userList[i];
    const user2 = userList[userList.length - 1 + i];
    ctx.fillRect(user1.pox, user1.poy, game.size.user.x, game.size.user.y);
    ctx.fillText(user1.nickname, user1.pox + game.size.user.x / 2, user1.poy);
    if (user2 && user1 !== user2) {
      ctx.fillRect(user2.pox, user2.poy, game.size.user.x, game.size.user.y);
      ctx.fillText(user2.nickname, user2.pox + game.size.user.x / 2, user2.poy);
    }
    ctx.textAlign = "center";
  }
}

function render(time) {
  time += 0.001;

  clearScene();
  update(time);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

window.addEventListener("load", () => {
  /* axios connection area */
  axios
    .post(`/v1/query/enter`, {
      uuid: userInfo.uuid,
      locale: userInfo.locale,
      pox: app.width / 2 - game.size.user.x / 2,
      poy: app.height / 2 - game.size.user.y / 2,
      roy: (Math.PI / 180) * 90,
    })
    .then((result) => {
      const { data } = result;
      connectSocket(data);
    });
});
