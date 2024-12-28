import fs from "node:fs/promises";
import path, { join } from "node:path";

const modelDir = path.resolve("src/models");

const models = {};
const files = await fs.readdir(modelDir);

for (const file of files) {
  if (file === "base.model.js") continue;
  const modelPath = join(modelDir, file);
  const model = (await import(modelPath)).default;
  models[model.getModelName()] = model;
}

console.log(models);
export default {};
