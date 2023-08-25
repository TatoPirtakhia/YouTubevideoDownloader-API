import express from "express";
import { downloadMusic, getTitle } from "../controllers/videoControlers.js";

const Route = express.Router();

Route.post("/downloadVideo", downloadMusic);
Route.post("/getTitle", getTitle);
export default Route