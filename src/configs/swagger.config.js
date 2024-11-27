 import path from 'path';
 import fs from 'fs';
 import packageJson from '#root/package.json' with { type: 'json' };
 import env from '#configs/env';
 import sequelize from '#configs/database';
 
 const __dirname = path.resolve();
 const models = {};
 const modelsDir = path.join(__dirname, 'src', 'models');
 
 const config = {
   excludedFields: [
     'createdAt',
     'updatedAt',
     'createdBy',
     'updatedBy',
     'deletedAt',
     'id',
   ],
   excludedModels: ['OTP', 'BaseModel', 'City', 'State', 'Admin'],
   serverUrl: `http://${env.SERVER_HOST}:${env.PORT}`,
 };
 
 const getOpenApiType = (typeKey) => {
   switch (typeKey) {
     case 'INTEGER':
       return 'integer';
     case 'DECIMAL':
       return 'number';
     case 'STRING':
       return 'string';
     case 'BOOLEAN':
       return 'boolean';
     case 'DATE':
       return 'string';
     case 'ENUM':
       return 'string';
     case 'JSON':
       return 'array';
     default:
       return 'string';
   }
 };
 
 const loadModels = async () => {
   try {
     const files = await fs.promises.readdir(modelsDir);
     await Promise.all(
       files
         .filter((file) => file.endsWith('.js'))
         .map(async (file) => {
           try {
             const model = await import(path.join(modelsDir, file));
             models[model.default.name] = model.default;
           } catch (err) {
             console.error(`Error loading model ${file}:`, err);
           }
         })
     );
   } catch (err) {
     console.error('Error reading models directory:', err);
   }
 };
 
 await loadModels();
 
 const generatePropertySchema = (attribute, type, comment, allowNull) => {
   const schema = {
     type: getOpenApiType(type.key),
     description: comment || '',
   };
 
   if (type.key === 'ENUM') schema.enum = type.values;
   if (type.key === 'JSON') schema.items = { type: 'string' };
   if (!allowNull) schema.required = true;
 
   return schema;
 };
 
 const checkForMultipart = (attribute) => attribute.file === true;
 
 const generateResponses = (modelName) => ({
   200: {
     description: `Successful retrieval of ${modelName}`,
     content: {
       'application/json': {
         schema: { $ref: `#/components/schemas/${modelName}` },
       },
     },
   },
   201: {
     description: `${modelName} created successfully.`,
     content: {
       'application/json': {
         schema: { $ref: `#/components/schemas/${modelName}` },
       },
     },
   },
   400: { description: 'Invalid input provided.' },
   404: { description: `${modelName} not found.` },
 });
 
 const generatePathsAndSchemas = () => {
   const paths = {};
   const components = { schemas: {} };
   const tags = [];
   const modelMap = Object.keys(models)
     .sort()
     .reduce((acc, key) => {
       acc[key] = models[key];
       return acc;
     }, {});
 
   for (const modelName in modelMap) {
     const model = models[modelName];
     if (config.excludedModels.includes(modelName)) continue;
 
     const schemaProperties = {};
     let usesMultipart = false;
 
     for (const attribute in model.rawAttributes) {
       const { fieldName, type, comment, allowNull, publicKey } =
         model.rawAttributes[attribute];
 
       if (!publicKey) {
         continue;
       }
 
       if (config.excludedFields.includes(fieldName)) continue;
 
       const propertySchema = generatePropertySchema(
         attribute,
         type,
         comment,
         allowNull
       );
       if (checkForMultipart(model.rawAttributes[attribute])) {
         propertySchema.type = 'string';
         propertySchema.format = 'binary';
         usesMultipart = true;
       }
 
       schemaProperties[attribute] = propertySchema;
     }
 
     components.schemas[modelName] = {
       type: 'object',
       properties: schemaProperties,
       required: [],
     };
 
     let modelPath = '';
 
     for (let i = 0; i < modelName.length; i++) {
       if (!i) {
         modelPath += modelName[i].toLowerCase();
       } else {
         if (modelName[i].toUpperCase() === modelName[i]) {
           modelPath += `-${modelName[i].toLowerCase()}`;
         } else {
           modelPath += modelName[i];
         }
       }
     }
 
     modelPath = `/api/${modelPath}`;
     const requestBodyContent = {
       [usesMultipart ? 'multipart/form-data' : 'application/json']: {
         schema: { type: 'object', properties: schemaProperties },
       },
     };
 
     const responses = generateResponses(modelName);
 
     paths[modelPath] = {
       get: {
         summary: `Retrieve all ${modelName}s`,
         tags: [modelName],
         responses: { 200: responses[200] },
       },
       post: {
         summary: `Create new ${modelName}`,
         tags: [modelName],
         requestBody: { required: true, content: requestBodyContent },
         responses: { 201: responses[201], 400: responses[400] },
       },
     };
 
     paths[`${modelPath}/{id}`] = {
       get: {
         summary: `Retrieve ${modelName} by ID`,
         tags: [modelName],
         parameters: [
           {
             in: 'path',
             name: 'id',
             required: true,
             schema: { type: 'integer' },
             description: `ID of ${modelName}`,
           },
         ],
         responses: { 200: responses[200], 404: responses[404] },
       },
       put: {
         summary: `Update ${modelName} by ID`,
         tags: [modelName],
         parameters: [
           {
             in: 'path',
             name: 'id',
             required: true,
             schema: { type: 'integer' },
             description: `ID of ${modelName}`,
           },
         ],
         requestBody: { required: true, content: requestBodyContent },
         responses: { 200: responses[200], 404: responses[404] },
       },
       delete: {
         summary: `Delete ${modelName} by ID`,
         tags: [modelName],
         parameters: [
           {
             in: 'path',
             name: 'id',
             required: true,
             schema: { type: 'integer' },
             description: `ID of ${modelName}`,
           },
         ],
         responses: {
           200: { description: `${modelName} deleted successfully.` },
           404: responses[404],
         },
       },
     };
 
     if (!tags.find((tag) => tag.name === modelName)) {
       tags.push({
         name: modelName,
         description: `Operations for ${modelName} model`,
       });
     }
   }
 
   return { paths, components, tags };
 };
 
 const generateSwagger = () => {
   const { paths, components, tags } = generatePathsAndSchemas();
 
   return {
     openapi: '3.0.0',
     info: {
       description: packageJson.description || 'API Documentation',
       version: packageJson.version || '1.0.0',
       title: packageJson.name || 'API',
     },
     servers: [{ url: config.serverUrl }],
     paths,
     components: components,
     tags,
   };
 };
 
 /*
 const writeSwaggerFile = async (data) => {
   try {
     await fs.promises.writeFile('swagger.json', JSON.stringify(data, null, 2));
   } catch (err) {
     console.error('Error writing Swagger file:', err);
   }
 };
 
 writeSwaggerFile(generateSwagger());
 */
 export default generateSwagger();
