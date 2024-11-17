import express from 'express';

class Router {
  constructor(controller) {
    this.controller = controller;
    this.router = express.Router();
    this.use();
  }
  
  use() {
    const controller = this.controller;
    const router = this.router;

    router
      .route('/:id?')
      .get(controller.get)
      .post(controller.create)
      .put(controller.update)
      .delete(controller.delete);
  }
}

export default Router;
