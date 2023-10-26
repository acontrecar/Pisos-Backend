import mongoose from "mongoose";

export const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    console.log("⚡️[server]: DB is connected");
  } catch (error) {
    console.log(error);
  }
};
