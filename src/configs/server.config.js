import express from 'express';
import routeMapper from '#routes/index';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '#configs/swagger';
import {globalErrorHandler} from '#utils/error'

const server = express();

const port = process.env.PORT ?? 3000

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
server.use('/api',routeMapper)

server.use(globalErrorHandler);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server
