import BaseModel from "#models/base";

class User extends BaseModel {}

const UserModel = User.initialize({
  name: {
    type: String,
    required: true,
  },
  password: String,
});
export default UserModel;
