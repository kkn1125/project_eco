import mysql2 from "mysql2";
import mariaConf from "./maria.conf.js";

let connection = null;

function getConnection() {
  connection = mysql2.createConnection(mariaConf);
  connection.on("connect", (e) => {
    console.log("connect");
  });
  connection.on("error", (e) => {
    connection.destroy();
    connection = mysql2.createConnection(mariaConf);
  });
}

function keepAlive() {
  setTimeout(() => {
    connection.query("SELECT 1");
    // console.log("ping to db");
    keepAlive();
  }, 5000);
}

keepAlive();

getConnection();

export default connection;
