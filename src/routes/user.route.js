import express from "express";
import BaseRouter from "#routes/base";
import userController from "#controllers/user";

class UserRouter extends BaseRouter {}

const router = express.Router();
const userRouter = new UserRouter(router, userController);

router.get("/test", userController.findSafe);

userRouter.use();
export default router;
