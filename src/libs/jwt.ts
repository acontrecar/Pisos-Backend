import jwt from "jsonwebtoken";
import { Types } from "mongoose";

export function createAccessToken(payload: Types.ObjectId | object) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}
