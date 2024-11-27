import BaseModel from '#models/base';
import {DataTypes} from 'sequelize';

class User extends BaseModel {

}

User.initialize({
  name:{
    type:DataTypes.STRING,
    allowNull:false
  },
  email:{
    type:DataTypes.STRING,
    allowNull:false
  },
  password:{
    type:DataTypes.STRING,
    allowNull:false
  }
})

export default User;
