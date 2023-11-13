import express from "express";
import { UserController } from "../controllers/user.controller";
import authenticate from "../middlewares/checkToken";
import fileUpload from "express-fileupload";
const router = express.Router();

router.post("/register", UserController.register);

router.post("/login", UserController.login);

router.post("/test", authenticate, UserController.test);

router.get("/logout", authenticate, UserController.logout);

router.get("/check-token", authenticate, UserController.checkToken);

router.patch(
  "/updateImage",
  authenticate,
  fileUpload({ useTempFiles: true, tempFileDir: "./uploads" }),
  UserController.updateImage
);

router.patch("/updateName", authenticate, UserController.updateName);

router.get("/getAllUsers", authenticate, UserController.getAllUsers);

export default router;
