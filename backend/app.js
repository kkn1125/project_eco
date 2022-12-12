import net from "net";
import zmq from "zeromq";
import dotenv from "dotenv";
import path from "path";
const __dirname = path.resolve();
dotenv.config({
  path: path.join(__dirname, `.env.${process.env.NODE_ENV}`),
});

const brokerServerHost = process.env.BROKER_SERVER_HOST;
const brokerServerPort = process.env.BROKER_SERVER_PORT;
const brokerClientHost = process.env.BROKER_CLIENT_HOST;
const brokerClientPort = process.env.BROKER_CLIENT_PORT;

async function serverRun() {
  const sock = new zmq.Reply();

  await sock.bind(`tcp://${brokerServerHost}:${brokerServerPort}`);

  for await (const [msg] of sock) {
    await sock.send(2 * parseInt(msg, 10));
  }
}

serverRun();

async function clientRun() {
  const sock = new zmq.Request();

  sock.connect(`tcp://${brokerClientHost}:${brokerClientPort}`);
  console.log("Producer bound to port %d on relay server", brokerClientPort);

  await sock.send("4");
  const [result] = await sock.receive();

  console.log(result);
}

clientRun();

net.createServer().listen();
