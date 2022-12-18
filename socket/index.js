import dotenv from "dotenv";
import path from "path";
import uWs from "uWebSockets.js";
import axios from "axios";
import protobuf from "protobufjs";
import Queue from "./src/models/Queue.js";
import zmq from "zeromq";

const __dirname = path.resolve();
const mode = process.env.NODE_ENV;
dotenv.config({
  path: path.join(__dirname, `.env`),
});
dotenv.config({
  path: path.join(__dirname, `.env.${mode}`),
});

// const locationQueue = new Queue();

const { Message, Field } = protobuf;
const port = Number(process.env.PORT) || 4000;
const apiHost = process.env.API_HOST;
const apiPort = process.env.API_PORT;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const relay = {};
const sockets = new Map();

/* zeromq */
const serverHost = process.env.RELAY_SOCKET_SERVER_HOST;
const serverPort = process.env.RELAY_SOCKET_SERVER_PORT;
const clientHost = process.env.RELAY_SOCKET_CLIENT_HOST;
const clientPort = process.env.RELAY_SOCKET_CLIENT_PORT;

Field.d(1, "string", "required")(Message.prototype, "uuid");
Field.d(2, "int32", "required")(Message.prototype, "server");
Field.d(3, "int32", "required")(Message.prototype, "channel");
Field.d(4, "float", "required")(Message.prototype, "pox");
Field.d(5, "float", "required")(Message.prototype, "poy");
Field.d(6, "float", "required")(Message.prototype, "poz");
Field.d(7, "float", "required")(Message.prototype, "roy");

/* zeromq */

const app = uWs
  ./*SSL*/ App(/* {
    key_file_name: "misc/key.pem",
    cert_file_name: "misc/cert.pem",
    passphrase: "1234",
  } */)
  .ws("/*", {
    /* Options */
    compression: uWs.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 32,
    /* Handlers */
    upgrade: (res, req, context) => {
      /* This immediately calls open handler, you must not use res after this call */
      res.upgrade(
        {
          url: req.getUrl(),
          token: req.getQuery("csrftoken"),
        },
        /* Spell these correctly */
        req.getHeader("sec-websocket-key"),
        req.getHeader("sec-websocket-protocol"),
        req.getHeader("sec-websocket-extensions"),
        context
      );
    },
    open: (ws) => {
      sockets.set(
        ws,
        Object.assign(sockets.get(ws) || {}, {
          uuid: ws.token,
        })
      );
      console.log("A WebSocket connected with URL: " + ws.url);
    },
    message: (ws, message, isBinary) => {
      /* Ok is false if backpressure was built up, wait for drain */
      if (isBinary) {
        const data = Message.decode(new Uint8Array(message)).toJSON();
        axios
          .post(`http://${apiHost}:${apiPort}/v1/query/type/location`, data)
          .then(async () => {
            await relay.push.send(JSON.stringify(data));
          });
        // app.publish(`${data.server}-${data.channel}`, message, isBinary, true);
        // locationQueue.enter(message);
      } else {
        const strings = decoder.decode(message);
        const json = JSON.parse(strings);
        if (json.type === "attach") {
          sockets.set(
            ws,
            Object.assign(sockets.get(ws), {
              server: json.server,
              channel: json.channel,
              socket: json.socket,
              locale: json.locale,
            })
          );
          ws.subscribe("broadcast");
          ws.subscribe(`${json.server}-${json.channel}`);
          ws.subscribe(ws.token);
          // console.log(`http://${apiHost}:${apiPort}/v1/query/list/players`);
          axios
            .post(`http://${apiHost}:${apiPort}/v1/query/list/players`, {
              server: json.server,
              channel: json.channel,
            })
            .then(async (result) => {
              const { data } = result;
              const { players } = data;
              console.log(players);
              // app.publish(
              //   `${json.server}-${json.channel}`,
              //   JSON.stringify({
              //     type: "players",
              //     players: players,
              //   })
              // );
              await relay.push.send(
                JSON.stringify({
                  type: "players",
                  server: json.server,
                  channel: json.channel,
                  players: players,
                })
              );
            });
        } else if (json.type === "login") {
          axios
            .post(`http://${apiHost}:${apiPort}/v1/query/login`, {
              uuid: sockets.get(ws).uuid,
              server: sockets.get(ws).server,
              channel: sockets.get(ws).channel,
              nickname: json.nickname,
              password: json.password,
            })
            .then(async (result) => {
              const { data } = result;
              if (data.ok) {
                // app.publish(
                //   `${sockets.get(ws).server}-${sockets.get(ws).channel}`,
                //   JSON.stringify({
                //     type: "players",
                //     players: data.players,
                //   })
                // );
                await relay.push.send(
                  JSON.stringify({
                    type: "players",
                    server: sockets.get(ws).server,
                    channel: sockets.get(ws).channel,
                    players: data.players,
                  })
                );
                // axios
                //   .post(`http://${apiHost}:${apiPort}/v1/query/list/players`)
                //   .then((result) => {
                //     const { data } = result;
                //     const { players } = data;
                //     // console.log(players);
                //     app.publish(
                //       `${sockets.get(ws).server}-${sockets.get(ws).channel}`,
                //       JSON.stringify({
                //         type: "players",
                //         players: players,
                //       })
                //     );
                //   });
              }
            });
        }
      }
    },
    drain: (ws) => {
      console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      axios
        .post(`http://${apiHost}:${apiPort}/v1/query/logout`, {
          uuid: sockets.get(ws).uuid,
          server: sockets.get(ws).server,
          channel: sockets.get(ws).channel,
        })
        .then(async (result) => {
          const { data } = result;
          if (data.ok) {
            // app.publish(
            //   `${sockets.get(ws).server}-${sockets.get(ws).channel}`,
            //   JSON.stringify({
            //     type: "players",
            //     players: data.players,
            //   })
            // );
            await relay.push.send(
              JSON.stringify({
                type: "players",
                server: sockets.get(ws).server,
                channel: sockets.get(ws).channel,
                players: data.players,
              })
            );
          }
        });

      console.log("WebSocket closed");
    },
  })
  .any("/*", (res, req) => {
    res.end("Nothing to see here!");
  })
  .listen(port, (token) => {
    if (token) {
      console.log("Listening to port " + port);
    } else {
      console.log("Failed to listen to port " + port);
    }
  });

// setInterval(() => {
//   if (locationQueue.count > 0) {
//     const message = locationQueue.get();
//     const data = Message.decode(new Uint8Array(message)).toJSON();
//     console.log(data)
//     app.publish(`${data.server}-${data.channel}`, message, true, true);
//   }
// }, 16);

async function clientRun() {
  relay.pull = new zmq.Pull();
  relay.push = new zmq.Push();
  relay.pull.connect(`tcp://${clientHost}:${clientPort}`);
  await relay.push.bind(`tcp://${serverHost}:${serverPort}`);

  for await (const [msg] of relay.pull) {
    try {
      const decoded = decoder.decode(msg);

      const json = JSON.parse(decoded);
      if (json.type === "players") {
        console.log("전파받음", json);
        console.log("전파받음", msg);
        app.publish(
          `${json.server}-${json.channel}`,
          JSON.stringify({ type: json.type, players: json.players })
        );
      }
    } catch (e) {
      // console.log("전파받음", json);
      const decoded = decoder.decode(msg);

      const json = JSON.parse(decoded);
      console.log("전파받음", msg);
      const message = Message.encode(new Message(json)).finish();
      app.publish(`broadcast`, message, true, true);
    }
  }
}
clientRun();
