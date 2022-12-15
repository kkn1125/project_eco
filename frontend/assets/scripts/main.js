import axios from "axios";
import { v4 } from "uuid";
import { convertLangToRegion } from "../../src/utils/tools";

/* axios connection area */
axios.post(`/v1/query/enter`, {
  uuid: v4(),
  locale: convertLangToRegion(navigator.language),
});

/* socket settings */
const socketHost = import.meta.env.VITE_SOCKET_HOST;
const socketPort = import.meta.env.VITE_SOCKET_PORT;

function connectSocket() {
  const socket = new WebSocket(`ws://${socketHost}:${socketPort}`);
  socket.binaryType = "arraybuffer";
  socket.onopen = function (e) {
    console.log("소켓 오픈");
  };
  socket.onmessage = function (message) {
    console.log(message);
  };
  socket.onerror = function (e) {
    console.log("소켓 에러");
    throw e.message;
  };
  socket.onclose = function (e) {
    console.log("소켓 닫힘");
  };
}

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
const users = new Map();
let me = null;

window.addEventListener("resize", (e) => {
  app.width = innerWidth;
  app.height = innerHeight;
});

users.set(0, {
  nickname: "kimson",
  pox: innerWidth / 2,
  poy: innerHeight / 2,
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
