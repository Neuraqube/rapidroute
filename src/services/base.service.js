class Service {
  constructor(model) {
    this.model = model;
  }

  async get(id, filter = {}) {
    if (!id) {
      const data = await this.model.findAllRecords(filter);
      return data;
    }
    const data = await this.model.findById(id);
    return data;
  }
  async getDeletedRecords(filter) {
    const data = await model.findAllRecords();
    return data;
  }
  async create(data) {
    const createdData = await model.create(data);
    return createdData;
  }
  async update(id, data) {
    const existingData = model.findById(id);
    const updatedData = { ...existingData, data };
    await updatedData.save();
    return updatedData;
  }
  async delete(id) {
    const existingData = await model.findById(id);
    await existingData.destroy();
  }
}

export default Service;
