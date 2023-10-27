import express from "express";
import { UserController } from "../controllers/user.controller";
import authenticate from "../middlewares/checkToken";
const router = express.Router();

router.post("/register", UserController.register);

router.post("/login", UserController.login);

router.post("/test", authenticate, UserController.test);

export default router;
