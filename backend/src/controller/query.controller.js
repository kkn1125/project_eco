import queryService from "../services/query.service";
import express from "express";

const queryController = new express.Router();

queryController.post("/enter", queryService.enter);
queryController.post("/login", queryService.login);
queryController.post("/logout", queryService.logout);

export default queryController;
