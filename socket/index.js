import dotenv from "dotenv";
import path from "path";
import uWs from "uWebSockets.js";
import axios from "axios";
import protobuf from "protobufjs";

const { Message, Field } = protobuf;

Field.d(1, "string", "required")(Message.prototype, "uuid");
Field.d(2, "int32", "required")(Message.prototype, "server");
Field.d(3, "int32", "required")(Message.prototype, "channel");
Field.d(4, "float", "required")(Message.prototype, "pox");
Field.d(5, "float", "required")(Message.prototype, "poy");
Field.d(6, "float", "required")(Message.prototype, "poz");
Field.d(7, "float", "required")(Message.prototype, "roy");

const __dirname = path.resolve();
const mode = process.env.NODE_ENV;

dotenv.config({
  path: path.join(__dirname, `.env`),
});
dotenv.config({
  path: path.join(__dirname, `.env.${mode}`),
});

const port = Number(process.env.PORT) || 4000;
const apiHost = process.env.API_HOST;
const apiPort = process.env.API_PORT;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const sockets = new Map();

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
        axios.post(`http://${apiHost}:${apiPort}/v1/query/type/location`, data);
        app.publish(
          `${sockets.get(ws).server}-${sockets.get(ws).channel}`,
          message,
          isBinary,
          true
        );
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
            .post(`http://${apiHost}:${apiPort}/v1/query/list/players`)
            .then((result) => {
              const { data } = result;
              const { players } = data;
              console.log(players);
              app.publish(
                `${json.server}-${json.channel}`,
                JSON.stringify({
                  type: "players",
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
            .then((result) => {
              const { data } = result;
              if (data.ok) {
                axios
                  .post(`http://${apiHost}:${apiPort}/v1/query/list/players`)
                  .then((result) => {
                    const { data } = result;
                    const { players } = data;
                    // console.log(players);
                    app.publish(
                      `${sockets.get(ws).server}-${sockets.get(ws).channel}`,
                      JSON.stringify({
                        type: "players",
                        players: players,
                      })
                    );
                  });
              }
            });
        }
      }
    },
    drain: (ws) => {
      console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
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
