import mongoose from "mongoose";

const ConnectDB = async () => {
  if (!process.env.MONGODB_URL) {
    console.error("❌ ERROR: MONGODB_URL is missing in environment variables!");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default ConnectDB;
