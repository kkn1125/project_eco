import express from "express";
import queryController from "./src/controller/query.controller";
import logger from "./src/middleware/logger";
const host = process.env.HOST;
const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger);

app.use("/v1/query", queryController);

app.listen(port, () => {
  console.log("listening on port " + port);
});
