import { createAccessToken } from "../libs/jwt";
import { Request, Response } from "express";
import { destroyImage, uploadImage } from "../libs/cloudinary";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import validator from "validator";
import fs from "fs-extra";
import { UploadedFile } from "express-fileupload";

const validImageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];

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
      validate_password =
        !validator.isEmpty(params.password) &&
        params.password.length >= 6 &&
        params.password.length <= 12 &&
        validator.isAlphanumeric(params.password);
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
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });

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

    const token = await createAccessToken({ id: userFound._id });
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });

    res
      .status(200)
      .send({ message: "User logged in", userFound, token: token });
  },

  logout: async (req: Request, res: Response) => {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
    res.status(200).send({ message: "User logged out" });
  },

  test: async (req: Request, res: Response) => {
    res.status(200).send({ message: "Has accedido correctamente" });
  },

  checkToken: async (req: Request, res: Response) => {
    const { token } = req.cookies;

    if (!token) {
      res.status(401).send({ message: "No token provided" });
      return;
    }

    const user = req.body.user;

    if (!user) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }

    res.status(200).send({ user, token, message: "Token correcto" });
  },

  updateImage: async (req: Request, res: Response) => {
    const image = req.files?.image;
    if (!image) {
      res.status(400).send({ message: "No image provided" });
      return;
    }

    if (Array.isArray(image)) {
      return res.status(400).send({ message: "Only one image allowed" });
    }

    const fileExtension = image.name.substring(image.name.lastIndexOf("."));

    if (!validImageExtensions.includes(fileExtension)) {
      await fs.remove(image.tempFilePath);
      res.status(400).send({ message: "Invalid image extension" });
      return;
    }

    const { id } = req.body.user;
    const user = await User.findById(id);

    if (user?.image?.public_id) {
      await destroyImage(user.image.public_id);
    }

    const result = await uploadImage(image.tempFilePath);
    await fs.remove(image.tempFilePath);

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    user.image = {
      public_id: result?.public_id,
      secure_url: result?.url,
    };

    await user.save();

    res.status(200).send({ message: "Image updated", image: user.image });
  },

  updateName: async (req: Request, res: Response) => {
    const { id } = req.body.user;
    const { name } = req.body;

    if (!name) {
      return res.status(400).send({ message: "No name provided" });
    }

    if (name.length < 3 || name.length > 20) {
      return res.status(400).send({ message: "Invalid name length" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }

    user.name = name;

    await user.save();

    res.status(200).send({ message: "Username updated", name });
  },

  getAllUsers: async (req: Request, res: Response) => {
    const { id } = req.body.user;
    const users = await User.find({ _id: { $ne: id } });
    res.status(200).send({ users });
  },
};
