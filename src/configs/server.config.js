import express from 'express';
import routeMapper from '#routes/index';

const server = express();

const port = process.env.PORT ?? 3000

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use('/',routeMapper)

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server