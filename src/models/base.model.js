import { model, Schema } from "mongoose";

class BaseModel extends Schema {
  constructor(definition, options) {
    super(definition, options);

    this.statics.getModelName = function () {
      return this.modelName;
    };
  }
  static initialize(schemaDefinition, schemaOptions = {}) {
    const schema = new this(schemaDefinition, {
      timestamps: true,
      ...schemaOptions,
    });
    return this.name !== "BaseModel" ? model(this.name, schema) : null;
  }
  static getModelName() {
    return this.name;
  }
}

export default BaseModel;
