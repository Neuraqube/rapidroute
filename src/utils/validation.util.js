 import Joi from 'joi';
 import { DataTypes } from 'sequelize';
 /**
  * Centralized messages for validation.
  */
 
 const messages = {
   string: {
     base: (key) => `${key} should be a string.`,
     empty: (key) => `${key} cannot be empty.`,
     min: (key, min) => `${key} should have a minimum length of ${min}.`,
     max: (key, max) => `${key} should have a maximum length of ${max}.`,
     email: (key) => `${key} must be a valid email.`,
   },
   number: {
     base: (key) => `${key} should be a number.`,
     integer: (key) => `${key} must be an integer.`,
     min: (key, min) => `${key} should be greater than or equal to ${min}.`,
     max: (key, max) => `${key} should be less than or equal to ${max}.`,
   },
   boolean: {
     base: (key) => `${key} should be true or false.`,
   },
   date: {
     base: (key) => `${key} should be a valid date.`,
   },
   object: {
     base: (key) => `${key} should be a valid JSON object.`,
   },
   any: {
     required: (key) => `${key} is required.`,
     invalid: (key, values) => `${key} must be one of ${values.join(', ')}.`,
   },
 };
 
 /**
  * Utility function to create Joi strings with messages.
  */
 const createStringSchema = (key, validations) => {
   let schema = Joi.string().messages({
     'string.base': messages.string.base(key),
     'string.empty': messages.string.empty(key),
   });
 
   if (validations) {
     if (validations.len) {
       schema = schema
         .min(validations.len[0])
         .max(validations.len[1])
         .messages({
           'string.min': messages.string.min(key, validations.len[0]),
           'string.max': messages.string.max(key, validations.len[1]),
         });
     }
     if (validations.isEmail) {
       schema = schema.email().messages({
         'string.email': messages.string.email(key),
       });
     }
   }
 
   return schema;
 };
 
 /**
  * Utility function to create Joi numbers with messages.
  */
 const createNumberSchema = (key, validations, isInteger = false) => {
   let schema = isInteger
     ? Joi.number()
         .integer()
         .messages({
           'number.base': messages.number.base(key),
           'number.integer': messages.number.integer(key),
         })
     : Joi.number().messages({
         'number.base': messages.number.base(key),
       });
 
   if (validations) {
     if (validations.min) {
       schema = schema.min(validations.min).messages({
         'number.min': messages.number.min(key, validations.min),
       });
     }
     if (validations.max) {
       schema = schema.max(validations.max).messages({
         'number.max': messages.number.max(key, validations.max),
       });
     }
   }
 
   return schema;
 };
 
 const excludedFields = [
   'createdAt',
   'updatedAt',
   'deletedAt',
   'createdBy',
   'updatedBy',
   'id',
 ];
 
 /**
  * Generates a Joi validation schema based on a Sequelize model's attributes.
  * @param {Object} sequelizeModel - The Sequelize model to derive the schema from.
  * @returns {Object} - A Joi validation schema.
  */
 function generateJoiSchema(sequelizeModel) {
   const attributes = sequelizeModel.rawAttributes;
   const joiSchema = {};

   for (const [key, attribute] of Object.entries(attributes)) {
     let joiType;
 
     if (excludedFields.includes(key)) {
       continue;
     }

     switch (attribute.type.constructor.name) {
       case DataTypes.STRING.key:
         joiType = createStringSchema(key, attribute.validate);
         break;
 
       case DataTypes.INTEGER.key:
         joiType = createNumberSchema(key, attribute.validate, true);
         break;
 
       case DataTypes.FLOAT.key:
       case DataTypes.DECIMAL.key:
         joiType = createNumberSchema(key, attribute.validate);
         break;
 
       case DataTypes.BOOLEAN.key:
         joiType = Joi.boolean().messages({
           'boolean.base': messages.boolean.base(key),
         });
         break;
 
       case DataTypes.DATE.key:
         joiType = Joi.date().messages({
           'date.base': messages.date.base(key),
         });
         break;
 
       case DataTypes.JSON.key:
         joiType = Joi.object()
           .unknown(true)
           .messages({
             'object.base': messages.object.base(key),
           });
         break;
 
       case DataTypes.ENUM.key:
         joiType = Joi.string()
           .valid(...attribute.values)
           .messages({
             'string.base': messages.string.base(key),
             'any.only': messages.any.invalid(key, attribute.values),
           });
         break;
 
       default:
         console.warn(
           `Unsupported data type for attribute ${key}: ${attribute.type.constructor.name}`
         );
         continue;
     }
 
     // Handle required attributes
     if (attribute.allowNull === false) {
       joiType = joiType.required().messages({
         'any.required': messages.any.required(key),
       });
     } else if (attribute.defaultValue !== undefined) {
       joiType = joiType.default(attribute.defaultValue);
     }
 
     joiSchema[key] = joiType;
   }
 
   return Joi.object({
     body: Joi.object(joiSchema).options({ allowUnknown: false }),
   }).options({ allowUnknown: true });
 }

 export default generateJoiSchema;
