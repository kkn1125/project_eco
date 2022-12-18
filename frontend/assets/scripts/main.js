import axios from "axios";
import { v4 } from "uuid";
import * as protobuf from "protobufjs";

const { Message, Field } = protobuf;

Field.d(1, "string", "required")(Message.prototype, "uuid");
Field.d(2, "int32", "required")(Message.prototype, "server");
Field.d(3, "int32", "required")(Message.prototype, "channel");
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
  speed: 5,
};
const direction = {
  w: false,
  s: false,
  a: false,
  d: false,
};
let users = [];
let me = null;
const sockets = new Map();

/* socket settings */
// const socketHost = import.meta.env.VITE_SOCKET_HOST;
// const socketPort = import.meta.env.VITE_SOCKET_PORT;

function connectSocket(data) {
  const socket = new WebSocket(
    `ws://${
      data.socket.ip === "192.168.254.16" ? "localhost" : data.socket.ip
    }:${data.socket.port}/?csrftoken=${data.user.uuid}`
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
      const decoded = Message.decode(new Uint8Array(data));
      const json = decoded.toJSON();
      for (let i = 0; i < users.length / 2; i++) {
        const user1 = users[i];
        const user2 = users[users.length - 1 - i];
        if (user1.uuid === json.uuid) {
          user1.pox = json.pox;
          user1.poy = json.poy;
          user1.poz = json.poz;
          user1.roy = json.roy;
        }

        if (user1 !== user2) {
          if (user2.uuid === json.uuid) {
            user2.pox = json.pox;
            user2.poy = json.poy;
            user2.poz = json.poz;
            user2.roy = json.roy;
          }
        }
      }
    } else {
      try {
        const json = JSON.parse(data);
        if (json.type === "players") {
          users = json.players;
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

  sockets.set(userInfo.uuid, socket);
}

window.addEventListener("resize", (e) => {
  app.width = innerWidth;
  app.height = innerHeight;
});

function clearScene() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
}

function userRender(time) {
  for (let i = 0; i < users.length / 2; i++) {
    const user1 = users[i];
    const user2 = users[users.length - 1 - i];
    ctx.fillRect(user1.pox, user1.poy, game.size.user.x, game.size.user.y);
    ctx.fillText(user1.nickname, user1.pox + game.size.user.x / 2, user1.poy);
    if (user2 && user1 !== user2) {
      ctx.fillRect(user2.pox, user2.poy, game.size.user.x, game.size.user.y);
      ctx.fillText(user2.nickname, user2.pox + game.size.user.x / 2, user2.poy);
    }
    ctx.textAlign = "center";
  }
}

function moving() {
  for (let i = 0; i < users.length / 2; i++) {
    const user1 = users[i];
    const user2 = users[users.length - 1 - i];
    if (!user1) continue;
    if (!user2) continue;
    if (direction.w || direction.a || direction.s || direction.d) {
      if (user1.uuid === me) {
        if (direction.w) {
          user1.poy -= game.speed;
        }
        if (direction.s) {
          user1.poy += game.speed;
        }
        if (direction.a) {
          user1.pox -= game.speed;
        }
        if (direction.d) {
          user1.pox += game.speed;
        }
        sockets.get(userInfo.uuid).send(
          Message.encode(
            new Message({
              uuid: userInfo.uuid,
              server: user1.server_id,
              channel: user1.channel_id,
              pox: user1.pox,
              poy: user1.poy,
              poz: user1.poz,
              roy: user1.roy,
            })
          ).finish()
        );
        break;
      }
      if (user1 !== user2) {
        if (user2.uuid === me) {
          if (direction.w) {
            user2.poy -= game.speed;
          }
          if (direction.s) {
            user2.poy += game.speed;
          }
          if (direction.a) {
            user2.pox -= game.speed;
          }
          if (direction.d) {
            user2.pox += game.speed;
          }
          sockets.get(userInfo.uuid).send(
            Message.encode(
              new Message({
                uuid: userInfo.uuid,
                server: user2.server_id,
                channel: user2.channel_id,
                pox: user2.pox,
                poy: user2.poy,
                poz: user2.poz,
                roy: user2.roy,
              })
            ).finish()
          );
          break;
        }
      }
    }
  }
}

function update(time) {
  userRender(time);
}

function render(time) {
  time += 0.001;

  clearScene();
  moving(time);
  update(time);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

function loginWindow() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <form class="login-window">
      <input type="text" id="nickname" autocomplete="username" />
      <input type="password" id="password" autocomplete="current-password" />
      <button type="button" id="login">login</button>
    </form>
  `
  );
}

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

  loginWindow();
});

window.addEventListener("keydown", (e) => {
  if (!e.key) return;
  const key = e.key.toLowerCase();
  if (key === "w" || key === "a" || key === "s" || key === "d") {
    direction[key] = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (!e.key) return;
  const key = e.key.toLowerCase();
  if (key === "w" || key === "a" || key === "s" || key === "d") {
    direction[key] = false;
  }
});

window.addEventListener("click", (e) => {
  const target = e.target;
  if (target.id !== "login") return;

  const nickname = document.querySelector("#nickname").value.trim();
  const password = document.querySelector("#password").value.trim();

  if (nickname && password) {
    sockets.get(userInfo.uuid).send(
      JSON.stringify({
        type: "login",
        uuid: userInfo.uuid,
        nickname: nickname,
        password: password,
      })
    );
    document.querySelector(".login-window")?.remove();
  }
});
