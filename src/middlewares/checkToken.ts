// import { NextFunction, Request, Response } from "express";
// import jwt from "jsonwebtoken";

// const authenticate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { token } = req.cookies;

//   if (!token) {
//     res.status(401).send({ message: "No token provided" });
//     return;
//   }

//   jwt.verify(token, process.env.JWT_SECRET_KEY!, (err, user) => {
//     if (err) {
//       res.status(401).send({ message: "Unauthorized" });
//       return;
//     }

//     req.user = user;
//   });

//   next();
// };

// export default authenticate;
