import { configDotenv } from "dotenv";
import { str, num, cleanEnv } from "envalid";

configDotenv();

const env = cleanEnv(process.env, {
  DB_NAME: str(),
  DB_URL: str(),
  NODE_ENV: str({ default: "development" }),
  PORT: num({ default: 3000 }),
});

export default env;
