import express from "express";
import routeMapper from "#routes/index";
import env from "#configs/env";
import connectMongoDb from "#configs/database";

const server = express();

const port = process.env.PORT ?? 3000;

connectMongoDb(env.DB_URL);
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/", routeMapper);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
