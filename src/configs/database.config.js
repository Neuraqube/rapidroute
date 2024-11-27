import {Sequelize} from 'sequelize';
import env from '#configs/env'

const sequelize = new Sequelize({
  database:env.DATABASE,
  host:env.DB_HOST,
  username:env.DB_USER,
  password:env.DB_PASS,
  dialect:env.DB_DIALECT,
  port:env.DB_PORT,
  logging:false
})

export default sequelize;
