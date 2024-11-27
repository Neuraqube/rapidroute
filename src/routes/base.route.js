import express from 'express';
import schemaValidator from '#middlewares/validation'
import validationSchemaGenerator from '#utils/validation'

class Router {
  constructor(controller) {
    this.controller = controller;
    this.router = express.Router();
    this.use();
  }
  
  use() {
    const controller = this.controller;
    const router = this.router;

    const model = controller.service.model;
    const schema = validationSchemaGenerator(model);

    router
      .route('/:id?')
      .get(controller.get)
      .post(schemaValidator(schema),controller.create)
      .put(schemaValidator,controller.update)
      .delete(controller.delete);
  }
}

export default Router;
