import express from "express";
import cors from "cors";
import morgan from "morgan";
import wRouter from "./routes/wRoutes.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/whatever", wRouter);

export default app;
