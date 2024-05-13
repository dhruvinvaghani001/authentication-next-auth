import mongoose from "mongoose";

const connection = {
  isConnnected: false,
};

async function connectDB() {
  if (connection.isConnnected) {
    console.log("Alredy connected to database!");
    return;
  }
  try {
    const connect = await mongoose.connect(process.env.MONGO_URL);
    connection.isConnnected = connect.connections[0].readyState;
    console.log("Db connected sussfully");
  } catch (error) {
    console.log("Error while mongodb conncetion!");
    process.exit(1);
  }
}

export default connectDB;
