import Router from '#routes/base';
import validationSchema from '#utils/validation';
import schemaValidator from '#middlewares/validation';
import { userControllerInstance } from '#controllers/user';

class UserRouter extends Router {}

const { router } = new UserRouter(userControllerInstance);

export default router;
