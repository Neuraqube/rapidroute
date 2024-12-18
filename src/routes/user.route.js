import Router from '#routes/base';
import { userControllerInstance } from '#controllers/user';

class UserRouter extends Router {}

const { router } = new UserRouter(userControllerInstance);

export default router;
