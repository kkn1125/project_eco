import express from "express";
import queryService from "../services/query.service.js";

const queryController = new express.Router();

queryController.post("/enter", queryService.enter);
queryController.post("/login", queryService.login);
queryController.post("/logout", queryService.logout);

queryController.post("/type/location", queryService.location);

queryController.post("/list/players", queryService.players);

export default queryController;
