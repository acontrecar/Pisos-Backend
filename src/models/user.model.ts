import mongoose from "mongoose";

// interface IUser {
//   username: string;
//   email: string;
//   password: string;
//   name: string;
//   image?: string;
//   role: string;
// }

const schemaUser = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  name: { type: String },
  image: { type: String },
  role: { type: String, required: true },
});

export const User = mongoose.model("User", schemaUser);
