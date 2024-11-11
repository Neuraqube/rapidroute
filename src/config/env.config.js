import envalid, { str, num } from 'envalid';
import { configDotenv } from 'dotenv';

configDotenv();

const env = envalid.cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
});

export default env;
