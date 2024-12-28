import express from "express";
import routeMapper from "#routes/index";
import env from "#configs/env";
import connectMongoDb from "#configs/database";
import globalErrorHandler from "#utils/error";
import swagger from "#configs/swagger";

const server = express();

const port = process.env.PORT ?? 3000;

connectMongoDb(env.DB_URL);
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/", routeMapper);

server.use(globalErrorHandler);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
