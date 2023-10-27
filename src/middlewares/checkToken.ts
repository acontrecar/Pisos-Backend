import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.cookies;

  if (!token) {
    res.status(401).send({ message: "No token provided" });
    return;
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);

  if (!decoded) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }

  const { id } = decoded as any;

  req.body.user = id;
  next();
};

export default authenticate;
