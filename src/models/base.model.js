 import httpStatus from '#utils/httpStatus';
 import { Model, DataTypes, Op } from 'sequelize';
 import sequelize from '#configs/database';

 class BaseModel extends Model {
   /**
    * Initialize the model with the given model definition and options.
    * @param {object} modelDefinition - The model definition
    * @param {object} options - The options for the model
    */
   static initialize(modelDefinition, options) {
     const modifiedModelDefinition = this.modifyModelDefinition(modelDefinition);
 
     this.init(
       {
         ...modifiedModelDefinition,
         createdBy: {
           type: DataTypes.INTEGER,
           allowNull: true,
         },
         updatedBy: {
           type: DataTypes.INTEGER,
           allowNull: true,
         },
       },
       {
         charset: 'utf8mb4',
         collate: 'utf8mb4_general_ci',
         hooks: {},
         ...options,
         sequelize,
         timestamps: true,
         paranoid: true,
         underscored: true,
       }
     );
   }
 
   static modifyModelDefinition(modelDefinition) {
     return Object.entries(modelDefinition).reduce((acc, [key, value]) => {
       acc[key] = {
         ...value,
         filterable: value.filterable ?? true,
         publicKey: value.publicKey ?? true,
         ...(modelDefinition[key]['references']
           ? {
               references: modelDefinition[key]['references'],
               validate: { isInt: { msg: `Invalid ${key}` } },
             }
           : {}),
       };
       return acc;
     }, {});
   }
 
   static async create(data) {
     const rawFields = this.getAttributes();
     for (const key in data) {
       rawFields[key] ? null : delete data[key];
     }
     const createdDocument = await super.create(data);
     return createdDocument;
   }
 
   /**
    * Find a record by its ID.
    *
    * @param {any} id - The ID of the record to find
    * @return {Promise<any>} The found record
    */
   static async findById(id) {
     this.idChecker(id);
     const filter = { id };
     const joinFilters = this.getAllAssociations();
     const queryObject = {
       where: filter,
       include: joinFilters,
       order: [['createdAt', 'DESC']],
     };
     const data = await this.findOne(queryObject);
     if (!data) {
       throw {
         status: false,
         httpStatus: httpStatus.NOT_FOUND,
         message: `${this.name} not found`,
       };
     }
     return data;
   }
 
   static async findAllWithIds(ids, otherfields = {}) {
     this.validateIds(ids);
 
     const queryObject = {
       where: { id: { [Op.in]: ids } },
       ...otherfields,
     };
     const data = await this.findAll(queryObject);
     if (!data.length) {
       throw {
         status: false,
         httpStatus: httpStatus.NOT_FOUND,
         message: `${this.name} not found`,
       };
     }
     return data;
   }
 
   static validateIds(ids) {
     if (
       !Array.isArray(ids) ||
       ids.length === 0 ||
       !ids.every((id) => !isNaN(parseInt(id)))
     ) {
       throw {
         status: false,
         message: `Invalid ${this.name} id`,
         httpStatus: httpStatus.BAD_REQUEST,
       };
     }
   }
 
   /**
    * Find all records based on the provided filter.
    *
    * @param {Object} filter - The filter object to apply
    * @return {Promise<Array>} A promise that resolves to an array of found records
    */
   static async findAllRecords(filter = {}, includeJoins) {
     const allowedFields = await this.rawFields();
     let attributesToInclude;
 
     if (filter.attributes) {
       filter.attributes = filter.attributes.split(',');
       attributesToInclude = filter.attributes;
     }
     delete filter.attributes;
 
     const filterableFields = this.getFilterableFields(allowedFields);
 
     const paginationFields = this.extractPaginationFields(filter);
 
     const joinFilters = includeJoins
       ? this.getAllAssociations(filterableFields, filter)
       : null;
 
     filterableFields.push('id');
     this.validateFilters(filter, filterableFields);
 
     delete filter.limit;
 
     const queryObject = this.buildQueryObject(
       filter,
       paginationFields,
       joinFilters,
       attributesToInclude
     );
     const { count, rows } = await this.findAndCountAll(queryObject);
     const currentCount = rows.length;
     return { total: count, currentCount, results: rows };
   }
 
   static getFilterableFields(allowedFields) {
     return Object.keys(allowedFields).filter(
       (field) => allowedFields[field].filterable
     );
   }
 
   static extractPaginationFields(filter) {
     const paginationFields = { all: null, pageSize: null, page: null };
 
     for (const key in paginationFields) {
       if (key in filter) {
         paginationFields[key] = filter[key];
         delete filter[key];
       } else {
         delete paginationFields[key];
       }
     }
     return paginationFields;
   }
 
   static validateFilters(filter, filterableFields) {
     const invalidFilters = Object.keys(filter).filter((field) => {
       filter[field] === 'null' ? (filter[field] = null) : null;
       return !filterableFields.includes(field);
     });
     if (invalidFilters.length) {
       throw {
         status: false,
         httpStatus: httpStatus.BAD_REQUEST,
         message: `Invalid filters ${invalidFilters}`,
       };
     }
   }
 
   static buildQueryObject(filter, paginationFields, joinFilters, attributes) {
     const queryObject = {
       where: filter,
       order: [['createdAt', 'DESC']],
       ...(attributes ? { attributes } : null),
     };
 
     if ('all' in paginationFields && paginationFields.all === 'true') {
       queryObject.limit = null;
       queryObject.offset = null;
     } else if ('pageSize' in paginationFields && 'page' in paginationFields) {
       queryObject.limit = parseInt(paginationFields.pageSize);
       queryObject.offset =
         (parseInt(paginationFields.page) - 1) *
         parseInt(paginationFields.pageSize);
     }
 
     if (joinFilters) {
       queryObject.include = joinFilters;
     }
 
     return queryObject;
   }
 
   static getAllAssociations(filterableFields = [], filter = {}) {
     return Object.keys(this.associations).map((key) => {
       filterableFields.push(key);
       const association = this.associations[key];
 
       const joinFilter = {
         model: association.target,
         as: association.as || key,
         required: false,
         attributes: this.includeJoinFields?.(key) || ['id', 'name'],
       };
 
       if (filter?.[key]?.limit) {
         joinFilter.required = true;
         joinFilter.limit = parseInt(filter[key].limit);
         delete filter[key].limit;
       }
 
       if (filter?.[key]) {
         joinFilter.required = true;
         joinFilter.where[key] = filter[key];
       }
       delete filter[key];
       return joinFilter;
     });
   }
 
   /**
    * Get the raw fields by calling the getAttributes method.
    *
    * @return {Promise} The raw fields as a Promise
    */
   static rawFields() {
     return this.getAttributes();
   }
 
   /**
    * Update a record by its ID.
    * @param {any} id - The ID of the record to update
    * @param {Object} updates - The updates to apply to the record
    * @return {Promise<Object>} The updated record
    */
   static async updateById(id, updates) {
     this.idChecker(id);
     const [updatedCount, updatedRecord] = await this.update(updates, {
       where: { id },
     });
 
     if (updatedCount !== 1) {
       throw {
         status: false,
         httpStatus: httpStatus.NOT_FOUND,
         message: `${this.name} not found`,
       };
     }
     return updatedRecord;
   }
 
   /**
    * Delete a record by its ID.
    *
    * @param {any} id - The ID of the record to delete
    * @return {Promise<Object>} The updated record
    */
   static async deleteById(id) {
     this.idChecker(id);
     const time = new Date();
     const [updatedCount, updatedRecord] = await this.update(
       { deletedAt: time },
       {
         where: { id, deletedAt: null },
         individualHooks: true,
       }
     );
     if (updatedCount !== 1 || !updatedRecord || !updatedRecord.length) {
       throw {
         status: false,
         httpStatus: httpStatus.NOT_FOUND,
         message: `${this.name} not found`,
       };
     }
     return updatedRecord;
   }
 
   static idChecker(id) {
     if (!id || isNaN(id)) {
       throw {
         status: false,
         httpStatus: httpStatus.BAD_REQUEST,
         message: `Invalid or missing ${this.name} id`,
       };
     }
   }
 
   static objectValidator(value) {
     return typeof value === 'object' && value !== null && !Array.isArray(value);
   }
 }
 
 export default BaseModel;
