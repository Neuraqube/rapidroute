import asyncHandler from "#utils/asyncHandler";
import { sendResponse } from "#utils/response";
import status from "#utils/httpStatus";
import userService from "#services/user";
import Controller from "#controllers/base";

class UserController extends Controller {
  findSafe = asyncHandler(async (req, res, next) => {
    const data = await this.service.findSafe();
    sendResponse(status.OK, res, data);
  });
}

const userController = new UserController(userService);

export default userController;
