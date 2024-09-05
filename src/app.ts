import express from "express";
import cors from "cors";
import morgan from "morgan";
import wRouter from "./routes/whateverRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import AppError from "./utils/appError.js";
import GlobalErrorHandler from "./controllers/globalErrorHandler.js";

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ROUTES
app.use("/whatever", wRouter);
app.use("/user", userRoutes);

// Catch-all for undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLER
app.use(GlobalErrorHandler);

export default app;
