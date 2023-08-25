import express from "express";
import bodyParser from "body-parser";
import cors from 'cors'
import Route from "./routes/routes.js";

const server = express();
server.use(bodyParser.json());
server.use(cors({ origin: '*' }));


server.use("/api", Route);
server.listen(process.env.PORT || 3005, () =>
  console.log("Server is listening at http://localhost:3005")
);
