import express from "express";
import cookieParser from "cookie-parser";
import { connect } from "./db/db";
import userRoutes from "./routes/user.routers";
import cors from "cors";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

dotenv.config();

connect();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);

const PORT = 3001;

app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
