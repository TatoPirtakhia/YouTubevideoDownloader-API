import express from "express";
import bodyParser from "body-parser";
import cors from 'cors'
import Route from "./routes/routes.js";

const server = express();
server.use(bodyParser.json());
server.use(cors({ origin: 'http://192.168.100.6:5173/' }));


server.use("/api", Route);
server.listen(3005, () =>
  console.log("Server is listening at http://localhost:3005")
);
