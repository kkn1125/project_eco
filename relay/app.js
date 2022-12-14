import zmq from "zeromq";
import dotenv from "dotenv";
import path from "path";
const __dirname = path.resolve();

dotenv.config({ path: path.join(__dirname, `.env.${process.env.NODE_ENV}`) });
const serverHost = process.env.SERVER_HOST;
const serverPort = process.env.SERVER_PORT;
const clientHost = process.env.CLIENT_HOST;
const clientPort = process.env.CLIENT_PORT;

async function serverRun() {
  const sock = new zmq.Reply();

  await sock.bind(`tcp://${serverHost}:${serverPort}`);

  for await (const [msg] of sock) {
    await sock.send(2 * parseInt(msg, 10));
  }
}

serverRun();

async function clientRun() {
  const sock = new zmq.Request();

  sock.connect(`tcp://${clientHost}:${clientPort}`);
  console.log("Producer bound to port %d on backend server", clientPort);

  await sock.send("4");
  const [result] = await sock.receive();

  console.log(result);
}

clientRun();
