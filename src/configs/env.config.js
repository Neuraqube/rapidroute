import {config} from 'dotenv';
import {str,num,cleanEnv} from 'envalid';

config();

const env = cleanEnv(process.env,{
  DB_USER:str(),
  DB_PASS:str(),
  DB_PORT:num({default:5432}),
  DB_HOST:str({default:'localhost'}),
  DB_DIALECT:str(),
  DATABASE:str(),
  SERVER_HOST:str({default:'localhost'}),
  PORT:num({default:3000})
})

export default env;
