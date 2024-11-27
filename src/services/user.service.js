import UserModel from '#models/user';
import Service from '#services/base';

class UserService extends Service {}

export const userServiceInstance = new UserService(UserModel);

export default UserService;
