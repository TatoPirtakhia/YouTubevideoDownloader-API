import express from "express";
import { downloadVideo, getTitle } from "../controllers/videoControlers.js";

const Route = express.Router();

Route.post("/downloadVideo", downloadVideo);
Route.post("/getTitle", getTitle);
export default Route