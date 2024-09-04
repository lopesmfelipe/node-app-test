import express from "express";
import cors from "cors";
import morgan from "morgan";
import wRouter from "./routes/wRoutes.js";
import AppError from "./utils/appError.js";
import GlobalErrorHandler from "./controllers/globalErrorHandler.js";

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ROUTES
app.use("/whatever", wRouter);

// Catches the undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(GlobalErrorHandler);

export default app;
