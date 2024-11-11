import express from 'express';

const server = express();

server.use('/', (req, res, next) => {
  res.status(200).json({ status: true, message: 'RapidRoute is working' });
});

export default server;
