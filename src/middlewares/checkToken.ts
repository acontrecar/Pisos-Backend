import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      res.status(401).send({ message: "No token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);

    if (!decoded) {
      res.status(401).send({ message: "Unauthorized1" });
      return;
    }

    const { id } = decoded as any;

    const user = await User.findById(id, { password: 0 });

    if (!user) {
      res.status(401).send({ message: "Unauthorized2" });
      return;
    }
    req.body.user = user;
    next();
  } catch (error) {
    res.status(401).send({ message: "Unauthorized3" });
  }
};

export default authenticate;
