import { userServiceInstance } from '#services/user';
import Controller from '#controllers/base';

class UserController extends Controller {}

export const userControllerInstance = new UserController(userServiceInstance);

export default UserController;
