import express from "express";
import queryService from "../services/query.service.js";

const queryController = new express.Router();

queryController.post("/enter", queryService.enter);

queryController.post("/login", queryService.login);
queryController.post("/type/player", queryService.player);

queryController.post("/logout", queryService.logout);
queryController.post("/type/delete", queryService.delete);

queryController.post("/list/players", queryService.players);

export default queryController;
