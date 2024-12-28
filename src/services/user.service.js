import UserModel from "#models/user";
import Service from "#services/base";

class UserService extends Service {
  findSafe = async () => {
    return this.model.find();
  };
}

const userService = new UserService(UserModel);

export default userService;
