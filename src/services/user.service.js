import UserModel from '#models/base';
import Service from '#services/base';

class UserService extends Service {}

export const userServiceInstance = new UserService(UserModel);

export default UserService;
