import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import wRouter from "./routes/whateverRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import AppError from "./utils/appError.js";
import GlobalErrorHandler from "./controllers/globalErrorHandler.js";

const app = express();

// MIDDLEWARES
app.use(morgan("dev")); 

// Limit the number of requests from the same IP per hour
const limiter = rateLimit({
  max: 2, // max 100 requests
  windowMs: 60 * 60 * 1000, // time limit of 1 hour
  message: 'Too many requests from this IP, please try again in 1 hour'
});
app.use('/', limiter);

app.use(cors());
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
