import { Request, Response } from "express";
import validator from "validator";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { createAccessToken } from "../libs/jwt";

export const UserController = {
  register: async (req: Request, res: Response) => {
    const params = req.body;

    if (params.password !== params.confirmPassword) {
      res.status(400).send({ message: "Passwords don't match" });
      return;
    }

    let validate_username: boolean = false;
    let validate_email: boolean = false;
    let validate_password: boolean = false;

    if (params.password !== params.confirmPassword) {
      res.status(400).send({ message: "Passwords don't match" });
      return;
    }

    try {
      validate_username = !validator.isEmpty(params.username);
      validate_email =
        !validator.isEmpty(params.email) && validator.isEmail(params.email);
      validate_password = !validator.isEmpty(params.password);
    } catch (ex) {
      return res.status(400).send({ message: "Error registering user" });
    }

    if (!validate_username || !validate_email || !validate_password) {
      res.status(400).send({ message: "Error registering user" });
      return;
    }

    const user = new User();

    user.username = params.username;
    user.email = params.email;
    user.name = params.name;
    user.role = "ROLE_USER";

    const userFound = await User.findOne({
      $or: [{ email: user.email }, { username: user.username }],
    });

    if (userFound)
      return res.status(400).send({ message: "User already exists" });

    const salt = bcrypt.genSaltSync(8);
    const hash = bcrypt.hashSync(
      process.env.SECRET_KEY + params.password,
      salt
    );

    user.password = hash;

    const userSaved = await user.save();

    if (!userSaved)
      return res.status(400).send({ message: "Error registering user" });

    const token = await createAccessToken({ id: userSaved._id });
    res.cookie("token", token, { httpOnly: true });

    console.log(userSaved);
    res
      .status(200)
      .send({ message: "User registered", user: userSaved, token });
  },

  login: async (req: Request, res: Response) => {
    const params = req.body;

    let validate_username: boolean = false;
    let validate_password: boolean = false;

    try {
      validate_username = !validator.isEmpty(params.username);
      validate_password = !validator.isEmpty(params.password);
    } catch (ex) {
      res.status(400).send({ message: "Error logging in" });
    }

    if (!validate_username || !validate_password)
      return res.status(400).send({ message: "Error logging in" });

    const userFound = await User.findOne({ username: params.username });

    if (!userFound) return res.status(400).send({ message: "User not found" });

    const matchPassword = bcrypt.compareSync(
      process.env.SECRET_KEY + params.password,
      userFound.password
    );

    if (!matchPassword)
      return res.status(400).send({ message: "Invalid password" });

    res.status(200).send({ message: "User logged in", userFound });
  },

  logout: async (req: Request, res: Response) => {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
    res.status(200).send({ message: "User logged out" });
  },
};
