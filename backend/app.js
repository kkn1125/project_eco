import express from "express";
import queryController from "./src/controller/query.controller.js";
import logger from "./src/middleware/logger.js";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";

const __dirname = path.resolve();
const mode = process.env.NODE_ENV;

dotenv.config({
  path: path.join(__dirname, ".env"),
});

dotenv.config({
  path: path.join(__dirname, `.env.${mode}`),
});

const host = process.env.HOST;
const port = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger);

app.use("/v1/query", queryController);

app.listen(port, () => {
  console.log("listening on port " + port);
  process.send("ready");
});

process.on("SIGINT", function () {
  console.log("shut down");
});