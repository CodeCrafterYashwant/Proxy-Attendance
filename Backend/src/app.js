import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.set("trust proxy", 1);
app.use(express.json({ limit: process.env.LIMIT }));
app.use(express.urlencoded({ extended: true, limit: process.env.LIMIT }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("tiny"));

app.get("/", (req, res) => {
    res.status(200).json({ status: "ok" });
});

//routes import
import userRouter from "./routes/user.routes.js";
import attendanceRouter from "./routes/attendence.routes.js";

//routes declaration
app.use("/attendence", attendanceRouter);
app.use("/user", userRouter);

export { app };
