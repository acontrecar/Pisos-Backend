import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINRY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(filePath: string) {
  return await cloudinary.uploader.upload(filePath, {
    folder: "user-avatar",
  });
}

export async function destroyImage(publicId: string) {
  return await cloudinary.uploader.destroy(publicId);
}
