import { connect } from "mongoose";
const connectMongoDb = async (url) => {
  try {
    const connection = await connect(url);

    //TODO: Will be implemented later to handle different database connections
    //console.log(connection.models);
    console.log("connected to mongodb");
  } catch (err) {
    console.log(err);
  }
};

export default connectMongoDb;
