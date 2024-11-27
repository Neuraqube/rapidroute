import { sendResponse } from '#utils/response';
import status from '#utils/httpStatus';

class Controller {
  constructor(service) {
    this.service = service;
  }
  get = async (req, res, next) => {
    try{
      const { id } = req.params;
      const filter = req.query;
      const data = await this.service.get(id, filter);
      sendResponse(status.OK, res, data,'Record fetched successfully');
    }catch(err){
      next(err);
    } 
  };
  create = async (req, res, next) => {
    try{
      const data = req.body;
      const createdData = await this.service.create(data);
      sendResponse(
        status.CREATED,
        res,
        createdData,
        'Record created successfully'
      );
    }catch(err){
      next(err);
    }
  };
  update = async (req, res, next) => {
    try{
      const { id } = req.params;
      const data = req.body;
      const updatedData = await this.service.update(id, data);
      sendResponse(status.OK, res, updatedData, 'Record updated successfully');
    }catch(err){
      next(err)
    }
  };
  delete = async (req, res, next) => {
    try{
      const { id } = req.params;
      await this.service.delete(id);
      sendResponse(status.NO_CONTENT, res, null, 'Record deleted successfully');
    }catch(err){
      next(err)
    }
  };
}

export default Controller;
